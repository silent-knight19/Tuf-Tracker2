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
5.  **Environment Variables:**
    Scroll down to "Environment Variables" and add the following:
    *   `PORT`: `3001`
    *   `GEMINI_API_KEY`: `your_gemini_api_key`
    *   `FIREBASE_DATABASE_URL`: `your_firebase_database_url` (if used)
    *   `FIREBASE_SERVICE_ACCOUNT`: Paste the **entire content** of your `serviceAccountKey.json` file as a single string.
        *   *Note: Ensure there are no newlines if possible, though Render usually handles it.*
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

*   **Backend Health Check:** Visit `https://your-backend-url.onrender.com/` to see if it responds (e.g., "API is running").
*   **Frontend API Connection:** Open the browser console on your deployed site. If you see CORS errors or 404s, check the `VITE_API_URL` variable in Vercel.
