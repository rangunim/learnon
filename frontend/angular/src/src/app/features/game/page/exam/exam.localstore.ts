import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { GameStore } from '../../game.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Chapter, WordPair } from '../../../chapter/model/chapter.model';

export type TranslationDirection = 'toLang2' | 'toLang1';

export interface ExamAnswer {
    card: WordPair;
    sourceWord: string;
    targetWord: string;
    userAnswer: string;
    isCorrect: boolean;
}

export interface ExamState {
    chapterId: string | null;
    chapter: Chapter | null;
    isLoading: boolean;
    lang1: string;
    lang2: string;
    cards: WordPair[];
    currentIndex: number;
    score: number;
    direction: TranslationDirection;
    currentStep: 'QUESTIONS' | 'SUMMARY' | 'RESULTS';
    currentInput: string;
    answers: ExamAnswer[];
}

export interface ExamViewModel {
    state: ExamState;
    totalCount: number;
    currentSourceWord: string;
    currentTargetWord: string;
    sourceLang: string;
    targetLang: string;
    progress: number;
    counterText: string;
    isSubmitDisabled: boolean;
    stepIndex: number;
}


const initialState: ExamState = {
    chapterId: null,
    chapter: null,
    isLoading: true,
    lang1: 'PL',
    lang2: 'EN',
    cards: [],
    currentIndex: 0,
    score: 0,
    direction: 'toLang2',
    currentStep: 'QUESTIONS',
    currentInput: '',
    answers: []
};

@Injectable()
export class ExamLocalStore {
    private readonly gamesStore = inject(GameStore);
    private readonly destroyRef = inject(DestroyRef);
    private readonly _state = signal<ExamState>(initialState);

    public readonly viewModel = computed((): ExamViewModel => {
        const s = this._state();
        const cards = s.cards;
        const totalCount = cards.length;
        const currentCard = cards[s.currentIndex];

        const sourceWord = currentCard ? (s.direction === 'toLang2' ? currentCard.pl : currentCard.eng) : '';
        const targetWord = currentCard ? (s.direction === 'toLang2' ? currentCard.eng : currentCard.pl) : '';

        return {
            state: s,
            totalCount,
            currentSourceWord: sourceWord,
            currentTargetWord: targetWord,
            sourceLang: s.direction === 'toLang2' ? s.lang1 : s.lang2,
            targetLang: s.direction === 'toLang2' ? s.lang2 : s.lang1,
            progress: totalCount > 0 ? Math.floor((s.currentIndex / totalCount) * 100) : 0,
            counterText: `${s.currentIndex + 1} / ${totalCount}`,
            isSubmitDisabled: !s.currentInput.trim(),
            stepIndex: s.currentStep === 'QUESTIONS' ? 0 : (s.currentStep === 'SUMMARY' ? 1 : 2)
        };
    })

    public loadGame(id: string): void {
        this._patch({ isLoading: true, chapterId: id });
        this.gamesStore.loadGameData(id).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (chapter: Chapter) => {
                const shuffledWords = [...chapter.words].sort(() => Math.random() - 0.5);
                this._patch({
                    chapterId: chapter.id || null,
                    chapter: chapter,
                    isLoading: false,
                    lang1: chapter.lang1 || 'PL',
                    lang2: chapter.lang2 || 'EN',
                    cards: shuffledWords,
                    currentIndex: 0,
                    score: 0,
                    direction: 'toLang2',
                    currentStep: 'QUESTIONS',
                    currentInput: '',
                    answers: []
                });
            },
            error: () => this._patch({ isLoading: false })
        });
    }

    public toggleDirection(): void {
        this._patch({
            direction: this._state().direction === 'toLang2' ? 'toLang1' : 'toLang2'
        });
    }

    public updateInput(val: string): void {
        this._patch({ currentInput: val });
    }

    public submitAnswer(): void {
        const s = this._state();
        const currentCard = s.cards[s.currentIndex];
        const userVal = s.currentInput.trim().toLowerCase();
        if (!userVal) return;

        const vm = this.viewModel();
        const targetVal = vm.currentTargetWord.trim().toLowerCase();
        const isCorrect = userVal === targetVal;

        this._recordAnswer(currentCard, s.currentInput, isCorrect, vm);
    }

    public skip(): void {
        const s = this._state();
        const currentCard = s.cards[s.currentIndex];
        const vm = this.viewModel();

        this._recordAnswer(currentCard, '', false, vm);
    }

    private _recordAnswer(card: WordPair, userAnswer: string, isCorrect: boolean, vm: ExamViewModel): void {
        const s = this._state();
        const nextIndex = s.currentIndex + 1;
        const newScore = isCorrect ? s.score + 1 : s.score;

        const newAnswer: ExamAnswer = {
            card,
            sourceWord: vm.currentSourceWord,
            targetWord: vm.currentTargetWord,
            userAnswer,
            isCorrect
        };
        const updatedAnswers = [...s.answers, newAnswer];

        if (nextIndex >= s.cards.length) {
            this._patch({
                currentIndex: nextIndex,
                score: newScore,
                currentStep: 'SUMMARY',
                currentInput: '',
                answers: updatedAnswers
            });
        } else {
            this._patch({
                currentIndex: nextIndex,
                score: newScore,
                currentInput: '',
                answers: updatedAnswers
            });
        }
    }

    public nextStep(): void {
        const s = this._state();
        if (s.currentStep === 'SUMMARY') {
            this._patch({ currentStep: 'RESULTS' });
        }
    }

    public prevStep(): void {
        const s = this._state();
        if (s.currentStep === 'QUESTIONS') {
            if (s.currentIndex > 0) {
                this._patch({ currentIndex: s.currentIndex - 1, currentInput: '' });
            }
        } else if (s.currentStep === 'SUMMARY') {
            this._patch({ currentStep: 'QUESTIONS', currentIndex: s.cards.length - 1 });
        }
    }

    public forceSummary(): void {
        this._patch({ currentStep: 'SUMMARY' });
    }

    public goToItem(index: number): void {
        this._patch({
            currentIndex: index,
            currentStep: 'QUESTIONS',
            currentInput: ''
        });
    }

    public restartGame(): void {
        const id = this._state().chapterId;
        if (id) {
            this.loadGame(id);
        }
    }

    private _patch(patch: Partial<ExamState>): void {
        this._state.update(s => ({ ...s, ...patch }));
    }
}
