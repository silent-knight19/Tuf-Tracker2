import { useEffect } from 'react';
import { useAnalyticsStore } from '../stores/analyticsStore';
import ActivityHeatmap from '../components/features/ActivityHeatmap';
import { Trophy, CheckCircle2, Star, Zap, Target, TrendingUp, Code2 } from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

function AnalyticsPage() {
  const { 
    overview, topics, patterns, difficulty, platforms, timeline,
    fetchOverview, fetchTopics, fetchPatterns, fetchDifficulty, fetchPlatforms, fetchTimeline,
    loading 
  } = useAnalyticsStore();

  useEffect(() => {
    fetchOverview();
    fetchTopics();
    fetchPatterns();
    fetchDifficulty();
    fetchPlatforms();
    fetchTimeline(30);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  // Prepare data for charts
  const platformData = platforms?.map(p => ({
    name: p.platform,
    value: p.count
  })) || [];

  const COLORS = ['#ffa116', '#00b8a3', '#3b5998', '#ff375f', '#8e44ad'];

  const radarData = topics?.slice(0, 6).map(t => ({
    subject: t.topic,
    A: t.count,
    fullMark: Math.max(...topics.map(tp => tp.count))
  })) || [];

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar space-y-6">
      
      {/* Top Row: Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-dark-900 border-dark-800 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center">
            <Zap className="w-6 h-6 text-brand-orange" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{overview?.currentStreak || 0}</div>
            <div className="text-xs text-dark-400">Day Streak</div>
          </div>
        </div>

        <div className="card bg-dark-900 border-dark-800 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-yellow/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-brand-yellow" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{overview?.totalProblems || 0}</div>
            <div className="text-xs text-dark-400">Problems Solved</div>
          </div>
        </div>

        <div className="card bg-dark-900 border-dark-800 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Star className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{overview?.patternsMastered || 0}</div>
            <div className="text-xs text-dark-400">Patterns Mastered</div>
          </div>
        </div>

        <div className="card bg-dark-900 border-dark-800 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{overview?.totalActiveDays || 0}</div>
            <div className="text-xs text-dark-400">Total Active Days</div>
          </div>
        </div>
      </div>

      {/* Middle Row: Heatmap & Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Heatmap (Takes up 2/3) */}
        <div className="lg:col-span-2 card bg-dark-900 border-dark-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-brand-orange" />
              Submission Activity
            </h2>
          </div>
          <div className="h-48 w-full">
            <ActivityHeatmap />
          </div>
        </div>

        {/* Platform Breakdown (Takes up 1/3) */}
        <div className="card bg-dark-900 border-dark-800 p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-orange" />
            Platforms
          </h2>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Topic Radar & Difficulty Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Topic Proficiency Radar */}
        <div className="card bg-dark-900 border-dark-800 p-6 h-[400px]">
          <h2 className="text-lg font-semibold text-white mb-4">Topic Proficiency</h2>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
              <Radar
                name="Problems Solved"
                dataKey="A"
                stroke="#ffa116"
                fill="#ffa116"
                fillOpacity={0.6}
              />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Difficulty Distribution Concentric Chart */}
        <div className="card bg-dark-900 border-dark-800 p-6 h-[400px]">
          <h2 className="text-lg font-semibold text-white mb-4">Difficulty Distribution</h2>
          <div className="relative h-[calc(100%-2rem)]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ name: 'Easy', value: difficulty?.Easy || 0 }]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={51}
                  outerRadius={63}
                  fill="#00b8a3"
                  stroke="none"
                >
                  <Cell fill="#00b8a3" />
                </Pie>
                <Pie
                  data={[{ name: 'Medium', value: difficulty?.Medium || 0 }]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={80}
                  fill="#ffa116"
                  stroke="none"
                >
                  <Cell fill="#ffa116" />
                </Pie>
                <Pie
                  data={[{ name: 'Hard', value: difficulty?.Hard || 0 }]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={85}
                  outerRadius={97}
                  fill="#ff375f"
                  stroke="none"
                >
                  <Cell fill="#ff375f" />
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <div className="text-3xl font-bold text-white">
                {(difficulty?.Easy || 0) + (difficulty?.Medium || 0) + (difficulty?.Hard || 0)}
              </div>
              <div className="text-xs text-dark-400">Total Solved</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AnalyticsPage;
