# Auth Feature - Register Page Store Spec

Ten dokument opisuje mechanikę podłączaną pod stronę rejestracji nowego użytkownika w module Auth (np. `/auth/register`).

## Scenariusze BDD

**Zdarzenie: Rejestracja z poprawnymi i unikalnymi danymi**
- *Given*: Użytkownik wypełnia formularz rejestracji (np. email, hasło, imię) poprawnymi i spełniającymi wymogi walidacyjne danymi.
- *When*: Jesteśmy na etapie wysyłania formularza, co wyzwala metodę `register(userData)` w `RegisterLocalStore`.
- *Then*: 
  - Store ustawia stan `isLoading: true` i czyści ewentualne errory ustawiając `error: null`.
  - Agregowany sygnał (np. w `viewModel`) blokuje pola wejściowe i interakcje.
  - Store wykonuje połączenie przez serwis `AuthService`, np. `authService.register(userData)`.
  - Serwer rejestruje użytkownika i zwraca odpowiedź o sukcesie. Store zdejmuje flagę `isLoading: false`.
  - Następnie, jeśli aplikacja wymaga logowania po rejestracji, router przenosi użytkownika na widok `/auth/login` (lub od razu wykonuje auto-zalogowanie zależnie od serwisu API), powiadamiając dodatkowo popu-pem / toast'em: "Konto zostało pomyślnie utworzone."

**Zdarzenie: Rejestracja z użyciem zajętego adresu email**
- *Given*: Użytkownik przesyła formularz używając adresu email, który jest już zajęty.
- *When*: Odpalona jest metoda `register(userData)`.
- *Then*: 
  - Zapytanie do serwisu zwraca błąd z komunikatem konfliktu (np. HTTP 409 Conflict / HTTP 400 z JSON).
  - Store wyłapuje go i ustawia flagę na zdejmującą tryb ładowania `isLoading: false`.
  - W obiekcie stanu zapamiętywany jest napotkany problem, np. mapuje kod błędu widniejący w odpowiedzi na komunikat czytelny dla użytkownika: `error: 'Adres e-mail jest już zajęty'`. Trafia on poprzez getter do `viewModel.errorMessage` wyświetlając się wizualnie.
