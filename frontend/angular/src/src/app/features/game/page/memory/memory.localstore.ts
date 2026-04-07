import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { GameStore } from '../../game.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Chapter } from '../../../chapter/model/chapter.model';

export interface MemoryCard {
    id: number;
    pairId: string;
    text: string;
    type: 'lang1' | 'lang2';
    isFlipped: boolean;
    isMatched: boolean;
}

export interface MemoryGameState {
    chapterId: string | null;
    lang1: string;
    lang2: string;
    isLoading: boolean;
    cards: MemoryCard[];
    movesCount: number;
    flippedCards: MemoryCard[];
    lockBoard: boolean;
    currentStep: 'PLAY' | 'RESULTS';
}

export interface MemoryViewModel {
    state: MemoryGameState;
    isGameWon: boolean;
}


const initialState: MemoryGameState = {
    chapterId: null,
    lang1: 'Polski',
    lang2: 'Angielski',
    isLoading: true,
    cards: [],
    movesCount: 0,
    flippedCards: [],
    lockBoard: false,
    currentStep: 'PLAY'
};

@Injectable()
export class MemoryLocalStore {
    private readonly gamesStore = inject(GameStore);
    private readonly destroyRef = inject(DestroyRef);
    private readonly _state = signal<MemoryGameState>(initialState);

    // Selectors
    public readonly viewModel = computed((): MemoryViewModel => {
        const s = this._state();
        const cards = s.cards;
        const isGameWon = cards.length > 0 && cards.every(c => c.isMatched);

        return {
            state: s,
            isGameWon
        };
    });

    // Methods
    public loadGame(id: string): void {
        this._patch({ isLoading: true, chapterId: id });
        this.gamesStore.loadGameData(id).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (chapter: Chapter) => {
                const cards: MemoryCard[] = this.buildCards(chapter);
                this._patch({
                    chapterId: chapter.id || null,
                    lang1: chapter.lang1 || 'Polski',
                    lang2: chapter.lang2 || 'Angielski',
                    isLoading: false,
                    cards: cards,
                    movesCount: 0,
                    flippedCards: [],
                    lockBoard: false,
                    currentStep: 'PLAY'
                });
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

    public flipCard(card: MemoryCard): void {
        const newState = this.handleFlipCard(this._state(), card);
        this._state.set(newState);

        if (newState.lockBoard) {
            setTimeout(() => {
                const state = this._state();
                const [c1, c2] = state.flippedCards;
                const cards: MemoryCard[] = state.cards.map(c =>
                    c.id === c1.id || c.id === c2.id ? { ...c, isFlipped: false } : { ...c }
                );
                this._state.set(<MemoryGameState>{ ...state, cards, flippedCards: [], lockBoard: false });
            }, 1000);
        }
    }

    private handleFlipCard(state: MemoryGameState, card: MemoryCard): MemoryGameState {
        if (state.lockBoard || card.isFlipped || card.isMatched) {
            return state;
        }

        const cards = state.cards.map(c =>
            c.id === card.id ? { ...c, isFlipped: true } : { ...c }
        );
        const flippedCard = cards.find(c => c.id === card.id)!;
        const flippedCards = [...state.flippedCards, flippedCard];

        if (flippedCards.length === 2) {
            const [c1, c2] = flippedCards;

            if (this.isMatchingPair(c1, c2)) {
                const updatedCards = cards.map(c =>
                    c.id === c1.id || c.id === c2.id ? { ...c, isMatched: true } : c
                );

                const isFinished = updatedCards.every(c => c.isMatched);

                return {
                    ...state,
                    cards: updatedCards,
                    movesCount: state.movesCount + 1,
                    flippedCards: [],
                    lockBoard: false,
                    currentStep: isFinished ? 'RESULTS' : state.currentStep
                };
            }

            return {
                ...state,
                cards,
                movesCount: state.movesCount + 1,
                flippedCards,
                lockBoard: true
            };
        }

        return { ...state, cards, flippedCards };
    }

    private _patch(patch: Partial<MemoryGameState>): void {
        this._state.update(s => ({ ...s, ...patch }));
    }

    private buildCards(chapter: Chapter): MemoryCard[] {
        const cards: MemoryCard[] = [];
        let idCounter = 1;

        chapter.words.slice(0, 10).forEach(word => {
            cards.push({ id: idCounter++, pairId: word.pl, text: word.pl, type: 'lang1', isFlipped: false, isMatched: false });
            cards.push({ id: idCounter++, pairId: word.pl, text: word.eng, type: 'lang2', isFlipped: false, isMatched: false });
        });

        return cards.sort(() => Math.random() - 0.5);
    }

    private isMatchingPair(card1: MemoryCard, card2: MemoryCard): boolean {
        return card1.pairId === card2.pairId && card1.type !== card2.type;
    }
}
