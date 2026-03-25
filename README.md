# BatchFlow Web

BatchFlow is a proprietary web application for managing product batches, generating QR/barcode labels, and exporting manufacturing records.

## Proprietary Notice

This project is proprietary software owned by Refora Technologies.
Unauthorized copying, distribution, modification, or commercial use is prohibited unless explicitly approved by the owner.

## What This App Does

- Manages products and categories.
- Generates sequential batch numbers.
- Exports batch lists to PDF.
- Exports printable QR/barcode sheets.
- Stores and shows batch history.
- Supports CSV data export for backups.
- Uses Google Sign-In with Firebase Authentication.

## Tech Stack

- React 19
- Vite 7
- React Router
- Firebase Authentication + Firestore
- jsPDF
- qrcode
- jsbarcode

## Project Structure

```text
src/
	components/      Reusable UI components (layout, guards, modal, select)
	contexts/        Auth and notification state providers
	hooks/           Shared custom hooks
	pages/           Route-level screens (Dashboard, Products, History, etc.)
	services/        Firestore data access helpers
	utils/           Export and formatting helpers
	firebase.js      Firebase initialization using environment variables
```

## Routes

Public routes:
- `/`
- `/login`
- `/privacy-policy`

Protected routes:
- `/dashboard`
- `/add-product`
- `/product-list`
- `/new-batch`
- `/history`
- `/settings`

## Local Development

Prerequisites:
- Node.js 18+
- npm 9+

Install and run:

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

Lint:

```bash
npm run lint
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in real values:

```bash
copy .env.example .env.local
```

Required keys:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

If any required key is missing, the app throws a clear startup error.

## Security: Prevent Secrets From Being Pushed

This repository is configured to avoid committing local secrets:
- `.env` and `.env.*` are ignored in `.gitignore`.
- Runtime Firebase config now reads from env vars only.
- `.env.example` contains placeholders only.

Recommended pre-push check:

```bash
git status --short
git diff -- .env.local
```

You should see no tracked secret files in the diff.

Optional secret scan before push:

```bash
git grep -n "AIza\|apiKey\|secret\|token" -- src
```

## Data Model (High Level)

Main Firestore collections:
- `categories`
- `products`
- `batchHistory`
- `settings`
- `webhooks`

Data is scoped by authenticated user ID.

## Deployment Notes

For any hosting target (Netlify, Firebase Hosting, etc.):
- Add `VITE_FIREBASE_*` variables in the hosting environment.
- Do not store real credentials in source files.
- Do not commit `.env.local`.

## Ownership

Maintained by Refora Technologies.
