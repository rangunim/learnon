# Chapter Feature - Detail Page Store Spec

Plik definiuje przypadek użycia specyficznego dla `ViewDetailLocalStore` używanego pod konkretnym podglądem zestawu fiszek wywoływanym z parametru URLa (np. `/chapters/1`).

## Scenariusze BDD

**Zdarzenie: Szybkie wczytywanie (Cache Hit)**
- *Given*: Użytkownik wchodzi na adres ID np. `1`.
- *When*: Komponent zleca `store.loadChapter('1')`.
- *Then*: LocalStore sprawdza Globalny bufor, a jeśli go posiada, buduje obiekty ViewModel bez ładowania, i unika ustawienia statusu "isLoading: true". Błyskawicznie emituje szczegóły na powłokę widoku.

**Zdarzenie: Usuwanie fiszki z potwierdzeniem (Confirmation Guard)**
- *Given*: Odpalony widok detali. Użytkownik klika w kosz "Usuń".
- *When*: Emitowana jest metoda `deleteChapter(id)`.
- *Then*:
  - Wywołany zostaje moduł nakładkowy `ConfirmationService` z domyślnym komunikatem "Czy na pewno chcesz usunąć?". Użytkownik anulując - natychmiast wraca.
  - Akceptacja puszcza Globalny Delete do sieci, po sukcesie wymusza Router push na listę i informuje go przez `MessageService` (`severity: 'success'`).
  
**Zdarzenie: Eksport lub Udostępnianie (Share)**
- *When*: W widoku występuje akcja `exportChapter()` lub `shareChapter()`.
- *Then*: Po wybraniu akcji Share do Globalnego stora wędruje zapytanie na modyfikację wartości Public na True. Jeśli API potwierdzi, `MessageService` wyrzuca zielony Box "Udostępniono", inaczej rzuca "Błąd". Eksport rzuca bąblem "Przygotowywanie pliku..." podczas transformowania tablic do excela CSV.
