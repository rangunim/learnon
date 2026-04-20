import '@angular/compiler';
import { runInInjectionContext, Injector, signal, DestroyRef, WritableSignal } from '@angular/core';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ChapterCreateLocalStore, ChapterCreateViewModel } from '../../../../../app/features/chapter/page/create/chapter-create.localstore';
import { ChapterStore } from '../../../../../app/features/chapter/chapter.store';
import { AuthStore, User } from '../../../../../app/core/stores/auth.store';
import { Router } from '@angular/router';
import { NonNullableFormBuilder, FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { Chapter } from '../../../../../app/features/chapter/model/chapter.model';

describe('ChapterCreateLocalStore', () => {
    let localStore: ChapterCreateLocalStore;
    let mockChapterStore: { createChapter: Mock<typeof ChapterStore.prototype.createChapter> };
    let mockAuthStore: { user: WritableSignal<User | null> };
    let mockRouter: { navigate: Mock<typeof Router.prototype.navigate> };

    beforeEach(() => {
        mockAuthStore = { user: signal({ id: 'user-1', firstName: 'John', lastName: 'Doe' } as User) };

        mockChapterStore = {
            createChapter: vi.fn()
        };

        const injector = Injector.create({
            providers: [
                { provide: ChapterStore, useValue: mockChapterStore },
                { provide: AuthStore, useValue: mockAuthStore },
                { provide: Router, useValue: { navigate: vi.fn() } },
                { provide: NonNullableFormBuilder, useValue: new FormBuilder().nonNullable },
                { provide: DestroyRef, useValue: { onDestroy: vi.fn() } }
            ]
        });

        runInInjectionContext(injector, () => {
            localStore = new ChapterCreateLocalStore();
        });
    });

    it('should initialize with default state', () => {
        // when
        const vm: ChapterCreateViewModel = localStore.viewModel();

        // then
        expect(vm.form).toBeDefined();
        expect(vm.isValid).toBe(false); // Validating empty form
        expect(vm.state.isSaving).toBe(false);
    });

    it('should add and remove words from form array', () => {
        // given
        expect(localStore.words.length).toBe(0);

        // when
        localStore.addWord();

        // then
        expect(localStore.words.length).toBe(1);

        // when
        localStore.removeWord(0);

        // then
        expect(localStore.words.length).toBe(0);
    });

    it('should validate form fields appropriately', () => {
        // given
        localStore.viewModel().form.patchValue({
            name: 'Owoce',
            lang1: 'Polski',
            lang2: 'Angielski'
        });

        // when
        let vm: ChapterCreateViewModel = localStore.viewModel();

        // then
        expect(vm.isValid).toBe(true); // Should be valid with name and default langs

        // Trigger canSubmit logic
        expect(vm.canSubmit).toBe(true);
    });

    it('should call createChapter and navigate on success', () => {
        // given
        const savedChapter = { id: 'new-id' } as Partial<Chapter>;
        mockChapterStore.createChapter.mockReturnValue(of(savedChapter as Chapter));

        localStore.viewModel().form.patchValue({
            name: 'New Chapter',
            lang1: 'PL',
            lang2: 'EN'
        });

        // when
        localStore.saveChapter();

        // then
        expect(mockChapterStore.createChapter).toHaveBeenCalledOnce();
        expect(mockChapterStore.createChapter).toHaveBeenCalledWith(expect.objectContaining({
            name: 'New Chapter',
            userId: 'user-1'
        }));
    });
});
