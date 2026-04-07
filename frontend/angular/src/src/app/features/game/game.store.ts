import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { Chapter } from '../chapter/model/chapter.model';
import { ChapterStore } from '../chapter/chapter.store';

@Injectable({
    providedIn: 'root'
})
export class GameStore {
    private readonly chapterStore = inject(ChapterStore);

    /**
     * Loads chapter data from the global chapter store cache.
     * Prevents games from making direct HTTP requests.
     */
    public loadGameData(chapterId: string): Observable<Chapter> {
        return this.chapterStore.loadChapter(chapterId);
    }
}
