import { Play, Wand2, Target, Activity, Clock } from 'lucide-react';

function RevisionSidebar({ revision, onStartReview, onGuidedReview }) {
  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="card bg-dark-900 border-dark-800 p-6 space-y-4">
        <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">Actions</h3>
        <button 
          onClick={onStartReview}
          className="w-full py-4 rounded-lg bg-brand-orange text-white font-bold hover:bg-brand-orange/90 transition-all shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2 group"
        >
          <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" /> 
          Start Quick Review
        </button>
        <button 
          onClick={onGuidedReview}
          className="w-full py-4 rounded-lg bg-dark-800 text-white font-medium hover:bg-dark-700 transition-colors border border-dark-700 flex items-center justify-center gap-2"
        >
          <Wand2 className="w-5 h-5 text-purple-400" /> 
          Guided Review
        </button>
      </div>

      {/* Pattern Card */}
      <div className="card bg-dark-900 border-dark-800 p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Target className="w-32 h-32 text-brand-orange" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded bg-brand-orange/20 flex items-center justify-center text-brand-orange">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-lg">Pattern Strategy</h3>
          </div>
          
          <div className="text-xl font-medium text-white mb-2">{revision.pattern || 'No Pattern'}</div>
          <div className="text-sm text-dark-400">Core problem solving pattern</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card bg-dark-900 border-dark-800 p-6 flex flex-col items-center justify-center text-center">
          <Activity className="w-6 h-6 text-green-400 mb-3" />
          <div className="text-3xl font-bold text-white mb-1">{revision.healthScore || 0}<span className="text-base text-dark-500">/5</span></div>
          <div className="text-sm text-dark-400">Health Score</div>
        </div>
        
        <div className="card bg-dark-900 border-dark-800 p-6 flex flex-col items-center justify-center text-center">
          <Clock className="w-6 h-6 text-blue-400 mb-3" />
          <div className="text-3xl font-bold text-white mb-1">{revision.totalReviews || 0}</div>
          <div className="text-sm text-dark-400">Total Reviews</div>
        </div>
      </div>
    </div>
  );
}

export default RevisionSidebar;
