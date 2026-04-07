# Chapter Feature - Create / Edit Forms Store Spec

Ten plik zarządza specyfikacją LocalStore dla widoków tworzenia i edytowania zestawu fiszek (`/chapters/new` lub `/chapters/edit/:id`).

## Scenariusze BDD LocalStore (Create/Edit)

**Zdarzenie: Inicjalizacja formularza i zarządzanie polem słówek**
- *Given*: Router ładuje stronę tworzenia/edycji.
- *When*: `LocalStore` buduje interaktywny formularz ReactiveForms (`FormGroup`), domyślnie dodając metody `addWord()` i `removeWord(index)`.
- *Then*: Tablica wyrazów (`FormArray`) pozwala dodawać i usuwać konkretne pola par językowych w czasie rzeczywistym. Computed `viewModel` nasłuchuje zdarzeń kontrolujących walidację, odblokowując flagę `canSubmit` tylko wtedy, gdy wszystkie pola tekstowe i wymagane języki są wypełnione (`isValid: true`).

**Zdarzenie: Asynchroniczny zapis na backend (API Post)**
- *When*: Użytkownik wysyła poprawny Formularz klikając potwierdzenie.
- *Then*:
  - LocalStore natychmiast odpala sygnał `isSaving: true`.
  - Computed ViewModel zmienia tekst głównego przycisku na `submitLabel: 'Zapisywanie...'` i blokuje kliknięcia.
  - Wywołuje Globalny Store.
  - W strumieniu powrotnym po poprawnym requeście odblokowuje loader, nawigując na nowoutworzony / edytowany zasób w widoku listy.
  
**Zdarzenie: Błąd walidacji Backendowej podczas zapisu**
- *When*: Serwer odpowiada zrzutem błędu (API Error).
- *Then*: Skrypt zatrzymuje przekierowanie Routera (zostawia usera pod adresem edycji). Przełącza `isSaving: false` żeby oddać kontrolę i pozwala na ponowną próbę zapisu bez pęsetowego ucinania aktualnie podanych danych.
