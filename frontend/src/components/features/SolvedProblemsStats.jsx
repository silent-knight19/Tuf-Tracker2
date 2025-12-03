import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useProblemStore } from '../../stores/problemStore';

function SolvedProblemsStats({ customProblems }) {
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Left: Progress Ring & Stats */}
      <div className="card flex flex-col sm:flex-row items-center gap-8">
        {/* Ring Chart */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={75}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#282828', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-dark-400">{customProblems ? 'Total' : 'Solved'}</div>
          </div>
        </div>

        {/* Stats Breakdown */}
        <div className="flex-1 w-full space-y-4">
          {/* Easy */}
          <div className="group cursor-pointer" onClick={() => setFilters({ difficulty: 'Easy' })}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-dark-300 group-hover:text-white transition-colors">Easy</span>
              <span className="font-medium text-white">
                {stats.easy}
                <span className="text-dark-500 ml-1">/ {stats.total}</span>
              </span>
            </div>
            <div className="w-full bg-dark-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-difficulty-easy rounded-full" 
                style={{ width: `${stats.total ? (stats.easy / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Medium */}
          <div className="group cursor-pointer" onClick={() => setFilters({ difficulty: 'Medium' })}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-dark-300 group-hover:text-white transition-colors">Medium</span>
              <span className="font-medium text-white">
                {stats.medium}
                <span className="text-dark-500 ml-1">/ {stats.total}</span>
              </span>
            </div>
            <div className="w-full bg-dark-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-difficulty-medium rounded-full" 
                style={{ width: `${stats.total ? (stats.medium / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Hard */}
          <div className="group cursor-pointer" onClick={() => setFilters({ difficulty: 'Hard' })}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-dark-300 group-hover:text-white transition-colors">Hard</span>
              <span className="font-medium text-white">
                {stats.hard}
                <span className="text-dark-500 ml-1">/ {stats.total}</span>
              </span>
            </div>
            <div className="w-full bg-dark-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-difficulty-hard rounded-full" 
                style={{ width: `${stats.total ? (stats.hard / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right: Topics & Patterns */}
      <div className="card flex flex-col">
        <div className="flex items-center gap-4 border-b border-dark-700 pb-3 mb-3">
          <button 
            className={`text-sm font-medium pb-1 transition-colors ${
              expandedSection === 'topics' ? 'text-white border-b-2 border-white' : 'text-dark-400 hover:text-dark-200'
            }`}
            onClick={() => setExpandedSection('topics')}
          >
            Topics
          </button>
          <button 
            className={`text-sm font-medium pb-1 transition-colors ${
              expandedSection === 'patterns' ? 'text-white border-b-2 border-white' : 'text-dark-400 hover:text-dark-200'
            }`}
            onClick={() => setExpandedSection('patterns')}
          >
            Patterns
          </button>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[180px] pr-2 custom-scrollbar">
          <div className="flex flex-wrap gap-2">
            {expandedSection === 'topics' ? (
              stats.topics.length > 0 ? (
                stats.topics.map(t => {
                  const isActive = filters.topic === t.name;
                  return (
                    <button
                      key={t.name}
                      onClick={() => setFilters({ topic: t.name })}
                      className={`badge cursor-pointer transition-all flex items-center gap-2 ${
                        isActive 
                          ? 'bg-brand-orange text-white border-brand-orange shadow-md shadow-brand-orange/30' 
                          : 'bg-dark-800 hover:bg-dark-700 text-dark-300 border-dark-700'
                      }`}
                    >
                      {t.name}
                      <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                        isActive ? 'bg-white/20 text-white' : 'bg-dark-900 text-dark-400'
                      }`}>
                        {t.count}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="text-dark-500 text-sm italic">No topics yet</div>
              )
            ) : (
              stats.patterns.length > 0 ? (
                stats.patterns.map(p => {
                  const isActive = filters.pattern === p.name;
                  return (
                    <button
                      key={p.name}
                      onClick={() => setFilters({ pattern: p.name })}
                      className={`badge cursor-pointer transition-all flex items-center gap-2 ${
                        isActive 
                          ? 'bg-brand-orange text-white border-brand-orange shadow-md shadow-brand-orange/30' 
                          : 'bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange border-brand-orange/20'
                      }`}
                    >
                      {p.name}
                      <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                        isActive ? 'bg-white/20 text-white' : 'bg-brand-orange/20'
                      }`}>
                        {p.count}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="text-dark-500 text-sm italic">No patterns yet</div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SolvedProblemsStats;
