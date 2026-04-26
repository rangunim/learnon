import { Injectable, Signal, inject, signal } from '@angular/core';
import { Observable, of, switchMap, tap, throwError } from 'rxjs';
import { ChapterService } from './chapter.service';
import { ChapterFileService } from './chapter-file.service';
import { Chapter } from './model/chapter.model';
import { ChapterCreateRequest, ChapterUpdateRequest } from './model/chapter.dto';
import { AuthStore } from '../../core/stores/auth.store';

export interface ChapterDomainState {
    chapters: Chapter[];
    isLoaded: boolean;
    loadedUserId: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class ChapterStore {
    private readonly chapterService = inject(ChapterService);
    private readonly chapterFileService = inject(ChapterFileService);
    private readonly authStore = inject(AuthStore);

    private readonly _state = signal<ChapterDomainState>({
        chapters: [],
        isLoaded: false,
        loadedUserId: null
    });

    public readonly state: Signal<ChapterDomainState> = this._state.asReadonly();

    public loadChapters(userId: string): Observable<Chapter[]> {
        // If already loaded for DIFFERENT user, clear state first
        if (this._state().isLoaded && this._state().loadedUserId !== userId) {
            this._state.set({ chapters: [], isLoaded: false, loadedUserId: userId });
        }

        if (this._state().isLoaded) {
            return of(this._state().chapters);
        }

        return this.chapterService.getChapters(userId).pipe(
            tap((chapters: Chapter[]) => this._state.set({ chapters, isLoaded: true, loadedUserId: userId }))
        );
    }

    public loadChapter(id: string): Observable<Chapter> {
        const cachedChapter = this._state().chapters.find((c: Chapter) => c.id === id);
        if (cachedChapter && this._state().isLoaded) {
            return of(cachedChapter);
        }

        return this.chapterService.getChapter(id).pipe(
            tap((chapter: Chapter) => {
                this._state.update(s => {
                    const exists = s.chapters.some((c: Chapter) => c.id === id);
                    if (exists) {
                        return {
                            ...s,
                            chapters: s.chapters.map((c: Chapter) => c.id === id ? chapter : c)
                        };
                    } else {
                        return {
                            ...s,
                            chapters: [...s.chapters, chapter]
                        };
                    }
                });
            })
        );
    }

    public createChapter(chapter: ChapterCreateRequest): Observable<Chapter> {
        return this.chapterService.createChapter(chapter).pipe(
            tap((newChapter: Chapter) => {
                this._state.update(s => ({
                    ...s,
                    isLoaded: true,
                    chapters: [...s.chapters, newChapter]
                }));
            })
        );
    }

    public updateChapter(id: string, chapter: ChapterUpdateRequest): Observable<Chapter> {
        return this.chapterService.updateChapter(id, chapter).pipe(
            tap((updatedChapter: Chapter) => {
                this._state.update(s => ({
                    ...s,
                    chapters: s.chapters.map((c: Chapter) => c.id === id ? updatedChapter : c)
                }));
            })
        );
    }

    public deleteChapter(id: string): Observable<void> {
        return this.chapterService.deleteChapter(id).pipe(
            tap(() => {
                this._state.update(s => ({
                    ...s,
                    chapters: s.chapters.filter((c: Chapter) => c.id !== id)
                }));
            })
        );
    }


    public importChapter(file: File): Observable<Chapter> {
        const userId = this.authStore.user()?.id;
        if (!userId) {
            return throwError(() => new Error('User not authenticated'));
        }

        return this.chapterFileService.parseFile(file).pipe(
            switchMap(words => {
                const chapterName = file.name.split('.')[0] || 'Importowany Rozdział';
                const request: ChapterCreateRequest = {
                    userId: userId,
                    name: chapterName,
                    description: `Zaimportowano z pliku: ${file.name}`,
                    lang1: 'Polski',
                    lang2: 'Angielski',
                    isPublic: false,
                    originalAuthor: '',
                    words: words.map(w => ({ pl: w.pl, eng: w.eng }))
                };
                return this.createChapter(request);
            })
        );
    }

    public exportChapter(chapter: Chapter, format: 'csv' | 'xlsx'): Observable<void> {
        return this.chapterFileService.exportChapter(chapter, format);
    }


    public importFromPublic(chapter: Chapter): Observable<Chapter> {
        const userId = this.authStore.user()?.id;
        if (!userId) {
            return throwError(() => new Error('User not authenticated'));
        }

        const request: ChapterCreateRequest = {
            userId: userId,
            name: chapter.name,
            description: chapter.description,
            lang1: chapter.lang1,
            lang2: chapter.lang2,
            isPublic: false,
            originalAuthor: chapter.originalAuthor || 'Użytkownik', // Zachowaj lub ustaw autora
            words: chapter.words.map(w => ({ pl: w.pl, eng: w.eng }))
        };

        return this.createChapter(request);
    }

    public toggleChapterPublicStatus(id: string, isPublic: boolean): Observable<Chapter> {
        return this.updateChapter(id, { isPublic });
    }

    public getPublicChapters(query?: string): Observable<Chapter[]> {
        return this.chapterService.getPublicChapters(query);
    }

}
