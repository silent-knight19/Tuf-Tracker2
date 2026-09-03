# Deployment Guide for TufTracker

This guide covers how to deploy the TufTracker application. The application consists of a **Node.js/Express Backend** (which requires Java) and a **React/Vite Frontend**.

## Prerequisites

1.  **GitHub Repository:** Ensure your code is pushed to a GitHub repository.
2.  **Firebase Project:** You need your Firebase configuration keys.
3.  **Gemini API Key:** You need your Google Gemini AI API key.

---

## Part 1: Deploy Backend (Render)

We use **Render** for the backend because it supports Docker, which allows us to install Java (required for the code runner).

1.  **Sign up/Login** to [Render](https://render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Configure the Service:**
    *   **Name:** `tuftracker-backend` (or similar)
    *   **Root Directory:** `backend`
    *   **Runtime:** `Docker` (Important! Do not select Node)
    *   **Region:** Select one close to you (e.g., Singapore, Oregon).
    *   **Instance Type:** Free (or Starter).
5.  **Environment Variables (S17: dashboard-only, never in git):**
    The blueprint (`render.yaml`) declares every variable with `sync: false`,
    so values live ONLY in the Render dashboard. Scroll down to "Environment Variables" and set:
    *   `PORT`: `3001`
    *   `FRONTEND_URL`: `https://your-frontend.vercel.app` (no trailing slash — required; boot refuses localhost in production)
    *   `BACKEND_URL`: `https://tuftracker-backend.onrender.com` (no trailing slash, not localhost)
    *   `GROQ_API_KEY`: `your_groq_api_key`
    *   `FIREBASE_DATABASE_URL`: `your_firebase_database_url` (if used)
    *   `FIREBASE_SERVICE_ACCOUNT`: Paste the **entire content** of your `serviceAccountKey.json` file as a single string.
        *   *Note: Ensure there are no newlines if possible, though Render usually handles it.*
    *   `ADMIN_EMAILS`: `you@example.com` (admin allowlist for `POST /api/quotes/refresh`; unset = deny-all)
6.  Click **Create Web Service**.

Render will now build your Docker image (installing Node.js and Java) and deploy the server.
**Copy the Backend URL** provided by Render (e.g., `https://tuftracker-backend.onrender.com`). You will need this for the frontend.

---

## Part 2: Deploy Frontend (Vercel)

We use **Vercel** for the frontend as it's optimized for Vite/React.

1.  **Sign up/Login** to [Vercel](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configure the Project:**
    *   **Root Directory:** Click "Edit" and select `frontend`.
    *   **Framework Preset:** Vite (should be auto-detected).
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `dist`
5.  **Environment Variables:**
    Add the following variables (copy values from your local `.env`):
    *   `VITE_API_URL`: `https://your-backend-url.onrender.com/api` (**Append /api** to the Render URL)
    *   `VITE_FIREBASE_API_KEY`: `...`
    *   `VITE_FIREBASE_AUTH_DOMAIN`: `...`
    *   `VITE_FIREBASE_PROJECT_ID`: `...`
    *   `VITE_FIREBASE_STORAGE_BUCKET`: `...`
    *   `VITE_FIREBASE_MESSAGING_SENDER_ID`: `...`
    *   `VITE_FIREBASE_APP_ID`: `...`
    *   `VITE_FIREBASE_MEASUREMENT_ID`: `...`
6.  Click **Deploy**.

Vercel will build and deploy your frontend.

---

## Part 3: Final Configuration

1.  **CORS Update (CRITICAL):**
    *   Once your frontend is deployed, copy its URL (e.g., `https://tuftracker.vercel.app`).
    *   Go back to **Render (Backend)** -> **Environment Variables**.
    *   Add `FRONTEND_URL` with value `https://tuftracker.vercel.app` (no trailing slash).
    *   **Redeploy** the backend (Manual Deploy -> Deploy latest commit) for changes to take effect.
    *   *Without this, your frontend will fail to connect to the backend.*

2.  **Firebase Auth Domains:**
    *   Go to **Firebase Console** -> **Authentication** -> **Settings** -> **Authorized Domains**.
    *   Add your Vercel domain (e.g., `tuftracker.vercel.app`).

## Troubleshooting

*   **Backend Health Check:** Visit `https://your-backend-url.onrender.com/health` — expect `{"status":"ok",...}`. (`/` is not a route; the platform health gate uses `/health`.)
*   **Hardening notes (S17):** the image runs as unprivileged `node` (never root) on Node 22 LTS, installs production deps only (`npm ci`), and exposes nothing but the API port. Render free-tier disks are **ephemeral**: the company-tags file write-back is best-effort and inert in production (in-memory data rules). For no-sleep + steadier runner performance, prefer the **Starter** instance type over Free (billing decision — not set in `render.yaml`). The Java runner shares this container (see `docs/security/s5-code-runner.md`); a dedicated isolated runner service is the tracked follow-up, not part of this deploy.
*   **Frontend API Connection:** Open the browser console on your deployed site. If you see CORS errors or 404s, check the `VITE_API_URL` variable in Vercel.
