import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { GameStore } from '../../game.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Chapter, WordPair } from '../../../chapter/model/chapter.model';

export type TranslationDirection = 'toLang2' | 'toLang1';
export type ResultFilter = 'ALL' | 'CORRECT' | 'INCORRECT';

export interface ExamRootState {
    isLoading: boolean;
    currentStep: 'QUESTIONS' | 'SUMMARY' | 'RESULTS';
    chapterId: string | null;
    chapter: Chapter | null;
    lang1: string;
    lang2: string;
    cards: WordPair[];
    direction: TranslationDirection;
}

export interface RootViewModel {
    state: ExamRootState;
    stepIndex: number;
    totalCount: number;
}

export interface ExamPlayState {
    currentIndex: number;
    currentInput: string;
    drafts: string[];
}

export interface QuestionViewModel {
    state: ExamPlayState;
    sourceWord: string;
    targetWord: string;
    sourceLang: string;
    targetLang: string;
    progressPercent: number;
    counterText: string;
    isSubmitDisabled: boolean;
    isPrevDisabled: boolean;
    isNextDisabled: boolean;
}

export interface ExamAnswer {
    card: WordPair;
    sourceWord: string;
    targetWord: string;
    userAnswer: string;
    isCorrect: boolean;
}

export interface SummaryItem {
    card: WordPair;
    sourceWord: string;
}

export interface SummaryViewModel {
    state: ExamRootState;
    items: SummaryItem[];
    answers: ExamAnswer[];
}

export interface ExamResultState {
    score: number;
    answers: ExamAnswer[];
    filter: ResultFilter;
}

export interface ResultViewModel {
    state: ExamResultState;
    filteredAnswers: ExamAnswer[];
    correctCount: number;
    incorrectCount: number;
    totalAnswersCount: number;
    scoreText: string;
    percentText: string;
    chapterId: string | null;
}

const initialRoot: ExamRootState = {
    isLoading: true,
    currentStep: 'QUESTIONS',
    chapterId: null,
    chapter: null,
    lang1: 'PL',
    lang2: 'EN',
    cards: [],
    direction: 'toLang2'
};

const initialPlay: ExamPlayState = {
    currentIndex: 0,
    currentInput: '',
    drafts: []
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

    private readonly _root = signal<ExamRootState>(initialRoot);
    private readonly _play = signal<ExamPlayState>(initialPlay);
    private readonly _result = signal<ExamResultState>(initialResult);

    public readonly rootViewModel = computed((): RootViewModel => {
        const root = this._root();
        const stepIndex: number = root.currentStep === 'QUESTIONS'
            ? 0
            : root.currentStep === 'SUMMARY' ? 1 : 2;

        return {
            state: root,
            stepIndex: stepIndex,
            totalCount: root.cards.length
        };
    });

    public readonly questionViewModel = computed((): QuestionViewModel => {
        const root = this._root();
        const play = this._play();
        const cards = root.cards;
        const card = cards[play.currentIndex];

        const sourceWord = card ? (root.direction === 'toLang2' ? card.pl : card.eng) : '';
        const targetWord = card ? (root.direction === 'toLang2' ? card.eng : card.pl) : '';

        const total = cards.length;
        const index = play.currentIndex;

        return {
            state: play,
            sourceWord: sourceWord,
            targetWord: targetWord,
            sourceLang: root.direction === 'toLang2' ? root.lang1 : root.lang2,
            targetLang: root.direction === 'toLang2' ? root.lang2 : root.lang1,
            progressPercent: total > 0 ? Math.floor((index / total) * 100) : 0,
            counterText: `${index + 1} / ${total}`,
            isSubmitDisabled: !play.currentInput.trim(),
            isPrevDisabled: index === 0,
            isNextDisabled: index >= total - 1
        };
    });

    public readonly summaryViewModel = computed((): SummaryViewModel => {
        const root = this._root();
        const result = this._result();

        const items: SummaryItem[] = root.cards.map(card => ({
            card,
            sourceWord: root.direction === 'toLang2' ? card.pl : card.eng
        }));

        return {
            state: root,
            items,
            answers: result.answers
        };
    });

    public readonly resultViewModel = computed((): ResultViewModel => {
        const root = this._root();
        const result = this._result();
        const total = root.cards.length;
        const correctCount = result.answers.filter(a => a.isCorrect).length;
        const incorrectCount = result.answers.filter(a => !a.isCorrect).length;

        const filteredAnswers =
            result.filter === 'CORRECT'
                ? result.answers.filter(a => a.isCorrect)
                : result.filter === 'INCORRECT'
                    ? result.answers.filter(a => !a.isCorrect)
                    : result.answers;

        return {
            state: result,
            filteredAnswers: filteredAnswers,
            correctCount: correctCount,
            incorrectCount: incorrectCount,
            totalAnswersCount: result.answers.length,
            scoreText: `${result.score} / ${total}`,
            percentText: total > 0 ? `${Math.round((result.score / total) * 100)}%` : '0%',
            chapterId: root.chapterId
        };
    });

    public loadGame(id: string): void {
        this._root.update(m => ({ ...m, isLoading: true, chapterId: id }));

        this.gamesStore.loadGameData(id).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (chapter: Chapter) => {
                const shuffledCards = [...chapter.words].sort(() => Math.random() - 0.5);
                this._root.set({
                    isLoading: false,
                    currentStep: 'QUESTIONS',
                    chapterId: chapter.id || null,
                    chapter,
                    lang1: chapter.lang1 || 'PL',
                    lang2: chapter.lang2 || 'EN',
                    cards: shuffledCards,
                    direction: 'toLang2'
                });
                this._play.set({
                    ...initialPlay,
                    drafts: new Array(shuffledCards.length).fill('')
                });
                this._result.set(initialResult);
            },
            error: () => this._root.update(m => ({ ...m, isLoading: false }))
        });
    }

    public toggleDirection(): void {
        this._root.update(c => ({
            ...c,
            direction: c.direction === 'toLang2' ? 'toLang1' : 'toLang2'
        }));
    }

    public setResultFilter(filter: ResultFilter): void {
        this._result.update(r => ({ ...r, filter: filter }));
    }

    public updateInput(val: string): void {
        this._play.update(p => {
            const drafts = [...p.drafts];
            if (p.currentIndex < drafts.length) {
                drafts[p.currentIndex] = val;
            }
            return {
                ...p,
                currentInput: val,
                drafts: drafts
            };
        });
    }

    public submitAnswer(): void {
        const root = this._root();
        const play = this._play();
        const card = root.cards[play.currentIndex];
        const userVal = play.currentInput.trim().toLowerCase();
        if (!userVal || !card) return;

        const targetWord = root.direction === 'toLang2' ? card.eng : card.pl;
        const sourceWord = root.direction === 'toLang2' ? card.pl : card.eng;
        const isCorrect = userVal === targetWord.trim().toLowerCase();

        this._recordAnswer(card, sourceWord, targetWord, play.currentInput, isCorrect);
    }

    public skip(): void {
        const root = this._root();
        const play = this._play();
        const card = root.cards[play.currentIndex];
        if (!card) return;

        const targetWord = root.direction === 'toLang2' ? card.eng : card.pl;
        const sourceWord = root.direction === 'toLang2' ? card.pl : card.eng;

        this._recordAnswer(card, sourceWord, targetWord, '', false);
    }

    private _recordAnswer(
        card: WordPair,
        sourceWord: string,
        targetWord: string,
        userAnswer: string,
        isCorrect: boolean
    ): void {
        const root = this._root();
        const play = this._play();
        const result = this._result();
        const nextIndex: number = play.currentIndex + 1;
        const newScore: number = isCorrect ? result.score + 1 : result.score;

        const newAnswer: ExamAnswer = { card, sourceWord, targetWord, userAnswer, isCorrect };
        const updatedAnswers: ExamAnswer[] = [...result.answers, newAnswer];

        this._result.update(r => ({ ...r, score: newScore, answers: updatedAnswers }));

        if (nextIndex >= root.cards.length) {
            this._root.update(m => ({ ...m, currentStep: 'SUMMARY' }));
        }

        this._play.update(p => {
            const nextIndex = p.currentIndex + 1;
            return {
                ...p,
                currentIndex: nextIndex,
                currentInput: p.drafts[nextIndex] || ''
            };
        });
    }

    public nextQuestion(): void {
        const root = this._root();
        const play = this._play();
        if (play.currentIndex < root.cards.length - 1) {
            const nextIndex = play.currentIndex + 1;
            this._play.update(p => ({
                ...p,
                currentIndex: nextIndex,
                currentInput: p.drafts[nextIndex] || ''
            }));
        } else {
            this._root.update(m => ({ ...m, currentStep: 'SUMMARY' }));
        }
    }

    public nextStep(): void {
        if (this._root().currentStep === 'SUMMARY') {
            this._root.update(m => ({ ...m, currentStep: 'RESULTS' }));
        }
    }

    public prevStep(): void {
        const root = this._root();
        const play = this._play();

        if (root.currentStep === 'QUESTIONS') {
            if (play.currentIndex > 0) {
                const prevIndex = play.currentIndex - 1;
                this._play.update(p => ({
                    ...p,
                    currentIndex: prevIndex,
                    currentInput: p.drafts[prevIndex] || ''
                }));
            }
        } else if (root.currentStep === 'SUMMARY') {
            const lastIndex = root.cards.length - 1;
            this._root.update(m => ({ ...m, currentStep: 'QUESTIONS' }));
            this._play.update(p => ({
                ...p,
                currentIndex: lastIndex,
                currentInput: p.drafts[lastIndex] || ''
            }));
        }
    }

    public forceSummary(): void {
        this._root.update(m => ({ ...m, currentStep: 'SUMMARY' }));
    }

    public goToItem(index: number): void {
        this._root.update(m => ({ ...m, currentStep: 'QUESTIONS' }));
        this._play.update(p => ({
            ...p,
            currentIndex: index,
            currentInput: p.drafts[index] || ''
        }));
    }

    public restartGame(): void {
        const id = this._root().chapterId;
        if (id) {
            this.loadGame(id);
        }
    }

    public close(): void {
        const id = this._root().chapterId;
        if (id) {
            this.router.navigate(['/chapters', id]);
        } else {
            this.router.navigate(['/chapters']);
        }
    }
}
