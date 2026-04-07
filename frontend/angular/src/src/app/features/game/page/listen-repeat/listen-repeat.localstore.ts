import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { Chapter, WordPair } from '../../../chapter/model/chapter.model';
import { GameStore } from '../../game.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SpeechService } from '../../../../core/services/speech.service';
import { MessageService } from 'primeng/api';

export interface ListenRepeatState {
    chapterId: string;
    chapter: Chapter | null;
    isLoading: boolean;
    currentIndex: number;
    words: WordPair[];
    score: number;
    isFinished: boolean; // Keep for compatibility
    autoListen: boolean;
    lastTranscript: string;
    isCorrect: boolean | null;
    isSwapped: boolean;
    showWord: boolean;
    attemptCount: number;
    currentStep: 'PLAY' | 'RESULTS';
}

export interface ListenRepeatViewModel {
    state: ListenRepeatState;
    totalCount: number;
    targetText: string;
    targetLangCode: string;
    progress: number;
    isListening: boolean;
    lang1: string;
    lang2: string;
    currentWord: WordPair | null;
}

const initialState: ListenRepeatState = {
    chapterId: '',
    chapter: null,
    isLoading: false,
    currentIndex: 0,
    words: [],
    score: 0,
    isFinished: false,
    autoListen: true,
    lastTranscript: '',
    isCorrect: null,
    isSwapped: false,
    showWord: false,
    attemptCount: 0,
    currentStep: 'PLAY'
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
        const words = s.words;
        const index = s.currentIndex;
        const totalCount = words.length;
        const currentWord = words[index] || null;

        const targetText = currentWord
            ? (s.isSwapped ? currentWord.pl : currentWord.eng)
            : '';

        return {
            state: s,
            totalCount,
            targetText,
            targetLangCode: s.isSwapped ? 'pl-PL' : 'en-US',
            progress: totalCount > 0 ? (index / totalCount) * 100 : 0,
            isListening: false,
            lang1: s.chapter?.lang1 || 'Polski',
            lang2: s.chapter?.lang2 || 'Angielski',
            currentWord
        };
    });

    // Methods
    public handleLoadGame(id: string): void {
        this._patch({ isLoading: true, chapterId: id });
        this.gamesStore.loadGameData(id).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (chapter: Chapter) => {
                const words = [...chapter.words].sort(() => Math.random() - 0.5);
                this._patch({
                    chapter,
                    words,
                    isLoading: false,
                    currentStep: 'PLAY',
                    currentIndex: 0,
                    score: 0,
                    isFinished: false
                });
            },
            error: () => this._patch({ isLoading: false })
        });
    }

    public checkTranscript(transcript: string): void {
        const target = this.viewModel().targetText.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
        const heard = transcript.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
        const isCorrect = target === heard;

        this._state.update(s => {
            const newScore = isCorrect ? s.score + 1 : s.score;
            const newAttemptCount = isCorrect ? s.attemptCount : s.attemptCount + 1;

            return {
                ...s,
                isCorrect,
                score: newScore,
                attemptCount: newAttemptCount,
                lastTranscript: transcript
            };
        });

        // Auto-skip after 3 attempts
        if (!isCorrect && this._state().attemptCount >= 3) {
            setTimeout(() => {
                if (this._state().attemptCount >= 3) {
                    this.nextWord();
                    this.playAudio();
                }
            }, 2000);
        }

        if (isCorrect) {
            setTimeout(() => {
                const s = this._state();
                if (s.isCorrect === true) {
                    this.nextStep();
                    this.playAudio();
                }
            }, 1800);
        }

        const state = this._state();
        if (state.currentStep === 'PLAY') {
            setTimeout(() => {
                const s = this._state();
                if (s.currentStep === 'PLAY' && !s.isFinished) {
                    this.startListening();
                }
            }, 2800);
        }
    }

    public nextWord(): void {
        const s = this._state();
        const nextIndex = s.currentIndex + 1;

        if (nextIndex >= s.words.length) {
            this._patch({ currentIndex: s.words.length, isCorrect: null, showWord: false, attemptCount: 0, currentStep: 'RESULTS', isFinished: true });
        } else {
            this._patch({
                currentIndex: nextIndex,
                isCorrect: null,
                lastTranscript: '',
                showWord: false,
                attemptCount: 0
            });
        }
    }

    public nextStep(): void {
        const s = this._state();
        if (s.currentStep === 'PLAY') {
            const nextIndex = s.currentIndex + 1;
            if (nextIndex >= s.words.length) {
                this._patch({ currentIndex: s.words.length, isCorrect: null, showWord: false, attemptCount: 0, currentStep: 'RESULTS', isFinished: true });
            } else {
                this.nextWord();
            }
        }
    }

    public prevStep(): void {
        const s = this._state();
        if (s.currentStep === 'PLAY') {
            if (s.currentIndex > 0) {
                this._patch({ currentIndex: s.currentIndex - 1, isCorrect: null, lastTranscript: '', showWord: false, attemptCount: 0 });
            }
        }
    }


    public playAudio(): void {
        const vm = this.viewModel();
        this.speechService.speak(vm.targetText, vm.targetLangCode);
    }

    public async startListening(): Promise<void> {
        try {
            const transcript = await this.speechService.listen(this.viewModel().targetLangCode);
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
        this._patch({ attemptCount: this._state().attemptCount + 1 });
    }

    public failAttempt(): void {
        this._patch({
            attemptCount: this._state().attemptCount + 1,
            isCorrect: false
        });
    }

    public toggleWord(): void {
        this._patch({ showWord: !this._state().showWord });
    }

    public toggleAutoListen(): void {
        this._patch({ autoListen: !this._state().autoListen });
    }

    public toggleMode(): void {
        this._patch({ isSwapped: !this._state().isSwapped });
        this.resetGame();
    }

    public resetGame(): void {
        const s = this._state();
        const words = [...(s.chapter?.words || [])].sort(() => Math.random() - 0.5);
        this._patch({
            currentIndex: 0,
            score: 0,
            isFinished: false,
            words: words,
            isCorrect: null,
            lastTranscript: '',
            showWord: false,
            attemptCount: 0,
            currentStep: 'PLAY'
        });
    }

    private _patch(patch: Partial<ListenRepeatState>): void {
        this._state.update(s => ({ ...s, ...patch }));
    }
}
