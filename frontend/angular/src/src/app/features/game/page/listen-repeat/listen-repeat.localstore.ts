import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { Chapter, WordPair } from '../../../chapter/model/chapter.model';
import { GameStore } from '../../game.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SpeechService } from '../../../../core/services/speech.service';
import { MessageService } from 'primeng/api';

export interface ListenRepeatRootState {
    isLoading: boolean;
    currentStep: 'PLAY' | 'RESULTS';
    isFinished: boolean;
    chapter: Chapter | null;
    words: WordPair[];
    isSwapped: boolean;
    autoListen: boolean;
}

export interface RootViewModel {
    state: ListenRepeatRootState;
    chapterId: string | null;
    totalCount: number;
}

export interface ListenPlayState {
    currentIndex: number;
    lastTranscript: string;
    isCorrect: boolean | null;
    showWord: boolean;
    attemptCount: number;
}

export interface PlayViewModel {
    state: ListenPlayState;
    targetText: string;
    targetLangCode: string;
    progressPercent: number;
    isListening: boolean;
    currentWord: WordPair | null;
    autoListen: boolean;
    currentSourceLang: string;
}

export interface ListenResultState {
    score: number;
}

export interface ResultViewModel {
    state: ListenResultState;
    totalCount: number;
    chapterId: string | null;
}

const initialRoot: ListenRepeatRootState = {
    isLoading: false,
    currentStep: 'PLAY',
    isFinished: false,
    chapter: null,
    words: [],
    isSwapped: false,
    autoListen: true
};

const initialPlay: ListenPlayState = {
    currentIndex: 0,
    lastTranscript: '',
    isCorrect: null,
    showWord: false,
    attemptCount: 0
};

const initialResult: ListenResultState = {
    score: 0
};

@Injectable()
export class ListenRepeatLocalStore {
    private readonly gamesStore = inject(GameStore);
    private readonly destroyRef = inject(DestroyRef);
    private readonly speechService = inject(SpeechService);
    private readonly messageService = inject(MessageService);

    private readonly _root = signal<ListenRepeatRootState>(initialRoot);
    private readonly _play = signal<ListenPlayState>(initialPlay);
    private readonly _result = signal<ListenResultState>(initialResult);

    public readonly rootViewModel = computed((): RootViewModel => {
        const root = this._root();
        return {
            state: root,
            chapterId: root.chapter?.id || null,
            totalCount: root.words.length
        };
    });

    public readonly playViewModel = computed((): PlayViewModel => {
        const root = this._root();
        const play = this._play();
        const words = root.words;
        const totalCount = words.length;

        const currentWord = words[play.currentIndex] || null;
        const targetText = currentWord ? (root.isSwapped ? currentWord.pl : currentWord.eng) : '';

        return {
            state: play,
            targetText,
            targetLangCode: root.isSwapped ? 'pl-PL' : 'en-US',
            progressPercent: totalCount > 0 ? (play.currentIndex / totalCount) * 100 : 0,
            isListening: false, // Updated in the page component
            currentWord,
            autoListen: root.autoListen,
            currentSourceLang: root.isSwapped ? root.chapter?.lang1 || 'Polski' : root.chapter?.lang2 || 'Angielski'
        };
    });

    public readonly resultViewModel = computed((): ResultViewModel => {
        const root = this._root();
        const result = this._result();
        return {
            state: result,
            totalCount: root.words.length,
            chapterId: root.chapter?.id || null
        };
    });


    public handleLoadGame(id: string): void {
        this._root.update(s => ({ ...s, isLoading: true }));
        this.gamesStore.loadGameData(id).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (chapter: Chapter) => {
                const words = [...chapter.words].sort(() => Math.random() - 0.5);
                this._root.set({
                    isLoading: false,
                    currentStep: 'PLAY',
                    isFinished: false,
                    chapter,
                    words,
                    isSwapped: false,
                    autoListen: true
                });
                this._play.set(initialPlay);
                this._result.set(initialResult);

                // Auto-start initial word
                setTimeout(() => {
                    this.playAudio();
                    if (this._root().autoListen) {
                        setTimeout(() => this.startListening(), 1500);
                    }
                }, 800);
            },
            error: () => this._root.update(s => ({ ...s, isLoading: false }))
        });
    }

    public checkTranscript(transcript: string): void {
        const root = this._root();
        const play = this._play();

        const words = root.words;
        const currentWord = words[play.currentIndex] || null;
        if (!currentWord) return;

        const targetText = root.isSwapped ? currentWord.pl : currentWord.eng;
        const target = targetText.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
        const heard = transcript.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
        const isCorrect = target === heard;

        if (isCorrect) {
            this._result.update(s => ({ score: s.score + 1 }));
        }

        this._play.update(p => ({
            ...p,
            isCorrect,
            attemptCount: isCorrect ? p.attemptCount : p.attemptCount + 1,
            lastTranscript: transcript
        }));

        // Auto-skip after 3 attempts
        if (!isCorrect && this._play().attemptCount >= 3) {
            setTimeout(() => {
                const p = this._play();
                const r = this._root();
                if (p.attemptCount >= 3 && r.currentStep === 'PLAY') {
                    this.nextWord();
                    setTimeout(() => {
                        this.playAudio();
                        if (this._root().autoListen) {
                            setTimeout(() => this.startListening(), 1300);
                        }
                    }, 500);
                }
            }, 2000);
        }

        if (isCorrect) {
            setTimeout(() => {
                const p = this._play();
                const r = this._root();
                if (p.isCorrect === true && r.currentStep === 'PLAY') {
                    this.nextStep();
                    if (this._root().currentStep === 'PLAY') {
                        setTimeout(() => {
                            this.playAudio();
                            if (this._root().autoListen) {
                                setTimeout(() => this.startListening(), 1300);
                            }
                        }, 500);
                    }
                }
            }, 2000);
        }

        if (!isCorrect && this._play().attemptCount < 3 && this._root().currentStep === 'PLAY') {
            setTimeout(() => {
                const r = this._root();
                if (r.currentStep === 'PLAY' && !r.isFinished && r.autoListen) {
                    this.startListening();
                }
            }, 1600);
        }
    }

    public nextWord(): void {
        const root = this._root();
        const play = this._play();
        const nextIndex = play.currentIndex + 1;

        if (nextIndex >= root.words.length) {
            this._root.update(s => ({
                ...s,
                currentStep: 'RESULTS',
                isFinished: true
            }));
            this._play.update(p => ({ ...p, currentIndex: root.words.length, isCorrect: null, showWord: false, attemptCount: 0 }));
        } else {
            this._play.update(p => ({
                ...p,
                currentIndex: nextIndex,
                isCorrect: null,
                lastTranscript: '',
                showWord: false,
                attemptCount: 0
            }));
        }
    }

    public nextStep(): void {
        const r = this._root();
        if (r.currentStep === 'PLAY') {
            const p = this._play();
            const nextIndex = p.currentIndex + 1;
            if (nextIndex >= r.words.length) {
                this._root.update(s => ({
                    ...s,
                    currentStep: 'RESULTS',
                    isFinished: true
                }));
                this._play.update(play => ({ ...play, currentIndex: r.words.length, isCorrect: null, showWord: false, attemptCount: 0 }));
            } else {
                this.nextWord();
            }
        }
    }

    public prevStep(): void {
        const r = this._root();
        if (r.currentStep === 'PLAY') {
            const p = this._play();
            if (p.currentIndex > 0) {
                this._play.update(play => ({
                    ...play,
                    currentIndex: play.currentIndex - 1,
                    isCorrect: null,
                    lastTranscript: '',
                    showWord: false,
                    attemptCount: 0
                }));
            }
        }
    }

    public playAudio(): void {
        const playVm = this.playViewModel();
        if (playVm.currentWord) {
            this.speechService.speak(playVm.targetText, playVm.targetLangCode);
        }
    }

    public async startListening(): Promise<void> {
        const playVm = this.playViewModel();
        if (!playVm.currentWord) return;
        try {
            this.speechService.stopListening();
            const transcript = await this.speechService.listen(playVm.targetLangCode);
            this.checkTranscript(transcript);
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Błąd mikrofonu',
                detail: typeof error === 'string' ? error : 'Nie udało się rozpoznać mowy.'
            });
        }
    }

    public incrementAttempts(): void {
        this._play.update(p => ({ ...p, attemptCount: p.attemptCount + 1 }));
    }

    public failAttempt(): void {
        this._play.update(p => ({ ...p, attemptCount: p.attemptCount + 1, isCorrect: false }));
    }

    public toggleWord(): void {
        this._play.update(p => ({ ...p, showWord: !p.showWord }));
    }

    public toggleAutoListen(): void {
        this._root.update(s => ({ ...s, autoListen: !s.autoListen }));
    }

    public toggleMode(): void {
        this._root.update(s => ({ ...s, isSwapped: !s.isSwapped }));
        this.resetGame();
    }

    public resetGame(): void {
        this._root.update(s => {
            const words = [...(s.chapter?.words || [])].sort(() => Math.random() - 0.5);
            return {
                ...s,
                currentStep: 'PLAY',
                isFinished: false,
                words
            };
        });
        this._play.set(initialPlay);
        this._result.set(initialResult);
    }
}

