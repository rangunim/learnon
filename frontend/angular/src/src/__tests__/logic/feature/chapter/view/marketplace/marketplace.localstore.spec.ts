import '@angular/compiler';
import { runInInjectionContext, Injector, signal, DestroyRef, WritableSignal } from '@angular/core';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { MarketplaceLocalStore, MarketplaceViewModel } from '../../../../../../app/features/chapter/page/view/marketplace/marketplace.localstore';
import { ChapterStore } from '../../../../../../app/features/chapter/chapter.store';
import { Chapter } from '../../../../../../app/features/chapter/model/chapter.model';
import { AuthStore, User } from '../../../../../../app/core/stores/auth.store';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

describe('MarketplaceLocalStore', () => {
    let mockChapterStore: {
        getPublicChapters: Mock<typeof ChapterStore.prototype.getPublicChapters>;
        importFromPublic: Mock<typeof ChapterStore.prototype.importFromPublic>;
    };
    let mockAuthStore: { user: WritableSignal<User | null> };
    let localStore: MarketplaceLocalStore;

    beforeEach(() => {
        mockAuthStore = { user: signal({ id: 'user-1' } as User) };

        mockChapterStore = {
            getPublicChapters: vi.fn(),
            importFromPublic: vi.fn()
        };

        const injector = Injector.create({
            providers: [
                { provide: ChapterStore, useValue: mockChapterStore },
                { provide: AuthStore, useValue: mockAuthStore },
                { provide: MessageService, useValue: { add: vi.fn() } },
                { provide: DestroyRef, useValue: { onDestroy: vi.fn() } }
            ]
        });

        runInInjectionContext(injector, () => {
            localStore = new MarketplaceLocalStore();
        });
    });

    it('should load public chapters and set state correctly', () => {
        // given
        const publicChapter: Partial<Chapter> = { id: 'c1', name: 'Angular', userId: 'user-2' };
        mockChapterStore.getPublicChapters.mockReturnValue(of([publicChapter as Chapter]));

        // when
        localStore.loadPublicChapters();

        // then
        const vm: MarketplaceViewModel = localStore.viewModel();
        expect(vm.state.isLoading).toBe(false);
        expect(vm.state.publicChapters.length).toBe(1);
        expect(vm.chapterCards[0].chapter.name).toBe('Angular');
        expect(vm.chapterCards[0].isOwnChapter).toBe(false); // Since user-1 != user-2

        expect(mockChapterStore.getPublicChapters).toHaveBeenCalledOnce();
        expect(mockChapterStore.getPublicChapters).toHaveBeenCalledWith(undefined);
    });

    it('should filter marketplace chapters based on search query and title', () => {
        // given
        const publicChapter: Partial<Chapter> = { id: 'c1', name: 'Angular', userId: 'user-2' };
        mockChapterStore.getPublicChapters.mockReturnValue(of([publicChapter as Chapter]));
        localStore.loadPublicChapters();

        // when
        localStore.loadPublicChapters('noexisting');

        // then
        let vm: MarketplaceViewModel = localStore.viewModel();
        expect(vm.chapterCards.length).toBe(0);

        // when
        localStore.loadPublicChapters('ang');

        // then
        vm = localStore.viewModel();
        expect(vm.chapterCards.length).toBe(1);
        expect(mockChapterStore.getPublicChapters).toHaveBeenCalledTimes(3);
        expect(mockChapterStore.getPublicChapters).toHaveBeenLastCalledWith('ang');
    });

    it('should correctly select chapter for preview', () => {
        // given
        const chapter = { id: 'test' } as Partial<Chapter>;

        // when
        localStore.showPreview(chapter as Chapter);

        // then
        expect(localStore.viewModel().state.isPreviewVisible).toBe(true);
        expect(localStore.viewModel().state.selectedChapterForPreview).toBe(chapter);

        // when
        localStore.hidePreview();

        // then
        expect(localStore.viewModel().state.isPreviewVisible).toBe(false);
        expect(localStore.viewModel().state.selectedChapterForPreview).toBeNull();
    });
});
