# Game Feature - Listen Repeat Local Store Spec

Dokument ten specyfikuje zarządzanie stanem specyficznym dla trybu "Słuchaj i Powtarzaj" (`ListenRepeatLocalStore`).

## Typ Stanu (ViewModel)

Złotą zasadą jest użycie mikro-stanu audio, powiązanego ze `SpeechService`.

```typescript
export interface ListenRepeatState {
    chapterId: string;
    chapter: Chapter | null;
    isLoading: boolean;
    currentIndex: number;
    words: WordPair[];
    isPlayingTimeout: boolean;
    isSwapped: boolean; 
}
```

## Specyfikacja Zachowań (BDD)

**Scenariusz A: Autoodtwarzanie sekwencji**
- *Given*: Użytkownik wejdzie na pierwszą stronę, naciśnie przycisk play.
- *When*: Store wywoła `playAudio()` używając wewnętrznego serwisu WebSpeech API (np. `SpeechService`).
- *Then*: Stan gry blokuje interfejs (lub zmienia jego wygląd na "czytanie"), dopóki callback nie zwróci końca odtworzenia, a potem następuje przesunięcie na kolejne słowo według wskazanego time-outu.
