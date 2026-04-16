import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { GameStore } from '../../game.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Chapter, WordPair } from '../../../chapter/model/chapter.model';

export type TranslationDirection = 'toLang2' | 'toLang1';
export type ResultFilter = 'ALL' | 'CORRECT' | 'INCORRECT';

export interface ExamAnswer {
    card: WordPair;
    sourceWord: string;
    targetWord: string;
    userAnswer: string;
    isCorrect: boolean;
}

export interface ExamMetaState {
    isLoading: boolean;
    currentStep: 'QUESTIONS' | 'SUMMARY' | 'RESULTS';
}

export interface ExamConfigState {
    chapterId: string | null;
    chapter: Chapter | null;
    lang1: string;
    lang2: string;
    cards: WordPair[];
    direction: TranslationDirection;
}

export interface RootViewModel {
    isLoading: boolean;
    currentStep: 'QUESTIONS' | 'SUMMARY' | 'RESULTS';
    stepIndex: number;
    totalCount: number;
    chapterId: string | null;
}


export interface ExamPlayState {
    currentIndex: number;
    currentInput: string;
}

export interface QuestionViewModel {
    sourceWord: string;
    targetWord: string;
    sourceLang: string;
    targetLang: string;
    progressPercent: number;
    counterText: string;
    isSubmitDisabled: boolean;
    currentInput: string;
}


export interface SummaryViewModel {
    answers: ExamAnswer[];
    cards: WordPair[];
    direction: TranslationDirection;
}

export interface ExamResultState {
    score: number;
    answers: ExamAnswer[];
    filter: ResultFilter;
}

export interface ResultViewModel {
    filter: ResultFilter;
    filteredAnswers: ExamAnswer[];
    correctCount: number;
    incorrectCount: number;
    totalAnswersCount: number;
    scoreText: string;
    percentText: string;
    chapterId: string | null;
}

const initialMeta: ExamMetaState = {
    isLoading: true,
    currentStep: 'QUESTIONS'
};

const initialConfig: ExamConfigState = {
    chapterId: null,
    chapter: null,
    lang1: 'PL',
    lang2: 'EN',
    cards: [],
    direction: 'toLang2'
};

const initialPlay: ExamPlayState = {
    currentIndex: 0,
    currentInput: ''
};

const initialResult: ExamResultState = {
    score: 0,
    answers: [],
    filter: 'ALL'
};

@Injectable()
export class ExamLocalStore {
    private readonly gamesStore = inject(GameStore);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);

    private readonly _meta = signal<ExamMetaState>(initialMeta);
    private readonly _config = signal<ExamConfigState>(initialConfig);
    private readonly _play = signal<ExamPlayState>(initialPlay);
    private readonly _result = signal<ExamResultState>(initialResult);

    public readonly rootViewModel = computed((): RootViewModel => {
        const meta = this._meta();
        const config = this._config();
        const stepIndex = meta.currentStep === 'QUESTIONS' ? 0
            : meta.currentStep === 'SUMMARY' ? 1 : 2;

        return {
            isLoading: meta.isLoading,
            currentStep: meta.currentStep,
            stepIndex,
            totalCount: config.cards.length,
            chapterId: config.chapterId
        };
    });

    public readonly questionViewModel = computed((): QuestionViewModel => {
        const config = this._config();
        const play = this._play();
        const cards = config.cards;
        const total = cards.length;
        const index = play.currentIndex;
        const card = cards[index];

        const sourceWord = card ? (config.direction === 'toLang2' ? card.pl : card.eng) : '';
        const targetWord = card ? (config.direction === 'toLang2' ? card.eng : card.pl) : '';

        return {
            sourceWord,
            targetWord,
            sourceLang: config.direction === 'toLang2' ? config.lang1 : config.lang2,
            targetLang: config.direction === 'toLang2' ? config.lang2 : config.lang1,
            progressPercent: total > 0 ? Math.floor((index / total) * 100) : 0,
            counterText: `${index + 1} / ${total}`,
            isSubmitDisabled: !play.currentInput.trim(),
            currentInput: play.currentInput
        };
    });

    public readonly summaryViewModel = computed((): SummaryViewModel => {
        const config = this._config();
        const result = this._result();

        return {
            answers: result.answers,
            cards: config.cards,
            direction: config.direction
        };
    });

    public readonly resultViewModel = computed((): ResultViewModel => {
        const config = this._config();
        const result = this._result();
        const total = config.cards.length;
        const correctCount = result.answers.filter(a => a.isCorrect).length;
        const incorrectCount = result.answers.filter(a => !a.isCorrect).length;

        const filteredAnswers =
            result.filter === 'CORRECT' ? result.answers.filter(a => a.isCorrect) :
                result.filter === 'INCORRECT' ? result.answers.filter(a => !a.isCorrect) :
                    result.answers;

        return {
            filter: result.filter,
            filteredAnswers: filteredAnswers,
            correctCount: correctCount,
            incorrectCount: incorrectCount,
            totalAnswersCount: result.answers.length,
            scoreText: `${result.score} / ${total}`,
            percentText: total > 0 ? `${Math.round((result.score / total) * 100)}%` : '0%',
            chapterId: config.chapterId
        };
    });

    public loadGame(id: string): void {
        this._meta.update(m => ({ ...m, isLoading: true }));
        this._config.update(c => ({ ...c, chapterId: id }));

        this.gamesStore.loadGameData(id).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (chapter: Chapter) => {
                const shuffledCards = [...chapter.words].sort(() => Math.random() - 0.5);
                this._meta.set({ isLoading: false, currentStep: 'QUESTIONS' });
                this._config.set({
                    chapterId: chapter.id || null,
                    chapter,
                    lang1: chapter.lang1 || 'PL',
                    lang2: chapter.lang2 || 'EN',
                    cards: shuffledCards,
                    direction: 'toLang2'
                });
                this._play.set(initialPlay);
                this._result.set(initialResult);
            },
            error: () => this._meta.update(m => ({ ...m, isLoading: false }))
        });
    }

    public toggleDirection(): void {
        this._config.update(c => ({
            ...c,
            direction: c.direction === 'toLang2' ? 'toLang1' : 'toLang2'
        }));
    }

    public setResultFilter(filter: ResultFilter): void {
        this._result.update(r => ({ ...r, filter: filter }));
    }

    public updateInput(val: string): void {
        this._play.update(p => ({ ...p, currentInput: val }));
    }

    public submitAnswer(): void {
        const config = this._config();
        const play = this._play();
        const card = config.cards[play.currentIndex];
        const userVal = play.currentInput.trim().toLowerCase();
        if (!userVal || !card) return;

        const targetWord = config.direction === 'toLang2' ? card.eng : card.pl;
        const sourceWord = config.direction === 'toLang2' ? card.pl : card.eng;
        const isCorrect = userVal === targetWord.trim().toLowerCase();

        this._recordAnswer(card, sourceWord, targetWord, play.currentInput, isCorrect);
    }

    public skip(): void {
        const config = this._config();
        const play = this._play();
        const card = config.cards[play.currentIndex];
        if (!card) return;

        const targetWord = config.direction === 'toLang2' ? card.eng : card.pl;
        const sourceWord = config.direction === 'toLang2' ? card.pl : card.eng;

        this._recordAnswer(card, sourceWord, targetWord, '', false);
    }

    private _recordAnswer(
        card: WordPair,
        sourceWord: string,
        targetWord: string,
        userAnswer: string,
        isCorrect: boolean
    ): void {
        const config = this._config();
        const play = this._play();
        const result = this._result();
        const nextIndex = play.currentIndex + 1;
        const newScore = isCorrect ? result.score + 1 : result.score;

        const newAnswer: ExamAnswer = { card, sourceWord, targetWord, userAnswer, isCorrect };
        const updatedAnswers = [...result.answers, newAnswer];

        this._result.update(r => ({ ...r, score: newScore, answers: updatedAnswers }));

        if (nextIndex >= config.cards.length) {
            this._meta.update(m => ({ ...m, currentStep: 'SUMMARY' }));
            this._play.update(p => ({ ...p, currentIndex: nextIndex, currentInput: '' }));
        } else {
            this._play.update(p => ({ ...p, currentIndex: nextIndex, currentInput: '' }));
        }
    }

    public nextStep(): void {
        if (this._meta().currentStep === 'SUMMARY') {
            this._meta.update(m => ({ ...m, currentStep: 'RESULTS' }));
        }
    }

    public prevStep(): void {
        const meta = this._meta();
        const play = this._play();

        if (meta.currentStep === 'QUESTIONS') {
            if (play.currentIndex > 0) {
                this._play.update(p => ({ ...p, currentIndex: p.currentIndex - 1, currentInput: '' }));
            }
        } else if (meta.currentStep === 'SUMMARY') {
            const lastIndex = this._config().cards.length - 1;
            this._meta.update(m => ({ ...m, currentStep: 'QUESTIONS' }));
            this._play.update(p => ({ ...p, currentIndex: lastIndex }));
        }
    }

    public forceSummary(): void {
        this._meta.update(m => ({ ...m, currentStep: 'SUMMARY' }));
    }

    public goToItem(index: number): void {
        this._meta.update(m => ({ ...m, currentStep: 'QUESTIONS' }));
        this._play.update(p => ({ ...p, currentIndex: index, currentInput: '' }));
    }

    public restartGame(): void {
        const id = this._config().chapterId;
        if (id) {
            this.loadGame(id);
        }
    }

    public close(): void {
        const id = this._config().chapterId;
        if (id) {
            this.router.navigate(['/chapters', id]);
        } else {
            this.router.navigate(['/chapters']);
        }
    }
}
