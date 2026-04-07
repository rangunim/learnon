# Game Feature - Memory Local Store Spec

Dokument ten specyfikuje zarządzanie stanem gry typu Memory (`MemoryLocalStore`).

## Typ Stanu (ViewModel)

Siatka Memory opiera się na kafelkach. Store wylicza z modelu domenowego `cards` do tablicy dwuwymiarowej lub jednowymiarowej z ID, rozbitą na język docelowy i początkowy.

```typescript
export interface MemoryCard {
    id: string; // referencja do ID słówka
    text: string;
    type: 'pl' | 'eng';
    state: 'hidden' | 'visible' | 'matched';
}

export interface MemoryState {
    chapterId: string;
    chapter: Chapter | null;
    isLoading: boolean;
    cards: MemoryCard[];
    selectedIndices: number[]; // pozycje 2 otwartych aktualnie kart
    matchedPairsCount: number;
    moves: number;
    currentStep: 'PLAY' | 'RESULTS';
}
```

## Specyfikacja Zachowań (BDD)

**Scenariusz A: Otwarcie kart**
- *Given*: Użytkownik ma `selectedIndices.length === 0`. Klika w konkretną kartę.
- *When*: Wywołanie `selectCard(index)`.
- *Then*: Karta zmienia stan na `visible`. Gdy odwrócone są 2 karty (`selectedIndices.length === 2`), Store w tle sprawdza z opóźnieniem powiązanie ID słówka (czyli czy karta `type="pl"` i karta `type="eng"` odnoszą się do tego samego wpisu DTO/modelu `WordPair`). 
  - Jeśli tak: `state: 'matched'`.
  - Jeśli nie: powrót na `state: 'hidden'`. Liczba ruchów rośnie.
