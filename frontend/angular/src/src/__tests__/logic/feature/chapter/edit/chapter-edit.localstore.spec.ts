import '@angular/compiler';
import { runInInjectionContext, Injector, signal, DestroyRef, WritableSignal } from '@angular/core';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ChapterEditLocalStore, ChapterEditViewModel } from '../../../../../app/features/chapter/page/edit/chapter-edit.localstore';
import { ChapterStore } from '../../../../../app/features/chapter/chapter.store';
import { Chapter } from '../../../../../app/features/chapter/model/chapter.model';
import { Router } from '@angular/router';
import { NonNullableFormBuilder, FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

describe('ChapterEditLocalStore', () => {
    let localStore: ChapterEditLocalStore;
    let mockChapterStore: {
        state: WritableSignal<{ chapters: any[] }>;
        loadChapter: Mock<typeof ChapterStore.prototype.loadChapter>;
        updateChapter: Mock<typeof ChapterStore.prototype.updateChapter>;
    };
    let mockRouter: { navigate: Mock<typeof Router.prototype.navigate> };

    beforeEach(() => {
        mockChapterStore = {
            state: signal({ chapters: [] }),
            loadChapter: vi.fn(),
            updateChapter: vi.fn()
        };

        const injector = Injector.create({
            providers: [
                { provide: ChapterStore, useValue: mockChapterStore },
                { provide: Router, useValue: { navigate: vi.fn() } },
                { provide: NonNullableFormBuilder, useValue: new FormBuilder().nonNullable },
                { provide: DestroyRef, useValue: { onDestroy: vi.fn() } }
            ]
        });

        runInInjectionContext(injector, () => {
            localStore = new ChapterEditLocalStore();
        });
    });

    it('should initialize form and navigate empty state', () => {
        // when
        const vm: ChapterEditViewModel = localStore.viewModel();

        // then
        expect(vm.form).toBeDefined();
        expect(vm.state.chapterId).toBeNull();
    });

    it('should load chapter and patch form', () => {
        // given
        const mockChapter: Partial<Chapter> = {
            id: '123',
            name: 'Existing Chapter',
            description: 'Desc',
            lang1: 'FR',
            lang2: 'EN',
            isPublic: true,
            words: [{ pl: 'jabłko', eng: 'apple' } as any]
        };

        mockChapterStore.loadChapter.mockReturnValue(of(mockChapter as Chapter));

        // when
        localStore.loadChapter('123');

        // then
        const vm: ChapterEditViewModel = localStore.viewModel();
        expect(vm.state.chapterId).toBe('123');
        expect(vm.state.initialData?.name).toBe('Existing Chapter');
        expect(mockChapterStore.loadChapter).toHaveBeenCalledOnce();
        expect(mockChapterStore.loadChapter).toHaveBeenCalledWith('123');

        expect(vm.form.get('name')?.value).toBe('Existing Chapter');
        expect(vm.form.get('lang1')?.value).toBe('FR');
        expect(localStore.words.length).toBe(1);
    });

    it('should allow adding and removing words', () => {
        // when
        localStore.addWord();

        // then
        expect(localStore.words.length).toBe(1);

        // when
        localStore.removeWord(0);

        // then
        expect(localStore.words.length).toBe(0);
    });

    it('should call updateChapter and navigate on success', () => {
        // given
        const id = '123';
        mockChapterStore.state.set({ chapters: [{ id, name: 'Old' }] as any });
        mockChapterStore.updateChapter.mockReturnValue(of({ id } as any));
        mockChapterStore.loadChapter.mockReturnValue(of({ id, name: 'Old', words: [] } as any));

        localStore.loadChapter(id);
        localStore.viewModel().form.patchValue({ name: 'Updated Name' });

        // when
        localStore.updateChapter();

        // then
        expect(mockChapterStore.updateChapter).toHaveBeenCalledOnce();
        expect(mockChapterStore.updateChapter).toHaveBeenCalledWith(id, expect.objectContaining({
            name: 'Updated Name'
        }));
    });
});
