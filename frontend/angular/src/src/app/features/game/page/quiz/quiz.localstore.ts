import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { GameStore } from '../../game.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Chapter, WordPair } from '../../../chapter/model/chapter.model';

export interface QuizOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface QuizItem {
    card: WordPair;
    question: string;
    correctAnswer: string;
    options: QuizOption[];
    selectedOptionId: string | null;
    isAnswered: boolean;
    isCorrect: boolean | null;
    selectedOptionText?: string;
}

export interface QuizRootState {
    chapterId: string | null;
    isLoading: boolean;
    lang1: string;
    lang2: string;
    direction: 'toLang2' | 'toLang1';
    currentStep: 'QUESTIONS' | 'SUMMARY' | 'RESULTS';
}

export interface QuizQuestionState {
    items: QuizItem[];
    currentIndex: number;
}

export interface QuizResultState {
    score: number;
    currentFilter: 'all' | 'correct' | 'wrong';
}

export interface RootViewModel {
    state: QuizRootState;
    chapterId: string;
    sourceLang: string;
    targetLang: string;
}

export interface QuestionViewModel {
    state: QuizQuestionState;
    currentItem: QuizItem | null;
    totalCount: number;
    progress: number;
}

export interface SummaryViewModel {
    items: QuizItem[];
    answeredCount: number;
    totalCount: number;
    canFinish: boolean;
}

export interface ResultViewModel {
    state: QuizResultState;
    totalCount: number;
    filteredItems: QuizItem[];
    chapterId: string;
}

const initialRoot: QuizRootState = {
    chapterId: null,
    isLoading: true,
    lang1: 'PL',
    lang2: 'EN',
    direction: 'toLang2',
    currentStep: 'QUESTIONS'
};

const initialQuestion: QuizQuestionState = {
    items: [],
    currentIndex: 0
};

const initialResult: QuizResultState = {
    score: 0,
    currentFilter: 'all'
};

@Injectable()
export class QuizLocalStore {
    private readonly gamesStore = inject(GameStore);
    private readonly destroyRef = inject(DestroyRef);

    private readonly _root = signal<QuizRootState>(initialRoot);
    private readonly _question = signal<QuizQuestionState>(initialQuestion);
    private readonly _result = signal<QuizResultState>(initialResult);

    public readonly rootViewModel = computed((): RootViewModel => {
        const root = this._root();
        return {
            state: root,
            chapterId: root.chapterId || '',
            sourceLang: root.direction === 'toLang2' ? root.lang1 : root.lang2,
            targetLang: root.direction === 'toLang2' ? root.lang2 : root.lang1,
        };
    });

    public readonly questionViewModel = computed((): QuestionViewModel => {
        const root = this._root();
        const question = this._question();
        const totalCount = question.items.length;

        return {
            state: question,
            currentItem: question.items[question.currentIndex] || null,
            totalCount,
            progress: totalCount > 0 ? Math.floor(((question.currentIndex + (root.currentStep === 'QUESTIONS' ? 0 : 1)) / totalCount) * 100) : 0,
        };
    });

    public readonly summaryViewModel = computed((): SummaryViewModel => {
        const question = this._question();

        const enrichedItems: QuizItem[] = question.items.map((item: QuizItem) => ({
            ...item,
            selectedOptionText: item.options.find((o: QuizOption) => o.id === item.selectedOptionId)?.text || 'Brak odpowiedzi'
        }));

        const totalCount = enrichedItems.length;
        const answeredCount = enrichedItems.filter(i => i.isAnswered).length;

        return {
            items: enrichedItems,
            totalCount,
            answeredCount,
            canFinish: totalCount > 0 && answeredCount === totalCount
        };
    });

    public readonly resultViewModel = computed((): ResultViewModel => {
        const root = this._root();
        const question = this._question();
        const result = this._result();

        const filter = result.currentFilter;

        const enrichedItems: QuizItem[] = question.items.map((item: QuizItem) => ({
            ...item,
            selectedOptionText: item.options.find((o: QuizOption) => o.id === item.selectedOptionId)?.text || 'Brak odpowiedzi'
        }));

        const filteredItems = filter === 'all'
            ? enrichedItems
            : enrichedItems.filter(i => filter === 'correct' ? i.isCorrect : !i.isCorrect);

        return {
            state: result,
            totalCount: enrichedItems.length,
            filteredItems,
            chapterId: root.chapterId || ''
        };
    });

    public loadGame(id: string): void {
        this._root.update(r => ({ ...r, isLoading: true, chapterId: id }));

        this.gamesStore.loadGameData(id).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (chapter: Chapter) => {
                const words = chapter.words || [];
                const shuffled = this.shuffle([...words]);
                const items = shuffled.map(card => this.createQuizItem(card, shuffled, 'toLang2'));

                this._root.update(r => ({
                    ...r,
                    chapterId: chapter.id,
                    isLoading: false,
                    lang1: chapter.lang1 || 'PL',
                    lang2: chapter.lang2 || 'EN',
                    direction: 'toLang2',
                    currentStep: 'QUESTIONS'
                }));

                this._question.set({
                    items,
                    currentIndex: 0
                });

                this._result.set(initialResult);
            },
            error: () => this._root.update(r => ({ ...r, isLoading: false }))
        });
    }

    public restartGame(): void {
        const id = this._root().chapterId;
        if (id) {
            this.loadGame(id);
        }
    }

    public setFilter(filter: 'all' | 'correct' | 'wrong'): void {
        this._result.update(r => ({ ...r, currentFilter: filter }));
    }

    public toggleDirection(): void {
        const root = this._root();
        const question = this._question();

        const newDir = root.direction === 'toLang2' ? 'toLang1' : 'toLang2';

        const newItems = question.items.map(item =>
            this.createQuizItem(item.card, question.items.map(i => i.card), newDir)
        );

        this._root.update(r => ({ ...r, direction: newDir }));
        this._question.update(q => ({ ...q, items: newItems }));
    }

    public selectOption(optionId: string): void {
        const root = this._root();
        if (root.currentStep !== 'QUESTIONS') return;

        const question = this._question();
        const itemIndex = question.currentIndex;
        const currentItems = [...question.items];
        const item = { ...currentItems[itemIndex] };

        if (item.selectedOptionId === optionId) return;

        const option = item.options.find(o => o.id === optionId);
        item.selectedOptionId = optionId;
        item.isAnswered = true;
        item.isCorrect = option?.isCorrect ?? false;

        currentItems[itemIndex] = item;
        this._question.update(q => ({ ...q, items: currentItems }));
    }

    public nextStep(): void {
        const root = this._root();
        const question = this._question();

        if (root.currentStep === 'QUESTIONS') {
            if (question.currentIndex < question.items.length - 1) {
                this._question.update(q => ({ ...q, currentIndex: q.currentIndex + 1 }));
            } else {
                this._root.update(r => ({ ...r, currentStep: 'SUMMARY' }));
            }
        } else if (root.currentStep === 'SUMMARY') {
            // Calculate final score when entering RESULTS
            const score = question.items.filter(i => i.isCorrect).length;
            this._result.update(r => ({ ...r, score }));
            this._root.update(r => ({ ...r, currentStep: 'RESULTS' }));
        }
    }

    public prevStep(): void {
        const root = this._root();
        const question = this._question();

        if (root.currentStep === 'QUESTIONS') {
            if (question.currentIndex > 0) {
                this._question.update(q => ({ ...q, currentIndex: q.currentIndex - 1 }));
            }
        } else if (root.currentStep === 'SUMMARY') {
            this._root.update(r => ({ ...r, currentStep: 'QUESTIONS' }));
            this._question.update(q => ({ ...q, currentIndex: question.items.length - 1 }));
        }
    }

    public goToStep(index: number): void {
        this._root.update(r => ({ ...r, currentStep: 'QUESTIONS' }));
        this._question.update(q => ({ ...q, currentIndex: index }));
    }

    public forceSummary(): void {
        this._root.update(r => ({ ...r, currentStep: 'SUMMARY' }));
    }

    private createQuizItem(card: WordPair, allCards: WordPair[], direction: 'toLang2' | 'toLang1'): QuizItem {
        const isToLang2 = direction === 'toLang2';
        const questionText = isToLang2 ? card.pl : card.eng;
        const correctAnswerText = isToLang2 ? card.eng : card.pl;
        const options = this.generateOptions(card, allCards, direction);

        return {
            card,
            question: questionText,
            correctAnswer: correctAnswerText,
            options,
            selectedOptionId: null,
            isAnswered: false,
            isCorrect: null
        };
    }

    private generateOptions(correctCard: WordPair, allCards: WordPair[], direction: 'toLang2' | 'toLang1'): QuizOption[] {
        const isToLang2 = direction === 'toLang2';
        const correctText = isToLang2 ? correctCard.eng : correctCard.pl;

        const distractors = allCards
            .filter((c: WordPair) => {
                const wordText = isToLang2 ? c.eng : c.pl;
                return wordText.toLowerCase() !== correctText.toLowerCase();
            })
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map((c: WordPair) => ({
                id: c.id || `dist-${Math.random().toString(36).substr(2, 9)}`,
                text: isToLang2 ? c.eng : c.pl,
                isCorrect: false
            }));

        const options: QuizOption[] = [
            { id: correctCard.id || 'correct-id', text: correctText, isCorrect: true },
            ...distractors
        ];

        return this.shuffle(options);
    }

    private shuffle<T>(array: T[]): T[] {
        return [...array].sort(() => Math.random() - 0.5);
    }
}
