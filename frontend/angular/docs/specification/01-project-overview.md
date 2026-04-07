# LearnON - Project Overview

## 1. Wstęp
LearnON to nowoczesna aplikacja edukacyjna zorientowana na produktywną i interaktywną naukę (m.in. języków obcych). System opiera się na modułowej architekturze łączącej śledzenie postępów poprzez rozdziały tematyczne ("Chapters"), zaawansowane minigry walidujące wiedzę (np. Listen-Repeat, Dictation, Exam) oraz ekosystem wymiany materiałów w postaci zewnętrznego wbudowanego rynku edukacyjnego ("Marketplace").

## 2. Główne Moduły Aplikacji (Features)
Aplikacja została podzielona na funkcjonalne "Features", co ułatwia testowanie, inkrementalny rozwój (AI-driven) i bezkolizyjną pracę twórców. 

Główne Moduły:
- **Chapter**: Centralny moduł odpowiedzialny za organizację wiedzy. Posiada struktury pozwalające na zarządzanie modułami czytania, logiką przechodzenia punkt po punkcie, wsparcie dla zabezpieczeń autoryzacji multi-user oraz stany globalnych postępów.
- **Game (Rozgrywka i Walidacja)**: Czysto rozrywkowe i edukacyjne formaty uczenia w formie gier. Obsługuje ujednolicone mechanizmy oceniania (wzorzec LocalStore ViewModel) dla takich aktywności jak:
  - **Listen-Repeat**: Ćwiczenia pamięci słuchowej, słuchania i poprawnej wymowy.
  - **Dictation**: Rozumienie tekstu i odtwarzanie go na piśmie pod dyktando.
  - **Exam**: Zaawansowane mechaniki weryfikowania przyswojonego materiału.
- **Marketplace**: Zewnętrzna lub wewnętrzna giełda z wiedzą, która pozwala autorom na publikację swoich skryptów, zadań, układanek, a użytkownikom na wyszukiwanie ich po tytułach, imionach czy odpowiednio przefiltrowanym adresie email twórcy.
