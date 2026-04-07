# Chapter Feature - Marketplace Store Spec

Ten dokument opisuje mikrologikę `MarketplaceLocalStore` podłączaną pod `marketplace.page.ts`. Odpowiada za skomplikowany system wyboru rozdziałów asynchronicznych na giełdzie publicznie.

## Typ Stanu Lokalnego i ViewModel
```typescript
export interface MarketplaceState {
    publicChapters: Chapter[];
    isLoading: boolean;
    searchQuery: string;
    searchField: MarketplaceSearchField; // 'title' | 'authorEmail' | 'authorName'
    selectedChapterForPreview: Chapter | null; // podgląd szczegółów in-place
    isPreviewVisible: boolean;
}

export interface MarketplaceViewModel {
    state: MarketplaceState;
    chapterCards: PublicChapterCard[];
    hasChapters: boolean;
    currentUserId: string | undefined;
}
```

## Scenariusze BDD LocalStore

**Zdarzenie: Błąd sieci podczas ładowania (API Failure 500)**
- *Given*: Użytkownik inicjuje rynek (`loadPublicChapters`). Serwer odpowiada krytycznie (np. brak sieci).
- *When*: Observable wchodzi w .error.
- *Then*: LocalStore zdejmuje blokadę strony (`isLoading: false`). Wyrzuca notyfikację Toast PrimeNG (`MessageService`) w celu zaalertowania systemu.

**Zdarzenie: Wyszukiwanie na żywym organizmie (Input Search Filter)**
- *Given*: Zakończone wczytywanie (`isLoading: false`), widoczne paczki zadań.
- *When*: Do LocalStore wchodzi komenda `setSearchField()` określając filtr ułożony jako dropdown. Użytkownik pisze w `searchQuery`.
- *Then*: Komputowany `viewModel` wzbudza przebieg wybierając logicznie (Switch w TypeScript) odpowiednie property z obiektu do porównania (Title / Author Name itd.). Następnie przepuszcza przez mapping obudowując w strukturę Card.

**Zdarzenie: Importowanie czyjejś pracy asynchronicznie (Clone)**
- *When*: Z poziomu preview / paczki wciskane zostaje pobierz (`importChapter(chapter)`).
- *Then*: LocalStore po udanym strzale do zewnętrznego interfejsu klonującego API wydaje sukces do `MessageService` z tekstem "Rozdział Został Zaimportowany". Błędy obsługiwane są odpowiednikiem fail'a.

**Zdarzenie: Wysunięcie podglądu publicznej kolekcji (Preview Dialog)**
- *When*: Puszczone zostaje zapytanie `showPreview()`.
- *Then*: Zespół modyfikuje sygnałem flagi `isPreviewVisible: true` obudowując cały kontekst paczki słówek w stan z uwzględnieniem `selectedChapterForPreview` wyświetlanego wewnątrz Modalu wyżej. Zrzucenie widoku (np. przez Backdrop, lub escape) kasuje parametry czyszcząc ramm i gasząc nakładkę `hidePreview()`.
