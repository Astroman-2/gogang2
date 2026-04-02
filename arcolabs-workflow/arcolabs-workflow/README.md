# Arcolabs — Full-Stack Draft State Workflow

[![CI](https://github.com/YOUR_USERNAME/arcolabs-workflow/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/arcolabs-workflow/actions)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-orange?logo=github)](https://YOUR_USERNAME.github.io/gogang2/arcolabs-workflow/arcolabs-workflow/)

> **Live interactive demo →** [https://YOUR_USERNAME.github.io/gogang2/arcolabs-workflow/arcolabs-workflow/](https://YOUR_USERNAME.github.io/gogang2/arcolabs-workflow/arcolabs-workflow/)
>
> *(Replace `YOUR_USERNAME` with your GitHub username after pushing.)*

A clean TypeScript full-stack application demonstrating a multi-step workflow:  
**Draft → Performed → Approved** — with full audit logging and an Arcolabs-branded UI (light-blue panels, orange-gold actions).

---

## Screenshots

| Dashboard | Record View | Audit Log |
|-----------|-------------|-----------|
| State selector + workflow diagram | Editable fields with Perform/Approve | Expandable before/after JSON diffs |

---

## Project Structure

```
arcolabs-workflow/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Express server & all route handlers
│   │   ├── db.ts             # SQLite setup & schema initialisation
│   │   ├── types.ts          # Shared TypeScript interfaces
│   │   └── index.test.ts     # Jest tests (state transitions + audit log)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.tsx           # Main component — full workflow UI
│   │   ├── index.tsx         # React entry point
│   │   └── styles.css        # Arcolabs design system
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   └── index.html            # Self-contained live demo (GitHub Pages)
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI
├── .gitignore
└── README.md
```

---

## Setup & Running

### Prerequisites
- Node.js 18+  
- npm 9+

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Runs on **http://localhost:4000**

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Runs on **http://localhost:3000**

### 3. Run Tests

```bash
cd backend
npm test
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/record` | Create a new record in `draft` state |
| `POST` | `/record/:id/perform` | Save form data → transition to `performed` |
| `POST` | `/record/:id/approve` | Lock record → transition to `approved` |
| `GET` | `/record/:id` | Return record + full audit log |

### State Machine

```
draft ──► performed ──► approved
           (locked)
```

Any out-of-order transition returns `HTTP 400` with a descriptive error.

---

## Enabling the Live Demo (GitHub Pages)

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Set **Source** to `Deploy from a branch`, branch `main`, folder `/docs`.
4. Click **Save** — your demo will be live at `https://YOUR_USERNAME.github.io/gogang2/arcolabs-workflow/arcolabs-workflow/` within ~60 seconds.
5. Update the two `YOUR_USERNAME` placeholders in this README.

The `docs/index.html` is a fully self-contained demo — no backend required. It simulates the entire API in-browser so interviewers can explore the workflow instantly.

---

## Assumptions

- A single dummy user (`John Doe`) is used for all audit log entries — authentication is out of scope.
- `state_code` is a free-form string chosen from a dropdown that can be extended at runtime.
- Transitions are **strictly linear**: `draft → performed → approved`. Any other transition returns HTTP 400.
- The SQLite database file (`database.sqlite`) is auto-created on first run and persists between restarts.

---

## Design Notes

1. **Strict State Machine** — All transitions are enforced at the API level. Attempting to approve a draft record returns `400` with a clear error, regardless of frontend behaviour. The frontend mirrors this by only showing the relevant action button for each state.

2. **Persistent SQLite Storage** — SQLite was chosen over in-memory storage so records and audit logs survive server restarts without the reviewer needing to configure a separate database. The schema initialises automatically on server start.

3. **Full Before/After Audit Trail** — Every transition stores `before_json` and `after_json` snapshots of the record's `data` field. The frontend renders these in an expandable log panel so any change is fully traceable.

4. **Arcolabs Design System** — The UI uses a custom CSS design system built around a light-blue panel palette (`#1562a8` primary) and an orange-gold action colour (`#e07d08`). Typography pairs `Syne` (headings) with `DM Sans` (body) for a distinctive, professional feel consistent with the Arcolabs brand.

5. **Error Resilience + UX Polish** — All API calls are wrapped in try/catch. Failures surface in a dismissable notification banner (top-right) rather than silent failures. Buttons disable with a loading spinner during in-flight requests to prevent duplicate submissions. After approval, all fields and actions are disabled with a clear lock banner.
