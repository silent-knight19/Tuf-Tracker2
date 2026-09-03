import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import DashboardOverviewPage from './DashboardOverviewPage';
import ProblemsPage from './ProblemsPage';
import AnalyticsPage from './AnalyticsPage';
import RevisionDashboardPage from './RevisionDashboardPage';
import RevisionProblemDetailPage from './RevisionProblemDetailPage';
import ProblemViewPage from './ProblemViewPage';
import LearnPage from './LearnPage';
import SheetsPage from './SheetsPage';
import Neetcode150Page from './Neetcode150Page';
import StriversA2ZPage from './StriversA2ZPage';
import DsaPatternsPage from './DsaPatternsPage';
import CompanyQuestionsPage from './CompanyQuestionsPage';
import { useProblemStore } from '../stores/problemStore';

function DashboardPage({ children }) {
  const { fetchProblems } = useProblemStore();

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  return (
    <AppShell>
      {children ? (
        children
      ) : (
        <Routes>
          <Route path="/" element={<DashboardOverviewPage />} />
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
    </AppShell>
  );
}

export default DashboardPage;



