import { useEffect, useState, useMemo, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import ProblemsPage from './ProblemsPage';
import AnalyticsPage from './AnalyticsPage';
import CompaniesPage from './CompaniesPage';
import RevisionDashboardPage from './RevisionDashboardPage';
import RevisionProblemDetailPage from './RevisionProblemDetailPage';
import ProblemViewPage from './ProblemViewPage';
import SolveUserProblemPage from './SolveUserProblemPage';
import LearnPage from './LearnPage';
import SheetsPage from './SheetsPage';
import Neetcode150Page from './Neetcode150Page';
import StriversA2ZPage from './StriversA2ZPage';
import DsaPatternsPage from './DsaPatternsPage';
import CompanyQuestionsPage from './CompanyQuestionsPage';
import { useProblemStore } from '../stores/problemStore';
import { Flame, PanelLeft, Search } from 'lucide-react';
import { useAutoHideHeader } from '../hooks/useAutoHideHeader';

// Update function signature to accept children
function DashboardPage({ children }) {
  const location = useLocation();
  const { fetchProblems, problems } = useProblemStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const mainContentRef = useRef(null);
  const headerVisible = useAutoHideHeader(mainContentRef);

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

  // Calculate total solved count
  const solvedCount = useMemo(() => {
    if (!problems) return 0;
    return problems.filter(p => p.status === 'Solved' || p.status === 'Completed' || p.solvedAt).length;
  }, [problems]);

  return (
    <div className="flex h-screen overflow-hidden bg-dark-950 text-dark-100">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar - Clean Frosted Glass */}
        <header 
          className={`fixed top-0 right-0 z-40 h-16 border-b border-white/[0.06] flex items-center justify-between px-6 bg-dark-950/80 backdrop-blur-xl transition-all duration-300 ease-spring ${
            headerVisible ? 'translate-y-0' : '-translate-y-full'
          }`} 
          style={{ left: sidebarOpen ? '16rem' : '0' }}
        >
          {/* Left: Sidebar Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-2 text-dark-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all active:scale-95"
              title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <PanelLeft className={`w-5 h-5 transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180 opacity-60'}`} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-dark-500 font-medium">Workspace</span>
              <span className="text-dark-600">/</span>
              <span className="text-white font-semibold capitalize">
                {location.pathname === '/' || location.pathname === '/problems' ? 'Dashboard' :
                 location.pathname.startsWith('/sheets') ? 'Curated Sheets' :
                 location.pathname.startsWith('/analytics') ? 'Analytics' :
                 location.pathname.startsWith('/revision') ? 'Spaced Revision' :
                 location.pathname.startsWith('/company') ? 'Company Prep' : 'Overview'}
              </span>
            </div>
          </div>
 
          {/* Center: Raycast Command Palette Trigger */}
          <div className="flex items-center justify-center max-w-md w-full px-4">
            <div 
              onClick={() => {
                const searchInput = document.getElementById('problem-search-input');
                if (searchInput) searchInput.focus();
              }}
              className="w-full group flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] text-dark-400 hover:text-dark-200 transition-all duration-200 cursor-pointer shadow-inner"
            >
              <div className="flex items-center gap-2.5 text-xs truncate">
                <Search className="w-3.5 h-3.5 text-dark-500 group-hover:text-brand-orange transition-colors" />
                <span className="truncate">Search problems, tags, companies...</span>
              </div>
              <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-dark-400 bg-white/[0.05] border border-white/[0.1] rounded">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right: Quick Executive Stats */}
          <div className="flex items-center gap-2.5 ml-auto">
            {/* Solved Problems Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
              <span className="text-dark-400 font-medium">Solved:</span>
              <span className="text-white font-semibold">{solvedCount}</span>
            </div>

            {/* Streak Counter */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 ${
              streak > 0 
                ? 'bg-brand-orange/10 border-brand-orange/30 text-white shadow-sm shadow-brand-orange/10' 
                : 'bg-white/[0.03] border-white/[0.07] text-dark-400'
            }`}>
              <Flame className={`w-4 h-4 transition-colors ${streak > 0 ? 'text-brand-orange fill-brand-orange animate-pulse-subtle' : 'text-dark-500'}`} />
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="text-white">{streak}</span>
                <span className="text-dark-400 font-normal text-2xs">Day Streak</span>
              </div>
            </div>
          </div>
        </header>
 
        {/* Content Area - dynamic padding based on header visibility */}
        <main ref={mainContentRef} className={`flex-1 overflow-y-auto transition-[padding] duration-300 ${headerVisible ? 'pt-[72px]' : 'pt-0'}`}>
          {children ? children : (
            <Routes>
              <Route path="/" element={<ProblemsPage />} />
              <Route path="/problems" element={<ProblemsPage />} />
              <Route path="/sheets" element={<SheetsPage />} />
              <Route path="/sheets/neetcode" element={<Neetcode150Page />} />
              <Route path="/sheets/strivers" element={<StriversA2ZPage />} />
              <Route path="/sheets/dsa-patterns" element={<DsaPatternsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/company-prep/:companyName" element={<CompanyQuestionsPage />} />
              <Route path="/companies/:companyName" element={<ProblemsPage />} />
              <Route path="/revision" element={<RevisionDashboardPage />} />
              <Route path="/revision/:id" element={<RevisionProblemDetailPage />} />
              <Route path="/revision/:id/review" element={<RevisionProblemDetailPage autoOpenReview={true} />} />
              <Route path="/problem/view" element={<ProblemViewPage />} />
              <Route path="/problem/:id" element={<ProblemViewPage />} />
              <Route path="/learn" element={<LearnPage />} />
            </Routes>
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;

