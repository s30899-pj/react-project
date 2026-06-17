# 🗺️ MapForge

Edytor map kafelkowych do gier — projekt na przedmiot **Bogate Interfejsy Użytkownika w aplikacjach webowych**.

Tworzenie i edycja map 2D z systemem warstw, terenem, obiektami, kolizjami, regionami logiki, kamerą (zoom/pan/obrót/izometria), walidacją i eksportem.

## Stack
- **React 18 + TypeScript + Vite**
- **React Router** (routing SPA)
- **Context API + useReducer** (stan edytora, motyw, autentykacja, powiadomienia)
- **SCSS** (moduły CSS, motyw ciemny/jasny)
- **Apollo Client / GraphQL**, **React Query**, **axios** — wszystkie zamockowane (bez backendu i bazy)
- **React Hook Form**, **Vitest + React Testing Library**, **Storybook**

> Aplikacja jest celowo „poprawna, ale fejkowa": brak prawdziwych integracji i bazy danych — atrapy API i `localStorage`.

## Uruchomienie
```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # build produkcyjny
npm run preview      # podgląd builda
npm test             # testy jednostkowe i integracyjne
npm run typecheck    # sprawdzenie typów
npm run lint         # ESLint
npm run storybook    # dokumentacja komponentów (http://localhost:6006)
```

## Logowanie (demo)
Dowolny e-mail i hasło zadziałają. Rola zależy od adresu:
- e-mail z `admin` → **administrator**
- e-mail z `test` → **tester**
- pozostałe → **twórca**

## Struktura
```
src/
  api/          atrapy danych: axios (REST), Apollo (GraphQL), React Query, localStorage
  components/   komponenty bazowe (Button, Modal, Tooltip, Panel, Tabs, ErrorBoundary, HOC, render-props…)
  context/      AuthContext, ThemeContext, EditorContext (reducer), ToastContext
  hooks/        custom hooki (useEditor, useAutoSave, useKeyboardShortcuts…)
  features/
    auth/       logowanie, rejestracja, profil
    projects/   lista projektów, kreator nowej mapy
    editor/     rdzeń edytora: kanwa, kamera, narzędzia, panele, silnik (engine)
  styles/       tokeny, mixiny, style globalne (SCSS)
```
