import React, { useEffect, useMemo } from 'react';
import { Code, Activity, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SolveProblemsSection from '../../components/features/revision/SolveProblemsSection';
import { useRevisionStore } from '../../stores/revisionStore';

function SolveProblemsPage() {
  const { revisions, fetchRevisions, loading } = useRevisionStore();

  useEffect(() => {
    fetchRevisions();
  }, [fetchRevisions]);

  const validRevisions = useMemo(() => {
    const seenIds = new Set();
    const seenTitles = new Set();
    
    return revisions.filter(r => {
      const title = r.problemTitle?.trim();
      if (!title || title.toLowerCase() === 'untitled problem') {
        return false; 
      }
      
      if (r.problemId) {
        if (seenIds.has(r.problemId)) return false;
        seenIds.add(r.problemId);
        return true;
      }
      
      const key = `${title.toLowerCase()}-${r.platform || 'LeetCode'}`;
      if (seenTitles.has(key)) return false;
      seenTitles.add(key);
      return true;
    });
  }, [revisions]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-dark-950 overflow-hidden flex flex-col">
      {/* Cinematic Background Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-orange/5 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-yellow/5 blur-[100px] rounded-full translate-y-1/2 pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 p-6 max-w-7xl mx-auto w-full flex-1 flex flex-col"
      >
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row items-end justify-between mb-8 gap-8 shrink-0">
          <motion.div variants={itemVariants} className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 px-2.5 py-0.5 bg-brand-orange/10 border border-brand-orange/20 rounded-full w-fit">
              <Zap className="w-3 h-3 text-brand-orange" />
              <span className="text-[9px] font-black text-brand-orange uppercase tracking-[0.2em]">Personal Vault</span>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-3">
                Problem <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-yellow">Bank</span>
              </h1>
              <p className="text-lg font-medium text-dark-400 max-w-lg leading-relaxed">
                Your curated repository of technical challenges, organized by pattern for maximum mastery.
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex gap-3 items-stretch h-fit">
            <div className="px-6 py-4 bg-dark-900/40 backdrop-blur-3xl border border-dark-800/50 rounded-2xl flex flex-col justify-center min-w-[130px] shadow-2xl relative overflow-hidden group hover:border-brand-orange/30 transition-all duration-500">
              <div className="absolute top-0 right-0 w-16 h-16 bg-brand-orange/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-brand-orange/10 transition-colors" />
              <span className="text-[11px] font-black text-dark-500 uppercase tracking-[0.2em] mb-1">Vault Size</span>
              <span className="text-3xl font-black text-white">{validRevisions.length}</span>
            </div>

            <div className="px-6 py-4 bg-dark-900/40 backdrop-blur-3xl border border-dark-800/50 rounded-2xl flex items-center gap-5 min-w-[200px] shadow-2xl relative overflow-hidden group hover:border-brand-orange/30 transition-all duration-500">
              <div className="absolute top-0 right-0 w-20 h-20 bg-brand-yellow/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-brand-yellow/10 transition-colors" />
              <div className="p-2.5 bg-brand-orange/10 rounded-xl border border-brand-orange/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Activity className="w-5 h-5 text-brand-orange drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-dark-500 uppercase tracking-[0.2em] mb-1 leading-none">Due for Revision</span>
                <span className="text-3xl font-black text-white leading-none">
                  {validRevisions.filter(r => r.nextDueDate && new Date(r.nextDueDate) <= new Date()).length}
                </span>
              </div>
            </div>
          </motion.div>
        </header>

        {/* Main Content Area */}
        <motion.div variants={itemVariants} className="flex-1 min-h-0 bg-dark-900/20 rounded-3xl border border-dark-800/30 backdrop-blur-sm overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {loading && revisions.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center flex-1"
              >
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-brand-orange/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 overflow-hidden">
                <SolveProblemsSection />
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SolveProblemsPage;
