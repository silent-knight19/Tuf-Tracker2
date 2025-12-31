import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

import BackendHealthCheck from './components/layout/BackendHealthCheck';
import RateLimitToast from './components/ui/RateLimitToast';
import './index.css';

// Lazy load all pages for code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProblemViewPage = lazy(() => import('./pages/ProblemViewPage'));
const RevisionProblemDetailPage = lazy(() => import('./pages/RevisionProblemDetailPage'));
const InterviewProblemPage = lazy(() => import('./pages/InterviewProblemPage'));
const AIInterviewPage = lazy(() => import('./pages/AIInterviewPage'));
const SolveProblemPage = lazy(() => import('./pages/SolveProblemPage'));
const PatternPracticePage = lazy(() => import('./pages/practice/PatternPracticePage'));
const InterviewPracticePage = lazy(() => import('./pages/practice/InterviewPracticePage'));
const CompanyPracticePage = lazy(() => import('./pages/practice/CompanyPracticePage'));
const SolveProblemsPage = lazy(() => import('./pages/practice/SolveProblemsPage'));

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

  // Note: Rate limiting is enforced by the BACKEND returning 429 errors.
  // Frontend blocking was removed because it can be bypassed via DevTools.
  // If a user hits the rate limit, their API requests simply fail.
  const canAccessProtectedRoute = !!user;

  return (
    <>

      <BackendHealthCheck>
        <RateLimitToast />
        <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" /> : <LoginPage />} 
            />
            <Route 
              path="/problem/:id" 
              element={canAccessProtectedRoute ? <ProblemViewPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/revision/:id" 
              element={canAccessProtectedRoute ? <RevisionProblemDetailPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/revision/:id/review" 
              element={canAccessProtectedRoute ? <RevisionProblemDetailPage autoOpenReview={true} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/interview/ai" 
              element={canAccessProtectedRoute ? <AIInterviewPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/interview/:id" 
              element={canAccessProtectedRoute ? <InterviewProblemPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/solve/:id" 
              element={canAccessProtectedRoute ? <SolveProblemPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/solve/:id" 
              element={canAccessProtectedRoute ? <SolveProblemPage /> : <Navigate to="/login" />} 
            />
            {/* Practice Routes - Note the '/*' to allow nested routes if needed, though here we render specific children */}
            <Route 
              path="/practice/patterns/*" 
              element={canAccessProtectedRoute ? <DashboardPage><PatternPracticePage /></DashboardPage> : <Navigate to="/login" />} 
            />
            <Route 
              path="/practice/interview/*" 
              element={canAccessProtectedRoute ? <DashboardPage><InterviewPracticePage /></DashboardPage> : <Navigate to="/login" />} 
            />
            <Route 
              path="/practice/companies/*" 
              element={canAccessProtectedRoute ? <DashboardPage><CompanyPracticePage /></DashboardPage> : <Navigate to="/login" />} 
            />
            <Route 
              path="/practice/solve/*" 
              element={canAccessProtectedRoute ? <DashboardPage><SolveProblemsPage /></DashboardPage> : <Navigate to="/login" />} 
            />
            <Route 
              path="/*" 
              element={canAccessProtectedRoute ? <DashboardPage /> : <Navigate to="/login" />} 
            />
          </Routes>
          </Suspense>
        </Router>
      </BackendHealthCheck>
    </>
  );
}

export default App;
