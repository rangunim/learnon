import '@angular/compiler';
import { runInInjectionContext, Injector, signal, DestroyRef, WritableSignal } from '@angular/core';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ChapterDetailLocalStore, ChapterDetailViewModel } from '../../../../../../app/features/chapter/page/view/detail/chapter-detail.localstore';
import { ChapterStore } from '../../../../../../app/features/chapter/chapter.store';
import { Chapter } from '../../../../../../app/features/chapter/model/chapter.model';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';

describe('ChapterDetailLocalStore', () => {
    let localStore: ChapterDetailLocalStore;
    let mockChapterStore: {
        state: WritableSignal<{ chapters: Chapter[] }>;
        loadChapter: Mock<typeof ChapterStore.prototype.loadChapter>;
        deleteChapter: Mock<typeof ChapterStore.prototype.deleteChapter>;
        exportChapter: Mock<typeof ChapterStore.prototype.exportChapter>;
        toggleChapterPublicStatus: Mock<typeof ChapterStore.prototype.toggleChapterPublicStatus>;
    };

    beforeEach(() => {
        mockChapterStore = {
            state: signal({ chapters: [] }),
            loadChapter: vi.fn(),
            deleteChapter: vi.fn(),
            exportChapter: vi.fn(),
            toggleChapterPublicStatus: vi.fn()
        };

        const injector = Injector.create({
            providers: [
                { provide: ChapterStore, useValue: mockChapterStore },
                { provide: Router, useValue: { navigate: vi.fn() } },
                { provide: ConfirmationService, useValue: { confirm: vi.fn() } },
                { provide: MessageService, useValue: { add: vi.fn() } },
                { provide: DestroyRef, useValue: { onDestroy: vi.fn() } }
            ]
        });

        runInInjectionContext(injector, () => {
            localStore = new ChapterDetailLocalStore();
        });
    });

    it('should initialize with default state', () => {
        // when
        const vm: ChapterDetailViewModel = localStore.viewModel();

        // then
        expect(vm.state.isLoading).toBe(true);
        expect(vm.state.chapter).toBeNull();
    });

    it('should set isLoading to false when loading a chapter from empty cache', () => {
        // given
        const mockChapter: Partial<Chapter> = { id: '1', name: 'Test' };
        mockChapterStore.loadChapter.mockReturnValue(of(mockChapter as Chapter));

        // when
        localStore.loadChapter('1');

        // then
        const vm: ChapterDetailViewModel = localStore.viewModel();
        expect(vm.state.isLoading).toBe(false);
        expect(vm.state.chapter?.name).toBe('Test');
        expect(mockChapterStore.loadChapter).toHaveBeenCalledOnce();
        expect(mockChapterStore.loadChapter).toHaveBeenCalledWith('1');
    });
});
