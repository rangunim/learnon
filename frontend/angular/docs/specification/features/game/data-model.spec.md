# Game Feature - Data Model & API Spec (Krok 1)

Celem dokumentu jest określenie warstwy domenowej (Models), kontraktu komunikacyjnego i struktury danych dla modułu gier (Game). Moduł ten odpowiada za mechanikę rozgrywki na podstawie interfejsu `Chapter` z modułu `Chapter`.

## 1. DTO (Data Transfer Objects)
Moduł `Game` nie komunikuje się bezpośrednio z własnymi endpointami REST API w zakresie pobierania danych rozdziału – bazuje na danych pochodzących z `ChapterStore`.

*Uwaga: Zgodnie z Konstytucją omijamy typ `any`. Raportowanie wyników (zapisywanie progresu) obecnie nie zachodzi bezpośrednio z poziomu gry, ale jeśli zostanie wprowadzone, wykorzysta DTO do wysyłania wyników.*

## 2. Modele Domenowe (Domain Models)
Aplikacja wykorzystuje zewnętrzny model `Chapter` z modułu `chapter` oraz wewnętrzne modele specyficzne dla gier (tzw. stan rozgrywki). 

Współdzielone definicje na potrzeby gier:
```typescript
import { Chapter } from '../../chapter/model/chapter.model';

export type GameStatus = 'idle' | 'playing' | 'finished';

// Generyczny stan pojedynczej gry/ćwiczenia - każda gra ma swoje specyficzne warianty
export interface BaseGameState {
    status: GameStatus;
    score: number;
    currentWordIndex: number;
}
```

## 3. Zależności Zewnętrzne
Gra korzysta w sercu ze wstrzykniętego `ChapterStore` do asynchronicznego pobierania danych rozdziałów za pomocą `GameStore`.
- Błąd ładowania (np. brak sieci, błędny ID rozdziału) lub brak autoryzacji obsługiwany jest wyżej w architekturze.
- Wewnątrz ViewModeli każdej gry używany jest zaimportowany model `Chapter` i `WordPair`.
