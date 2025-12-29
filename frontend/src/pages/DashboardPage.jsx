import { useEffect, useState, useMemo, useRef } from 'react';
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
import { Flame, PanelLeft, Search } from 'lucide-react';
import { useAutoHideHeader } from '../hooks/useAutoHideHeader';
import CountdownTimer from '../components/ui/CountdownTimer';

// Update function signature to accept children
function DashboardPage({ children }) {
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

  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Fixed position for proper auto-hide */}
        <header className={`fixed top-0 right-0 left-0 h-[72px] z-40 border-b border-dark-800/60 flex items-center justify-between px-8 bg-dark-950/80 backdrop-blur-xl transition-all duration-500 ease-in-out ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        } ${sidebarOpen ? 'shadow-none' : 'shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)]'}`} style={{ left: sidebarOpen ? '16rem' : '0' }}>
          
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-3 -ml-3 text-dark-500 hover:text-white hover:bg-dark-800/40 rounded-xl transition-all group active:scale-90 relative z-10"
              title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <PanelLeft className={`w-6 h-6 transition-transform duration-500 ease-out ${sidebarOpen ? '' : 'rotate-180 opacity-50'}`} />
            </button>
          </div>
 
          <div className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-500 ease-in-out" 
               style={{ 
                 left: sidebarOpen ? 'calc(50% - 8rem)' : '50%',
                 transform: 'translate(-50%, -50%)' 
               }}>
            <CountdownTimer targetDate="2026-04-01T00:00:00" />
          </div>
 
          <div className="flex items-center gap-6">
            {/* Notifications / Actions (Future Proofing) */}
            <div className="hidden sm:flex items-center gap-2.5 pr-5 border-r border-dark-800/50">
               <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
               <span className="text-[11px] font-bold text-dark-500 uppercase tracking-[0.15em]">Live Sync</span>
            </div>
 
            {/* Streak Counter - Premium Pill */}
            <div className={`group flex items-center gap-3.5 px-5 py-2 rounded-full border transition-all duration-500 cursor-default ${
              streak > 0 
                ? 'bg-brand-orange/5 border-brand-orange/20 shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:bg-brand-orange/10 hover:border-brand-orange/30' 
                : 'bg-dark-900 border-dark-800'
            }`}>
              <div className="relative">
                <Flame className={`w-6 h-6 transition-all duration-300 ${streak > 0 ? 'text-brand-orange fill-brand-orange/20 drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'text-dark-500'}`} />
                {streak > 0 && (
                  <div className="absolute inset-0 bg-brand-orange/40 blur-xl rounded-full animate-pulse" />
                )}
              </div>
              <div className="flex flex-col -space-y-1">
                <span className={`text-[11px] font-black uppercase tracking-tighter ${streak > 0 ? 'text-brand-orange/70' : 'text-dark-500'}`}>Streak</span>
                <span className={`text-[15px] font-black transition-colors ${streak > 0 ? 'text-white' : 'text-dark-400'}`}>
                  {streak} Days
                </span>
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
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;

