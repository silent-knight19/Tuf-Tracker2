import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useProblemStore } from '../../stores/problemStore';

function SolvedProblemsStats({ customProblems, onShowAddModal }) {
  const { problems: storeProblems, setFilters, filters } = useProblemStore();
  const [expandedSection, setExpandedSection] = useState('topics'); // 'topics' or 'patterns'

  const problems = customProblems || storeProblems;

  // Calculate stats
  const stats = useMemo(() => {
    const total = problems.length;
    const easy = problems.filter(p => p.difficulty === 'Easy').length;
    const medium = problems.filter(p => p.difficulty === 'Medium').length;
    const hard = problems.filter(p => p.difficulty === 'Hard').length;

    // Aggregate topics
    const topicsMap = {};
    problems.forEach(p => {
      p.topics?.forEach(t => {
        topicsMap[t] = (topicsMap[t] || 0) + 1;
      });
    });
    const topics = Object.entries(topicsMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Aggregate patterns
    const patternsMap = {};
    problems.forEach(p => {
      p.patterns?.forEach(pat => {
        patternsMap[pat] = (patternsMap[pat] || 0) + 1;
      });
    });
    const patterns = Object.entries(patternsMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return { total, easy, medium, hard, topics, patterns };
  }, [problems]);

  const data = [
    { name: 'Easy', value: stats.easy, color: '#00b8a3' },   // LeetCode Teal
    { name: 'Medium', value: stats.medium, color: '#ffc01e' }, // LeetCode Yellow
    { name: 'Hard', value: stats.hard, color: '#ff375f' },     // LeetCode Red
  ];

  // If no data, show grey ring
  const chartData = stats.total === 0 
    ? [{ name: 'None', value: 1, color: '#3e4143' }] 
    : data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
      {/* Left Column: Core Stats Mastery (7 cols) */}
      <div className="lg:col-span-12 xl:col-span-7">
        <div className="bg-dark-900/40 backdrop-blur-xl border border-dark-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group transition-all duration-500 ease-out">
          {/* Decorative background glow */}
          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-orange blur-[80px] rounded-full pointer-events-none opacity-0 group-hover:opacity-25 transition-opacity duration-500" />
          


          <div className="flex flex-col sm:flex-row items-center gap-10 relative z-10 pt-6">
            {/* Left Side: Chart & Action */}
            <div className="flex flex-col items-center gap-6">
              {/* High Fidelity Ring Chart */}
              <div className="relative w-48 h-48 flex-shrink-0 group/chart transition-transform duration-500 hover:scale-105">
                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={88}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={stats.total > 0 ? 4 : 0}
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          className="transition-all duration-500 hover:opacity-80"
                          style={{
                            filter: `drop-shadow(0 0 8px ${entry.color}44)`
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 17, 17, 0.95)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                      }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center Text with enhanced typography */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-4xl font-black text-white tracking-tighter animate-in fade-in zoom-in duration-700">
                    {stats.total}
                  </div>
                  <div className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em] mt-1">
                    {customProblems ? 'Total' : 'Solved'}
                  </div>
                </div>
              </div>

              {onShowAddModal && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowAddModal();
                  }}
                  className="px-5 py-2.5 bg-brand-orange text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] active:scale-95 flex items-center gap-2 group/btn"
                >
                  <Plus className="w-3.5 h-3.5 group-hover/btn:rotate-90 transition-transform" />
                  Add Problem
                </button>
              )}
            </div>

            {/* Premium Stats Breakdown */}
            <div className="flex-1 w-full space-y-7">
              {[
                { label: 'Easy', count: stats.easy, color: 'bg-[#00b8a3]', textColor: 'text-[#00b8a3]', glow: 'shadow-[#00b8a3]/20', key: 'Easy' },
                { label: 'Medium', count: stats.medium, color: 'bg-[#ffc01e]', textColor: 'text-[#ffc01e]', glow: 'shadow-[#ffc01e]/20', key: 'Medium' },
                { label: 'Hard', count: stats.hard, color: 'bg-[#ff375f]', textColor: 'text-[#ff375f]', glow: 'shadow-[#ff375f]/20', key: 'Hard' }
              ].map((diff) => (
                <div 
                  key={diff.label}
                  className="group/item cursor-pointer" 
                  onClick={() => setFilters({ difficulty: diff.key })}
                >
                  <div className="flex items-end justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${diff.color} group-hover/item:scale-150 transition-transform`} />
                      <span className="text-xs font-black text-dark-300 uppercase tracking-widest group-hover/item:text-white transition-colors">{diff.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-white">{diff.count}</span>
                      <span className="text-[10px] font-bold text-dark-600 uppercase">/ {stats.total}</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-dark-950 rounded-full overflow-hidden border border-dark-800 p-0.5">
                    <div 
                      className={`h-full ${diff.color} rounded-full transition-all duration-1000 ease-out shadow-lg ${diff.glow}`} 
                      style={{ 
                        width: `${stats.total ? (diff.count / stats.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Exploration (5 cols) */}
      <div className="lg:col-span-12 xl:col-span-5">
        <div className="bg-dark-900/40 backdrop-blur-xl border border-dark-800 rounded-[2rem] p-8 h-full flex flex-col shadow-2xl relative overflow-hidden group transition-all duration-500 ease-out">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500 blur-[80px] rounded-full pointer-events-none opacity-0 group-hover:opacity-25 transition-opacity duration-500" />
          
          <div className="flex items-center gap-6 border-b border-dark-800 pb-5 mb-6 relative z-10">
            <button 
              className={`text-xs font-black uppercase tracking-[0.2em] transition-all relative py-2 ${
                expandedSection === 'topics' ? 'text-white' : 'text-dark-500 hover:text-dark-300'
              }`}
              onClick={() => setExpandedSection('topics')}
            >
              Mastered Topics
              {expandedSection === 'topics' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-brand-orange to-orange-400 rounded-full animate-in slide-in-from-left duration-300" />
              )}
            </button>
            <button 
              className={`text-xs font-black uppercase tracking-[0.2em] transition-all relative py-2 ${
                expandedSection === 'patterns' ? 'text-white' : 'text-dark-500 hover:text-dark-300'
              }`}
              onClick={() => setExpandedSection('patterns')}
            >
              Recurring Patterns
              {expandedSection === 'patterns' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full animate-in slide-in-from-left duration-300" />
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar relative z-10 p-2 -m-2">
            <div className="flex flex-wrap gap-2.5 p-1">
              {expandedSection === 'topics' ? (
                stats.topics.length > 0 ? (
                  stats.topics.map(t => {
                    const isActive = filters.topic === t.name;
                    return (
                      <button
                        key={t.name}
                        onClick={() => setFilters({ topic: t.name })}
                        className={`group/tag px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border flex items-center gap-3 active:scale-95 hover:scale-110 hover:z-20 ${
                          isActive 
                            ? 'bg-brand-orange border-brand-orange text-white shadow-[0_0_20px_rgba(249,115,22,0.2)]' 
                            : 'bg-dark-950 border-dark-800 text-dark-500 hover:border-brand-orange/50 hover:bg-dark-800 hover:shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                        }`}
                      >
                        {t.name}
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] ${
                          isActive ? 'bg-white/20 text-white' : 'bg-dark-800 text-dark-400 group-hover/tag:bg-dark-700'
                        }`}>
                          {t.count}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full w-full py-8 text-dark-600">
                    <div className="text-sm font-black uppercase tracking-widest italic opacity-50">Empty Archive</div>
                  </div>
                )
              ) : (
                stats.patterns.length > 0 ? (
                  stats.patterns.map(p => {
                    const isActive = filters.pattern === p.name;
                    return (
                      <button
                        key={p.name}
                        onClick={() => setFilters({ pattern: p.name })}
                        className={`group/tag px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border flex items-center gap-3 active:scale-95 hover:scale-110 hover:z-20 ${
                          isActive 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]' 
                            : 'bg-dark-950 border-dark-800 text-dark-500 hover:border-blue-500/50 hover:bg-dark-800 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                        }`}
                      >
                        {p.name}
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] ${
                          isActive ? 'bg-white/20 text-white' : 'bg-dark-800 text-dark-400 group-hover/tag:bg-dark-700'
                        }`}>
                          {p.count}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full w-full py-8 text-dark-600">
                    <div className="text-sm font-black uppercase tracking-widest italic opacity-50">No Patterns Logged</div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SolvedProblemsStats;
