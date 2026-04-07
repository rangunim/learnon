# Chapter Feature - List Page Store Spec

Ten dokument opisuje mechanikę podłączaną najczęściej pod listę główną uzytkownika tzw. "Moje Rozdziały" (np. `/chapters`). 

## Scenariusze BDD

**Zdarzenie: Wywołanie zapytania i lokalne filtrowanie (Search Filter)**
- *Given*: Użytkownik widzi listę i używa pola wejściowego `<input>`.
- *When*: Metoda `updateSearch(query)` wstrzykuje nową wartość, zmieniając stan Store'a.
- *Then*: Podpięta pod LocalStore funkcjonalność Computed wyłapuje zapytanie. Wyciąga obiekty autorskie przypięte do tej listy i nakłada funkcję `filter` ograniczając tablicę jedynie do elementów na których `name.toLowerCase()` spełnia kryteria wyszukiwania. W przypadku braku dopasowania widok prezentuje informator tekstowy bez fiszek. Zamiast Pagination używany jest pełny cache globalny.

**Zdarzenie: Otwieranie Sklepu jako Modal? (Marketplace Overlap)**
- *When*: Użytkownik wykorzysta metodę "Przejdź na Marketplace".
- *Then*: Store aktualizuje zmienną `isMarketplaceVisible: true` co ma wpływ na widoczność UI (komponent z boku/bądź popover) i zezwala oddać obsługę `MarketplaceLocalStore`. Zamknięcie przywołuje `closeMarketplace()`.

**Zdarzenie: Import lokalnego arkusza (File Import)**
- *When*: Użytkownik wybiera arkusz lokalny dla nowej Fiszki uderzając w `importFile(file)`.
- *Then*:
  - Global Store poddaje plik z wykorzystaniem specjalnego parsera usługowego (`ChapterFileService`) do konwersji ze struktur np. CSV do struktury "ChapterCreateRequest".
  - Metoda zdejmuje lub powiesza ładowanie UI wywołując zielony komunikat za pomocą biblioteki Alertów ('Zaimportowano. Stworzono nowy rozdział'). W ramach krachu struktury pilnuje wyrzucenia formatki z czerwonym trójkątem błędu.
  
**Zdarzenie: Globalna komunikacja powielona**
- Widok Listy operuje również na udostępnianiu `shareChapter` oraz eksporcie excela `onExport`, których przypadki działają analogicznie do instancji w Detail LocalStore (Notyfikacje o postępach za pomocą Toast API).
