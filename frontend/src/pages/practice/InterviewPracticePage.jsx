import React, { useState } from 'react';
import { Building2, Zap, Play, CheckCircle2, Timer, Settings, ShieldAlert, Cpu, Trophy } from 'lucide-react';
import { useProblemStore } from '../../stores/problemStore';
import api from '../../utils/api';
import { auth } from '../../config/firebase';
import MotivationalQuote from '../../components/ui/MotivationalQuote';

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
    <div className="min-h-screen bg-black">
      {/* LeetCode-inspired Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-[1440px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#FFA116]/10 rounded-lg">
                <Building2 className="w-6 h-6 text-[#FFA116]" />
              </div>
              <h1 className="text-2xl font-semibold text-white">Mock Interview</h1>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">SOLVED</span>
                <span className="text-lg font-medium text-white">{solvedProblems.length}</span>
              </div>
              <div className="w-px h-5 bg-gray-800" />
              <div className="flex items-center gap-2" title="Skill Score: Average difficulty rating of your solved problems">
                <span className="text-sm text-gray-500">AVG S-SCORE</span>
                <span className={`text-lg font-medium ${
                  (() => {
                    if (solvedProblems.length === 0) return 'text-gray-600';
                    const score = Math.round(solvedProblems.reduce((acc, p) => {
                      if (p.difficulty === 'Easy') return acc + 30;
                      if (p.difficulty === 'Medium') return acc + 60;
                      if (p.difficulty === 'Hard') return acc + 100;
                      return acc;
                    }, 0) / solvedProblems.length);
                    if (score >= 80) return 'text-[#FFA116]';
                    if (score >= 50) return 'text-yellow-500';
                    return 'text-green-400';
                  })()
                }`}>
                  {solvedProblems.length === 0 ? 'N/A' : `${Math.round(solvedProblems.reduce((acc, p) => {
                    if (p.difficulty === 'Easy') return acc + 30;
                    if (p.difficulty === 'Medium') return acc + 60;
                    if (p.difficulty === 'Hard') return acc + 100;
                    return acc;
                  }, 0) / solvedProblems.length)}%`}
                </span>
              </div>
            </div>
          </div>
          
          <p className="mt-3 text-sm text-gray-400 max-w-2xl">
            Simulate the pressure of a high-stakes technical interview. AI-curated problems with real-time feedback.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Mode Selection - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mode Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Random Interview Mode */}
              <div 
                className={`relative bg-[#1a1a1a] border rounded-lg p-6 cursor-pointer transition-all ${
                  mode === 'random' ? 'border-[#FFA116] ring-1 ring-[#FFA116]/20' : 'border-gray-800 hover:border-gray-700'
                }`}
                onClick={() => setMode('random')}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-3 rounded-lg transition-all ${mode === 'random' ? 'bg-[#FFA116]' : 'bg-gray-800'}`}>
                    <Cpu className={`w-6 h-6 ${mode === 'random' ? 'text-black' : 'text-gray-400'}`} />
                  </div>
                  {mode === 'random' && (
                    <div className="px-2.5 py-1 bg-[#FFA116] text-[10px] font-semibold text-black uppercase rounded">Active</div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">AI Technical Screen</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  AI generates a fresh problem based on your history. Features a hidden timer and one-time hints.
                </p>
                <div className="flex items-center gap-2 text-xs font-medium text-[#FFA116]">
                  <Zap className="w-3 h-3" /> AI Powered Generation
                </div>
              </div>

              {/* Review Solved Mode */}
              <div 
                className={`relative bg-[#1a1a1a] border rounded-lg p-6 cursor-pointer transition-all ${
                  mode === 'solved-review' ? 'border-[#FFA116] ring-1 ring-[#FFA116]/20' : 'border-gray-800 hover:border-gray-700'
                }`}
                onClick={() => setMode('solved-review')}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-3 rounded-lg transition-all ${mode === 'solved-review' ? 'bg-[#FFA116]' : 'bg-gray-800'}`}>
                    <CheckCircle2 className={`w-6 h-6 ${mode === 'solved-review' ? 'text-black' : 'text-gray-400'}`} />
                  </div>
                  {mode === 'solved-review' && (
                    <div className="px-2.5 py-1 bg-[#FFA116] text-[10px] font-semibold text-black uppercase rounded">Active</div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Random Review</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  Pick a random problem from your solved collection. Best for reinforcing existing mental models.
                </p>
                <div className="flex items-center gap-2 text-xs font-medium text-[#FFA116]">
                  <Trophy className="w-3 h-3" /> {solvedProblems.length} Problems Available
                </div>
              </div>
            </div>

            {/* Configuration Card */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <h3 className="text-base font-semibold text-white">Session Configuration</h3>
                </div>
              </div>

              <div className="px-6 py-5 space-y-6">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    INTERVIEW DIFFICULTY
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Easy', 'Medium', 'Hard'].map(diff => (
                      <button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                          difficulty === diff
                            ? diff === 'Easy' 
                              ? 'bg-green-600/20 text-green-500 border border-green-600/50'
                              : diff === 'Medium' 
                              ? 'bg-yellow-600/20 text-yellow-500 border border-yellow-600/50'
                              : 'bg-red-600/20 text-red-500 border border-red-600/50'
                            : 'bg-transparent text-gray-500 border border-gray-800 hover:border-gray-700 hover:text-gray-300'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStartPractice}
                  disabled={practiceLoading || (mode === 'solved-review' && solvedProblems.length === 0)}
                  className={`w-full py-3.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    practiceLoading || (mode === 'solved-review' && solvedProblems.length === 0)
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-[#FFA116] text-black hover:bg-[#FFB143] active:bg-[#FF9800]'
                  }`}
                >
                  {practiceLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
                      <span>Acquiring Target...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Initiate Session</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Rules/Info Sidebar - Right Column */}
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800">
                <h3 className="text-base font-semibold text-white">Session Protocol</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex gap-3 p-3 bg-black/40 rounded-lg border border-gray-800">
                  <Timer className="w-5 h-5 text-[#FFA116] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Standardized Timing</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Once initiated, you have 45 minutes to find an optimal solution. Time management is graded.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-black/40 rounded-lg border border-gray-800">
                  <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">No Tab Switching</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      To maintain simulation integrity, avoid searching for solutions externally. Focus on the core logic.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-black/40 rounded-lg border border-gray-800">
                  <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Feedback Loop</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      After submission, you'll receive a breakdown of your space/time efficiency compared to AI baselines.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mx-5 mb-5 p-4 bg-[#FFA116]/10 border border-[#FFA116]/20 rounded-lg">
                <p className="text-xs text-gray-300 leading-relaxed italic">
                  "Interviews are more than just correct code. They are about how you handle edge cases and clarify complex requirements under pressure."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Quote at bottom */}
        <div className="mt-8">
          <MotivationalQuote category="Discipline" variant="card" className="!bg-[#1a1a1a] !border-gray-800" />
        </div>
      </div>
    </div>
  );
}

export default InterviewPracticePage;
