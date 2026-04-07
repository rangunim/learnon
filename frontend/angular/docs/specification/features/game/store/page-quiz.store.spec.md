# Game Feature - Quiz Local Store Spec

Dokument specyfikuje zachowania `QuizLocalStore`.

## Typ Stanu (ViewModel)

Quiz to gra wielokrotnego wyboru, typowo z 4 odpowiedziami. Tablica odpowiedzi musi być kalkulowana i izolowana by szablony były thin-component.

```typescript
export interface QuizOption {
    text: string;
    isCorrect: boolean;
    isSelected: boolean;
}

export interface QuizState {
    chapterId: string;
    chapter: Chapter | null;
    currentIndex: number;
    words: WordPair[]; // wszystkie
    score: number;
    options: QuizOption[]; // Zmienia się z każdym indexem słowa, wymusza 3 złe, 1 dobrą
    isAnswered: boolean;
    isSwapped: boolean;
    currentStep: 'PLAY' | 'RESULTS';
}
```

## Specyfikacja Zachowań (BDD)

**Scenariusz A: Generacja odpowiedzi dla wiersza**
- *Given*: Widok żąda wyrenderowania bieżącego słowa (np. pod `currentIndex: 5`).
- *When*: Mechanizm selektora `_wordContext()` iteruje odpowiedź.
- *Then*: Przezcomputed wybierane jest prawdziwe słowo (np. `Cat`), a do niego dobierane są pseudolosowo 3 inne słowa obecne w `chapter.words` nie będące kotem. Kolejność wynikowa wpada do zahasłowanego pola opcji (by uniknąć domysłu "zawsze pozycja numer 1 to prawda").

**Scenariusz B: Oddanie głosu na kafelek**
- *Given*: Flaga `isAnswered === false`. Użytkownik klika opcję "Cat".
- *When*: Przeprowadzenie funkcji `vote(option)`.
- *Then*: Sygnał zamraża opcje, sprawdzając, czy opcja odpowiada `isCorrect`. Podświetla poprawne/niepoprawne kafle kolorami (przez zmianę properties w opcji). Licznik poprawności rośnie jeśli trafił. Dodawane jest opóźnienie (lub wymóg kliknięcia next) przed załadowaniem kolejnego zestawu (Scenariusz A).
