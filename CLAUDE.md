# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GamesDex is a cross-platform social network for gamers built as a Final Degree Project (TFG/DAM). Users track played games, write reviews, follow other gamers, and get AI-powered game recommendations. The app integrates with RAWG API (game catalog), Hugging Face Inference API (AI recommendations), and Firebase (auth + database).

## Priority Docs

Before generating or modifying code, always consult these documents first:

1. **[Docs/_ARQUITECTURA_Y_CAPAS.md](Docs/_ARQUITECTURA_Y_CAPAS.md)** — Defines the layered architecture, module boundaries, and where each type of code belongs. All new code must conform to this structure.
2. **[Docs/_GUIA_ESTILO_UI.md](Docs/_GUIA_ESTILO_UI.md)** — UI design system: color tokens, typography, spacing, component patterns, and dark mode rules. All UI code must follow these guidelines.

Other useful references in `Docs/`:
- `_BASE_DE_DATOS_NOSQL.md` — Firestore collections and document schemas
- `_REQUISITOS_Y_HISTORIAS.md` — User stories and functional requirements
- `_DIAGRAMAS_UML.md` — UML diagrams
- `_CONTEXTO_MAESTRO.md` — Project master context

## Commands

```bash
npm start        # Dev server on port 4200 (ng serve)
ionic serve      # Dev server on port 8100 (Ionic CLI, preferred)
npm run build    # Production build (output: www/)
npm test         # Unit tests (Karma + Jasmine, Chrome)
npm run lint     # ESLint on .ts and .html files
npm run watch    # Build in watch mode
```

## Architecture

**Angular 20 + Ionic 8 + Firebase** — standalone components, no NgModules.

### Layer structure (`src/app/`)

- **`core/`** — Business logic layer: services (singleton), data models, API integrations
  - `models/database.models.ts` — Firestore document interfaces (User, Review, Follow, UserGame)
  - `models/game.model.ts` — RAWG API interfaces (Game, Genre, Platform, RawgResponse)
  - `services/auth.service.ts` — Firebase Auth + Firestore user sync
  - `services/game.service.ts` — RAWG API (search, details, trending, forYou, byGenre)
- **`UI/`** — Presentation layer: pages and components organized by feature
  - `UI/home/` — Feed principal (hero banner, trending slider, para ti grid)
  - `UI/search/` — Búsqueda de juegos con debounce RxJS
  - `UI/my-games/` — Gestión de colección personal (placeholder)
  - `UI/auth/` — Login, register, complete-profile
- **`app.routes.ts`** — Standalone lazy-loaded routing (no route modules)

### Data layer

- **Firebase Auth** for authentication (email/password, Google)
- **Cloud Firestore** collections: `users`, `reviews`, `follows`, `user_games`
- **RAWG API** for game metadata (IDs, covers, descriptions)
- **Hugging Face API** for AI recommendations
- Images stored as **Base64** strings in Firestore (no separate storage bucket)

### State management

RxJS Observables/Subjects in services — no external state library.

### Deployment targets

- Web (PWA-ready)
- Android via **Capacitor 8** (webDir: `www/`, appId: `io.ionic.starter`)

## Code Style

- **TypeScript strict mode**, target ES2022
- **Single quotes** in TypeScript, 2-space indentation
- Component/directive selectors must use `app-` prefix
- SCSS for styling; theme tokens in `src/theme/variables.scss`
- Comments and model field names are in **Spanish**
