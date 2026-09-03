import React, { useState } from 'react';
import { Building2, Zap, Play, CheckCircle2, Timer, Settings, ShieldAlert, Cpu } from 'lucide-react';
import { useProblemStore } from '../../stores/problemStore';
import api from '../../utils/api';
import { auth } from '../../config/firebase';
import MotivationalQuote from '../../components/ui/MotivationalQuote';

function InterviewPracticePage() {
  const { problems } = useProblemStore();
  
  const [mode, setMode] = useState('random'); // 'random', 'solved-review'
  const [difficulty, setDifficulty] = useState('Medium');
  const [practiceLoading, setPracticeLoading] = useState(false);

  // Normalize solved check to match Dashboard logic
  const solvedProblems = problems.filter(p => p.status === 'Solved' || p.status === 'Completed' || p.solvedAt);

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
          // Open in Solve page with blind mode (hides title/difficulty/company)
          window.open(`/solve/${randomSolved.id}?blind=true`, '_blank');
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
    <div className="min-h-screen bg-background">
      {/* Professional Header */}
      <div className="border-b border-border bg-surface/50">
        <div className="max-w-[1440px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground">Mock Interview</h1>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">SOLVED</span>
                <span className="text-lg font-mono font-medium text-foreground">{solvedProblems.length}</span>
              </div>
              <div className="w-px h-5 bg-border" />
              <div className="flex items-center gap-2" title="Average difficulty rating of your solved problems">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">DIFFICULTY RATING</span>
                <span className={`text-lg font-mono font-medium ${
                  (() => {
                    if (solvedProblems.length === 0) return 'text-foreground-subtle';
                    const score = Math.round(solvedProblems.reduce((acc, p) => {
                      if (p.difficulty === 'Easy') return acc + 30;
                      if (p.difficulty === 'Medium') return acc + 60;
                      if (p.difficulty === 'Hard') return acc + 100;
                      return acc;
                    }, 0) / solvedProblems.length);
                    if (score >= 80) return 'text-rose-400';
                    if (score >= 50) return 'text-accent-amber';
                    return 'text-emerald-400';
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
          
          <p className="mt-3 text-xs text-foreground-muted max-w-2xl">
            Simulate realistic technical interview conditions with AI-generated problems and detailed complexity analysis.
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
                className={`relative bg-surface border rounded-xl p-6 cursor-pointer transition-all ${
                  mode === 'random' ? 'border-primary ring-1 ring-primary/20 bg-surface-raised' : 'border-border hover:border-border-strong'
                }`}
                onClick={() => setMode('random')}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`p-2.5 rounded-lg transition-all ${mode === 'random' ? 'bg-primary text-white' : 'bg-surface-raised text-foreground-subtle'}`}>
                    <Cpu className="w-5 h-5" />
                  </div>
                  {mode === 'random' && (
                    <div className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-semibold uppercase tracking-wider rounded border border-primary/30">Active</div>
                  )}
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1.5">AI Technical Screen</h3>
                <p className="text-xs text-foreground-muted leading-relaxed mb-4">
                  AI generates a fresh problem based on your history. Features timing and socratic debriefing.
                </p>
                <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                  <Zap className="w-3.5 h-3.5" /> Dynamic Synthesis
                </div>
              </div>

              {/* Review Solved Mode */}
              <div 
                className={`relative bg-surface border rounded-xl p-6 cursor-pointer transition-all ${
                  mode === 'solved-review' ? 'border-primary ring-1 ring-primary/20 bg-surface-raised' : 'border-border hover:border-border-strong'
                }`}
                onClick={() => setMode('solved-review')}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`p-2.5 rounded-lg transition-all ${mode === 'solved-review' ? 'bg-primary text-white' : 'bg-surface-raised text-foreground-subtle'}`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  {mode === 'solved-review' && (
                    <div className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-semibold uppercase tracking-wider rounded border border-primary/30">Active</div>
                  )}
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1.5">Random Review</h3>
                <p className="text-xs text-foreground-muted leading-relaxed mb-4">
                  Pick a random problem from your solved collection to test recall and retention.
                </p>
                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {solvedProblems.length} Problems Available
                </div>
              </div>
            </div>

            {/* Configuration Card */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-foreground-subtle" />
                  <h3 className="text-sm font-semibold text-foreground">Session Configuration</h3>
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
                      ? 'bg-surface text-foreground-subtle border border-border cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary-hover active:bg-primary-dark shadow-glow-sm'
                  }`}
                >
                  {practiceLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Generating Problem...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Start Interview</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Rules/Info Sidebar - Right Column */}
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Interview Guidelines</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex gap-3 p-3 bg-surface-raised rounded-lg border border-border-subtle">
                  <Timer className="w-5 h-5 text-accent-amber flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-1">Standardized Timing</h4>
                    <p className="text-xs text-foreground-muted leading-relaxed">
                      You have 45 minutes to design and implement an optimal solution. Time management and pacing are evaluated.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-surface-raised rounded-lg border border-border-subtle">
                  <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-1">Authentic Practice</h4>
                    <p className="text-xs text-foreground-muted leading-relaxed">
                      To simulate actual technical interviews, work through the problem without external solutions. Focus on edge cases and invariants.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-surface-raised rounded-lg border border-border-subtle">
                  <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-1">Automated Evaluation</h4>
                    <p className="text-xs text-foreground-muted leading-relaxed">
                      After submission, you'll receive a breakdown of your space and time complexity compared to theoretical baselines.
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
