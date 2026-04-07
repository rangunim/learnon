# Chapter Feature - Data Model & API Spec (Krok 1)

Celem dokumentu jest określenie kontraktu komunikacyjnego (DTO), warstwy domenowej (Models) oraz punktów dostępu API (Endpoints) dla modułu rozdziałów (Chapter).

## 1. DTO (Data Transfer Objects)
Transfer danych z i do backendu (`environment.apiUrl/chapters`) wykorzystuje dedykowane interfejsy DTO. Interfejsy te odzwierciedlają surowy format struktury JSON w komunikacji. Zgodnie z Konstytucją omijamy typ `any`.

```typescript
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
```

## 2. Modele Domenowe (Domain Models)
Aplikacja, zgodnie z Konstytucją (02-constitution.md), nie posługuje się surowymi DTO w widokach, a wyczyszczonymi Modelami Domenowymi operującymi na sygnałach. Mapowanie realizuje `ChapterService`. Zbudowane na tej podstawie interfejsy do wykorzystywania w całej aplikacji to:

```typescript
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
```
*Note: W tym przypadku Model odpowiada niemal 1:1 DTO ze względu na kompatybilność, niemniej `ChapterService` rygorystycznie dba o to, by przy użyciu prywatnych metod iteracyjnych, takich jak `mapToDomain(dto: ChapterDto): Chapter` (co ma miejsce dla samego chaptera jak i każdego elementu words mapowanego w `mapWordToDomain(dto)`), wyizolować dane domeny.*

## 3. API Endpoints w Serwisie
Komunikacja z REST API izolowana jest w `ChapterService` za pomocą `@angular/common/http` i zmapowana operatorami RxJS z użyciem precyzyjnie otypowanych sygnatur:

| Metoda HTTP | Endpoint (relatywnie do `/chapters`) | Typ Body/Params | Zwracany Typ (`Observable`) | Zastosowanie |
|---|---|---|---|---|
| `GET` | `?userId={userId}` | `userId` (query string optional) | `Observable<Chapter[]>` | Pobranie wszystkich rozdziałów przypisanych do użytkownika. |
| `GET` | `?isPublic=true&q={query}` | `isPublic`, `q` (query string optional) | `Observable<Chapter[]>` | Pobranie publicznych rozdziałów (np. dla giełdy Marketplace). Zabezpiecza budowę asynchronicznej wyszukiwarki fraz (pole `q`). |
| `GET` | `/{id}` | - | `Observable<Chapter>` | Pobranie danych i wszystkich fiszek językowych danego rozdziału za pomocą ID. |
| `POST` | `/` | `ChapterCreateRequest` (body JSON) | `Observable<Chapter>` | Tworzy nowy zbiór słówek/rozdział, mapuje odpowiedź DTO na domenowy `Chapter`. |
| `PATCH` | `/{id}` | `ChapterUpdateRequest` (body JSON) | `Observable<Chapter>` | Umożliwia edycję poszczególnych pól (wszystkie dane optional) we wskazanym `id`. |
| `DELETE`| `/{id}` | - | `Observable<void>` | Usunięcie rozdziału z chmury. |
