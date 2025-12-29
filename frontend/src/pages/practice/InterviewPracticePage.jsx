import React, { useState } from 'react';
import { Briefcase, Zap, Play, CheckCircle2, Timer, Settings, ShieldAlert, Cpu, Sparkles, Trophy } from 'lucide-react';
import { useProblemStore } from '../../stores/problemStore';
import api from '../../utils/api';
import { auth } from '../../config/firebase';

function InterviewPracticePage() {
  const { problems } = useProblemStore();
  
  const [mode, setMode] = useState('random'); // 'random', 'solved-review'
  const [difficulty, setDifficulty] = useState('Medium');
  const [practiceLoading, setPracticeLoading] = useState(false);

  const solvedProblems = problems.filter(p => p.status === 'Solved');

  const handleStartPractice = async () => {
    setPracticeLoading(true);
    try {
      if (mode === 'random') {
        const localId = Date.now().toString();
        const newTab = window.open(`/interview/ai?localId=${localId}`, '_blank');

        try {
          const token = await auth.currentUser.getIdToken();
          const aiResponse = await api.post('/ai/custom-problem', {
            difficulty: difficulty
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          localStorage.setItem(`ai_problem_${localId}`, JSON.stringify(aiResponse.data));
        } catch (error) {
          console.error('Failed to generate interview problem:', error);
          if (newTab) newTab.close();
          alert('Failed to generate problem. Please try again.');
        }
      } else if (mode === 'solved-review') {
        if (solvedProblems.length > 0) {
          const randomSolved = solvedProblems[Math.floor(Math.random() * solvedProblems.length)];
          window.open(`/problem/${randomSolved.id}`, '_blank');
        } else {
          alert("No solved problems to review!");
        }
      }
    } catch (error) {
      console.error('Failed to start interview practice:', error);
      alert('Failed to start session. Please try again.');
    } finally {
      setPracticeLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <Briefcase className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Mock Interview</h1>
          </div>
          <p className="text-dark-400 text-lg max-w-xl">
            Simulate the pressure of a high-stakes technical interview. AI-curated problems with real-time feedback.
          </p>
        </div>
        
        <div className="flex items-center gap-8 px-8 py-4 bg-dark-900/50 border border-dark-800 rounded-2xl backdrop-blur-sm shadow-xl">
          <div className="text-center">
            <div className="text-xs font-bold text-dark-500 uppercase tracking-widest mb-1">Solved</div>
            <div className="text-xl font-black text-white">{solvedProblems.length}</div>
          </div>
          <div className="w-px h-10 bg-dark-800" />
          <div className="text-center" title="Skill Score: Average difficulty rating of your solved problems (Easy=30, Med=60, Hard=100)">
            <div className="text-xs font-bold text-dark-500 uppercase tracking-widest mb-1">Average S-Score</div>
            <div className={`text-xl font-black ${
              (() => {
                if (solvedProblems.length === 0) return 'text-dark-600';
                const score = Math.round(solvedProblems.reduce((acc, p) => {
                  if (p.difficulty === 'Easy') return acc + 30;
                  if (p.difficulty === 'Medium') return acc + 60;
                  if (p.difficulty === 'Hard') return acc + 100;
                  return acc;
                }, 0) / solvedProblems.length);
                if (score >= 80) return 'text-purple-400';
                if (score >= 50) return 'text-blue-400';
                return 'text-green-400';
              })()
            }`}>
              {solvedProblems.length === 0 ? 'N/A' : `${Math.round(solvedProblems.reduce((acc, p) => {
                if (p.difficulty === 'Easy') return acc + 30;
                if (p.difficulty === 'Medium') return acc + 60;
                if (p.difficulty === 'Hard') return acc + 100;
                return acc;
              }, 0) / solvedProblems.length)}%`}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Mode Selection */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Random Interview Mode */}
            <div 
              className={`group relative bg-dark-900 border-2 rounded-2xl p-8 cursor-pointer transition-all duration-300 ${
                mode === 'random' ? 'border-purple-500 bg-purple-500/5 shadow-2xl shadow-purple-500/10' : 'border-dark-800 hover:border-dark-700'
              }`}
              onClick={() => setMode('random')}
            >
              <div className="flex items-start justify-between mb-8">
                <div className={`p-4 rounded-xl transition-all ${mode === 'random' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-dark-800 text-dark-400 group-hover:bg-dark-700'}`}>
                  <Cpu className="w-8 h-8" />
                </div>
                {mode === 'random' && (
                  <div className="px-3 py-1 bg-purple-500 text-[10px] font-black text-white uppercase tracking-widest rounded-full">Active</div>
                )}
              </div>
              <h3 className="text-2xl font-black text-white mb-3">AI Technical Screen</h3>
              <p className="text-dark-400 text-sm leading-relaxed mb-6">
                AI generates a fresh problem based on your history. Features a hidden timer and one-time hints to simulate real screening conditions.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-400">
                <Sparkles className="w-3 h-3" /> AI Powered Generation
              </div>
            </div>

            {/* Review Solved Mode */}
            <div 
              className={`group relative bg-dark-900 border-2 rounded-2xl p-8 cursor-pointer transition-all duration-300 ${
                mode === 'solved-review' ? 'border-blue-500 bg-blue-500/5 shadow-2xl shadow-blue-500/10' : 'border-dark-800 hover:border-dark-700'
              }`}
              onClick={() => setMode('solved-review')}
            >
              <div className="flex items-start justify-between mb-8">
                <div className={`p-4 rounded-xl transition-all ${mode === 'solved-review' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-dark-800 text-dark-400 group-hover:bg-dark-700'}`}>
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                {mode === 'solved-review' && (
                  <div className="px-3 py-1 bg-blue-500 text-[10px] font-black text-white uppercase tracking-widest rounded-full">Active</div>
                )}
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Random Review</h3>
              <p className="text-dark-400 text-sm leading-relaxed mb-6">
                Pick a random problem from your solved collection. Best for reinforcing existing mental models and checking memory retention.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400">
                <Trophy className="w-3 h-3" /> {solvedProblems.length} Problems Available
              </div>
            </div>
          </div>

          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-8 shadow-xl">
             <div className="flex items-center gap-3 mb-8 pb-4 border-b border-dark-800">
                <Settings className="w-5 h-5 text-dark-500" />
                <h3 className="text-lg font-black text-white">Session Configuration</h3>
             </div>

             <div className="space-y-8">
                <div>
                   <label className="block text-xs font-bold text-dark-500 uppercase tracking-widest mb-4">Interview Difficulty</label>
                   <div className="grid grid-cols-3 gap-4">
                    {['Easy', 'Medium', 'Hard'].map(diff => (
                      <button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        className={`py-4 rounded-xl text-sm font-bold transition-all border-2 ${
                          difficulty === diff
                            ? diff === 'Easy' ? 'bg-green-500/10 border-green-500 text-green-400'
                            : diff === 'Medium' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400'
                            : 'bg-red-500/10 border-red-500 text-red-400'
                            : 'bg-dark-950 border-dark-800 text-dark-500 hover:border-dark-700 hover:text-dark-300'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleStartPractice}
                    disabled={practiceLoading || (mode === 'solved-review' && solvedProblems.length === 0)}
                    className="w-full relative group"
                  >
                    <div className={`absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 ${mode === 'random' ? 'bg-purple-600' : 'bg-blue-600'}`} />
                    <div className={`relative px-8 py-5 rounded-2xl leading-none flex items-center justify-center gap-3 transition-transform duration-200 group-hover:scale-[1.01] group-active:scale-[0.98] ${mode === 'random' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                      {practiceLoading ? (
                        <>
                          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-lg font-black text-white uppercase tracking-wider">Acquiring Target...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 fill-white text-white" />
                          <span className="text-lg font-black text-white uppercase tracking-wider">Initiate Session</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
             </div>
          </div>
        </div>

        {/* Rules/Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-8 h-full">
            <h3 className="text-xl font-black text-white mb-8">Session Protocol</h3>
            <div className="space-y-6">
              <div className="flex gap-4 p-4 bg-dark-800/30 rounded-xl border border-dark-700/50">
                <Timer className="w-6 h-6 text-purple-400 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">Standardized Timing</h4>
                  <p className="text-xs text-dark-400 leading-relaxed">
                    Once initiated, you have 45 minutes to find an optimal solution. Time management is a graded metric.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-dark-800/30 rounded-xl border border-dark-700/50">
                <ShieldAlert className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">No Tab Switching</h4>
                  <p className="text-xs text-dark-400 leading-relaxed">
                    To maintain simulation integrity, avoid searching for solutions externally. Focus on the core logic.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-dark-800/30 rounded-xl border border-dark-700/50">
                <Zap className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">Feedback Loop</h4>
                  <p className="text-xs text-dark-400 leading-relaxed">
                    After submission, you'll receive a breakdown of your space/time efficiency compared to AI baselines.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-purple-500/5 border border-purple-500/10 rounded-2xl relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
               <p className="text-xs font-medium text-dark-300 leading-relaxed italic">
                 "Interviews are more than just correct code. They are about how you handle edge cases and clarify complex requirements under pressure."
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewPracticePage;
