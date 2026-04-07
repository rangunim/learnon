# Game Feature - Exam Local Store Spec

Dokument ten specyfikuje zarządzanie stanem specyficznym dla trybu Egzaminu (`ExamLocalStore`).

## Typ Stanu (ViewModel)

Tryb Exam minimalizuje feedback do użytkownika – nie wyświetla poprawności poszczególnych liter od razu, ocena następuje pod koniec.

```typescript
export interface ExamState {
    chapterId: string;
    chapter: Chapter | null;
    isLoading: boolean;
    currentIndex: number;
    words: WordPair[];
    score: number;
    isSwapped: boolean; 
    currentAnswers: string[]; 
    currentStep: 'PLAY' | 'RESULTS';
}
```

## Specyfikacja Zachowań (BDD)

**Scenariusz A: Zapisanie odpowiedzi**
- *Given*: Użytkownik wpisał odpowiedź na dany wiersz i przechodzi dalej.
- *When*: `nextWord(answer: string)` jest natywnie wezwane z widoku.
- *Then*: Store dodaje odpowiedź do `currentAnswers`, inkrementuje `currentIndex`. Brak ujawniania stanu poprawności UI – dopiero na ekranie z wynikami (`RESULTS`) weryfikuje się każdą odpowiedź z `targetText` poprzez algorytm wyliczający `score`.

**Scenariusz B: Odwrócenie zestawu**
- *Given*: Gra na starcie losuje pozycję początkową lub gracz klika `toggleMode()`.
- *When*: `isSwapped` zmienia stan (pl/eng).
- *Then*: Tasowana jest wirtualna tablica języka podpowiedzi i odgadywania, `currentAnswers` resetuje się, uderzając "od nowa".
