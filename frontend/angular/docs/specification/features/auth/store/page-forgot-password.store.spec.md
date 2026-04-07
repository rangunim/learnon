# Auth Feature - Forgot Password Page Store Spec

Ten dokument opisuje mechanikę podłączaną pod stronę resetowania hasła w module Auth (np. `/auth/forgot-password`).

## Scenariusze BDD

**Zdarzenie: Żądanie resetu hasła z podaniem poprawnego formatu email**
- *Given*: Użytkownik znajduje się na widoku resetowania hasła i wpisuje prawidłowy z punktu widzenia walidacji adres email.
- *When*: Uruchamiana jest metoda `requestPasswordReset(email)` z poziomu komponentu do `ForgotPasswordLocalStore`.
- *Then*:
  - Metoda Store aktywuje znacznik ładowania `isLoading: true` blokując ponowną wysyłkę.
  - Wywoływane jest uderzenie do serwera po HTTP np. `authService.requestPasswordReset(email)`.
  - Po procesowaniu żądania rzucona jest odpowiedź pozytywna. Store podmienia flagę stanu na `isEmailSent: true` i `isLoading: false`.
  - Interfejs za pomocą reaktywnego zczytywania `viewModel.isEmailSent` ukrywa oryginalny formularz i podmienia widownię na komunikat sukcesu: "O ile istnieje konto z tym adresem, został na nie wysłany link operacyjny."

**Zdarzenie: Obsługa limitowania (Rate Limiting)**
- *Given*: Użytkownik w panice kilka razy próbuje poprosić o wiadomości resetujące.
- *When*: Odpalana jest ponownie metoda zapytania.
- *Then*:
  - Zapytanie do systemu obronnego serwera zwraca limit (np. kod HTTP 429 lub 400).
  - W klasie logicznej Store łapany jest ten wyjątek, co wycisza flagę interfejsu ładującego.
  - Generowana jest notka do stanu wewnętrznego `error: 'Spróbuj ponownie za x minut'`, która spływa poprzez typowanie ViewModel i blokuje użytkownika pokazując czerwoną linię alertu.
