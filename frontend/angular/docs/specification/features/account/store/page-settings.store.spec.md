# Account Feature - Settings Page Store Spec

Ten dokument opisuje mechanikę podłączaną najczęściej pod widok modyfikacji ustawień konta, w tym zmana hasła lub np. usunięcie konta, z reguły widoczny na np `/account/settings`.

## Scenariusze BDD

**Zdarzenie: Zmiana starego hasła na nowe**
- *Given*: Użytkownik widzi zakładkę bezpieczeństwa, wklepuje obecne hasło jak i 2-krotnie nowe prawidłowo zabezpieczone hasło rzucając okiem by się zgadzało.
- *When*: Składany jest submit operujący metodą Store: `changePassword(passwordData)`.
- *Then*:
  - Store na krótko przyblokowuje aktywność zaznaczając typ w klasie stanu `isPasswordUpdating: true`.
  - Serwis strzela do API z obiektem autoryzacji zmiany hasła.
  - Sukces ściąga obostrzenie zmiany z opisanym wynikiem dla Toast'a `Hasło zmienione pomyślnie`. W przypadku błędu (np. niepasujące rzekome stare hasło HTTP 400), klasa uwidacznia errory do np. `viewModel.passwordChangeError` bez zamykania widoku.

**Zdarzenie: Ochrona ustawień i usunięcie konta**
- *Given*: Użytkownik chce rozwiązać pakt i naciska guzik usuwający konto z ostrzeżeniem.
- *When*: Użyto akcji `deleteAccount()`, najczęściej osadzonej w pewnego rodzaju potrójnym kliknięciu w dialogowym modal boxie.
- *Then*:
  - Store realizuje ostateczny sygnał usuwania przez Serwis.
  - W ramach sukcesu Store rozkazuje GlobalStore unieważnić wszystkie instancje i sesje związane autoryzacyjnie, odłącza LocalStorage i pcha router pod adres pożegnania lub do startu aplikacji: `/`.
