import '@angular/compiler';
import { runInInjectionContext, Injector, DestroyRef } from '@angular/core';
import { describe, it, expect, beforeEach, vi, Mock, test } from 'vitest';
import { ExamLocalStore } from '../../../../../app/features/game/page/exam/exam.localstore';
import { GameStore } from '../../../../../app/features/game/game.store';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Chapter } from '../../../../../app/features/chapter/model/chapter.model';

describe('ExamLocalStore', () => {
    let localStore: ExamLocalStore;
    let mockGameStore: {
        loadGameData: Mock;
    };
    let mockRouter: {
        navigate: Mock;
    };

    beforeEach(() => {
        mockGameStore = {
            loadGameData: vi.fn()
        };
        mockRouter = {
            navigate: vi.fn()
        };

        const injector = Injector.create({
            providers: [
                { provide: GameStore, useValue: mockGameStore },
                { provide: Router, useValue: mockRouter },
                { provide: DestroyRef, useValue: { onDestroy: vi.fn() } }
            ]
        });

        runInInjectionContext(injector, () => {
            localStore = new ExamLocalStore();
        });
    });

    it('should initialize with default state', () => {
        const rootVm = localStore.rootViewModel();
        expect(rootVm.state.isLoading).toBe(true);
        expect(rootVm.state.currentStep).toBe('QUESTIONS');
    });

    it('should load game data and initialize config', () => {
        const mockChapter: Partial<Chapter> = {
            id: '1',
            words: [
                { eng: 'apple', pl: 'jabłko' },
                { eng: 'banana', pl: 'banan' }
            ],
            lang1: 'PL',
            lang2: 'EN'
        } as any;
        mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));

        localStore.loadGame('1');

        const rootVm = localStore.rootViewModel();
        const questionVm = localStore.questionViewModel();

        expect(rootVm.state.isLoading).toBe(false);
        expect(rootVm.state.chapterId).toBe('1');
        expect(rootVm.totalCount).toBe(2);
        expect(questionVm.sourceWord).toBeDefined();
        expect(mockGameStore.loadGameData).toHaveBeenCalledWith('1');
    });

    describe('Answer Scenarios', () => {
        beforeEach(() => {
            const mockChapter: Partial<Chapter> = {
                id: '1',
                words: [{ eng: 'apple', pl: 'jabłko' }],
                lang1: 'PL',
                lang2: 'EN'
            } as any;
            mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));
            localStore.loadGame('1');
        });

        test.each`
            input      | direction    | action      | isCorrect | desc
            ${'apple'} | ${'toLang2'} | ${'submit'} | ${true}   | ${'correct answer'}
            ${'APPLE'} | ${'toLang2'} | ${'submit'} | ${true}   | ${'case-insensitive'}
            ${' apple'}| ${'toLang2'} | ${'submit'} | ${true}   | ${'with whitespace'}
            ${'jabłko'}| ${'toLang1'} | ${'submit'} | ${true}   | ${'reverse direction'}
            ${'pear'}  | ${'toLang2'} | ${'submit'} | ${false}  | ${'wrong answer'}
            ${''}      | ${'toLang2'} | ${'skip'}   | ${false}  | ${'skipped question'}
        `('should handle $desc ($direction, input: "$input") -> isCorrect: $isCorrect',
            ({ input, direction, action, isCorrect }) => {
                if (direction === 'toLang1') {
                    localStore.toggleDirection();
                }

                if (action === 'submit') {
                    localStore.updateInput(input);
                    localStore.submitAnswer();
                } else {
                    localStore.skip();
                }

                const result = localStore.resultViewModel();
                if (isCorrect) {
                    expect(result.correctCount).toBe(1);
                } else {
                    expect(result.incorrectCount).toBe(1);
                }
                expect(localStore.rootViewModel().state.currentStep).toBe('SUMMARY');
            });
    });

    it('should toggle direction correctly', () => {
        const mockChapter: Partial<Chapter> = {
            id: '1',
            words: [{ eng: 'apple', pl: 'jabłko' }],
            lang1: 'PL',
            lang2: 'EN'
        } as any;
        mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));
        localStore.loadGame('1');

        expect(localStore.questionViewModel().sourceWord).toBe('jabłko');
        localStore.toggleDirection();
        expect(localStore.questionViewModel().sourceWord).toBe('apple');
    });

    it('should navigate between steps', () => {
        const mockChapter: Partial<Chapter> = {
            id: '1',
            words: [{ eng: 'apple', pl: 'jabłko' }]
        } as any;
        mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));
        localStore.loadGame('1');

        localStore.skip();
        expect(localStore.rootViewModel().state.currentStep).toBe('SUMMARY');

        localStore.nextStep();
        expect(localStore.rootViewModel().state.currentStep).toBe('RESULTS');
    });

    it('should navigate back to chapter on close', () => {
        const mockChapter: Partial<Chapter> = {
            id: '1',
            words: []
        } as any;
        mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));
        localStore.loadGame('1');

        localStore.close();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/chapters', '1']);
    });
});
