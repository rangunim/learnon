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

export interface QuizGameState {
    chapterId: string | null;
    isLoading: boolean;
    lang1: string;
    lang2: string;
    items: QuizItem[];
    score: number;
    direction: 'toLang2' | 'toLang1';
    currentStep: 'QUESTIONS' | 'SUMMARY' | 'RESULTS';
    currentIndex: number;
}

export interface QuizViewModel {
    state: QuizGameState;
    chapterId: string; // Override to be non-nullable in VM
    filteredItems: QuizItem[];
    currentFilter: 'all' | 'correct' | 'wrong';
    totalCount: number;
    answeredCount: number;
    sourceLang: string;
    targetLang: string;
    progress: number;
    canFinish: boolean;
    currentItem: QuizItem | null;
}

const initialState: QuizGameState = {
    chapterId: null,
    isLoading: true,
    lang1: 'PL',
    lang2: 'EN',
    items: [],
    score: 0,
    direction: 'toLang2',
    currentStep: 'QUESTIONS',
    currentIndex: 0
};

@Injectable()
export class QuizLocalStore {
    private readonly gamesStore = inject(GameStore);
    private readonly destroyRef = inject(DestroyRef);
    private readonly _state = signal<QuizGameState>(initialState);

    // Filter signal for summary view
    private readonly _currentFilter = signal<'all' | 'correct' | 'wrong'>('all');

    // Selectors
    public readonly viewModel = computed((): QuizViewModel => {
        const s = this._state();
        const filter = this._currentFilter();

        // Enrich items with selected option text once
        const enrichedItems: QuizItem[] = s.items.map((item: QuizItem) => ({
            ...item,
            selectedOptionText: item.options.find((o: QuizOption) => o.id === item.selectedOptionId)?.text || 'Brak odpowiedzi'
        }));

        const totalCount = enrichedItems.length;
        const answeredCount = enrichedItems.filter((i: QuizItem) => i.isAnswered).length;

        const filteredItems = filter === 'all'
            ? enrichedItems
            : enrichedItems.filter((i: QuizItem) => filter === 'correct' ? i.isCorrect : !i.isCorrect);

        return {
            state: s,
            chapterId: s.chapterId || '',
            filteredItems,
            currentFilter: filter,
            totalCount,
            answeredCount,
            sourceLang: s.direction === 'toLang2' ? s.lang1 : s.lang2,
            targetLang: s.direction === 'toLang2' ? s.lang2 : s.lang1,
            progress: totalCount > 0 ? Math.floor(((s.currentIndex + (s.currentStep === 'QUESTIONS' ? 0 : 1)) / totalCount) * 100) : 0,
            canFinish: totalCount > 0 && answeredCount === totalCount,
            currentItem: enrichedItems[s.currentIndex] || null
        };
    });

    // Methods
    public loadGame(id: string): void {
        this._patch({ isLoading: true, chapterId: id });
        this.gamesStore.loadGameData(id).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (chapter: Chapter) => {
                const words = chapter.words || [];
                const shuffled = this.shuffle([...words]);

                // direction is 'toLang2' by default
                const items = shuffled.map(card => this.createQuizItem(card, shuffled, 'toLang2'));

                const newState: Partial<QuizGameState> = {
                    chapterId: chapter.id,
                    isLoading: false,
                    lang1: chapter.lang1 || 'PL',
                    lang2: chapter.lang2 || 'EN',
                    items: items,
                    score: 0,
                    direction: 'toLang2',
                    currentStep: 'QUESTIONS',
                    currentIndex: 0
                };
                this._patch(newState)
            },
            error: () => this._patch({ isLoading: false })
        });
    }

    public restartGame(): void {
        const id = this._state().chapterId;
        if (id) {
            this.loadGame(id);
        }
    }

    public setFilter(filter: 'all' | 'correct' | 'wrong'): void {
        this._currentFilter.set(filter);
    }

    public toggleDirection(): void {
        const s = this._state();
        const newDir = s.direction === 'toLang2' ? 'toLang1' : 'toLang2';

        const newItems = s.items.map(item =>
            this.createQuizItem(item.card, s.items.map(i => i.card), newDir)
        );

        this._patch({
            direction: newDir,
            items: newItems
        });
    }

    public selectOption(optionId: string): void {
        const s = this._state();
        if (s.currentStep !== 'QUESTIONS') return;

        const itemIndex: number = s.currentIndex;
        const currentItems: QuizItem[] = [...s.items];
        const item: QuizItem = { ...currentItems[itemIndex] };

        if (item.selectedOptionId === optionId) return;

        const option: QuizOption | undefined = item.options.find(o => o.id === optionId);
        item.selectedOptionId = optionId;
        item.isAnswered = true;
        item.isCorrect = option?.isCorrect ?? false;

        currentItems[itemIndex] = item;
        this._patch({ items: currentItems });

        // Auto move to next if not last? 
        // Maybe auto-advance is good for UX, but let's stick to buttons first or small delay.
    }

    public nextStep(): void {
        const s = this._state();
        if (s.currentStep === 'QUESTIONS') {
            if (s.currentIndex < s.items.length - 1) {
                this._patch({ currentIndex: s.currentIndex + 1 });
            } else {
                this._patch({ currentStep: 'SUMMARY' });
            }
        } else if (s.currentStep === 'SUMMARY') {
            this._patch({ currentStep: 'RESULTS' });
        }
    }

    public prevStep(): void {
        const s = this._state();
        if (s.currentStep === 'QUESTIONS') {
            if (s.currentIndex > 0) {
                this._patch({ currentIndex: s.currentIndex - 1 });
            }
        } else if (s.currentStep === 'SUMMARY') {
            this._patch({ currentStep: 'QUESTIONS', currentIndex: s.items.length - 1 });
        }
    }

    public goToStep(index: number): void {
        this._patch({ currentStep: 'QUESTIONS', currentIndex: index });
    }

    public forceSummary(): void {
        this._patch({ currentStep: 'SUMMARY' });
    }

    private _patch(patch: Partial<QuizGameState>): void {
        this._state.update(s => ({ ...s, ...patch }));
    }

    private createQuizItem(card: WordPair, allCards: WordPair[], direction: 'toLang2' | 'toLang1'): QuizItem {
        const isToLang2 = direction === 'toLang2';
        const question = isToLang2 ? card.pl : card.eng;
        const correctAnswer = isToLang2 ? card.eng : card.pl;
        const options = this.generateOptions(card, allCards, direction);

        return {
            card,
            question,
            correctAnswer,
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
