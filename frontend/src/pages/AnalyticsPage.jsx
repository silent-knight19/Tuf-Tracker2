import { useEffect, useMemo } from 'react';
import { useAnalyticsStore } from '../stores/analyticsStore';
import ActivityHeatmap from '../components/features/ActivityHeatmap';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import {
  CheckCircle2,
  Flame,
  Target,
  Award,
  Calendar,
  Activity,
  Layers,
  BarChart2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

export default function AnalyticsPage() {
  const {
    overview,
    topics,
    patterns,
    difficulty,
    platforms,
    fetchDashboard,
    loading,
  } = useAnalyticsStore();

  useEffect(() => {
    fetchDashboard(30);
  }, [fetchDashboard]);

  const platformData = useMemo(() => {
    return (
      platforms?.map((p) => ({
        name: p.platform || 'Other',
        value: p.count || 0,
      })) || []
    );
  }, [platforms]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#38bdf8'];

  // Radar chart data for patterns
  const radarData = useMemo(() => {
    const combinedMap = {};
    [...(topics || []), ...(patterns || [])].forEach((item) => {
      const key = item.topic || item.pattern;
      if (key) {
        combinedMap[key] = (combinedMap[key] || 0) + item.count;
      }
    });

    const maxCount = Math.max(...Object.values(combinedMap), 1);

    return Object.entries(combinedMap)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map((t) => ({
        subject: t.subject,
        A: t.count,
        fullMark: maxCount,
      }));
  }, [topics, patterns]);

  // Custom unified dark tooltip for Recharts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-surface-elevated border border-border-strong px-3 py-2 rounded-lg shadow-xl text-xs select-none">
          <p className="font-semibold text-foreground">{data.name || data.payload?.subject}</p>
          <p className="text-primary font-mono mt-0.5">
            {data.value} problems
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading && !overview) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <Skeleton variant="card" count={4} />
      </div>
    );
  }

  const totalDiff = (difficulty?.easy || 0) + (difficulty?.medium || 0) + (difficulty?.hard || 0) || 1;
  const easyPct = Math.round(((difficulty?.easy || 0) / totalDiff) * 100);
  const medPct = Math.round(((difficulty?.medium || 0) / totalDiff) * 100);
  const hardPct = Math.round(((difficulty?.hard || 0) / totalDiff) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Performance Analytics
            </h1>
            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
            Real-time diagnostics on problem-solving velocity, retention intervals, and algorithmic strengths.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-foreground-subtle shrink-0">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>Last 30 Days</span>
        </div>
      </div>

      {/* 2. Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Solved */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-foreground-subtle mb-3">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Total Verified
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-foreground font-mono tabular-nums tracking-tight">
              {overview?.totalProblems || 0}
            </div>
            <div className="mt-3 pt-3 border-t border-border-subtle text-[11px] text-foreground-subtle">
              <span>Algorithmic problems verified</span>
            </div>
          </div>
        </Card>

        {/* Current Streak */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-foreground-subtle mb-3">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Current Streak
            </span>
            <Flame className="w-4 h-4 text-accent-amber" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-accent-amber font-mono tabular-nums tracking-tight">
              {overview?.currentStreak || 0} <span className="text-sm font-normal text-foreground-muted">Days</span>
            </div>
            <div className="mt-3 pt-3 border-t border-border-subtle text-[11px] text-foreground-subtle">
              <span>Consecutive practice days</span>
            </div>
          </div>
        </Card>

        {/* Patterns Mastered */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-foreground-subtle mb-3">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Patterns Logged
            </span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-foreground font-mono tabular-nums tracking-tight">
              {overview?.patternsMastered || 0}
            </div>
            <div className="mt-3 pt-3 border-t border-border-subtle text-[11px] text-foreground-subtle">
              <span>Core algorithmic paradigms</span>
            </div>
          </div>
        </Card>

        {/* Active Study Days */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-foreground-subtle mb-3">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Active Days
            </span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-sky-400 font-mono tabular-nums tracking-tight">
              {overview?.totalActiveDays || 0}
            </div>
            <div className="mt-3 pt-3 border-t border-border-subtle text-[11px] text-foreground-subtle">
              <span>Days with problem activity</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Heatmap & Platform Mix Bento (8 cols + 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Solve Velocity Heatmap */}
        <div className="lg:col-span-8">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Annual Solve Velocity
                </h3>
              </div>
              <span className="text-[11px] font-mono text-foreground-subtle">
                365-day cadence
              </span>
            </div>

            <ActivityHeatmap />
          </Card>
        </div>

        {/* Platform Distribution Donut */}
        <div className="lg:col-span-4">
          <Card className="flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent-amber" />
                <h3 className="text-sm font-semibold text-foreground">
                  Platform Distribution
                </h3>
              </div>
            </div>

            {platformData.length > 0 ? (
              <div className="h-44 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {platformData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="rgba(0,0,0,0.5)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-foreground-subtle">
                No platform data logged yet.
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-border-subtle text-xs">
              {platformData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-foreground-muted">{entry.name}</span>
                  <span className="font-mono font-semibold text-foreground">
                    ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* 4. Pattern Radar & Difficulty Breakdown (6 cols + 6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Pattern Radar */}
        <div className="lg:col-span-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Algorithmic Pattern Strengths
                </h3>
              </div>
              <span className="text-[11px] text-foreground-subtle">Top 6 paradigms</span>
            </div>

            {radarData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      stroke="rgba(255, 255, 255, 0.08)"
                      tick={{ fill: '#64748b', fontSize: 9 }}
                    />
                    <Radar
                      name="Problems Solved"
                      dataKey="A"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.25}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-foreground-subtle">
                Solve problems across various patterns to generate radar telemetry.
              </div>
            )}
          </Card>
        </div>

        {/* Difficulty Breakdown */}
        <div className="lg:col-span-6">
          <Card className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-foreground">
                  Difficulty Distribution
                </h3>
              </div>
              <span className="text-[11px] font-mono text-foreground-subtle">
                {totalDiff} Problems
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {/* Easy */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Easy</span>
                  </div>
                  <span className="font-mono text-foreground">
                    {difficulty?.easy || 0} ({easyPct}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border-subtle">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${easyPct}%` }}
                  />
                </div>
              </div>

              {/* Medium */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Medium</span>
                  </div>
                  <span className="font-mono text-foreground">
                    {difficulty?.medium || 0} ({medPct}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border-subtle">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${medPct}%` }}
                  />
                </div>
              </div>

              {/* Hard */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>Hard</span>
                  </div>
                  <span className="font-mono text-foreground">
                    {difficulty?.hard || 0} ({hardPct}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border-subtle">
                  <div
                    className="h-full bg-rose-400 rounded-full transition-all duration-500"
                    style={{ width: `${hardPct}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
