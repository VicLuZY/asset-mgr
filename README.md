# Asset Planning Dashboard

Public dashboard shell for local asset planning work.

The hosted GitHub Pages build does not include private asset data. It starts empty and lets a user load a local `.assetdb.json` file or compatible workbook in the browser. Loaded data stays client-side unless the user explicitly saves a portable JSON file from the app.

## Run Locally

```bash
npm install
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173/`.

## Verify

```bash
npm run build
npm run lint
npm audit --audit-level=high
```

## Data Safety

Private asset data, workbooks, reports, PDFs, local scripts, generated builds, and environment folders are ignored by git. The public repository and GitHub Pages artifact contain only the dashboard application and build configuration.

## Features

- Load a portable asset database or compatible workbook from the local computer.
- Edit assets, condition, criticality, risk inputs, capital planning rows, maintenance logs, inspections, and documents.
- View asset planning summaries, annual cost visualization, maintenance schedules, replacement schedules, printable work orders, closeout logs, and checklists when a loaded database includes planning data.
- Save a portable JSON database for local backup or handoff.

## Deployment

GitHub Pages is built by Actions from the Vite `dist/` artifact on pushes to `main`.
