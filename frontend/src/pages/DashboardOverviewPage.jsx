import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  CheckCircle2,
  RotateCw,
  ArrowRight,
  Target,
  Zap,
  BookOpen,
  Building2,
  Cpu,
  Layers,
  Calendar,
  Award,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useProblemStore } from '../stores/problemStore';
import { useRevisionStore } from '../stores/revisionStore';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function DashboardOverviewPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { problems, fetchProblems } = useProblemStore();
  const { dueToday, overdue, counts, fetchDueToday } = useRevisionStore();

  useEffect(() => {
    fetchProblems();
    fetchDueToday();
  }, [fetchProblems, fetchDueToday]);

  // Greeting based on local time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = useMemo(() => {
    if (!user?.displayName) return 'Engineer';
    return user.displayName.split(' ')[0];
  }, [user]);

  // Problems statistics
  const stats = useMemo(() => {
    const solved = (problems || []).filter(
      (p) => p.status === 'Solved' || p.status === 'Completed' || p.solvedAt
    );
    const easy = solved.filter((p) => p.difficulty === 'Easy').length;
    const medium = solved.filter((p) => p.difficulty === 'Medium').length;
    const hard = solved.filter((p) => p.difficulty === 'Hard').length;
    return {
      totalSolved: solved.length,
      easy,
      medium,
      hard,
    };
  }, [problems]);

  // Priority revisions
  const urgentRevisions = useMemo(() => {
    const allOverdue = overdue || [];
    const allDueToday = Object.values(dueToday || {}).flat();
    return [...allOverdue, ...allDueToday].slice(0, 3);
  }, [overdue, dueToday]);

  // Recommended problem for today
  const recommendedProblem = useMemo(() => {
    if (!problems || problems.length === 0) return null;
    // Find first unsolved problem or return first problem
    const unsolved = problems.find(
      (p) => p.status !== 'Solved' && p.status !== 'Completed' && !p.solvedAt
    );
    return unsolved || problems[0];
  }, [problems]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* 1. Compact Personalized Header (Orientation) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {greeting}, {firstName}
            </h1>
          </div>
          <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
            Daily Objective: Review scheduled spaced revisions and advance algorithmic pattern mastery.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/practice/interview')}
            leftIcon={Cpu}
          >
            Mock Interview
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/problems')}
            rightIcon={ArrowRight}
          >
            Problem Bank
          </Button>
        </div>
      </div>

      {/* 2. Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Solved Problems & Difficulty Distribution */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-foreground-subtle mb-3">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Problems Verified
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-foreground font-mono tabular-nums tracking-tight">
              {stats.totalSolved}
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-subtle text-[11px]">
              <span className="text-emerald-400 font-semibold">{stats.easy} Easy</span>
              <span className="text-foreground-subtle">·</span>
              <span className="text-amber-400 font-semibold">{stats.medium} Med</span>
              <span className="text-foreground-subtle">·</span>
              <span className="text-rose-400 font-semibold">{stats.hard} Hard</span>
            </div>
          </div>
        </Card>

        {/* Metric 2: Revision Queue (SM-2) */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-foreground-subtle mb-3">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Revision Queue
            </span>
            <RotateCw className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-foreground font-mono tabular-nums tracking-tight flex items-baseline gap-2">
              <span>{(counts?.dueToday || 0) + (counts?.overdue || 0)}</span>
              <span className="text-xs text-foreground-muted font-normal">due today</span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle text-[11px] text-foreground-subtle">
              <span>{counts?.overdue || 0} overdue</span>
              <span className="text-indigo-300 font-medium cursor-pointer hover:underline" onClick={() => navigate('/revision')}>
                Open Queue →
              </span>
            </div>
          </div>
        </Card>

        {/* Metric 3: Curated Roadmap Progress */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-foreground-subtle mb-3">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              TakeUForward A2Z
            </span>
            <Layers className="w-4 h-4 text-accent-amber" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-foreground font-mono tabular-nums tracking-tight">
              455
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle text-[11px] text-foreground-subtle">
              <span>Foundational Roadmap</span>
              <span className="text-accent-amber font-medium cursor-pointer hover:underline" onClick={() => navigate('/sheets/strivers')}>
                Resume Course →
              </span>
            </div>
          </div>
        </Card>

        {/* Metric 4: Silicon Valley Standard */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-foreground-subtle mb-3">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              NeetCode 150
            </span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-foreground font-mono tabular-nums tracking-tight">
              150
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle text-[11px] text-foreground-subtle">
              <span>15 Core Patterns</span>
              <span className="text-indigo-300 font-medium cursor-pointer hover:underline" onClick={() => navigate('/sheets/neetcode')}>
                View Sheet →
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Today's Actionable Focus Bento (8 cols + 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Revisions & Daily Recommendation (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Section A: Due Spaced Repetitions */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-primary/15 text-primary flex items-center justify-center">
                  <RotateCw className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Spaced Repetition Due Now
                </h3>
              </div>
              <button
                type="button"
                onClick={() => navigate('/revision')}
                className="text-xs text-primary hover:text-primary-hover font-medium flex items-center gap-1 transition-colors"
              >
                View all ({urgentRevisions.length}) <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {urgentRevisions.length > 0 ? (
              <div className="divide-y divide-border-subtle rounded-lg border border-border bg-surface overflow-hidden shadow-inner-rim">
                {urgentRevisions.map((rev) => (
                  <div
                    key={rev.id}
                    onClick={() => navigate(`/revision/${rev.id}`)}
                    className="flex items-center justify-between p-3 hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-foreground truncate">
                          {rev.problemTitle || rev.title || 'Algorithmic Problem'}
                        </div>
                        <div className="text-[11px] text-foreground-subtle truncate mt-0.5">
                          {rev.bucket ? `SM-2 Interval: ${rev.bucket}` : 'Due for retention review'}
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
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-foreground-subtle border border-dashed border-border rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-medium text-foreground">Spaced revision queue clear</p>
                <p className="text-[11px] text-foreground-subtle mt-0.5">
                  All scheduled spaced repetition reviews are up to date.
                </p>
              </div>
            )}
          </Card>

          {/* Section B: Today's Recommended Problem */}
          {recommendedProblem && (
            <Card className="relative overflow-hidden">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-accent-amber tracking-wider px-2 py-0.5 rounded bg-accent-amber/10 border border-accent-amber/20">
                      Recommended Next
                    </span>
                    <Badge
                      variant={
                        recommendedProblem.difficulty === 'Easy'
                          ? 'easy'
                          : recommendedProblem.difficulty === 'Hard'
                          ? 'hard'
                          : 'medium'
                      }
                      size="sm"
                      dot
                    >
                      {recommendedProblem.difficulty || 'Medium'}
                    </Badge>
                  </div>

                  <h3 className="text-base font-semibold text-foreground truncate">
                    {recommendedProblem.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {recommendedProblem.topics?.slice(0, 3).map((topic) => (
                      <span
                        key={topic}
                        className="text-[11px] text-foreground-subtle bg-surface px-2 py-0.5 rounded border border-border-subtle"
                      >
                        {topic}
                      </span>
                    ))}
                    {recommendedProblem.patterns?.[0] && (
                      <span className="text-[11px] text-indigo-300 bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                        {recommendedProblem.patterns[0]}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate(`/problem/${recommendedProblem.id}`)}
                  leftIcon={Zap}
                  className="shrink-0"
                >
                  Solve Problem
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Right: Quick Action Station & Practice Labs (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <Card>
            <h3 className="text-xs font-semibold text-foreground-subtle uppercase tracking-wider mb-3">
              Quick Action Station
            </h3>
            <div className="space-y-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/practice/interview')}
                leftIcon={Cpu}
                className="w-full justify-start text-xs"
              >
                Start AI Mock Interview
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/revision')}
                leftIcon={RotateCw}
                className="w-full justify-start text-xs"
              >
                Open Spaced Repetition
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/practice/patterns')}
                leftIcon={Target}
                className="w-full justify-start text-xs"
              >
                Explore Algorithmic Patterns
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/practice/companies')}
                leftIcon={Building2}
                className="w-full justify-start text-xs"
              >
                Browse Company Sheets
              </Button>
              <Button
                variant="subtle"
                size="md"
                onClick={() => navigate('/learn')}
                leftIcon={BookOpen}
                className="w-full justify-start text-xs"
              >
                AI DSA Curriculum
              </Button>
            </div>
          </Card>

          {/* Quick Curriculum Roadmap Callout */}
          <Card className="bg-gradient-to-br from-surface-raised via-surface to-surface border-border">
            <div className="flex items-center gap-2 text-accent-amber mb-2">
              <Award className="w-4 h-4" />
              <span className="text-xs font-bold tracking-tight">TakeUForward Course</span>
            </div>
            <p className="text-xs text-foreground-muted leading-relaxed mb-3">
              Master Arrays, Binary Search, Linked Lists, Trees, and Dynamic Programming with Striver's complete roadmap.
            </p>
            <Button
              variant="amber"
              size="sm"
              onClick={() => navigate('/sheets/strivers')}
              rightIcon={ArrowRight}
              className="w-full justify-center"
            >
              Continue A2Z Course
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
