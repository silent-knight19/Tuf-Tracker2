# TufTracker v2.0

A full-stack DSA progress tracking platform with intelligent problem analysis, company readiness scoring, and spaced repetition.

## 🚀 Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
- Add your Firebase service account JSON
- Add your Gemini API key
- Set other configuration options

5. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure Firebase credentials in `.env`

5. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📖 Features

- **Hybrid Problem Analysis**: Cache → Preloaded Data (2000+ problems) → AI Fallback
- **Company Readiness**: Track preparation for 10+ top tech companies
- **Smart Categorization**: Automatic topic, pattern, and difficulty detection
- **Spaced Repetition**: Intelligent revision scheduling
- **LeetCode UI**: Pixel-perfect recreation of LeetCode's interface
- **Analytics**: Progress tracking, streaks, heatmaps, and insights

## 🏗️ Architecture

### Backend
- Node.js + Express
- Firebase/Firestore
- Gemini AI (1.5 Flash)
- Hybrid caching system

### Frontend
- React 18 + Vite
- TailwindCSS
- Firebase Auth
- Zustand (State Management)
- React Router
- Recharts (Analytics)

## 📊 Preloaded Data

The system includes:
- **2000+ problems** from LeetCode, GFG, and top interview lists
- **10 companies**: Google, Amazon, Microsoft, Meta, Apple, Netflix, LinkedIn, Uber, Airbnb, Salesforce
- **30+ topics**: Arrays, Strings, Trees, Graphs, DP, etc.
- **50+ patterns**: Two Pointers, Sliding Window, DFS/BFS, etc.

## 🔑 Setup Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** (Email/Password)
4. Enable **Firestore Database**
5. Get your credentials:
   - Frontend: Project Settings → General → Your apps
   - Backend: Project Settings → Service Accounts → Generate new private key

## 🎨 LeetCode UI Theme

The platform uses LeetCode's exact color palette:
- Background: `#1a1a1a`
- Cards: `#262626`
- Accent: `#ffa116` (orange)
- Easy: `#00b8a3`
- Medium: `#ffc01e`
- Hard: `#ef4743`

## 📝 License

MIT

## 👥 Contributing

Contributions are welcome! Please open an issue or submit a PR.
