import { useEffect, useState, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import ProblemsPage from './ProblemsPage';
import AnalyticsPage from './AnalyticsPage';
import CompaniesPage from './CompaniesPage';
import RevisionDashboardPage from './RevisionDashboardPage';
import RevisionProblemDetailPage from './RevisionProblemDetailPage';
import ProblemViewPage from './ProblemViewPage';
import LearnPage from './LearnPage';
import { useProblemStore } from '../stores/problemStore';
import { Flame, Menu } from 'lucide-react';

function DashboardPage() {
  const { fetchProblems, problems } = useProblemStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchProblems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate streak based on solved problems
  const streak = useMemo(() => {
    if (!problems || problems.length === 0) return 0;

    // Get all solved dates (problems with status 'Solved'/'Completed' OR have solvedAt)
    const solvedDates = problems
      .filter(p => p.status === 'Solved' || p.status === 'Completed' || p.solvedAt)
      .map(p => {
        // Handle different date formats - check solvedAt first, then updatedAt
        const dateField = p.solvedAt || p.updatedAt;
        if (!dateField) return null;
        
        // Firestore Timestamp with _seconds (serialized from backend)
        if (dateField._seconds) {
          return new Date(dateField._seconds * 1000);
        }
        // Firestore Timestamp with seconds
        if (dateField.seconds) {
          return new Date(dateField.seconds * 1000);
        }
        // toDate() method (Firestore Timestamp client-side)
        if (dateField.toDate) {
          return dateField.toDate();
        }
        // ISO string or Date object
        const parsed = new Date(dateField);
        return isNaN(parsed.getTime()) ? null : parsed;
      })
      .filter(d => d !== null);

    if (solvedDates.length === 0) return 0;

    // Normalize dates to midnight for comparison (in local timezone)
    const normalizeDate = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };

    // Get unique dates (as timestamps)
    const uniqueDates = [...new Set(solvedDates.map(normalizeDate))].sort((a, b) => b - a);

    if (uniqueDates.length === 0) return 0;

    // Get today's date normalized
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    // Get yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayTime = yesterday.getTime();

    // Check if streak starts from today or yesterday
    const mostRecentSolve = uniqueDates[0];
    
    // If most recent solve is older than yesterday, streak is 0
    if (mostRecentSolve < yesterdayTime) {
      return 0;
    }

    // Count consecutive days
    let streakCount = 0;
    let currentDay = mostRecentSolve === todayTime ? todayTime : yesterdayTime;

    for (let i = 0; i < uniqueDates.length; i++) {
      if (uniqueDates[i] === currentDay) {
        streakCount++;
        // Move to previous day
        const prevDay = new Date(currentDay);
        prevDay.setDate(prevDay.getDate() - 1);
        currentDay = prevDay.getTime();
      } else if (uniqueDates[i] < currentDay) {
        // Gap in streak
        break;
      }
    }

    return streakCount;
  }, [problems]);

  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-dark-800 flex items-center justify-between px-6 bg-dark-900">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-dark-400 hover:text-dark-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Flame className={`w-6 h-6 ${streak > 0 ? 'text-brand-orange' : 'text-dark-500'}`} />
            <span className={streak > 0 ? 'text-brand-orange font-semibold' : 'text-dark-400'}>
              {streak} day{streak !== 1 ? 's' : ''} streak
            </span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<ProblemsPage />} />
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/companies/:companyName" element={<ProblemsPage />} />
            <Route path="/revision" element={<RevisionDashboardPage />} />
            <Route path="/revision/:id" element={<RevisionProblemDetailPage />} />
            <Route path="/revision/:id/review" element={<RevisionProblemDetailPage autoOpenReview={true} />} />
            <Route path="/problem/view" element={<ProblemViewPage />} />
            <Route path="/problem/:id" element={<ProblemViewPage />} />
            <Route path="/learn" element={<LearnPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;

