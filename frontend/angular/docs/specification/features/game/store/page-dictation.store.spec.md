# Game Feature - Dictation Local Store Spec

Dokument ten specyfikuje zarządzanie stanem specyficznym dla ekranu gry Dictation (`DictationLocalStore`).

## Typ Stanu (ViewModel)

Zgodnie z architekturą, logika i stan gry jest odizolowana od widoku HTML za pomocą `DictationLocalStore`. Udostępnia on pojedynczy sygnał `viewModel`.

```typescript
export interface DictationState {
    chapterId: string;
    chapter: Chapter | null;
    isLoading: boolean;
    currentIndex: number;
    words: WordPair[];
    score: number;
    isCorrect: boolean | null;
    showHint: boolean;
    errorIndex: number;
    isSwapped: boolean; // pl-eng / eng-pl
    showTranslation: boolean;
    currentInput: string;
    currentStep: 'PLAY' | 'RESULTS';
    highlightErrors: boolean;
    wasHintUsed: boolean;
}

export interface DictationViewModel {
    state: DictationState;
    totalCount: number;
    currentWord: WordPair | null;
    targetText: string;
    hintText: string;
    charStates: CharState[]; // do widoku podpowiadania znaków
    // ... UI properties
}
```

## Specyfikacja Zachowań (BDD)

**Scenariusz A: Wprowadzanie wpisu i sprawdzanie błędów**
- *Given*: Użytkownik wpisuje znaki w pole tekstowe podczas kroku `PLAY`.
- *When*: Uruchamiana jest metoda `validateInput(val: string)`.
- *Then*: Znajdowany jest pierwszy błędny indeks znaku. `errorIndex` w stanie ulega aktualizacji. Wyliczany sygnał na nowo generuje `charStates`. Jeśli wpis jest w pełni poprawny wg `targetText`, Store iteruje punktację i flagę poprawności, pomijając przycisk następne słowo.

**Scenariusz B: Użycie podpowiedzi (Hint/Translation)**
- *Given*: Użytkownik nie wie, jak napisać słowo.
- *When*: Klika "Pokaż tłumaczenie" lub "Poddaję się" (`toggleTranslation` / `giveUp`).
- *Then*: Store oznacza flagę `wasHintUsed: true`. Skutkuje to odjęciem punktów z mnożnikiem lub nie naliczeniem ich wcale gdy zgadnie tekst za pomocą podpowiedzi. Aktualizuje się widok odsłaniając pomoc.
