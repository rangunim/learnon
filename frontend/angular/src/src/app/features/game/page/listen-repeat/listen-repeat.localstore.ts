import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { Chapter, WordPair } from '../../../chapter/model/chapter.model';
import { GameStore } from '../../game.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SpeechService } from '../../../../core/services/speech.service';
import { MessageService } from 'primeng/api';

export interface ListenConfigState {
    chapterId: string | null;
    chapter: Chapter | null;
    lang1: string;
    lang2: string;
    words: WordPair[];
    isSwapped: boolean;
    autoListen: boolean;
}

export interface ListenPlayState {
    currentIndex: number;
    lastTranscript: string;
    isCorrect: boolean | null;
    showWord: boolean;
    attemptCount: number;
}

export interface ListenResultState {
    score: number;
}

export interface ListenRepeatState {
    isLoading: boolean;
    currentStep: 'PLAY' | 'RESULTS';
    isFinished: boolean;
    config: ListenConfigState;
    play: ListenPlayState;
    result: ListenResultState;
}

export interface PlayViewModel {
    currentIndex: number;
    targetText: string;
    targetLangCode: string;
    progressPercent: number;
    isListening: boolean;
    currentWord: WordPair | null;
    isCorrect: boolean | null;
    showWord: boolean;
    attemptCount: number;
    lastTranscript: string;
    autoListen: boolean;
    currentSourceLang: string;
}

export interface ResultViewModel {
    score: number;
    totalCount: number;
    chapterId: string | null;
}

export interface ListenRepeatViewModel {
    isLoading: boolean;
    currentStep: 'PLAY' | 'RESULTS';
    totalCount: number;
    chapterId: string | null;

    play?: PlayViewModel;
    result?: ResultViewModel;
}

const initialState: ListenRepeatState = {
    isLoading: false,
    currentStep: 'PLAY',
    isFinished: false,
    config: {
        chapterId: null,
        chapter: null,
        lang1: 'Polski',
        lang2: 'Angielski',
        words: [],
        isSwapped: false,
        autoListen: true
    },
    play: {
        currentIndex: 0,
        lastTranscript: '',
        isCorrect: null,
        showWord: false,
        attemptCount: 0
    },
    result: {
        score: 0
    }
};

@Injectable()
export class ListenRepeatLocalStore {
    private readonly gamesStore = inject(GameStore);
    private readonly destroyRef = inject(DestroyRef);
    private readonly _state = signal<ListenRepeatState>(initialState);
    private readonly speechService = inject(SpeechService);
    private readonly messageService = inject(MessageService);

    // Selectors
    public readonly viewModel = computed((): ListenRepeatViewModel => {
        const s = this._state();
        const words = s.config.words;
        const totalCount = words.length;

        let playVM: PlayViewModel | undefined = undefined;
        let resultVM: ResultViewModel | undefined = undefined;

        if (s.currentStep === 'PLAY') {
            const currentWord = words[s.play.currentIndex] || null;
            const targetText = currentWord ? (s.config.isSwapped ? currentWord.pl : currentWord.eng) : '';

            playVM = {
                currentIndex: s.play.currentIndex,
                targetText,
                targetLangCode: s.config.isSwapped ? 'pl-PL' : 'en-US',
                progressPercent: totalCount > 0 ? (s.play.currentIndex / totalCount) * 100 : 0,
                isListening: false,
                currentWord,
                isCorrect: s.play.isCorrect,
                showWord: s.play.showWord,
                attemptCount: s.play.attemptCount,
                lastTranscript: s.play.lastTranscript,
                autoListen: s.config.autoListen,
                currentSourceLang: s.config.isSwapped ? s.config.lang1 : s.config.lang2
            };
        }

        if (s.currentStep === 'RESULTS') {
            resultVM = {
                score: s.result.score,
                totalCount,
                chapterId: s.config.chapterId
            };
        }

        return {
            isLoading: s.isLoading,
            currentStep: s.currentStep,
            totalCount,
            chapterId: s.config.chapterId,
            play: playVM,
            result: resultVM
        };
    });

    // Methods
    public handleLoadGame(id: string): void {
        this._state.update(s => ({ ...s, isLoading: true, config: { ...s.config, chapterId: id } }));
        this.gamesStore.loadGameData(id).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (chapter: Chapter) => {
                const words = [...chapter.words].sort(() => Math.random() - 0.5);
                this._state.set({
                    isLoading: false,
                    currentStep: 'PLAY',
                    isFinished: false,
                    config: {
                        chapterId: chapter.id || null,
                        chapter,
                        lang1: chapter.lang1 || 'Polski',
                        lang2: chapter.lang2 || 'Angielski',
                        words,
                        isSwapped: false,
                        autoListen: true
                    },
                    play: {
                        currentIndex: 0,
                        lastTranscript: '',
                        isCorrect: null,
                        showWord: false,
                        attemptCount: 0
                    },
                    result: {
                        score: 0
                    }
                });
            },
            error: () => this._state.update(s => ({ ...s, isLoading: false }))
        });
    }

    public checkTranscript(transcript: string): void {
        const vm = this.viewModel();
        if (!vm.play) return;

        const target = vm.play.targetText.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
        const heard = transcript.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
        const isCorrect = target === heard;

        this._state.update(s => {
            const newScore = isCorrect ? s.result.score + 1 : s.result.score;
            const newAttemptCount = isCorrect ? s.play.attemptCount : s.play.attemptCount + 1;

            return {
                ...s,
                play: {
                    ...s.play,
                    isCorrect,
                    attemptCount: newAttemptCount,
                    lastTranscript: transcript
                },
                result: {
                    ...s.result,
                    score: newScore
                }
            };
        });

        // Auto-skip after 3 attempts
        if (!isCorrect && this._state().play.attemptCount >= 3) {
            setTimeout(() => {
                const state = this._state();
                if (state.play.attemptCount >= 3 && state.currentStep === 'PLAY') {
                    this.nextWord();
                    this.playAudio();
                }
            }, 2000);
        }

        if (isCorrect) {
            setTimeout(() => {
                const s = this._state();
                if (s.play.isCorrect === true && s.currentStep === 'PLAY') {
                    this.nextStep();
                    this.playAudio();
                }
            }, 1800);
        }

        const stateCheck = this._state();
        if (stateCheck.currentStep === 'PLAY') {
            setTimeout(() => {
                const s = this._state();
                if (s.currentStep === 'PLAY' && !s.isFinished && s.config.autoListen) {
                    this.startListening();
                }
            }, 2800);
        }
    }

    public nextWord(): void {
        const s = this._state();
        const nextIndex = s.play.currentIndex + 1;

        if (nextIndex >= s.config.words.length) {
            this._state.update(state => ({
                ...state,
                currentStep: 'RESULTS',
                isFinished: true,
                play: { ...state.play, currentIndex: state.config.words.length, isCorrect: null, showWord: false, attemptCount: 0 }
            }));
        } else {
            this._state.update(state => ({
                ...state,
                play: {
                    ...state.play,
                    currentIndex: nextIndex,
                    isCorrect: null,
                    lastTranscript: '',
                    showWord: false,
                    attemptCount: 0
                }
            }));
        }
    }

    public nextStep(): void {
        const s = this._state();
        if (s.currentStep === 'PLAY') {
            const nextIndex = s.play.currentIndex + 1;
            if (nextIndex >= s.config.words.length) {
                this._state.update(state => ({
                    ...state,
                    currentStep: 'RESULTS',
                    isFinished: true,
                    play: { ...state.play, currentIndex: state.config.words.length, isCorrect: null, showWord: false, attemptCount: 0 }
                }));
            } else {
                this.nextWord();
            }
        }
    }

    public prevStep(): void {
        const s = this._state();
        if (s.currentStep === 'PLAY') {
            if (s.play.currentIndex > 0) {
                this._state.update(state => ({
                    ...state,
                    play: {
                        ...state.play,
                        currentIndex: state.play.currentIndex - 1,
                        isCorrect: null,
                        lastTranscript: '',
                        showWord: false,
                        attemptCount: 0
                    }
                }));
            }
        }
    }

    public playAudio(): void {
        const vm = this.viewModel();
        if (vm.play) {
            this.speechService.speak(vm.play.targetText, vm.play.targetLangCode);
        }
    }

    public async startListening(): Promise<void> {
        const vm = this.viewModel();
        if (!vm.play) return;
        try {
            const transcript = await this.speechService.listen(vm.play.targetLangCode);
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
        this._state.update(state => ({
            ...state,
            play: { ...state.play, attemptCount: state.play.attemptCount + 1 }
        }));
    }

    public failAttempt(): void {
        this._state.update(state => ({
            ...state,
            play: { ...state.play, attemptCount: state.play.attemptCount + 1, isCorrect: false }
        }));
    }

    public toggleWord(): void {
        this._state.update(state => ({
            ...state,
            play: { ...state.play, showWord: !state.play.showWord }
        }));
    }

    public toggleAutoListen(): void {
        this._state.update(state => ({
            ...state,
            config: { ...state.config, autoListen: !state.config.autoListen }
        }));
    }

    public toggleMode(): void {
        this._state.update(state => ({
            ...state,
            config: { ...state.config, isSwapped: !state.config.isSwapped }
        }));
        this.resetGame();
    }

    public resetGame(): void {
        const s = this._state();
        const words = [...(s.config.chapter?.words || [])].sort(() => Math.random() - 0.5);
        this._state.update(state => ({
            ...state,
            currentStep: 'PLAY',
            isFinished: false,
            config: { ...state.config, words },
            play: {
                currentIndex: 0,
                lastTranscript: '',
                isCorrect: null,
                showWord: false,
                attemptCount: 0
            },
            result: {
                score: 0
            }
        }));
    }
}
