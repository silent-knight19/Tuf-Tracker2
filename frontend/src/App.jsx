import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import './index.css';

// Lazy load all pages for code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProblemViewPage = lazy(() => import('./pages/ProblemViewPage'));
const RevisionProblemDetailPage = lazy(() => import('./pages/RevisionProblemDetailPage'));
const InterviewProblemPage = lazy(() => import('./pages/InterviewProblemPage'));
const AIInterviewPage = lazy(() => import('./pages/AIInterviewPage'));
const SolveProblemPage = lazy(() => import('./pages/SolveProblemPage'));

// Loading spinner component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-950">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
  </div>
);

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
    return <PageLoader />;
  }

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
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
            path="/solve/:id" 
            element={user ? <SolveProblemPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/*" 
            element={user ? <DashboardPage /> : <Navigate to="/login" />} 
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
