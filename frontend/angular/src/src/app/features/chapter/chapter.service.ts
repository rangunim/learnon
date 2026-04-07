import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChapterDto, ChapterCreateRequest, ChapterUpdateRequest, WordPairDto } from './model/chapter.dto';
import { Chapter, WordPair } from './model/chapter.model';


@Injectable({
    providedIn: 'root'
})
export class ChapterService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/chapters`;

    getChapters(userId: string): Observable<Chapter[]> {
        return this.http.get<ChapterDto[]>(`${this.apiUrl}?userId=${userId}`).pipe(
            map(dtos => dtos.map(dto => this.mapToDomain(dto)))
        );
    }

    getPublicChapters(query?: string): Observable<Chapter[]> {
        let url = `${this.apiUrl}?isPublic=true`;
        if (query) {
            url += `&q=${query}`;
        }
        return this.http.get<ChapterDto[]>(url).pipe(
            map(dtos => dtos.map(dto => this.mapToDomain(dto)))
        );
    }

    getChapter(id: string): Observable<Chapter> {
        return this.http.get<ChapterDto>(`${this.apiUrl}/${id}`).pipe(
            map(dto => this.mapToDomain(dto))
        );
    }

    createChapter(chapter: ChapterCreateRequest): Observable<Chapter> {
        return this.http.post<ChapterDto>(this.apiUrl, chapter).pipe(
            map(dto => this.mapToDomain(dto))
        );
    }

    updateChapter(id: string, chapter: ChapterUpdateRequest): Observable<Chapter> {
        return this.http.patch<ChapterDto>(`${this.apiUrl}/${id}`, chapter).pipe(
            map(dto => this.mapToDomain(dto))
        );
    }

    deleteChapter(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Mappers
    private mapToDomain(dto: ChapterDto): Chapter {
        return {
            id: dto.id,
            userId: dto.userId,
            name: dto.name,
            description: dto.description,
            lang1: dto.lang1,
            lang2: dto.lang2,
            isPublic: dto.isPublic,
            originalAuthor: dto.originalAuthor,
            words: dto.words.map(w => this.mapWordToDomain(w)),
            user: dto.user
        };
    }

    private mapWordToDomain(dto: WordPairDto): WordPair {
        return {
            id: dto.id,
            pl: dto.pl,
            eng: dto.eng
        };
    }
}
