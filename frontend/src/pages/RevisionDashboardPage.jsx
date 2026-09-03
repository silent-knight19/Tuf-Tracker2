import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRevisionStore } from '../stores/revisionStore';
import { useAuthStore } from '../stores/authStore';
import {
  RotateCw,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Play,
  ArrowRight,
  Clock,
  Trash2,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Dialog from '../components/ui/Dialog';
import Skeleton from '../components/ui/Skeleton';

export default function RevisionDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    dueToday,
    overdue,
    upcoming,
    counts,
    loading,
    fetchDueToday,
    fetchRevisions,
    removeFromQueue,
  } = useRevisionStore();

  const [showUpcomingModal, setShowUpcomingModal] = useState(false);
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  const [clearingOverdue, setClearingOverdue] = useState(false);

  useEffect(() => {
    fetchDueToday();
    fetchRevisions();
  }, [fetchDueToday, fetchRevisions]);

  const dueList = useMemo(() => {
    return Object.values(dueToday || {}).flat();
  }, [dueToday]);

  const handleClearAllOverdue = async () => {
    if (
      !window.confirm(
        `Are you sure you want to dismiss all ${overdue.length} overdue problems from your immediate queue?`
      )
    ) {
      return;
    }

    setClearingOverdue(true);
    try {
      for (const rev of overdue) {
        await removeFromQueue(rev.id);
      }
      fetchDueToday();
      fetchRevisions();
      setShowOverdueModal(false);
    } catch (err) {
      console.error('Failed to dismiss overdue items:', err);
    } finally {
      setClearingOverdue(false);
    }
  };

  const handleStartSession = () => {
    const target = overdue[0] || dueList[0];
    if (target) {
      navigate(`/revision/${target.id}/review`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* 1. Retention Health Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Spaced Revision Queue
            </h1>
            <span className="text-[11px] font-medium text-indigo-300 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
              SM-2 Memory Engine
            </span>
          </div>
          <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
            Review algorithms at optimal psychological intervals to convert short-term recall into permanent mastery.
          </p>
        </div>

        {(overdue.length > 0 || dueList.length > 0) && (
          <Button
            variant="primary"
            size="md"
            onClick={handleStartSession}
            leftIcon={Play}
            className="shrink-0"
          >
            Start Review Session
          </Button>
        )}
      </div>

      {/* 2. Retention KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overdue */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-foreground-subtle mb-3">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Overdue Review
            </span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-foreground font-mono tabular-nums tracking-tight text-rose-400">
              {counts?.overdue || 0}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle text-[11px] text-foreground-subtle">
              <span>Immediate attention</span>
              {overdue.length > 0 && (
                <span
                  onClick={() => setShowOverdueModal(true)}
                  className="text-rose-400 font-medium cursor-pointer hover:underline"
                >
                  Manage →
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Due Today */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-foreground-subtle mb-3">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Scheduled for Today
            </span>
            <RotateCw className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-foreground font-mono tabular-nums tracking-tight text-amber-400">
              {counts?.dueToday || 0}
            </div>
            <div className="mt-3 pt-3 border-t border-border-subtle text-[11px] text-foreground-subtle">
              <span>Optimal retention interval</span>
            </div>
          </div>
        </Card>

        {/* Upcoming */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-foreground-subtle mb-3">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Upcoming Horizon
            </span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-foreground font-mono tabular-nums tracking-tight text-sky-400">
              {counts?.upcoming || upcoming.length || 0}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle text-[11px] text-foreground-subtle">
              <span>Scheduled next 14 days</span>
              {upcoming.length > 0 && (
                <span
                  onClick={() => setShowUpcomingModal(true)}
                  className="text-sky-400 font-medium cursor-pointer hover:underline"
                >
                  View All →
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Retention Health */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-foreground-subtle mb-3">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Retention Health
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums tracking-tight">
              {overdue.length === 0 ? '100%' : `${Math.max(40, 100 - overdue.length * 5)}%`}
            </div>
            <div className="mt-3 pt-3 border-t border-border-subtle text-[11px] text-foreground-subtle">
              <span>{overdue.length === 0 ? 'Optimal state' : 'Overdue debt accumulating'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Overdue Revisions (High Priority) */}
      {overdue.length > 0 && (
        <Card className="border-rose-500/25 bg-rose-500/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertCircle className="w-4 h-4" />
              <h3 className="text-sm font-bold tracking-tight text-foreground">
                Overdue Revisions ({overdue.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowOverdueModal(true)}
              className="text-xs text-rose-400 hover:underline font-medium"
            >
              Manage Overdue Queue
            </button>
          </div>

          <div className="divide-y divide-border-subtle rounded-xl border border-border bg-surface overflow-hidden shadow-inner-rim">
            {overdue.slice(0, 5).map((rev) => (
              <div
                key={rev.id}
                onClick={() => navigate(`/revision/${rev.id}`)}
                className="flex items-center justify-between p-3.5 hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <div className="min-w-0 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">
                      {rev.problemTitle || rev.title || 'Algorithmic Problem'}
                    </div>
                    <div className="text-[11px] text-foreground-subtle truncate mt-0.5">
                      Last reviewed: {rev.lastReviewed ? new Date(rev.lastReviewed).toLocaleDateString() : 'Initial solve'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={
                      rev.difficulty === 'Easy'
                        ? 'easy'
                        : rev.difficulty === 'Hard'
                        ? 'hard'
                        : 'medium'
                    }
                    size="sm"
                  >
                    {rev.difficulty || 'Medium'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/revision/${rev.id}/review`);
                    }}
                    className="h-7 text-[11px] px-2.5"
                  >
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 4. Due Today Queue */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent-amber/15 text-accent-amber flex items-center justify-center">
              <RotateCw className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              Scheduled for Today ({dueList.length})
            </h3>
          </div>
        </div>

        {dueList.length > 0 ? (
          <div className="divide-y divide-border-subtle rounded-xl border border-border bg-surface overflow-hidden shadow-inner-rim">
            {dueList.map((rev) => (
              <div
                key={rev.id}
                onClick={() => navigate(`/revision/${rev.id}`)}
                className="flex items-center justify-between p-3.5 hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <div className="min-w-0 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent-amber shrink-0 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">
                      {rev.problemTitle || rev.title || 'Algorithmic Problem'}
                    </div>
                    <div className="text-[11px] text-foreground-subtle truncate mt-0.5">
                      {rev.bucket ? `SM-2 Interval: ${rev.bucket}` : 'Interval review'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={
                      rev.difficulty === 'Easy'
                        ? 'easy'
                        : rev.difficulty === 'Hard'
                        ? 'hard'
                        : 'medium'
                    }
                    size="sm"
                  >
                    {rev.difficulty || 'Medium'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/revision/${rev.id}/review`);
                    }}
                    className="h-7 text-[11px] px-2.5"
                  >
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center border border-dashed border-border rounded-xl p-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h4 className="text-xs font-semibold text-foreground">
              Daily Revision Complete
            </h4>
            <p className="text-[11px] text-foreground-subtle max-w-sm mx-auto mt-1">
              You have reviewed all algorithms scheduled for today. Check upcoming intervals below.
            </p>
          </div>
        )}
      </Card>

      {/* 5. Upcoming Schedule */}
      {upcoming.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-foreground">
                Upcoming Intervals ({upcoming.length})
              </h3>
            </div>
            {upcoming.length > 6 && (
              <button
                type="button"
                onClick={() => setShowUpcomingModal(true)}
                className="text-xs text-sky-400 hover:underline font-medium"
              >
                View full schedule
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcoming.slice(0, 6).map((rev) => (
              <div
                key={rev.id}
                onClick={() => navigate(`/revision/${rev.id}`)}
                className="p-3 rounded-xl border border-border bg-surface hover:bg-surface-hover hover:border-border-strong transition-colors cursor-pointer shadow-inner-rim"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <Badge
                    variant={
                      rev.difficulty === 'Easy'
                        ? 'easy'
                        : rev.difficulty === 'Hard'
                        ? 'hard'
                        : 'medium'
                    }
                    size="sm"
                  >
                    {rev.difficulty || 'Medium'}
                  </Badge>
                  <span className="text-[10px] font-mono text-foreground-subtle">
                    {rev.nextReviewDate
                      ? new Date(rev.nextReviewDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Scheduled'}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-foreground truncate">
                  {rev.problemTitle || rev.title}
                </h4>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Overdue Modal */}
      <Dialog
        isOpen={showOverdueModal}
        onClose={() => setShowOverdueModal(false)}
        title="Manage Overdue Revisions"
        description="Problems overdue for spaced retrieval practice."
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearAllOverdue}
              disabled={clearingOverdue}
              isLoading={clearingOverdue}
              leftIcon={Trash2}
            >
              Dismiss All Overdue
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowOverdueModal(false)}
            >
              Done
            </Button>
          </div>
        }
      >
        <div className="divide-y divide-border-subtle max-h-96 overflow-y-auto custom-scrollbar">
          {overdue.map((rev) => (
            <div
              key={rev.id}
              className="py-2.5 flex items-center justify-between text-xs"
            >
              <div className="min-w-0 pr-4">
                <p className="font-semibold text-foreground truncate">
                  {rev.problemTitle || rev.title}
                </p>
                <p className="text-[11px] text-foreground-subtle">
                  {rev.difficulty} · Bucket {rev.bucket || '1'}
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setShowOverdueModal(false);
                  navigate(`/revision/${rev.id}/review`);
                }}
                className="h-7 text-[11px] shrink-0"
              >
                Review
              </Button>
            </div>
          ))}
        </div>
      </Dialog>

      {/* Upcoming Modal */}
      <Dialog
        isOpen={showUpcomingModal}
        onClose={() => setShowUpcomingModal(false)}
        title="All Upcoming Revisions"
        description="Chronological schedule of future spaced repetition milestones."
        footer={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowUpcomingModal(false)}
          >
            Close
          </Button>
        }
      >
        <div className="divide-y divide-border-subtle max-h-96 overflow-y-auto custom-scrollbar">
          {upcoming.map((rev) => (
            <div
              key={rev.id}
              className="py-2.5 flex items-center justify-between text-xs"
            >
              <div className="min-w-0 pr-4">
                <p className="font-semibold text-foreground truncate">
                  {rev.problemTitle || rev.title}
                </p>
                <p className="text-[11px] text-foreground-subtle">
                  {rev.difficulty} · Next:{' '}
                  {rev.nextReviewDate
                    ? new Date(rev.nextReviewDate).toLocaleDateString()
                    : 'Scheduled'}
                </p>
              </div>
              <Button
                size="sm"
                variant="subtle"
                onClick={() => {
                  setShowUpcomingModal(false);
                  navigate(`/revision/${rev.id}`);
                }}
                className="h-7 text-[11px] shrink-0"
              >
                Inspect
              </Button>
            </div>
          ))}
        </div>
      </Dialog>
    </div>
  );
}
