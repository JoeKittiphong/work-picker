# Work Picker

## Project Overview
Work Picker is a frontend web application built with React and Vite. It is a Progressive Web App (PWA) designed to function as an Overtime (OT) and Payroll calculator, specifically localized in Thai. 

The application allows users to log their work and overtime hours, calculates expected pay based on standard rates and custom holiday rules, and stores data locally on the user's device.

### Key Technologies
- **Framework:** React 19
- **Build Tool:** Vite 8
- **Styling:** Vanilla CSS (Modularized in `src/styles/`)
- **Storage:** IndexedDB (`work-picker-db`) with a fallback to localStorage for legacy migrations.
- **Linting:** ESLint

## Architecture & Key Files
- `src/App.jsx`: The main entry point for the React application. It manages the global state (settings, entries), orchestrates IndexedDB data loading, and handles UI rendering including various modals (Settings, Summary, Calendar, Entry, etc.).
- `src/db.js`: The storage layer utilizing IndexedDB. It manages the `settings` and `entries` object stores and includes logic to migrate older `localStorage` data into IndexedDB.
- `src/payroll.js`: Contains the core domain and business logic. It handles all payroll calculations, overtime rates (workday, morning, holiday), deductions (social security, provident fund), and formatting utilities.
- `public/`: Contains PWA assets like `manifest.json`, `sw.js` (Service Worker), and icons.
- `src/styles/`: Contains modularized CSS files for different UI components (animations, banners, calendar, cards, forms, modal, summary).

## Building and Running

Ensure you have Node.js and npm installed.

- **Install dependencies:**
  ```bash
  npm install
  ```
- **Start development server:**
  ```bash
  npm run dev
  ```
- **Build for production:**
  ```bash
  npm run build
  ```
- **Preview production build:**
  ```bash
  npm run preview
  ```
- **Run linting:**
  ```bash
  npm run lint
  ```

## Development Conventions
- **State Management:** Uses React Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`) for managing local component and app-wide state.
- **Styling:** Prefers vanilla CSS over utility-first frameworks, with styles separated by component/feature in the `src/styles` directory.
- **Data Persistence:** Offline-first approach using IndexedDB. Changes to entries or settings should be persisted via functions in `src/db.js` (`saveSettings`, `saveEntries`, `saveAll`).
- **Language/Localization:** The user interface and internal domain labels (e.g., `otTypes` in `payroll.js`) are primarily in Thai.
