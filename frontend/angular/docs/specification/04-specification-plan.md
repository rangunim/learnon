# AI Spec Driven Development - Propozycja Planu

Generacja specyfikacji przy udziale Agenta AI, szczególnie dla projektu narzucającego rygorystyczne normy architektoniczne (związane silnie z modularnością Angular i koncepcją MVVM + Signals), musi mieć podejście bardzo metodyczne, stopniowe, krok po kroku. Ułatwia to testowanie jednostkowe i izoluje "halucynacje" modeli językowych.

Zdecydowanie najbezpieczniejszym podejściem będzie przygotowywanie szczegółowej dokumentacji **Per Feature**.

## Proponowana Struktura Katalogów i Plików
Folder dokumentacji powinien finalnie po wygenerowaniu prezentować się w następujący sposób:

- `docs/specification/`
  - `01-project-overview.md` *(Stworzony)*
  - `02-constitution.md` *(Stworzony)*
  - `03-architecture.md` *(Stworzony)*
  - `04-specification-plan.md` *(Bieżący)*
  - `features/`
    - `chapter/` - Specyfikacja całego węzła nauki/kontekstu zadań
      - `data-model.md` (Interfejs domeny i zasady przesyłu DTO via API)
      - `spec.md` (Przypadki użycia BDD, logiki postępu autoryzacji poszczególnych modułów, wymogi widokowe Store'u i reguł kontrolnych dla Guardów Angulara)
    - `game/`
      - `listen-repeat.spec.md` (Stan ViewModelu, zdefiniowane eventy wejściowe i wyjściowe ekranu minigry, flow błędów audio)
      - `dictation.spec.md` (Przepływ oceniania podanego dyktanda, cykl utrat postępów w grze)
      - `exam.spec.md` (Logika generowania dynamicznego egzaminu punktowego)
    - `marketplace/`
      - `store.spec.md` (Zasady działania globalnego LocalStore pod wyszukiwarkę)
      - `spec.md` (Jak UI ma reagować na input wyszukiwarek asynchronicznych - filtrowanie emaila/autora)

---

## 4-krokowy Plan Generacji Specyfikacji dla każdego Feature (AI workflow)

W celu dodania nowego Feature (np. dodajemy moduł `achievementów / odznak`) lub domknięcia specyfikacji dla obecnych, pracujemy w następujących cyklach:

### Krok 1. Faza Bazy i Transferu Danych (Data & API Spec)
*Czego tu wymagamy od AI?*
- Rozpoznania koncepcji, co ten moduł robi.
- Zbudowania `[feature].dto.ts` uwzględniając restrykcyjne metody mapujące polecane przez `02-constitution.md` (unikanie `any`, upewnianie się, skąd i kiedy wchodzi dany strumień JSON, jakie są ścieżki endpoints).
- Nakreślenie modeli domenowych z których korzystać będziemy po stronie aplikacji UI. Zdefiniowanie pliku `data-model.md` wewnątrz feature.

### Krok 2. Faza ViewModel i Operacji Na Stanie (LocalStore Spec)
*Czego tu wymagamy od AI?*
- Świadomości różnicy między "LocalStore", a instancją globalną `providedIn: 'root'`.
- Rozpisanie Interfejsów: Jaki jest stan poczatkowy aplikacji przed wejściem na router danego `.page`
- Zaprojektowanie struktury Signala `ViewModel`, która trafi do ostatecznego renderu. To tutaj w tym dokumencie musimy rozpisać funkcjonalność dla poszczególnych eventów: `np co się stanie po failurze API? Co jak lista jest pusta i search w marketplace nie da wyników?`.
- Ta faza eliminuje błędy związane z pisaniem logiki pod widoki.

### Krok 3. UI, Kontenery Pages i Szablony (Interface Flow)
*Czego tu wymagamy od AI?*
- Przełożenia zebranych parametrów `ViewModel` z kroku 2 na deklaratywny, natywny HTML (Control Flow Angular bez dyrektyw starych).
- Określenia struktury *Tailwind*'a. W szczególności przypilnowania sztucznej inteligencji by nie wrzucała w ten widok kolorów i ozdobników - musi trzymać się wytycznych Konstytucji, oddzielając to dla pliku SCSS.
- Wygenerowania specyfikacji tzw. BDD lub ogólnych punktów Use Case na temat "zabezpieczeń testów Dostępności aplikacji - WCAG", skupiania focusu itp.

### Krok 4. Akceptacja i Zamknięcie (The Implementation Check)
Na podstawie 3 zebranych raportów wewnątrz `docs/specification/features/[nazwa]`, możemy bez strachu użyć innego chata / agenta w IDE by poprosić o realizację kodu, używając polecenia:
> "Opierając się na architekturze z 03-architecture.md, oraz plikach .spec znajdujących się w folderze /docs dla wymaganego modułu, stwórz docelową implementację TS/HTML/SCSS dla pliku." 

Ten 4 stopniowy cykl nakłada jasne granice dla modelu (AI ma krótki i twardy kontekst) a przez to redukuje zjawisko refactoring loop'ów.
