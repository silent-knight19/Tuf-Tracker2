import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import './index.css';

import ProblemViewPage from './pages/ProblemViewPage';
import RevisionProblemDetailPage from './pages/RevisionProblemDetailPage';
import InterviewProblemPage from './pages/InterviewProblemPage';
import AIInterviewPage from './pages/AIInterviewPage';

function App() {
  const { user, loading, initializeAuth } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => {
      if (unsubscribe) unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <LoginPage />} 
        />
        <Route 
          path="/problem/:id" 
          element={user ? <ProblemViewPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/revision/:id" 
          element={user ? <RevisionProblemDetailPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/revision/:id/review" 
          element={user ? <RevisionProblemDetailPage autoOpenReview={true} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/interview/ai" 
          element={user ? <AIInterviewPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/interview/:id" 
          element={user ? <InterviewProblemPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/*" 
          element={user ? <DashboardPage /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
