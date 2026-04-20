import '@angular/compiler';
import { runInInjectionContext, Injector, signal, DestroyRef } from '@angular/core';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ListenRepeatLocalStore } from '../../../../../app/features/game/page/listen-repeat/listen-repeat.localstore';
import { GameStore } from '../../../../../app/features/game/game.store';
import { SpeechService } from '../../../../../app/core/services/speech.service';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { Chapter } from '../../../../../app/features/chapter/model/chapter.model';

describe('ListenRepeatLocalStore', () => {
    let localStore: ListenRepeatLocalStore;
    let mockGameStore: {
        loadGameData: Mock;
    };
    let mockSpeechService: {
        speak: Mock;
        listen: Mock;
    };
    let mockMessageService: {
        add: Mock;
    };

    beforeEach(() => {
        mockGameStore = {
            loadGameData: vi.fn()
        };
        mockSpeechService = {
            speak: vi.fn(),
            listen: vi.fn()
        };
        mockMessageService = {
            add: vi.fn()
        };

        const injector = Injector.create({
            providers: [
                { provide: GameStore, useValue: mockGameStore },
                { provide: SpeechService, useValue: mockSpeechService },
                { provide: MessageService, useValue: mockMessageService },
                { provide: DestroyRef, useValue: { onDestroy: vi.fn() } }
            ]
        });

        runInInjectionContext(injector, () => {
            localStore = new ListenRepeatLocalStore();
        });
    });

    it('should initialize with default state', () => {
        const root = localStore.rootViewModel();
        expect(root.state.isLoading).toBe(false);
        expect(root.state.currentStep).toBe('PLAY');
    });

    it('should load game data and initialize config', () => {
        const mockChapter: Partial<Chapter> = {
            id: '1',
            words: [{ eng: 'apple', pl: 'jabłko' }]
        } as any;
        mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));

        localStore.handleLoadGame('1');

        const root = localStore.rootViewModel();
        expect(root.state.isLoading).toBe(false);
        expect(root.chapterId).toBe('1');
        expect(root.totalCount).toBe(1);
    });

    it('should check transcript correctly', () => {
        const mockChapter: Partial<Chapter> = {
            id: '1',
            words: [{ eng: 'apple', pl: 'jabłko' }]
        } as any;
        mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));
        localStore.handleLoadGame('1');

        localStore.checkTranscript('apple');

        const play = localStore.playViewModel();
        expect(play.state.isCorrect).toBe(true);
    });

    it('should handle incorrect transcript and increment attempts', () => {
        const mockChapter: Partial<Chapter> = {
            id: '1',
            words: [{ eng: 'apple', pl: 'jabłko' }]
        } as any;
        mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));
        localStore.handleLoadGame('1');

        localStore.checkTranscript('banana');

        const play = localStore.playViewModel();
        expect(play.state.isCorrect).toBe(false);
        expect(play.state.attemptCount).toBe(1);
    });

    it('should play audio using speech service', () => {
        const mockChapter: Partial<Chapter> = {
            id: '1',
            words: [{ eng: 'apple', pl: 'jabłko' }]
        } as any;
        mockGameStore.loadGameData.mockReturnValue(of(mockChapter as Chapter));
        localStore.handleLoadGame('1');

        localStore.playAudio();
        expect(mockSpeechService.speak).toHaveBeenCalledWith('apple', 'en-US');
    });

    it('should toggle auto-listen correctly', () => {
        const playBefore = localStore.playViewModel();
        expect(playBefore.autoListen).toBe(true);

        localStore.toggleAutoListen();

        const playAfter = localStore.playViewModel();
        expect(playAfter.autoListen).toBe(false);
    });

    it('should toggle word visibility', () => {
        const playBefore = localStore.playViewModel();
        expect(playBefore.state.showWord).toBe(false);

        localStore.toggleWord();

        const playAfter = localStore.playViewModel();
        expect(playAfter.state.showWord).toBe(true);
    });
});

