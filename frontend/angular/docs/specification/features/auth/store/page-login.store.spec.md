# Auth Feature - Login Page Store Spec

Ten dokument opisuje mechanikę podłączaną pod stronę logowania użytkownika w module Auth (np. `/auth/login`).

## Scenariusze BDD

**Zdarzenie: Próba logowania z poprawnymi danymi**
- *Given*: Użytkownik widzi formularz logowania i uzupełnia adres email oraz hasło, które są prawidłowe.
- *When*: Wysłanie formularza wyzwala metodę `login(credentials)` w `LoginLocalStore`.
- *Then*: 
  - Store ustawia sygnał `isLoading` na `true`, co blokuje przycisk formularza i pokazuje wskaźnik ładowania, widoczne przez pobranie `viewModel.isLoading`.
  - Store czyści ewentualne poprzednie błędy ustawiając `error` na `null`.
  - Store asynchronicznie wywołuje metodę we wstrzykniętym serwisie uwierzytelniania, np. `authService.login(credentials)`.
  - Po pomyślnej odpowiedzi, serwis zapisuje token lokalnie, a Store zdejmuje flagę ładowania `isLoading: false`.
  - Store wywołuje nawigację kierując użytkownika na główny widok aplikacji, np. `/chapters`.

**Zdarzenie: Próba logowania z niepoprawnymi danymi (Błąd autoryzacji)**
- *Given*: Użytkownik wprowadza niepoprawny adres email lub hasło.
- *When*: Uruchomiana jest metoda `login(credentials)` w Store.
- *Then*: 
  - Zapytanie do serwisu zwraca błąd (np. HTTP 401 Unauthorized lub 400 Bad Request).
  - Store w bloku wyłapującym błąd (catch/error) zdejmuje flagę `isLoading: false`.
  - Store aktualizuje ukrytą zmienną stanu `error: 'Nieprawidłowy email lub hasło'`, która jest odzwierciedlona w `viewModel.errorMessage` pozwalając na poinformowanie użytkownika za pomocą np. czerwonego paska na UI. Przekierowanie nie następuje.
