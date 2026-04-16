import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { Chapter } from '../../../model/chapter.model';
import { ChapterStore } from '../../../chapter.store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface ChapterDetailState {
    chapter: Chapter | null;
    isLoading: boolean;
}

export interface ChapterDetailViewModel {
    state: ChapterDetailState;
}

@Injectable()
export class ChapterDetailLocalStore {
    private readonly chapterStore = inject(ChapterStore);
    private readonly router = inject(Router);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly messageService = inject(MessageService);
    private readonly destroyRef = inject(DestroyRef);

    private readonly _state = signal<ChapterDetailState>({
        chapter: null,
        isLoading: true
    });

    public readonly viewModel = computed(() => <ChapterDetailViewModel>{
        state: this._state()
    });

    public loadChapter(id: string): void {
        const globalCache = this.chapterStore.state().chapters.find((c: Chapter) => c.id === id);
        this._state.update(s => ({
            ...s,
            isLoading: !globalCache, // Don't show spinner if we already have it
            chapter: globalCache || null
        }));

        this.chapterStore.loadChapter(id).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (chapter: Chapter) => this._state.set({ chapter, isLoading: false }),
            error: () => this._state.update(s => ({ ...s, isLoading: false }))
        });
    }

    public deleteChapter(id: string): void {
        this.confirmationService.confirm({
            message: 'Czy na pewno chcesz usunąć ten rozdział? Ta akcja jest nieodwracalna.',
            header: 'Potwierdzenie usunięcia',
            icon: 'pi pi-exclamation-triangle text-amber-500',
            acceptLabel: 'Tak, usuń',
            rejectLabel: 'Anuluj',
            acceptButtonStyleClass: 'p-button-danger rounded-xl',
            rejectButtonStyleClass: 'p-button-text rounded-xl',
            accept: () => {
                this.chapterStore.deleteChapter(id).pipe(
                    takeUntilDestroyed(this.destroyRef)
                ).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Usunięto', detail: 'Rozdział został skasowany.' });
                        this.router.navigate(['/chapters']);
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Błąd', detail: 'Nie udało się usunąć rozdziału.' });
                    }
                });
            }
        });
    }

    public exportChapter(chapter: Chapter, format: 'csv' | 'xlsx'): void {
        this.chapterStore.exportChapter(chapter, format);
        this.messageService.add({
            severity: 'info',
            summary: 'Eksportowanie',
            detail: 'Przygotowywanie pliku do pobrania...',
            life: 2000
        });
    }

    public shareChapter(chapter: Chapter): void {
        this.chapterStore.toggleChapterPublicStatus(chapter.id, true).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (updated) => {
                this._state.update(s => ({ ...s, chapter: updated }));
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
