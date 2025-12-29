import React, { useEffect } from 'react';
import { Code, BookOpen, Clock, Activity } from 'lucide-react';
import SolveProblemsSection from '../../components/features/revision/SolveProblemsSection';
import { useRevisionStore } from '../../stores/revisionStore';
import MotivationalQuote from '../../components/ui/MotivationalQuote';

function SolveProblemsPage() {
  const { revisions, fetchRevisions, loading } = useRevisionStore();

  useEffect(() => {
    fetchRevisions();
  }, [fetchRevisions]);

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] overflow-hidden flex flex-col">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-6 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-brand-orange/10 rounded-xl border border-brand-orange/20">
              <Code className="w-8 h-8 text-brand-orange" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Problem Bank</h1>
          </div>
          <p className="text-dark-400 text-lg">
            Manage and practice your personal collection of solved challenges.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8 text-right">
          <div className="flex items-center gap-4 text-right">
           <div className="px-6 py-3 bg-dark-900 border border-dark-800 rounded-2xl flex items-center gap-4 shadow-xl">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Collection</span>
                <span className="text-xl font-black text-white">{revisions.length}</span>
              </div>
              <div className="w-px h-8 bg-dark-800" />
              <div className="flex items-center gap-3">
                 <Activity className="w-5 h-5 text-brand-orange" />
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Active</span>
                    <span className="text-xl font-black text-white">
                       {revisions.filter(r => r.nextReviewDate && new Date(r.nextReviewDate) <= new Date()).length}
                    </span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="flex-1 overflow-hidden">
        {loading && revisions.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
          </div>
        ) : (
          <SolveProblemsSection />
        )}
      </div>
    </div>
  );
}

export default SolveProblemsPage;
