/*import { signal, computed } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Chapter } from '../../../app/features/chapter/model/chapter.model';
import { ChapterCreateRequest, ChapterUpdateRequest } from '../../../app/features/chapter/model/chapter.dto';

export class FakeChapterStore {
    private readonly _chapters = signal<Chapter[]>([]);

    public readonly state = computed(() => ({
        chapters: this._chapters()
    }));

    public chapters = this._chapters.asReadonly();

    public loadChapters(userId: string): Observable<Chapter[]> {
        return of(this._chapters());
    }

    public loadChapter(id: string): Observable<Chapter> {
        const chapter = this._chapters().find(c => c.id === id);
        if (!chapter) return throwError(() => new Error('Not found'));
        return of(chapter);
    }

    public createChapter(chapter: ChapterCreateRequest): Observable<Chapter> {
        const newChapter: Chapter = {
            ...chapter,
            id: `fake-id-${this._chapters().length + 1}`,
            words: chapter.words.map((w, i) => ({ ...w, id: `w-${i}` }))
        };

        this._chapters.update(s => [...s, newChapter]);
        return of(newChapter);
    }

    public updateChapter(id: string, chapter: ChapterUpdateRequest): Observable<Chapter> {
        let updated: Chapter | null = null;
        this._chapters.update(s => s.map(c => {
            if (c.id === id) {
                updated = { ...c, ...chapter };
                return updated;
            }
            return c;
        }));

        if (!updated) return throwError(() => new Error('Not found'));
        return of(updated as Chapter);
    }

    public deleteChapter(id: string): Observable<void> {
        this._chapters.update(s => s.filter(c => c.id !== id));
        return of(undefined);
    }

    // Helper methods for testing
    public setInitialChapters(chapters: Chapter[]): void {
        this._chapters.set(chapters);
    }

    public reset(): void {
        this._chapters.set([]);
    }
}
*/