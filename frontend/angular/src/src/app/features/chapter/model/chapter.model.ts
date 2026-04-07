export interface WordPair {
    id?: string;
    pl: string;
    eng: string;
}

export interface Chapter {
    id: string;
    userId: string;
    name: string;
    description: string;
    lang1: string;
    lang2: string;
    isPublic: boolean;
    originalAuthor: string;
    words: WordPair[];
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
}
