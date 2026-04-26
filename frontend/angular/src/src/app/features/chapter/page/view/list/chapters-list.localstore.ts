import { Injectable, Signal, inject, signal, computed } from '@angular/core';
import { Chapter } from '../../../model/chapter.model';
import { ChapterStore } from '../../../chapter.store';
import { AuthStore } from '../../../../../core/stores/auth.store';
import { MessageService } from 'primeng/api';

export interface ChaptersListState {
    isLoading: boolean;
    searchQuery: string;
}

export interface ChaptersListViewModel {
    state: ChaptersListState;
    filteredChapters: Chapter[];
}

@Injectable()
export class ChaptersListLocalStore {
    private readonly chapterStore = inject(ChapterStore);
    private readonly authStore = inject(AuthStore);
    private readonly messageService = inject(MessageService);

    private readonly _state = signal<ChaptersListState>({
        isLoading: false,
        searchQuery: ''
    });

    public readonly viewModel = computed<ChaptersListViewModel>(() => {
        const s = this._state();
        const globalChapters = this.chapterStore.state().chapters;
        const query = s.searchQuery.toLowerCase().trim();

        const filtered = !query
            ? globalChapters
            : globalChapters.filter((chapter: Chapter) => chapter.name.toLowerCase().includes(query));

        return {
            state: s,
            filteredChapters: filtered
        };
    });

    public updateSearch(query: string): void {
        this._state.update(s => ({ ...s, searchQuery: query }));
    }

    public clearSearch(): void {
        this._state.update(s => ({ ...s, searchQuery: '' }));
    }



    public loadChapters(): void {
        const user = this.authStore.user();
        if (!user) {
            this._state.update(s => ({ ...s, isLoading: false }));
            return;
        }

        // Check if chapters are already loaded in global domain state
        if (!this.chapterStore.state().isLoaded) {
            this._state.update(s => ({ ...s, isLoading: true }));
        }

        this.chapterStore.loadChapters(user.id).subscribe({
            next: () => this._state.update(s => ({ ...s, isLoading: false })),
            error: () => this._state.update(s => ({ ...s, isLoading: false }))
        });
    }

    public importFile(file: File): void {
        this._state.update(s => ({ ...s, isLoading: true }));
        this.chapterStore.importChapter(file).subscribe({
            next: (newChapter) => {
                this._state.update(s => ({ ...s, isLoading: false }));
                this.messageService.add({
                    severity: 'success',
                    summary: 'Zaimportowano',
                    detail: `Stworzono nowy rozdział: ${newChapter.name}`,
                    life: 3000
                });
            },
            error: (err) => {
                this._state.update(s => ({ ...s, isLoading: false }));
                this.messageService.add({
                    severity: 'error',
                    summary: 'Błąd importu',
                    detail: err.message || 'Wystąpił problem podczas importowania pliku.',
                    life: 5000
                });
            }
        });
    }

    public onExport(chapter: Chapter, format: 'csv' | 'xlsx'): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Eksportowanie',
            detail: 'Przygotowywanie pliku do pobrania...',
            life: 2000
        });

        this.chapterStore.exportChapter(chapter, format).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Eksportowano',
                    detail: `Rozdział "${chapter.name}" został wyeksportowany.`,
                    life: 3000
                });
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Błąd eksportu',
                    detail: err.message || 'Wystąpił problem podczas eksportowania rozdziału.',
                    life: 5000
                });
            }
        });
    }

    public shareChapter(chapter: Chapter): void {
        this.chapterStore.toggleChapterPublicStatus(chapter.id, true).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Udostępniono',
                    detail: `Rozdział "${chapter.name}" jest teraz publiczny.`,
                    life: 3000
                });
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Błąd',
                    detail: 'Nie udało się udostępnić rozdziału.',
                    life: 3000
                });
            }
        });
    }
}
