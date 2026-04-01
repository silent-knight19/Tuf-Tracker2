import { useState } from 'react';
import { Layers, ArrowRight, BookOpen, CheckCircle2, Clock, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const sheets = [
  {
    id: 'strivers',
    name: 'Strivers A2Z Sheet',
    path: '/sheets/strivers',
    color: 'from-[#312922] to-[#4a3d34]',
    bgGlow: 'bg-[#312922]/20',
    iconColor: 'text-[#5a4d44]',
    stats: [
      { label: 'Problems', value: '450+', icon: BookOpen },
      { label: 'Topics', value: '27', icon: Target },
      { label: 'Est. Time', value: '4-6 months', icon: Clock },
    ],
    description: 'Comprehensive DSA sheet covering all topics from basics to advanced. Structured in A2Z manner with step-by-step progression.',
    features: ['Arrays & Strings', 'Linked List', 'Binary Trees', 'DP', 'Graphs', 'Advanced'],
  },
  {
    id: 'neetcode',
    name: 'NeetCode 150',
    path: '/sheets/neetcode',
    color: 'from-[#7d72c7] to-[#9b8fd4]',
    bgGlow: 'bg-[#7d72c7]/20',
    iconColor: 'text-[#a396d6]',
    stats: [
      { label: 'Problems', value: '150', icon: BookOpen },
      { label: 'Topics', value: '15', icon: Target },
      { label: 'Est. Time', value: '2-3 months', icon: Clock },
    ],
    description: 'Curated list of 150 essential LeetCode problems. The gold standard for interview preparation at top tech companies.',
    features: ['Blind 75', 'Sequel 75', 'Company Tags', 'Pattern Based', 'Interview Focused'],
  },
  {
    id: 'dsa-patterns',
    name: 'Padho With Pratyush Pattern Sheet',
    path: '/sheets/dsa-patterns',
    color: 'from-emerald-500 to-teal-500',
    bgGlow: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    stats: [
      { label: 'Problems', value: '148', icon: BookOpen },
      { label: 'Patterns', value: '13', icon: Target },
      { label: 'Est. Time', value: '6-8 weeks', icon: Clock },
    ],
    description: 'Master 13 essential DSA patterns with hand-picked problems. Perfect for learning problem-solving patterns and techniques.',
    features: ['Two Pointers', 'Sliding Window', 'Binary Search', 'Tree Patterns', 'Heap', 'Stack'],
  },
];

function SheetsPage() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-brand-yellow flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">DSA Sheets</h1>
        </div>
        <p className="text-dark-400 text-lg max-w-2xl">
          Choose your path. Master Data Structures & Algorithms with curated problem sets trusted by thousands of developers.
        </p>
      </div>

      {/* Sheet Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sheets.map((sheet) => (
          <div
            key={sheet.id}
            onClick={() => navigate(sheet.path)}
            onMouseEnter={() => setHoveredCard(sheet.id)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`group relative overflow-hidden rounded-2xl border border-dark-800 bg-dark-900/50 backdrop-blur-sm cursor-pointer transition-all duration-500 ${
              hoveredCard === sheet.id ? 'scale-[1.02] shadow-2xl' : ''
            }`}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${sheet.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
            
            {/* Glow Effect */}
            <div className={`absolute -top-32 -right-32 w-64 h-64 ${sheet.bgGlow} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

            <div className="relative p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className={`text-2xl font-black text-white mb-2 group-hover:${sheet.iconColor} transition-colors`}>
                    {sheet.name}
                  </h2>
                  <p className="text-dark-400 text-sm leading-relaxed max-w-md">
                    {sheet.description}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sheet.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 overflow-hidden`}>
                  {sheet.id === 'neetcode' ? (
                    <img src="/neetcode-io-logo.png" alt="NeetCode" className="w-8 h-8 object-contain" />
                  ) : sheet.id === 'strivers' ? (
                    <img src="/striver.png" alt="Strivers" className="w-8 h-8 object-contain" />
                  ) : sheet.id === 'dsa-patterns' ? (
                    <img src="/padho with pratyush.jpeg" alt="Padho With Pratyush" className="w-16 h-16 object-contain" />
                  ) : (
                    <Layers className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mb-6">
                {sheet.stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <stat.icon className={`w-4 h-4 ${sheet.iconColor}`} />
                    <span className="text-white font-bold">{stat.value}</span>
                    <span className="text-dark-500 text-xs uppercase tracking-wider">{stat.label}</span>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-6">
                {sheet.features.map((feature) => (
                  <span
                    key={feature}
                    className={`px-3 py-1 rounded-full text-xs font-bold border border-dark-700 bg-dark-950/50 text-dark-300`}
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Action */}
              <div className="flex items-center gap-2 text-sm font-bold">
                <span className={`${sheet.iconColor} group-hover:translate-x-1 transition-transform duration-300`}>
                  Start Learning
                </span>
                <ArrowRight className={`w-4 h-4 ${sheet.iconColor} group-hover:translate-x-2 transition-transform duration-300`} />
              </div>
            </div>

            {/* Bottom Border Animation */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${sheet.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
          </div>
        ))}
      </div>

      {/* Tip Section */}
      <div className="mt-10 p-6 rounded-xl border border-dark-800 bg-dark-900/30">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-brand-orange/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-brand-orange" />
          </div>
          <div>
            <h3 className="text-white font-bold mb-1">Pro Tip</h3>
            <p className="text-dark-400 text-sm">
              Start with <span className="text-pink-400 font-bold">Strivers A2Z Sheet</span> if you're building fundamentals from scratch. 
              Go with <span className="text-cyan-400 font-bold">NeetCode 150</span> if you want focused interview prep. 
              Many top performers complete both!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SheetsPage;
