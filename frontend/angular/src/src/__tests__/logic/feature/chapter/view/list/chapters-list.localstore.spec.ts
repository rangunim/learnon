import { runInInjectionContext, Injector, signal, WritableSignal } from '@angular/core';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ChaptersListLocalStore, ChaptersListViewModel } from '../../../../../../app/features/chapter/page/view/list/chapters-list.localstore';
import { ChapterStore } from '../../../../../../app/features/chapter/chapter.store';
import { AuthStore, User } from '../../../../../../app/core/stores/auth.store';
import { MessageService } from 'primeng/api';
import { Chapter } from '../../../../../../app/features/chapter/model/chapter.model';

describe('ChaptersListLocalStore', () => {
    let localStore: ChaptersListLocalStore;
    let mockChapterStore: {
        state: WritableSignal<{ chapters: Chapter[], isLoaded: boolean }>;
        loadChapters: Mock<typeof ChapterStore.prototype.loadChapters>;
        importChapter: Mock<typeof ChapterStore.prototype.importChapter>;
        exportChapter: Mock<typeof ChapterStore.prototype.exportChapter>;
        toggleChapterPublicStatus: Mock<typeof ChapterStore.prototype.toggleChapterPublicStatus>;
    };
    let mockAuthStore: { user: WritableSignal<User | null> };
    let mockMessageService: { add: Mock<typeof MessageService.prototype.add> };

    beforeEach(() => {
        // Mock AuthStore
        mockAuthStore = {
            user: signal({ id: 'user-1', firstName: 'John', lastName: 'Doe' } as User)
        };

        // Mock ChapterStore
        mockChapterStore = {
            state: signal({ chapters: [], isLoaded: false }),
            loadChapters: vi.fn(),
            importChapter: vi.fn(),
            exportChapter: vi.fn(),
            toggleChapterPublicStatus: vi.fn()
        };

        // Mock MessageService
        mockMessageService = {
            add: vi.fn()
        };

        const injector = Injector.create({
            providers: [
                { provide: AuthStore, useValue: mockAuthStore },
                { provide: ChapterStore, useValue: mockChapterStore },
                { provide: MessageService, useValue: mockMessageService }
            ]
        });

        runInInjectionContext(injector, () => {
            localStore = new ChaptersListLocalStore();
        });
    });

    it('should initialize with default state', () => {
        const vm: ChaptersListViewModel = localStore.viewModel();
        expect(vm.state.isLoading).toBe(false);
        expect(vm.state.searchQuery).toBe('');
    });

    it('should filter chapters based on search query', () => {
        // given
        mockChapterStore.state.set({ chapters: [{ id: '1', name: 'Angular Basics' } as Chapter], isLoaded: true });

        // when
        localStore.updateSearch('angular');

        // then
        let vm: ChaptersListViewModel = localStore.viewModel();
        expect(vm.filteredChapters.length).toBe(1);
        expect(vm.filteredChapters[0].name).toBe('Angular Basics');
        expect(mockChapterStore.loadChapters).not.toHaveBeenCalled();

        // when
        localStore.updateSearch('react');

        // then
        vm = localStore.viewModel();
        expect(vm.filteredChapters.length).toBe(0);
    });

    it('should clear search query', () => {
        // given
        localStore.updateSearch('angular');
        expect(localStore.viewModel().state.searchQuery).toBe('angular');

        // when
        localStore.clearSearch();

        // then
        expect(localStore.viewModel().state.searchQuery).toBe('');
    });
});
