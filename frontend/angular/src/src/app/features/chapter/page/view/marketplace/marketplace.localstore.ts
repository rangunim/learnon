import { computed, inject, Injectable, signal, DestroyRef } from '@angular/core';
import { Chapter } from '../../../model/chapter.model';
import { ChapterStore } from '../../../chapter.store';
import { AuthStore } from '../../../../../core/stores/auth.store';
import { MessageService } from 'primeng/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface PublicChapterCard {
    chapter: Chapter;
    isOwnChapter: boolean;
}

export type MarketplaceSearchField = 'title' | 'authorEmail' | 'authorName';

export interface MarketplaceState {
    publicChapters: Chapter[];
    isLoading: boolean;
    searchQuery: string;
    searchField: MarketplaceSearchField;
    selectedChapterForPreview: Chapter | null;
    isPreviewVisible: boolean;
}

export interface MarketplaceViewModel {
    state: MarketplaceState;
    chapterCards: PublicChapterCard[];
    hasChapters: boolean;
    currentUserId: string | undefined;
}

@Injectable()
export class MarketplaceLocalStore {
    private readonly chapterStore = inject(ChapterStore);
    private readonly authStore = inject(AuthStore);
    private readonly messageService = inject(MessageService);
    private readonly destroyRef = inject(DestroyRef);

    private readonly _state = signal<MarketplaceState>({
        publicChapters: [],
        isLoading: false,
        searchQuery: '',
        searchField: 'title',
        selectedChapterForPreview: null,
        isPreviewVisible: false
    });

    public readonly viewModel = computed<MarketplaceViewModel>(() => {
        const s = this._state();
        const userId = this.authStore.user()?.id;
        const query = s.searchQuery.toLowerCase().trim();

        const filtered = s.publicChapters.filter(c => {
            if (!query) return true;

            switch (s.searchField) {
                case 'title':
                    return c.name?.toLowerCase().includes(query) || c.description?.toLowerCase().includes(query);
                case 'authorEmail':
                    return c.user?.email?.toLowerCase().includes(query);
                case 'authorName': {
                    const firstName = c.user?.firstName?.toLowerCase() || '';
                    const lastName = c.user?.lastName?.toLowerCase() || '';
                    const fullName = `${firstName} ${lastName}`.trim();
                    return firstName.includes(query) || lastName.includes(query) || fullName.includes(query);
                }
                default:
                    return true;
            }
        });

        return {
            state: s,
            chapterCards: filtered.map(c => ({
                chapter: c,
                isOwnChapter: c.userId === userId
            })),
            hasChapters: filtered.length > 0,
            currentUserId: userId
        };
    });

    public loadPublicChapters(query?: string): void {
        this._state.update(s => ({ ...s, isLoading: true, searchQuery: query || '' }));

        this.chapterStore.getPublicChapters(query).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (chapters) => {
                this._state.update(s => ({
                    ...s,
                    publicChapters: chapters,
                    isLoading: false
                }));
            },
            error: () => {
                this._state.update(s => ({
                    ...s,
                    isLoading: false
                }));
                this.messageService.add({
                    severity: 'error',
                    summary: 'Błąd',
                    detail: 'Błąd podczas ładowania marketplace'
                });
            }
        });
    }

    public importChapter(chapter: Chapter): void {
        this.chapterStore.importFromPublic(chapter).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sukces',
                    detail: `Rozdział "${chapter.name}" został zaimportowany.`
                });
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Błąd',
                    detail: 'Nie udało się zaimportować rozdziału.'
                });
            }
        });
    }

    public showPreview(chapter: Chapter): void {
        this._state.update(s => ({
            ...s,
            selectedChapterForPreview: chapter,
            isPreviewVisible: true
        }));
    }

    public hidePreview(): void {
        this._state.update(s => ({
            ...s,
            selectedChapterForPreview: null,
            isPreviewVisible: false
        }));
    }

    public setSearchField(field: MarketplaceSearchField): void {
        this._state.update(s => ({
            ...s,
            searchField: field
        }));
    }
}
