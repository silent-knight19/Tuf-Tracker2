import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import ProblemsPage from './ProblemsPage';
import AnalyticsPage from './AnalyticsPage';
import CompaniesPage from './CompaniesPage';
import RevisionDashboardPage from './RevisionDashboardPage';
import RevisionProblemDetailPage from './RevisionProblemDetailPage';
import ProblemViewPage from './ProblemViewPage';
import { useProblemStore } from '../stores/problemStore';
import { Flame, Menu } from 'lucide-react';

function DashboardPage() {
  const { fetchProblems } = useProblemStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchProblems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <Flame className="w-6 h-6 text-brand-orange" />
            <span className="text-dark-400">0 day streak</span>
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
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
