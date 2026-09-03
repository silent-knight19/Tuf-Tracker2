import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyStore } from '../stores/companyStore';
import { useProblemStore } from '../stores/problemStore';
import {
  Building2,
  Search,
  ArrowRight,
  Target,
  CheckCircle2,
  BarChart2,
  Layers,
  ExternalLink,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Drawer from '../components/ui/Drawer';
import Skeleton from '../components/ui/Skeleton';

const TIERS = [
  { id: 'all', label: 'All Companies' },
  { id: 'faang', label: 'Tier 1 / Big Tech' },
  { id: 'fintech', label: 'FinTech & High-Frequency' },
  { id: 'enterprise', label: 'Enterprise Cloud' },
];

export default function CompaniesPage() {
  const navigate = useNavigate();
  const {
    companies,
    fetchCompanies,
    getCompanyReadiness,
    readinessData,
    loading,
  } = useCompanyStore();
  const { problems } = useProblemStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');
  const [activeCompanyDrawer, setActiveCompanyDrawer] = useState(null);
  const [loadingReadiness, setLoadingReadiness] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Compute solved counts per company from local problems
  const companySolvedStats = useMemo(() => {
    const stats = {};
    (problems || []).forEach((p) => {
      const isSolved =
        p.status === 'Solved' || p.status === 'Completed' || Boolean(p.solvedAt);
      if (p.companies && Array.isArray(p.companies)) {
        p.companies.forEach((c) => {
          const key = c.toLowerCase();
          if (!stats[key]) stats[key] = { total: 0, solved: 0 };
          stats[key].total++;
          if (isSolved) stats[key].solved++;
        });
      }
    });
    return stats;
  }, [problems]);

  const filteredCompanies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return (companies || []).filter((comp) => {
      const name = comp.name?.toLowerCase() || '';
      return !q || name.includes(q);
    });
  }, [companies, searchQuery]);

  const handleOpenReport = async (companyName) => {
    setActiveCompanyDrawer(companyName);
    setLoadingReadiness(true);
    try {
      await getCompanyReadiness(companyName);
    } catch (err) {
      console.error('Failed to load readiness:', err);
    } finally {
      setLoadingReadiness(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Target Companies Hub
            </h1>
            <span className="text-[11px] font-medium text-indigo-300 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
              Readiness Telemetry
            </span>
          </div>
          <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
            Evaluate your algorithmic readiness against real interview question sets from leading technology companies.
          </p>
        </div>
      </div>

      {/* 2. Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface border border-border p-3 rounded-xl shadow-inner-rim">
        <div className="w-full sm:w-80">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder="Search company name..."
            icon={Search}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-foreground-subtle self-start sm:self-auto">
          <span>{filteredCompanies.length} companies tracked</span>
        </div>
      </div>

      {/* 3. Company Cards Grid */}
      {loading && filteredCompanies.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton variant="card" count={6} />
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-xl p-6">
          <Building2 className="w-8 h-8 text-foreground-subtle mx-auto mb-2 opacity-80" />
          <h4 className="text-xs font-semibold text-foreground">No companies match your search</h4>
          <p className="text-[11px] text-foreground-subtle mt-1">
            Try a different search term or explore the problem bank.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => {
            const key = company.name?.toLowerCase();
            const localStat = companySolvedStats[key] || { total: company.totalProblems || 0, solved: 0 };
            const solvedCount = localStat.solved;
            const totalProblems = Math.max(localStat.total, company.totalProblems || 0);
            const readinessScore = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

            return (
              <Card
                key={company.name}
                className="flex flex-col justify-between space-y-4 hover:border-border-strong transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center border border-border text-foreground font-bold text-xs shrink-0 shadow-sm">
                      {company.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {company.name}
                      </h3>
                      <span className="text-[11px] text-foreground-subtle">
                        {totalProblems} Questions Tracked
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      readinessScore >= 70
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                        : readinessScore >= 30
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                        : 'bg-surface text-foreground-subtle border border-border'
                    }`}
                  >
                    {readinessScore}% Ready
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-foreground-subtle">
                    <span>Preparation Progress</span>
                    <span className="font-mono text-foreground">
                      {solvedCount} / {totalProblems} Solved
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden border border-border-subtle">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, readinessScore)}%` }}
                    />
                  </div>
                </div>

                {/* Single Click Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-subtle">
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => handleOpenReport(company.name)}
                    className="h-8 text-[11px]"
                  >
                    Readiness
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate(`/company-prep/${company.name.toLowerCase()}`)}
                    rightIcon={ArrowRight}
                    className="h-8 text-[11px]"
                  >
                    Questions
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 4. Slide-Over Company Readiness Drawer */}
      <Drawer
        isOpen={Boolean(activeCompanyDrawer)}
        onClose={() => setActiveCompanyDrawer(null)}
        title={`${activeCompanyDrawer || 'Company'} Readiness Report`}
        subtitle="Interview preparation and question difficulty breakdown"
        width="max-w-lg"
      >
        {loadingReadiness ? (
          <div className="space-y-4 py-8">
            <Skeleton variant="card" count={2} />
          </div>
        ) : (
          <div className="space-y-6 text-xs text-foreground-muted">
            {/* Score Overview */}
            <div className="p-4 rounded-xl border border-border bg-surface flex items-center justify-between shadow-inner-rim">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-subtle block">
                  Readiness Assessment
                </span>
                <div className="text-2xl font-extrabold text-foreground font-mono mt-1">
                  {readinessData?.readinessScore || 0}%
                </div>
                <p className="text-[11px] text-foreground-subtle mt-0.5">
                  Based on verified solutions for {activeCompanyDrawer}
                </p>
              </div>

              <div className="w-12 h-12 rounded-full border-2 border-primary/30 flex items-center justify-center font-mono font-bold text-primary text-sm">
                {readinessData?.readinessScore || 0}%
              </div>
            </div>

            {/* Quick Actions */}
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                const comp = activeCompanyDrawer;
                setActiveCompanyDrawer(null);
                navigate(`/company-prep/${comp.toLowerCase()}`);
              }}
              rightIcon={ArrowRight}
              className="w-full justify-center"
            >
              Browse All {activeCompanyDrawer} Questions
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
