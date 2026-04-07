# Konstytucja Projektu (Zasady Niezmienne)

Konstytucja określa fundamentalne reguły, których "AI Agenci" i developerzy ludzcy muszą ściśle przestrzegać podczas tworzenia i refaktoringu aplikacji LearnON. Ochrona w nim zawartych zasad warunkuje wysoką bezawaryjność architektoniczną i zachowanie ustandaryzowanego flow.

## 1. Ekosystem i Framework
1. **Angular w wersji v20+**: Aplikacja korzysta TYLKO Z STANDALONE COMPONENTS. W pliku/dekoratorze `@Component` nigdy nie dodajemy `standalone: true`, ponieważ z uwagi na wymogi najnowszego frameworku stało się to cechą domyślną. Związane z NgModule klasy typu `AppModule` są usunięte z projektu.
2. **Minimalizacja RxJS do Granic API**: Skupiamy się na nowej infrastrukturze tzw. Signals by zrealizować re-rendering Angulara we w pełni synchronizowany i bezpieczny sposób.

## 2. Stan Aplikacji i Zarządzanie (State Management)
1. **Signals-First**: Podstawowym mechanizmem zarządzania stanem są sygnały. Brak bezpośrednich mutacji danych. Sygnały aktualizujemy z zastosowaniem podejścia niemutowalnego używając `.update()` lub `.set()`. 
2. **Globalny Store VS Lokalny Store**: 
   - Store logiki dla poszczególnych stron (tzw. `[nazwa].localstore.ts`) rezyduje jako "lokalny Service" dopięty po przez tablicę `providers: [NazwaStore]` do komponentu `page.ts`.
   - Klasyczny "globalny state store" (feature level store, w `providedIn: 'root'`) zarezerwowany jest tylko dla danych współdzielonych tj. stan autoryzacji czy sesje gry pomiędzy podstronami. 
3. **Change Detection**: Wszystkie komponenty - zarówno małe, jak i całe widoki - MUSZĄ posiadać flagę `ChangeDetectionStrategy.OnPush`.

## 3. Organizacja Szablonów i Komponentów
1. **Thin Components & ViewModel Pattern**: Cała ciężka logika, interakcje wielokrokowe lądują w LocalStore danego widoku. Optyka powłoki (czyli komponent `.ts`) ma być tak odtłuszczona ("thin"), zeby tylko subskrybowała sygnał ViewModel dostarczany ze Store i wystawiała protekcyjne metody (`protected`) spinane w `.html`.
2. **Native Flow Control**: Przejście z `*ngIf`, `*ngFor` wyłącznie na wbudowane Angular Control Flows: `@if`, `@for`, `@switch` i delegacja `@let vm = viewModel()`.
3. **Funkcyjne Dekoratory API**: Zakaz używania tradycyjnych anotacji `@Input` czy `@Output`. Interfejs definiujemy funkcjami API dostarczonymi przez najnowszego Angulara: `input()`, `output()`, `model()`, `computed()`.

## 4. Wytyczne Designu i UX/Accessibility
1. **Podział Stylowania (Tailwind vs SCSS)**: 
   - **Tailwind CSS** operuje wyłącznie mechanikami układu. Flex, Grid, Marginesy, Padding, Układ stron określamy "inline" bezpośrednio w logice i templach.
   - **SCSS (Custom)** jest po to, aby przenieść ciężkie ozdobniki i wnieść jakość Premium do aplikacji. Stylistka wizualna, kolory, unikalne łagodne fonty, dynamiczne mikro-animacje przy najechaniu i szklane cieniarki umieszczane są tam. Utrzymujemy architekturę designu w tonie żywych i harmonijnych palet.
2. Zgodność z testowaniem ułatwień dostępu wcag AA (Ostrości, Fokus, Aria attributes). Odrzucanie generycznych tagów `div` na rzecz znaczników semantycznych (`main`, `article`, `header`). Zamiast atrybutów standardowych preferować bindy np. przypinać paramertry class zamist dawnego `ngClass`. 

## 5. Zabezpieczenia w TypeScripcie
1. Zakaz korzystania z typu `any`. Przy asynchroniczności, braku wiedzy lub mockach domyślnym typem staje się `unknown`. Zawsze precyzujemy explicite typy powrotów do każdej metody w klasie.
2. Używanie `readonly` i wąskich pól scope. Cokolwiek co jest polem wewnętrznego loga bez renderowania w pliku `.html` jest `private`. Cokolwiek co działa jako referencja pod akcje z HTML z komponentu jest `protected`.

## 6. Integracja Assetów
1. Użycie dyrektywy Angulara: `NgOptimizedImage` dla każdego statycznego obrazu w aplikacji w zastępstwie za standardowy tag `<img>`. (Z wyjątkiem zasobów "Base64").
