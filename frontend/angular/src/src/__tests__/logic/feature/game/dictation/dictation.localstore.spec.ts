import '@angular/compiler';
import { runInInjectionContext, Injector, signal, DestroyRef } from '@angular/core';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { DictationLocalStore } from '../../../../../app/features/game/page/dictation/dictation.localstore';
import { GameStore } from '../../../../../app/features/game/game.store';
import { SpeechService } from '../../../../../app/core/services/speech.service';
import { of } from 'rxjs';
import { Chapter } from '../../../../../app/features/chapter/model/chapter.model';

describe('DictationLocalStore', () => {
    let localStore: DictationLocalStore;
    let mockGameStore: {
        loadGameData: Mock;
    };
    let mockSpeechService: {
        speak: Mock;
    };

    beforeEach(() => {
        mockGameStore = {
            loadGameData: vi.fn()
        };
        mockSpeechService = {
            speak: vi.fn()
        };

        const injector = Injector.create({
            providers: [
                { provide: GameStore, useValue: mockGameStore },
                { provide: SpeechService, useValue: mockSpeechService },
                { provide: DestroyRef, useValue: { onDestroy: vi.fn() } }
            ]
        });

        runInInjectionContext(injector, () => {
            localStore = new DictationLocalStore();
        });
    });

    it('should initialize with default state', () => {
        const rootVm = localStore.rootViewModel();
        const playVm = localStore.playViewModel();
        const resultVm = localStore.resultViewModel();

        expect(rootVm.state.isLoading).toBe(false);
        expect(rootVm.state.currentStep).toBe('PLAY');
        expect(playVm.state.currentIndex).toBe(0);
        expect(resultVm.state.score).toBe(0);
    });

    it('should load game data and shuffle words', () => {
        const mockChapter: Partial<Chapter> = {
            id: '1',
            words: [
                { eng: 'apple', pl: 'jabłko' },
                { eng: 'banana', pl: 'banan' }
            ]
        } as any;
        mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));

        localStore.handleLoadGame('1');

        const rootVm = localStore.rootViewModel();
        expect(rootVm.state.isLoading).toBe(false);
        expect(rootVm.state.chapter?.id).toBe('1');
        expect(rootVm.state.words.length).toBe(2);
        expect(mockGameStore.loadGameData).toHaveBeenCalledWith('1');
    });

    it('should check answer correctly', () => {
        const mockChapter: Partial<Chapter> = {
            id: '1',
            words: [{ eng: 'apple', pl: 'jabłko' }]
        } as any;
        mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));
        localStore.handleLoadGame('1');

        // Test correct answer
        localStore.checkAnswer('apple');
        expect(localStore.playViewModel().state.isCorrect).toBe(true);
        expect(localStore.resultViewModel().state.score).toBe(1);

        // Test incorrect answer
        localStore.checkAnswer('banana');
        expect(localStore.playViewModel().state.isCorrect).toBe(false);
    });

    it('should handle hints and penalties', () => {
        const mockChapter: Partial<Chapter> = {
            id: '1',
            words: [{ eng: 'apple', pl: 'jabłko' }]
        } as any;
        mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));
        localStore.handleLoadGame('1');

        localStore.setShowHint(true);
        localStore.checkAnswer('apple');

        // Score should be 0.5 because hint was used
        expect(localStore.resultViewModel().state.score).toBe(0.5);
    });

    it('should navigate to next word and then results', () => {
        const mockChapter: Partial<Chapter> = {
            id: '1',
            words: [
                { eng: 'apple', pl: 'jabłko' },
                { eng: 'banana', pl: 'banan' }
            ]
        } as any;
        mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));
        localStore.handleLoadGame('1');

        localStore.nextWord();
        expect(localStore.playViewModel().state.currentIndex).toBe(1);

        localStore.nextWord();
        expect(localStore.rootViewModel().state.currentStep).toBe('RESULTS');
    });

    it('should call speech service when playing audio', () => {
        const mockChapter: Partial<Chapter> = {
            id: '1',
            words: [{ eng: 'apple', pl: 'jabłko' }]
        } as any;
        mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));
        localStore.handleLoadGame('1');

        localStore.playAudio();
        expect(mockSpeechService.speak).toHaveBeenCalledWith('apple', 'en-US');
    });
});
