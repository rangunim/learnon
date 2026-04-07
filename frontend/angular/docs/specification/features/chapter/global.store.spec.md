# Chapter Feature - Global Store Spec

Dokument precyzuje globalne zachowania głównego repozytorium stanu (`ChapterStore`) modułu Chapter.

## Typ Stanu Globalnego
```typescript
export interface ChapterDomainState {
    chapters: Chapter[];
    isLoaded: boolean;
    loadedUserId: string | null;
}
```

## Specyfikacja Zachowań (Use Cases / BDD)

**Scenariusz A: Weryfikacja AuthGuard przed załadowaniem stanu**
- *Given*: Niezalogowany lub zdezaktualizowany użytkownik próbuje wejść na jakikolwiek rout związany z `/chapters`.
- *When*: Globalny Guard blokuje ładowanie Store'a by nie wysłać do chronionego endpointu zapytań bez tokena.
- *Then*: Użytkownik natychmiast jest kierowany pod `**/login`. Stan `isLoaded` pozostaje nienaruszony.

**Scenariusz B: Pobieranie Chapters u Prawidłowego Użytkownika**
- *Given*: Użytkownik wchodzi na widoki list (np. "Moje Rozdziały").
- *When*: Wywołana zostaje metoda `loadChapters(XYZ)`.
- *Then*:
  - **[Cache-Hit]**: Jeżeli `loadedUserId === XYZ` i `isLoaded === true`, Store zamyka Observablea rzucając zbuforowaną listę (zerowy koszt sieciowy).
  - **[Brak Cachu lub Zmiana Użytkownika]**: Następuje "zerowanie toalety" - zrzut tablicy do pusta i `isLoaded: false` upewniając się, że nie wyciekły dane po przelogowaniu z konta "Jan" na "Kasia". Następuje żądanie sieciowe dające nową tablicę.

**Scenariusz C: Propagacja Zmian Głębokich (Array Immutability)**
- *When*: Powraca zapytanie stworzenia/zmiany uderzające w `createChapter`, `updateChapter` itd.
- *Then*: Tablica `chapters()` poddawane jest immutate za pomocą `this._state.update(s => ...)`, z uzyciem tzw. Spread operatora. Powiadamia to automatycznie każdy `.page.ts` uzywajaćy globalnego modelu do Re-Renderu (m.in po przez OnPush strategy).
