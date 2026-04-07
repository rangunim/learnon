# Propozycja Feature'a: Statystyki i Analityka (Dashboard)

## 1. Metryka Propozycji
* **Status**: Wersja Robocza (Propozycja do akceptacji)
* **Właściciel Feature'a**: UI/Frontend
* **Lokalizacja w strukturze**: `src/app/features/dashboard/`
* **Route**: `/dashboard`

## 2. Kontekst Biznesowy i Cel
Dodanie nowego ekranu analityki mającego na celu motywowanie użytkownika i obrazowanie jego postępów. Główne miejsce nawigacyjne to nowa pozycja o nazwie **"Statystyki"** w liście rozwijalnej (dropdown) przy profilu użytkownika.

## 3. Elementy UI i Widoki
1. **Karty Podsumowujące (Stat Cards)** - wyeksponowane na górze widoku:
    * **Opanowane słowa (Total)**: Całkowita liczba wszystkich opanowanych słówek.
    * **Aktualny ciąg (Streak)**: Liczba dni z rzędu z przynajmniej jedną zaliczoną aktywnością/grą.
    * **Czas nauki**: Łączny czas spędzony w module gier.
2. **Wykresy Paskowe (PrimeNG Bar Charts)** - wyświetlane obok siebie w układzie `flex` lub `grid`:
    * **Wykres: Ostatni Tydzień**: Prezentujący 7 dni i ilość opanowanych słówek danego dnia.
    * **Wykres: Ostatni Miesiąc**: Domyślnie ładujący dane za ostatni miesiąc (punkty reprezentujące dni danego miesiąca).

## 4. Architektura i Stan (Store / Signal)
Nowy moduł zostanie zbudowany zgodnie z instrukcjami z pliku `AGENTS.md`.

* **Service (`dashboard.service.ts`)**: Będzie odpowiadał za "zapytania do backendu". Do wykresów wykona polecenia GET (zwracające bezpośrednio pre-kalkulowaną listę punktów dla obu przedziałów czasowych) oraz GET dla podsumowania do kafelków. Zabezpieczy DTO i zmapuje to do modeli domenowych.
* **Store (`dashboard.store.ts`)**: Jako Global lub Root Store zarządzający ładowaniem (loading) pobieraniem tych danych przy intializacji strony `/dashboard`.
* **ViewModel**: Stan `dashboardStore` zostanie zamieniony po stronie Store w sygnał `viewModel`, który specjalnie sformatuje obiekty zestawu danych (`datasets` i `labels`) do idealnego dla kontrolki `<p-chart type="bar">`.
* **Page Component (`dashboard.page.ts`)**: Dumb component (względnie thin component) odpowiedzialny wyłącznie za zaczytywanie zmiennej `viewModel` ze Store i wpompowywanie go w widok UI, pozbawiony logiki manipulacji danymi wewnątrz pliku.

## 5. Przepływy BDD (User Stories / Acceptance Criteria)

**Usługa Dostępna w Menu**
* **GIVEN** Zalogowany użytkownik w obojętnie jakiej części serwisu
* **WHEN** Otwiera menu rozwijalne profilu
* **THEN** Widzi nową opcję "Statystyki" prowadzacą do ścieżki `/dashboard`

**Wygląd Dashboardu i Kafelków**
* **GIVEN** Użytkownik wejdzie na ścieżkę `/dashboard`
* **WHEN** Komponent strony zostaje zainicjalizowany
* **THEN** Sklep wykonuje strzał po "Podsumowanie", a powyżej wykresów renderują się 3 metryki: Total Words, Streak, Time Spent.

**Wyświetlanie Wykresów Paskowych**
* **GIVEN** Użytkownik widzi ekran Dashboardu
* **WHEN** Żądania do API po dane z tygodnia i miesiąca po pre-kalkulowane punkty zakończą się sukcesem
* **THEN** Nałożone zostają one do interfejsu PrimeNG
* **AND** Ukazują się na stronie dwa wykresy kolumnowe obok siebie (lewa i prawa kolumna na desktopach) obrazujące wynik względem czasu.
