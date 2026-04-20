import '@angular/compiler';
import { runInInjectionContext, Injector, signal, DestroyRef } from '@angular/core';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { QuizLocalStore } from '../../../../../app/features/game/page/quiz/quiz.localstore';
import { GameStore } from '../../../../../app/features/game/game.store';
import { of } from 'rxjs';
import { Chapter } from '../../../../../app/features/chapter/model/chapter.model';

describe('QuizLocalStore', () => {
    let localStore: QuizLocalStore;
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
            localStore = new QuizLocalStore();
        });
    });

    it('should initialize with default state', () => {
        const rootVm = localStore.rootViewModel();
        expect(rootVm.state.isLoading).toBe(true);
        expect(rootVm.state.currentStep).toBe('QUESTIONS');
    });

    it('should load game data and generate quiz items', () => {
        const mockChapter: Partial<Chapter> = {
            id: '1',
            words: [
                { eng: 'apple', pl: 'jabłko' },
                { eng: 'banana', pl: 'banan' },
                { eng: 'orange', pl: 'pomarańcza' },
                { eng: 'strawberry', pl: 'truskawka' }
            ]
        } as any;
        mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));

        localStore.loadGame('1');

        const questionVm = localStore.questionViewModel();
        expect(questionVm.state.items.length).toBe(4);
        expect(questionVm.currentItem?.options.length).toBe(4); // 1 correct + 3 distractor
        expect(localStore.rootViewModel().state.isLoading).toBe(false);
    });

    it('should select option and mark as answered', () => {
        const mockChapter: Partial<Chapter> = {
            id: '1',
            words: [
                { id: 'w1', eng: 'apple', pl: 'jabłko' },
                { id: 'w2', eng: 'banana', pl: 'banan' },
                { id: 'w3', eng: 'orange', pl: 'pomarańcza' },
                { id: 'w4', eng: 'strawberry', pl: 'truskawka' }
            ]
        } as any;
        mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));
        localStore.loadGame('1');

        const item = localStore.questionViewModel().currentItem!;
        const correctOption = item.options.find((o: any) => o.isCorrect)!;

        localStore.selectOption(correctOption.id);

        const updatedItem = localStore.questionViewModel().currentItem!;
        expect(updatedItem.isAnswered).toBe(true);
        expect(updatedItem.selectedOptionId).toBe(correctOption.id);
        expect(updatedItem.isCorrect).toBe(true);
    });

    it('should calculate score correctly when moving to results', () => {
        const mockChapter: Partial<Chapter> = {
            id: '1',
            words: [
                { id: 'w1', eng: 'apple', pl: 'jabłko' },
                { id: 'w2', eng: 'banana', pl: 'banan' },
                { id: 'w3', eng: 'orange', pl: 'pomarańcza' },
                { id: 'w4', eng: 'strawberry', pl: 'truskawka' }
            ]
        } as any;
        mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));
        localStore.loadGame('1');

        const item = localStore.questionViewModel().currentItem!;
        const correctOption = item.options.find((o: any) => o.isCorrect)!;
        localStore.selectOption(correctOption.id);

        // For Quiz, we often have multiple questions.
        // nextStep will either move to next question or to SUMMARY.
        // In our case with 4 words, it moves to next question.
        // Let's just force summary for testing results calculation.
        localStore.forceSummary();
        expect(localStore.rootViewModel().state.currentStep).toBe('SUMMARY');

        localStore.nextStep(); // to RESULTS
        expect(localStore.rootViewModel().state.currentStep).toBe('RESULTS');
        expect(localStore.resultViewModel().state.score).toBe(1);
    });

    it('should toggle direction and update items', () => {
        const mockChapter: Partial<Chapter> = {
            id: '1',
            words: [
                { id: 'w1', eng: 'apple', pl: 'jabłko' },
                { id: 'w2', eng: 'banana', pl: 'banan' }
            ]
        } as any;
        mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));
        localStore.loadGame('1');

        // Default toLang2: question is pl, options are eng
        const initialItem = localStore.questionViewModel().currentItem!;
        expect(initialItem.question).toBe(initialItem.card.pl);

        localStore.toggleDirection();

        const updatedItem = localStore.questionViewModel().currentItem!;
        expect(updatedItem.question).toBe(updatedItem.card.eng);
        expect(localStore.rootViewModel().state.direction).toBe('toLang1');
    });
});
