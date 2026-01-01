import { Play, Wand2, Target, Activity, Clock, Terminal } from 'lucide-react';

function RevisionSidebar({ revision, onStartReview, onGuidedReview }) {
  const handleSolveWithAI = () => {
    // Open the code editor experience using the problemId
    if (revision.problemId) {
      window.open(`/solve/${revision.problemId}`, '_blank');
    }
  };

  return (
    <div className="space-y-10">
      {/* Action Protocol Container */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange/20 to-purple-500/20 rounded-3xl blur opacity-25 group-hover:opacity-100 transition duration-1000" />
        <div className="relative bg-dark-900 border border-dark-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-dark-800 pb-4">
             <div className="text-[11px] font-black text-dark-500 uppercase tracking-[0.2em]">Execution Protocol</div>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={onStartReview}
              className="group relative w-full overflow-hidden rounded-xl p-px transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-orange to-orange-400" />
              <div className="relative flex items-center justify-center gap-3 bg-dark-900 rounded-[11px] px-8 py-4 transition-all group-hover:bg-transparent">
                <Play className="w-5 h-5 text-brand-orange group-hover:text-white fill-current transition-colors" />
                <span className="text-white font-black text-sm uppercase tracking-widest leading-none">Quick Review</span>
              </div>
            </button>

            <button 
              onClick={onGuidedReview}
              className="w-full py-4 rounded-xl bg-dark-950 border border-dark-800 text-dark-400 hover:text-purple-400 hover:border-purple-500/30 transition-all flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest leading-none"
            >
              <Wand2 className="w-5 h-5 text-purple-400 group-hover:animate-pulse" /> 
              Guided Debrief
            </button>

            {/* Solve with AI Button */}
            <button 
              onClick={handleSolveWithAI}
              className="w-full py-4 rounded-xl bg-dark-950 border border-dark-800 text-dark-400 hover:text-brand-orange hover:border-brand-orange/30 transition-all flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest leading-none group/solve"
            >
              <Terminal className="w-5 h-5 text-brand-orange group-hover/solve:animate-pulse" /> 
              Solve with AI
            </button>
          </div>
        </div>
      </div>

      {/* Strategy Blueprint Card */}
      <div className="relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Target className="w-32 h-32 text-white" />
        </div>
        
        <div className="bg-dark-900/40 backdrop-blur-xl border border-dark-800 rounded-3xl p-6 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange border border-brand-orange/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-white text-xs uppercase tracking-widest mb-0.5">Pattern Strategy</h3>
              <div className="text-[10px] font-bold text-dark-500 uppercase tracking-wider">Algorithmic Base</div>
            </div>
          </div>
          
          <div className="text-2xl font-black text-white tracking-tight uppercase mb-2">
            {revision.pattern || 'Unknown Core'}
          </div>
          <div className="text-xs font-medium text-dark-400 italic">Advanced problem solving pattern detected</div>
        </div>
      </div>

      {/* Critical Metrics Hub */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Activity, value: revision.healthScore || 0, total: '/5', label: 'Health Score', color: 'text-green-400', bg: 'bg-green-400/10' },
          { icon: Clock, value: revision.totalReviews || 0, label: 'Sessions', color: 'text-blue-400', bg: 'bg-blue-400/10' }
        ].map((stat, i) => (
          <div key={i} className="bg-dark-900/40 backdrop-blur-md border border-dark-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center group/stat">
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} mb-4 transition-transform group-hover/stat:rotate-12`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-3xl font-black text-white tracking-tighter mb-1">
              {stat.value}{stat.total && <span className="text-base text-dark-500 font-bold">{stat.total}</span>}
            </div>
            <div className="text-[10px] font-black text-dark-500 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RevisionSidebar;
