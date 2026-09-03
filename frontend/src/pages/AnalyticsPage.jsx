import { useEffect } from 'react';
import { useAnalyticsStore } from '../stores/analyticsStore';
import ActivityHeatmap from '../components/features/ActivityHeatmap';
import { CheckCircle2, Zap, Target, TrendingUp, ArrowUpRight, Activity, Calendar, Award } from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

function AnalyticsPage() {
  const { 
    overview, topics, patterns, difficulty, platforms,
    fetchDashboard,
    loading 
  } = useAnalyticsStore();

  useEffect(() => {
    fetchDashboard(30);
  }, [fetchDashboard]);

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center h-full bg-dark-950">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange shadow-[0_0_20px_rgba(249,115,22,0.3)]"></div>
        </div>
      </div>
    );
  }

  const platformData = platforms?.map(p => ({
    name: p.platform,
    value: p.count
  })) || [];

  const COLORS = ['#f97316', '#10b981', '#3b82f6', '#f43f5e', '#8b5cf6'];

  // Combine topics and patterns for radar chart
  const combinedMap = {};
  [...topics, ...patterns].forEach(item => {
    const key = item.topic || item.pattern;
    combinedMap[key] = (combinedMap[key] || 0) + item.count;
  });

  const radarData = Object.entries(combinedMap)
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map(t => ({
      subject: t.subject,
      A: t.count,
      fullMark: Math.max(...Object.values(combinedMap), 1)
    }));

  const maxHeatmapCount = Math.max(...(useAnalyticsStore.getState().heatmap.map(d => d.count)), 0);

  return (
    <div className="p-6 sm:p-8 h-full overflow-y-auto custom-scrollbar bg-dark-950 selection:bg-brand-orange/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Title */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Performance Analytics</h1>
            <p className="text-xs text-dark-400 font-medium mt-1">Real-time metrics on problem solving velocity and consistency</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-xs text-dark-300">
            <Calendar className="w-3.5 h-3.5 text-brand-orange" />
            <span>Last 30 Days</span>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[
            { label: 'Current Streak', value: `${overview?.currentStreak || 0} Days`, sub: 'Active practice', icon: Zap, color: 'text-brand-orange', bg: 'bg-brand-orange/10 border-brand-orange/20' },
            { label: 'Total Solved', value: overview?.totalProblems || 0, sub: 'Problems verified', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Patterns Logged', value: overview?.patternsMastered || 0, sub: 'Algorithmic concepts', icon: Award, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { label: 'Active Study Days', value: overview?.totalActiveDays || 0, sub: 'Days of consistency', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' }
          ].map((stat, i) => (
            <div key={i} className="glass-panel rounded-2xl p-5 hover:border-white/[0.16] transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl border ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stat.value}</div>
                <div className="text-xs font-semibold text-dark-300 mt-1">{stat.label}</div>
                <div className="text-2xs text-dark-400 mt-0.5">{stat.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Middle Section: Heatmap & Platform Mix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Activity Heatmap (8 cols) */}
          <div className="lg:col-span-8 glass-panel rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Solve Velocity Heatmap</h2>
                  <p className="text-2xs text-dark-400 font-normal">Daily submission distribution over time</p>
                </div>
              </div>
            </div>

            <div className="w-full flex items-center justify-center py-4 overflow-x-auto no-scrollbar">
              <ActivityHeatmap />
            </div>
            
            {/* Heatmap Metrics Bar */}
            <div className="mt-6 pt-5 border-t border-white/[0.06] grid grid-cols-3 gap-4">
              <div>
                <span className="text-2xs text-dark-400 font-medium">Daily Peak</span>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">{maxHeatmapCount} solves</div>
              </div>
              <div>
                <span className="text-2xs text-dark-400 font-medium">Total Solves</span>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">{overview?.totalProblems || 0}</div>
              </div>
              <div>
                <span className="text-2xs text-dark-400 font-medium">Annual Consistency</span>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {overview?.totalActiveDays ? ((overview.totalActiveDays / 365) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Platform Distribution (4 cols) */}
          <div className="lg:col-span-4 glass-panel rounded-2xl p-6 flex flex-col items-center">
            <div className="w-full flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Platform Mix</h2>
                <p className="text-2xs text-dark-400 font-normal">Problem source distribution</p>
              </div>
            </div>
            
            <div className="w-full h-52 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {platformData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-dark-900/95 backdrop-blur-xl border border-white/[0.1] rounded-xl p-2.5 shadow-xl text-xs">
                            <span className="font-semibold text-white">{payload[0].name}: </span>
                            <span className="text-brand-orange font-bold">{payload[0].value}</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Platform Legend */}
            <div className="w-full flex flex-wrap justify-center gap-2 pt-2 border-t border-white/[0.06] mt-2">
              {platformData.map((p, i) => (
                <div key={i} className="flex items-center gap-2 px-2.5 py-1 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-dark-300 font-medium">{p.name} ({p.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Skills Radar & Difficulty Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Skill Proficiency Radar (6 cols) */}
          <div className="lg:col-span-6 glass-panel rounded-2xl p-6 h-[440px] flex flex-col">
            <div className="mb-4">
              <h2 className="text-base font-bold text-white tracking-tight">Skill Spectrum Radar</h2>
              <p className="text-2xs text-dark-400 font-normal">Top algorithmic patterns and paradigms</p>
            </div>

            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                  <Radar
                    name="Mastery"
                    dataKey="A"
                    stroke="#f97316"
                    strokeWidth={2}
                    fill="#f97316"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Difficulty Tiers Breakdown (6 cols) */}
          <div className="lg:col-span-6 glass-panel rounded-2xl p-6 h-[440px] flex flex-col">
            <div className="mb-4">
              <h2 className="text-base font-bold text-white tracking-tight">Difficulty Balance</h2>
              <p className="text-2xs text-dark-400 font-normal">Solved problems categorized by complexity</p>
            </div>
            
            <div className="relative flex-1 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Easy', value: difficulty?.Easy || 0, fill: '#10b981' },
                      { name: 'Medium', value: difficulty?.Medium || 0, fill: '#f59e0b' },
                      { name: 'Hard', value: difficulty?.Hard || 0, fill: '#f43f5e' }
                    ]}
                    dataKey="value" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={70} 
                    outerRadius={95}
                    paddingAngle={4}
                    stroke="none"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#f43f5e" />
                  </Pie>
                  <RechartsTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-dark-900/95 backdrop-blur-xl border border-white/[0.1] rounded-xl p-2.5 shadow-xl text-xs">
                            <span className="font-semibold text-white">{payload[0].name}: </span>
                            <span className="font-bold text-brand-orange">{payload[0].value}</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {(difficulty?.Easy || 0) + (difficulty?.Medium || 0) + (difficulty?.Hard || 0)}
                </div>
                <div className="text-2xs font-semibold uppercase tracking-wider text-dark-400">Total Solves</div>
              </div>
            </div>

            {/* Difficulty Legend */}
            <div className="flex justify-center gap-6 pt-4 border-t border-white/[0.06] w-full">
              {[
                { label: 'Easy', color: 'bg-emerald-400', value: difficulty?.Easy || 0 },
                { label: 'Medium', color: 'bg-amber-400', value: difficulty?.Medium || 0 },
                { label: 'Hard', color: 'bg-rose-400', value: difficulty?.Hard || 0 }
              ].map((tier, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${tier.color}`} />
                  <span className="text-xs text-dark-300 font-medium">{tier.label}:</span>
                  <span className="text-xs font-bold text-white">{tier.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AnalyticsPage;
