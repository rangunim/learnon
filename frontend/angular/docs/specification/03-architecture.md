# Architektura Systemu

Konstrukcja katalogów i separacji logiki w LearnON opiera się o Model-View-ViewModel (wraz z delegowanym LocalStorem), który dba o spójność w podziale kodu. System zapewnia czytelne testy na każdym kroku i zapobiega nieczytelności dużych klas z logiką aplikacji.

## 1. Wytyczne Organizacji Modułu (Feature Architecture)
Zarówno logikę, komponenty, widoki jak i zarządzanie danymi, zamykamy w kontekstach poszczególnych modułów zgrupowanych wewnątrz folderu `src/app/features/nazwa-modulu/`.

Typowy schemat fizyczny dla konkretnego `Feature`:
- **/model/**: Definiuje typowane modele domeny w aplikacji tj np. `chapter.model.ts`. Oraz oddzielnie struktury typu Data Transfer Object (DTO) odbierające strzały HTTP, np. `chapter.dto.ts`.
- **/page/**: Są to pełnoprawne widoki aplikacji stanowiące pewne punkty z określonym routami (tzw. węzły/widoki wejściowe).
- **[nazwa].service.ts**: JEDYNY punkt kontaktowy z backendem (warstwa logiki z HTTP Client). Usługa ta pobiera API od serwisu po REST z użyciem DTO i prywatnie powołuje metody takie jak `mapToDomain`, by na polecenie Store zaopatrywać aplikację zawsze oczyszczonych domenowych strukturach w typie Readonly i Observablach z odpowiednimi flagami czasu.
- **[nazwa].routes.ts**: Routing asynchroniczny z lazy-loading dla feature.

## 2. Architektura Zarządzania Stanem: LocalStore + ViewModel Pattern

Każdy aktywny komponent (głównie `.page.ts` z folderu `page/`) tworzy obiekty `Injectable` określane mianem powiązanego z danym kontenerem *Local Store'a*. Odpowiada on za agregację sygnałów logiki niezbędnych pod formularz wyszukiwania / logikę gry na tym konkretnie widoku. 

Przykład architektonicznego podziału ról (Wzorzec):
1. **LocalStore**: Implementuje stan aplikacji dla konkretnego miejsca powołanego w Angularze za pomocą wstrzykniętych Signali.
   - Posiada ukryte, mutowane wewnątrz siebie sygnałowe zmienne: `private readonly state = signal({ id: 0, loading: false, user: null})`.
   - Definiuje metody, strzelające do HTTP Serwisów, i zapisujące zmiany do lokalnego sygnału.
   - Generuje finalny pojedynczy tzw. Model Widoku widoczny publicznie jako getter: `public readonly viewModel = computed<ViewModelType>(() => ... )`. Sygnał `computed` odczytuje mniejsze parametry ze stany bazowego i formatuje finalny bezpieczny agregat `viewModel`, dzięki czemu zapotrzebowania w HTML będą proste jak np. `@if (vm.hasItems)`.
2. **Page Component (Dumb-thin Component)**: Skupia się wyłącznie na warstwie obsługi przycisków i UI zaaplikowaniem interfejsu (dekoracjami `Tailwind` i klasami własnymi z `SCSS`). 
   - Wrzuca do swojej tablicy providerów (`providers: [GameLocalStore]`).
   - Wstrzykuje dependency interfejsowy `inject(GameLocalStore)`.
   - Jedynie upublicznia referencją do pliku `html` sygnał `this.store.viewModel()`, pozwalający renderować widok bez żadnej logiki walidowania na poziomie Komponentu i jego szablonu. Wszelkie metody `@output()` czy proste kliknięcia sprowadzają się miej/więcej w stronę wywołania 1 akcji typu `protected confirmAction() { this.store.handleConfirmation(this.data); }`.
