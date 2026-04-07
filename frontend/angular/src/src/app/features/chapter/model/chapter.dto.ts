export interface WordPairDto {
    id?: string;
    pl: string;
    eng: string;
}

export interface ChapterDto {
    id: string;
    userId: string;
    name: string;
    description: string;
    lang1: string;
    lang2: string;
    isPublic: boolean;
    originalAuthor: string;
    words: WordPairDto[];
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
}

export interface ChapterCreateRequest {
    userId: string;
    name: string;
    description: string;
    lang1: string;
    lang2: string;
    isPublic: boolean;
    originalAuthor: string;
    words: WordPairDto[];
}

export interface ChapterUpdateRequest {
    userId?: string;
    name?: string;
    description?: string;
    lang1?: string;
    lang2?: string;
    isPublic?: boolean;
    originalAuthor?: string;
    words?: WordPairDto[];
}
