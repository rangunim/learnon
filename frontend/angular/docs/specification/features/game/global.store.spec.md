# Game Feature - Global Store Spec

Dokument precyzuje globalne zachowania repozytorium stanu (`GameStore`) modułu Game.

## 1. Ograniczenie Odpowiedzialności i Fasada

Zgodnie z koncepcją "Thin Global Store" i wymogami modułu gry, `GameStore` działa jako usługa delegująca i fasada bazująca na `ChapterStore`. Nie dubluje on globalnego stanu (nie wyciąga Chapterów z Cache'a po to, by zapisać je u siebie), ale eksponuje metody ładujące do gier.

```typescript
// Szkic klasy GameStore (już istnieje w kodzie)
@Injectable({ providedIn: 'root' })
export class GameStore {
    private readonly chapterStore = inject(ChapterStore);

    public loadGameData(chapterId: string): Observable<Chapter> {
        return this.chapterStore.loadChapter(chapterId);
    }
}
```

## 2. Specyfikacja Zachowań (Use Cases / BDD)

**Scenariusz A: Otwarcie gry przez użytkownika (Żądanie Danych Gry)**
- *Given*: Użytkownik wchodzi na stronę wybranej gry np. `/game/quiz/xyz`.
- *When*: komponent podczepiony pod wiersz gry (`QuizPage`) powołuje swój `QuizLocalStore`. LocalStore onInit uruchamia `GameStore.loadGameData('xyz')`.
- *Then*: `GameStore` pcha żądanie do `ChapterStore`. `ChapterStore` weryfikuje Cache-Hit. Jeśli dane są obecne (rozdział `xyz` już istnieje pod globalnym kluczem), strumień wydostaje pełen obiekt `Chapter` z wewnątrz bez uderzania po REST. LocalStore gry tworzy sygnał ViewModelu z wczytanym rozdziałem i przechodzi do konfiguracji układu (np. tasowanie słówek dla gry Quiz).

**Scenariusz B: Obsługa braku danych (Cache-Miss)**
- *Given*: Użytkownik odświeża stronę gry (`F5`), więc cache `ChapterStore` traci dane.
- *When*: `GameStore.loadGameData('xyz')` odpytuje `ChapterStore`.
- *Then*: HTTP Request zostaje przeprowadzony do ściągnięcia ID, następnie `ChapterStore` aktualizuje cache powiadamiając subskrypcję gry, że dane wróciły i widok gry zmienia stan `status: 'playing'`.
