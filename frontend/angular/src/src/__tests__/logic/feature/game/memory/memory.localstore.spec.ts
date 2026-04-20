import '@angular/compiler';
import { runInInjectionContext, Injector, signal, DestroyRef } from '@angular/core';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { MemoryLocalStore } from '../../../../../app/features/game/page/memory/memory.localstore';
import { GameStore } from '../../../../../app/features/game/game.store';
import { of } from 'rxjs';
import { Chapter } from '../../../../../app/features/chapter/model/chapter.model';

describe('MemoryLocalStore', () => {
    let localStore: MemoryLocalStore;
    let mockGameStore: {
        loadGameData: Mock;
    };

    beforeEach(() => {
        mockGameStore = {
            loadGameData: vi.fn()
        };

        const injector = Injector.create({
            providers: [
                { provide: GameStore, useValue: mockGameStore },
                { provide: DestroyRef, useValue: { onDestroy: vi.fn() } }
            ]
        });

        runInInjectionContext(injector, () => {
            localStore = new MemoryLocalStore();
        });
    });

    it('should initialize with default state', () => {
        const vm = localStore.viewModel();
        expect(vm.state.isLoading).toBe(true);
        expect(vm.state.currentStep).toBe('PLAY');
    });

    it('should load game data and build cards', () => {
        const mockChapter: Partial<Chapter> = {
            id: '1',
            words: [
                { eng: 'apple', pl: 'jabłko' },
                { eng: 'banana', pl: 'banan' }
            ]
        } as any;
        mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));

        localStore.loadGame('1');

        const vm = localStore.viewModel();
        expect(vm.state.isLoading).toBe(false);
        expect(vm.state.cards.length).toBe(4); // 2 words * 2 cards each
        expect(vm.state.chapterId).toBe('1');
    });

    it('should match cards correctly', () => {
        const mockChapter: Partial<Chapter> = {
            id: '1',
            words: [{ eng: 'apple', pl: 'jabłko' }]
        } as any;
        mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));
        localStore.loadGame('1');

        const cards = localStore.viewModel().state.cards;
        const card1 = cards.find((c: any) => c.text === 'apple')!;
        const card2 = cards.find((c: any) => c.text === 'jabłko')!;

        localStore.flipCard(card1);
        localStore.flipCard(card2);

        const vm = localStore.viewModel();
        expect(vm.state.cards.every(c => c.isMatched)).toBe(true);
        expect(vm.isGameWon).toBe(true);
        expect(vm.state.currentStep).toBe('RESULTS');
    });

    it('should not flip more than 2 cards at once', () => {
        const mockChapter: Partial<Chapter> = {
            id: '1',
            words: [
                { eng: 'apple', pl: 'jabłko' },
                { eng: 'banana', pl: 'banan' }
            ]
        } as any;
        mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));
        localStore.loadGame('1');

        const cards = localStore.viewModel().state.cards;
        localStore.flipCard(cards[0]);
        localStore.flipCard(cards[1]);

        // At this point lockBoard should be true if they don't match, or cards should be matched and flippedCards cleared if they do.
        // If they match: flippedCards.length = 0, lockBoard = false
        // If they don't match: flippedCards.length = 2, lockBoard = true

        const stateAfterTwo = localStore.viewModel().state;
        if (stateAfterTwo.lockBoard) {
            localStore.flipCard(cards[2]);
            expect(localStore.viewModel().state.flippedCards.length).toBe(2);
        }
    });

    it('should increment moves count', () => {
        const mockChapter: Partial<Chapter> = {
            id: '1',
            words: [
                { eng: 'apple', pl: 'jabłko' },
                { eng: 'banana', pl: 'banan' }
            ]
        } as any;
        mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));
        localStore.loadGame('1');

        const cards = localStore.viewModel().state.cards;
        localStore.flipCard(cards[0]);
        localStore.flipCard(cards[1]);

        expect(localStore.viewModel().state.movesCount).toBe(1);
    });
});
