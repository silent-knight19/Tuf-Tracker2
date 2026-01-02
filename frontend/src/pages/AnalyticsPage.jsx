import { useEffect } from 'react';
import { useAnalyticsStore } from '../stores/analyticsStore';
import ActivityHeatmap from '../components/features/ActivityHeatmap';
import { Trophy, CheckCircle2, Star, Zap, Target, TrendingUp, Code2, ArrowUpRight, Activity, Calendar, Award } from 'lucide-react';
import MotivationalQuote from '../components/ui/MotivationalQuote';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
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
  }, []);

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center h-full bg-dark-950">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-orange shadow-[0_0_20px_rgba(249,115,22,0.3)]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-6 h-6 text-brand-orange animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const platformData = platforms?.map(p => ({
    name: p.platform,
    value: p.count
  })) || [];

  const COLORS = ['#ffa116', '#00b8a3', '#3b5998', '#ff375f', '#8e44ad'];

  // Combine topics and patterns for a comprehensive radar view
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
      fullMark: Math.max(...Object.values(combinedMap))
    }));

  return (
    <div className="p-0 h-full overflow-y-auto custom-scrollbar bg-dark-950 selection:bg-brand-orange/30">
      {/* Cinematic Hero Background - Optimized with lower blur for performance */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-brand-orange/5 blur-[80px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 blur-[80px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-10 space-y-12">
        

        {/* Synthetic Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Current Streak', value: overview?.currentStreak || 0, sub: 'Days Active', icon: Zap, color: 'text-orange-400', glow: 'shadow-orange-500/10' },
            { label: 'Problems Solved', value: overview?.totalProblems || 0, sub: 'Protocol Verified', icon: CheckCircle2, color: 'text-green-400', glow: 'shadow-green-500/10' },
            { label: 'Knowledge Base', value: overview?.patternsMastered || 0, sub: 'Patterns Logged', icon: Award, color: 'text-blue-400', glow: 'shadow-blue-500/10' },
            { label: 'Total Engagement', value: overview?.totalActiveDays || 0, sub: 'Market Units', icon: Activity, color: 'text-purple-400', glow: 'shadow-purple-500/10' }
          ].map((stat, i) => (
            <button key={i} className="group text-left relative overflow-hidden bg-dark-900/20 backdrop-blur-3xl border border-white/[0.05] rounded-[2rem] p-8 hover:bg-dark-900/40 hover:border-white/[0.1] transition-all duration-500 active:scale-[0.98]">
               <div className="flex items-start justify-between mb-8">
                  <div className={`p-4 rounded-2xl bg-dark-950 border border-white/[0.03] ${stat.color} transition-transform group-hover:-rotate-6 group-hover:scale-110 duration-700`}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-dark-800 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
               </div>
               <div>
                  <div className="text-4xl font-black text-white tracking-tighter mb-1.5">{stat.value}</div>
                  <div className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em]">{stat.label}</div>
                  <div className="text-[9px] font-bold text-brand-orange/60 uppercase tracking-widest mt-2">{stat.sub}</div>
               </div>
            </button>
          ))}
        </div>

        {/* Core Execution Clusters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Submission Matrix */}
          <div className="lg:col-span-8 group relative">
             <div className="absolute inset-0 bg-brand-orange/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
             <div className="relative h-full bg-dark-900/40 backdrop-blur-2xl border border-white/[0.05] rounded-[3rem] p-10 overflow-hidden">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-dark-950 rounded-2xl flex items-center justify-center border border-white/[0.03]">
                       <Activity className="w-6 h-6 text-brand-orange" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight uppercase">Activity Stream</h2>
                      <div className="text-[10px] font-black text-dark-500 uppercase tracking-widest mt-1 italic">Temporal distribution of solves</div>
                    </div>
                  </div>
                  <div className="flex p-1.5 bg-dark-950 border border-white/[0.05] rounded-2xl">
                    <button className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-dark-800 shadow-xl transition-all">Yearly</button>
                    <button className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-dark-500 hover:text-white transition-all">Monthly</button>
                  </div>
                </div>

                <div className="w-full flex items-center justify-center py-6">
                   <ActivityHeatmap />
                </div>
                
                <div className="mt-12 grid grid-cols-3 gap-6 pt-10 border-t border-white/[0.03]">
                   {[
                     { 
                       label: 'Neural Max', 
                       value: `${Math.max(...(useAnalyticsStore.getState().heatmap.map(d => d.count)), 0)} Solves`, 
                       icon: Zap 
                     },
                     { 
                       label: 'Cycle Load', 
                       value: `${overview?.totalProblems || 0} Problems`, 
                       icon: Code2 
                     },
                     { 
                       label: 'Uptime', 
                       value: `${overview?.totalActiveDays ? ((overview.totalActiveDays / 365) * 100).toFixed(1) : 0}%`, 
                       icon: TrendingUp 
                     }
                   ].map((metric, i) => (
                     <div key={i} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <metric.icon className="w-3 h-3 text-dark-600" />
                          <span className="text-dark-600 text-[9px] font-black uppercase tracking-[0.2em]">{metric.label}</span>
                        </div>
                        <div className="text-2xl font-black text-white tracking-tighter">{metric.value}</div>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Environmental Distribution */}
          <div className="lg:col-span-4 group h-full">
            <div className="relative h-full bg-dark-900/40 backdrop-blur-2xl border border-white/[0.05] rounded-[3rem] p-10 flex flex-col items-center">
               <div className="w-full flex flex-col items-center text-center mb-8">
                  <div className="w-12 h-12 bg-dark-950 rounded-2xl flex items-center justify-center border border-white/[0.03] mb-6 shadow-xl">
                    <Target className="w-6 h-6 text-brand-orange" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Ecosystem</h2>
                  <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest mt-1">Platform deployment mix</p>
               </div>
               
               <div className="flex-1 w-full relative min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="45%"
                        innerRadius={85}
                        outerRadius={110}
                        paddingAngle={10}
                        dataKey="value"
                        stroke="none"
                        animationBegin={100}
                        animationDuration={800}
                      >
                        {platformData.map((entry, index) => (
                          <Cell 
                           key={`cell-${index}`} 
                           fill={COLORS[index % COLORS.length]} 
                           className="hover:scale-105 transition-transform duration-500 cursor-pointer outline-none"
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-dark-950/90 backdrop-blur-xl border border-white/[0.05] rounded-2xl p-4 shadow-2xl">
                                <div className="text-[10px] font-black text-dark-500 uppercase tracking-widest mb-1">{payload[0].name}</div>
                                <div className="text-xl font-black text-white">{payload[0].value} <span className="text-xs text-dark-600 font-bold uppercase">Problems</span></div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Bio-Legend */}
                  <div className="w-full flex flex-wrap justify-center gap-3 px-4">
                     {platformData.map((p, i) => (
                       <div key={i} className="flex items-center gap-3 px-4 py-2 bg-dark-950 border border-white/[0.03] rounded-2xl">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length], boxShadow: `0 0 10px ${COLORS[i % COLORS.length]}66` }} />
                          <span className="text-[9px] font-black text-white uppercase tracking-widest">{p.name}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Knowledge & Calibration Clusters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
          {/* Neural Proficiency Radar */}
          <div className="lg:col-span-6 bg-dark-900/10 backdrop-blur-xl border border-white/[0.05] rounded-[3.5rem] p-12 hover:border-white/[0.1] transition-all h-[550px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
               <Trophy className="w-64 h-64 text-white" />
            </div>
            
            <div className="relative z-10 mb-12">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Cognitive Map</h2>
              <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                 <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Mastery Spectrum Radar</p>
              </div>
            </div>

            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '900', letterSpacing: '0.1em' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                  <Radar
                    name="Mastery"
                    dataKey="A"
                    stroke="#ffa116"
                    strokeWidth={4}
                    fill="url(#radarGradient)"
                    fillOpacity={0.5}
                    animationDuration={1000}
                  />
                  <defs>
                    <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                       <stop offset="0%" stopColor="#ffa116" stopOpacity={0.9} />
                       <stop offset="100%" stopColor="#ff375f" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Difficulty Phase Breakdown */}
          <div className="lg:col-span-6 bg-dark-900/10 backdrop-blur-xl border border-white/[0.05] rounded-[3.5rem] p-12 hover:border-white/[0.1] transition-all h-[550px] flex flex-col items-center">
            <div className="text-center mb-10 w-full">
               <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Stability Breakdown</h2>
               <div className="inline-block px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                 <p className="text-[9px] font-black text-green-400 uppercase tracking-widest">Problem Classification Tiers</p>
              </div>
            </div>
            
            <div className="relative h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ name: 'Easy', value: difficulty?.Easy || 0 }]}
                    dataKey="value" cx="50%" cy="50%" innerRadius={70} outerRadius={80}
                    cornerRadius={10} paddingAngle={0} fill="#00b8a3" stroke="none"
                    animationDuration={1500}
                  >
                    <Cell fill="#00b8a3" />
                  </Pie>
                  <Pie
                    data={[{ name: 'Medium', value: difficulty?.Medium || 0 }]}
                    dataKey="value" cx="50%" cy="50%" innerRadius={95} outerRadius={105}
                    cornerRadius={10} paddingAngle={0} fill="#ffa116" stroke="none"
                    animationBegin={300} animationDuration={1500}
                  >
                    <Cell fill="#ffa116" />
                  </Pie>
                  <Pie
                    data={[{ name: 'Hard', value: difficulty?.Hard || 0 }]}
                    dataKey="value" cx="50%" cy="50%" innerRadius={120} outerRadius={130}
                    cornerRadius={10} paddingAngle={0} fill="#ff375f" stroke="none"
                    animationBegin={300} animationDuration={1000}
                  >
                    <Cell fill="#ff375f" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <div className="text-6xl font-black text-white tracking-tighter">
                   {(difficulty?.Easy || 0) + (difficulty?.Medium || 0) + (difficulty?.Hard || 0)}
                 </div>
                 <div className="text-[10px] font-black text-dark-500 uppercase tracking-[.4em] mt-2 translate-x-1">Solves</div>
              </div>
            </div>

            <div className="flex justify-center gap-10 mt-12 w-full">
                 {[
                   { label: 'Easy', color: 'bg-[#00b8a3]', glow: 'rgba(0,184,163,0.4)', value: difficulty?.Easy || 0 },
                   { label: 'Medium', color: 'bg-[#ffa116]', glow: 'rgba(255,161,22,0.4)', value: difficulty?.Medium || 0 },
                   { label: 'Hard', color: 'bg-[#ff375f]', glow: 'rgba(255,55,95,0.4)', value: difficulty?.Hard || 0 }
                 ].map((tier, i) => (
                   <div key={i} className="flex flex-col items-center gap-2 group/tier transition-transform hover:scale-110">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${tier.color}`} style={{ boxShadow: `0 0 12px ${tier.glow}` }} />
                        <span className="text-[10px] font-black text-dark-400 group-hover:text-white uppercase tracking-widest transition-colors">{tier.label}</span>
                      </div>
                      <div className="text-xl font-black text-white">{tier.value}</div>
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
