# Account Feature - Profile Page Store Spec

Ten dokument opisuje mechanikę Store'a dla strony profilu domyślnego użytkownika (`/account/profile`), która zajmuje się wyświetlaniem jego avataru, danych osobowych (imię, nazwisko, opis itp.). 

## Scenariusze BDD

**Zdarzenie: Inicjalizacja i załadowanie danych profilu**
- *Given*: Użytkownik ładuje i przechodzi na stronę profilu. 
- *When*: W bloku inicjalizacyjnym lub konstruktorze `ProfileLocalStore` odpalana jest asynchroniczna metoda startowa np. `loadProfile()`.
- *Then*:
  - Global Store dostarcza lub Service uderza w API celem zaciągnięcia DTO użytkownika.
  - Flaga pobierania `isLoading: true` uniemożliwia interakcję przez ułamek sekundy serwując tzw. Szkielet (Skeleton screen) uwidoczniony przez `viewModel.isLoading`.
  - Store parsuje dane HTTP do Domenowego Modelu, zapisuje stan w sygnale. Umożliwia render widoku pokazując imię i nazwisko użytkownika.

**Zdarzenie: Aktualizacja danych profilowych (Edit Profile)**
- *Given*: Użytkownik poprawił swoje imię lub nazwisko w polach formularza i naciska guzik "Zapisz zmiany".
- *When*: Wywoływana zostaje metoda Store `updateProfile(newProfileData)`.
- *Then*:
  - Store oznacza włączenie ładowania za pomocą `isUpdating: true` (np. kręciołek wewnątrz przycisku).
  - Wykonane zostaje zapytanie za pośrednictwem HTTP Client, np. PATCH kierowany w `AccountService`.
  - Backend zwraca wyłuskanego nowego uaktualnionego użytkownika. Store nadpisuje stan pod ten wariant i zdejmuje opcję ładowania aktualizacji.
  - Rzucany jest w powiadomieniu zielony Alert/Toast API z tekstem: "Profil wyedytowano poprawnie" bez przetrzymywania i zmiany routingu. Zmiany stają się od reki widoczne.
