import { useEffect, useState } from 'react';
import { useRevisionStore } from '../stores/revisionStore';
import { useAuthStore } from '../stores/authStore';
import { CheckCircle, X, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import RevisionProblemCard from '../components/features/RevisionProblemCard';
import DashboardHeader from '../components/features/revision/DashboardHeader';
import MotivationalQuote from '../components/ui/MotivationalQuote';

function RevisionDashboardPage() {
  const { user } = useAuthStore();
  const { dueToday, overdue, upcoming, counts, loading, fetchDueToday, fetchRevisions, removeFromQueue } = useRevisionStore();
  
  // Upcoming Modal State
  const [showUpcoming, setShowUpcoming] = useState(false);
  
  // Overdue Modal State
  const [showOverdue, setShowOverdue] = useState(false);
  const [clearingOverdue, setClearingOverdue] = useState(false);

  // Lock scroll when modals are open
  useScrollLock(showUpcoming || showOverdue);

  useEffect(() => {
    fetchDueToday();
    fetchRevisions();
  }, [fetchDueToday, fetchRevisions]);

  const handleClearAllOverdue = async () => {
    if (!window.confirm(`Are you sure you want to remove all ${overdue.length} overdue problems from your revision queue?`)) {
      return;
    }
    
    setClearingOverdue(true);
    try {
      // Remove all overdue items
      for (const revision of overdue) {
        await removeFromQueue(revision.id);
      }
    } catch (error) {
      console.error('Failed to clear overdue items:', error);
      alert('Failed to clear some overdue items');
    } finally {
      setClearingOverdue(false);
      setShowOverdue(false);
    }
  };



  if (loading && counts.dueToday === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar space-y-8 bg-dark-950/20">
      
      <DashboardHeader user={user} counts={counts} />

      <div className="max-w-7xl mx-auto space-y-10">
        
        
        {/* Revision Queue Groups */}
        <div className="space-y-8">
          
          {/* Overdue Section - High Priority */}
          {overdue.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20">
                    <AlertCircle className="w-6 h-6 text-red-500 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                       Alert: {overdue.length} Overdue
                    </h3>
                    <p className="text-dark-500 text-sm font-bold uppercase tracking-widest mt-1">Immediate action required</p>
                  </div>
                </div>
                <button 
                  onClick={handleClearAllOverdue}
                  disabled={clearingOverdue}
                  className="px-4 py-2 bg-dark-900 border border-dark-800 rounded-xl text-[11px] font-black text-dark-400 hover:text-red-400 hover:border-red-500/30 transition-all uppercase tracking-widest active:scale-95"
                >
                  {clearingOverdue ? 'Purging Archive...' : 'Purge All Overdue'}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {overdue.slice(0, 4).map(revision => (
                  <RevisionProblemCard key={revision.id} revision={revision} />
                ))}
              </div>
              
              {overdue.length > 4 && (
                <button 
                  onClick={() => setShowOverdue(true)}
                  className="w-full py-4 bg-dark-900/40 border border-dark-800/60 rounded-2xl text-[11px] font-black text-dark-500 hover:text-white transition-all uppercase tracking-widest hover:bg-dark-900"
                >
                  Decrypt all {overdue.length} overdue records
                </button>
              )}
            </div>
          )}

          {/* Due Today - Core Focus */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-brand-orange/10 rounded-xl border border-brand-orange/20">
                    <RefreshCw className="w-6 h-6 text-brand-orange" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                       Active Revisions ({counts.dueToday})
                    </h3>
                    <p className="text-dark-500 text-sm font-bold uppercase tracking-widest mt-1">Mastery Maintenance protocol</p>
                  </div>
                </div>
            </div>

            {Object.values(dueToday).flat().length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Object.values(dueToday).flat().map(revision => (
                  <RevisionProblemCard key={revision.id} revision={revision} />
                ))}
              </div>
            ) : (
              <div className="group bg-dark-900/40 backdrop-blur-xl border border-dark-800/60 rounded-[2rem] py-16 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-brand-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10 space-y-4">
                  <div className="w-20 h-20 bg-dark-950 border border-dark-800 rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white tracking-tight">System Status: Clear</h4>
                    <p className="text-dark-400 text-sm font-bold uppercase tracking-[0.2em] mt-2">All revisions neutralized for today.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Upcoming - Horizon */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                       Upcoming ({upcoming.length})
                    </h3>
                    <p className="text-dark-500 text-sm font-bold uppercase tracking-widest mt-1">Scheduled debriefings</p>
                  </div>
                </div>
            </div>

            {upcoming.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcoming.slice(0, 6).map(revision => (
                  <RevisionProblemCard key={revision.id} revision={revision} />
                ))}
              </div>
            ) : (
              <div className="p-10 bg-dark-900/20 border border-dark-800/40 rounded-3xl text-center">
                <p className="text-[11px] font-black text-dark-600 uppercase tracking-[0.3em]">No upcoming transmissions detected.</p>
              </div>
            )}

            {upcoming.length > 6 && (
              <button 
                onClick={() => setShowUpcoming(true)}
                className="w-full py-4 bg-dark-900/40 border border-dark-800/60 rounded-2xl text-[11px] font-black text-dark-500 hover:text-white transition-all uppercase tracking-widest hover:bg-dark-900"
              >
                Access all {upcoming.length} upcoming records
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Modal */}
      {showUpcoming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><Calendar className="w-5 h-5" /> All Upcoming Reviews ({upcoming.length})</h3>
              <button onClick={() => setShowUpcoming(false)} className="text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2 overflow-y-auto flex-1 pr-2">
              {upcoming.map(revision => (
                <RevisionProblemCard key={revision.id} revision={revision} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overdue Modal */}
      {showOverdue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-dark-900 border border-red-500/30 rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="text-xl font-bold text-red-400 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> All Overdue Problems ({overdue.length})</h3>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleClearAllOverdue}
                  disabled={clearingOverdue}
                  className="text-sm text-dark-400 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  {clearingOverdue ? 'Clearing...' : 'Clear All'}
                </button>
                <button onClick={() => setShowOverdue(false)} className="text-dark-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 overflow-y-auto flex-1 pr-2">
              {overdue.map(revision => (
                <RevisionProblemCard key={revision.id} revision={revision} />
              ))}
            </div>
          </div>
        </div>
      )}






    </div>
  );
}

export default RevisionDashboardPage;
