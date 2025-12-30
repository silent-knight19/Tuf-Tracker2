import { ChevronLeft, ExternalLink, Sprout, CheckCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAutoHideHeader } from '../../../hooks/useAutoHideHeader';

function RevisionHeader({ revision }) {
  const navigate = useNavigate();
  const headerVisible = useAutoHideHeader();

  const StatusIcon = {
    fresh: Sprout,
    mastered: CheckCircle,
    needs_revision: RefreshCw
  }[revision.bucket] || Sprout;

  const statusLabel = {
    fresh: 'Fresh',
    mastered: 'Mastered',
    needs_revision: 'In Progress'
  }[revision.bucket] || 'Fresh';

  return (
    <div className={`sticky top-0 z-30 bg-dark-950/40 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex items-center justify-between transition-all duration-500 ease-in-out ${
      headerVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className="flex items-center gap-6">
        <button 
          onClick={() => navigate('/revision')}
          className="group flex items-center gap-2 p-2 rounded-xl bg-dark-900 border border-dark-800 hover:border-brand-orange/40 hover:bg-brand-orange/5 text-dark-400 hover:text-brand-orange transition-all active:scale-95"
          title="Back to Revision"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
             <div className="w-2 h-8 bg-brand-orange rounded-full" />
             <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-dark-100 tracking-tight uppercase leading-none">
                    {revision.problemTitle}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                      revision.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      revision.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {revision.difficulty}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
                      <StatusIcon className="w-3 h-3" />
                      {statusLabel}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-dark-500 uppercase tracking-[0.2em] mt-1.5">
                  Collection / <span className="text-dark-300">Revision Protocol</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
           <div className="text-[10px] font-black text-dark-500 uppercase tracking-widest leading-none mb-1">Last Sync</div>
           <div className="text-xs font-bold text-dark-100 uppercase tracking-tighter">
             {new Date(revision.updatedAt).toLocaleDateString()}
           </div>
        </div>
      </div>
    </div>
  );
}

export default RevisionHeader;
