import { ExternalLink, Code2, Sparkles, X, CheckCircle2, Circle, BookOpen, Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function SheetProblemModal({ problem, onClose, isSolved, onToggleSolved }) {
  const navigate = useNavigate();

  const handleSolveWithAI = () => {
    navigate(`/solve/${problem.id}`, {
      state: {
        problem: {
          id: problem.id,
          title: problem.title,
          difficulty: problem.difficulty,
          category: problem.category,
          leetCodeUrl: problem.leetCodeUrl,
          gfgUrl: problem.gfgUrl,
          source: problem.source || 'sheet',
          // Note: description is intentionally NOT set here
          // so that SolveUserProblemPage will call fetchDescription
          // to generate a full description object with examples, constraints, etc.
        }
      }
    });
    onClose();
  };

  const handleOpenLink = () => {
    const url = problem.leetCodeUrl || problem.gfgUrl;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-dark-400 bg-dark-400/10 border-dark-400/20';
    }
  };

  const getDifficultyGradient = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'from-green-500/20 to-emerald-500/20';
      case 'Medium': return 'from-yellow-500/20 to-orange-500/20';
      case 'Hard': return 'from-red-500/20 to-rose-500/20';
      default: return 'from-dark-500/20 to-dark-600/20';
    }
  };

  const hasExternalLink = problem.leetCodeUrl || problem.gfgUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-dark-950/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal - Larger, more modern design */}
      <div className="relative w-full max-w-2xl bg-dark-900 border border-dark-700 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Top Gradient Bar */}
        <div className={`h-2 w-full bg-gradient-to-r ${getDifficultyGradient(problem.difficulty)}`} />
        
        {/* Header Section */}
        <div className="relative px-8 pt-8 pb-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 text-dark-500 hover:text-white hover:bg-dark-800/80 rounded-xl transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-start gap-5 pr-12">
            {/* Status Icon */}
            <div 
              onClick={onToggleSolved}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 ${getDifficultyColor(problem.difficulty)}`}
            >
              {isSolved ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <Circle className="w-8 h-8" />
              )}
            </div>
            
            {/* Title & Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
                {problem.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-1.5 text-sm font-bold rounded-lg border ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
                <span className="flex items-center gap-1.5 text-dark-400 text-sm">
                  <Target className="w-4 h-4" />
                  {problem.category}
                </span>
                {problem.isBlind && (
                  <span className="px-2.5 py-1 text-xs font-bold bg-brand-orange/20 text-brand-orange rounded-lg border border-brand-orange/30">
                    BLIND 75
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Problem Stats */}
        <div className="px-8 py-4 bg-dark-950/50 border-y border-dark-800">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-dark-500" />
              <span className="text-dark-400 text-sm">Problem <span className="text-white font-mono font-bold">#{problem.id}</span></span>
            </div>
            {problem.subcategory && (
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-dark-500" />
                <span className="text-dark-400 text-sm">{problem.subcategory}</span>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          <p className="text-dark-400 text-base leading-relaxed mb-8">
            Choose how you want to approach this problem. Open the external link to view the full problem statement, or use our AI-powered editor to solve it here.
          </p>

          {/* Action Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Open External Link */}
            {hasExternalLink ? (
              <button
                onClick={handleOpenLink}
                className="group relative p-6 bg-dark-950 border border-dark-700 rounded-2xl hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-300 text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                    <ExternalLink className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white text-lg mb-1">Open Problem Link</div>
                    <div className="text-sm text-dark-500">
                      View on {problem.leetCodeUrl ? 'LeetCode' : 'GeeksforGeeks'}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-dark-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ) : (
              <div className="p-6 bg-dark-950/50 border border-dark-800 rounded-2xl opacity-50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-dark-600" />
                  </div>
                  <div>
                    <div className="font-bold text-dark-500 text-lg mb-1">No External Link</div>
                    <div className="text-sm text-dark-600">Solve with AI below</div>
                  </div>
                </div>
              </div>
            )}

            {/* Solve with AI */}
            <button
              onClick={handleSolveWithAI}
              className="group relative p-6 bg-gradient-to-br from-brand-orange/10 to-brand-yellow/5 border border-brand-orange/30 rounded-2xl hover:border-brand-orange/60 hover:shadow-[0_0_40px_rgba(249,115,22,0.2)] transition-all duration-300 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-orange/20 flex items-center justify-center group-hover:bg-brand-orange/30 transition-colors">
                  <Sparkles className="w-6 h-6 text-brand-orange" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white text-lg mb-1">Solve with AI</div>
                  <div className="text-sm text-dark-400">
                    Use our AI-powered editor
                  </div>
                </div>
                <Code2 className="w-5 h-5 text-brand-orange group-hover:scale-110 transition-transform" />
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-dark-950/80 border-t border-dark-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-dark-500">
              ID: <span className="text-dark-300 font-mono">{problem.id}</span>
            </span>
            {isSolved && (
              <span className="flex items-center gap-1.5 text-sm text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                Solved
              </span>
            )}
          </div>
          
          {hasExternalLink && (
            <a 
              href={problem.leetCodeUrl || problem.gfgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View Original Problem
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default SheetProblemModal;
