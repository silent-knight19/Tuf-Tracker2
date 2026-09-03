import React, { useState } from 'react';
import { Target, Zap, Terminal, Brain, Layers, ChevronRight } from 'lucide-react';
import { useProblemStore } from '../../stores/problemStore';
import SearchableSelect from '../../components/ui/SearchableSelect';
import MotivationalQuote from '../../components/ui/MotivationalQuote';
import api from '../../utils/api';
import { auth } from '../../config/firebase';
import { DSA_PATTERNS, DSA_TOPICS } from '../../utils/dsaConstants';

const SUGGESTED_PATTERNS = [
  { name: 'Sliding Window', desc: 'Optimal for arrays & strings', color: 'blue' },
  { name: 'Two Pointers', desc: 'Sorted array manipulation', color: 'green' },
  { name: 'Dynamic Programming', desc: 'Tabulation & Memoization', color: 'purple' },
  { name: 'Graphs', desc: 'BFS, DFS & Shortest Path', color: 'orange' }
];

function PatternPracticePage() {
  const { problems } = useProblemStore();
  
  const [selectedPattern, setSelectedPattern] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  const [practiceLoading, setPracticeLoading] = useState(false);

  // Combine user's solved patterns/topics with standard lists
  const uniquePatterns = [...new Set([
    ...DSA_PATTERNS,
    ...problems.flatMap(p => p.patterns || [])
  ])].sort();

  const uniqueTopics = [...new Set([
    ...DSA_TOPICS,
    ...problems.flatMap(p => p.topics || [])
  ])].sort();

  const handlePatternPractice = async (overridePattern = null) => {
    const patternToUse = overridePattern || selectedPattern;
    if (!patternToUse && !selectedTopic) {
      alert('Please select at least a pattern or a topic');
      return;
    }

    // Open tab immediately to avoid popup blockers
    const localId = Date.now().toString();
    const newTab = window.open(`/interview/ai?localId=${localId}`, '_blank');

    try {
      setPracticeLoading(true);
      const token = await auth.currentUser.getIdToken();

      const aiResponse = await api.post('/ai/custom-problem', {
        pattern: patternToUse,
        topic: selectedTopic || undefined,
        difficulty: selectedDifficulty
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.setItem(`ai_problem_${localId}`, JSON.stringify(aiResponse.data));
      
    } catch (error) {
      console.error('Failed to generate pattern problem:', error);
      if (newTab) newTab.close();
      alert('Failed to generate problem. Please try again.');
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
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground">Pattern Focus</h1>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">PATTERNS</span>
                <span className="text-lg font-medium text-white">{uniquePatterns.length}</span>
              </div>
              <div className="w-px h-5 bg-gray-800" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">TOPICS</span>
                <span className="text-lg font-medium text-white">{uniqueTopics.length}</span>
              </div>
            </div>
          </div>
          
          <p className="mt-3 text-sm text-gray-400 max-w-2xl">
            Target specific algorithmic weaknesses. Our AI generates novel problems designed to test your mastery of a single pattern.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selection Card */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-5 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                      TARGET PATTERN
                    </label>
                    <SearchableSelect
                      options={uniquePatterns}
                      value={selectedPattern}
                      onChange={setSelectedPattern}
                      placeholder="e.g. Sliding Window"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                      RELATED TOPIC
                    </label>
                    <SearchableSelect
                      options={uniqueTopics}
                      value={selectedTopic}
                      onChange={setSelectedTopic}
                      placeholder="All Topics"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    DIFFICULTY LEVEL
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Easy', 'Medium', 'Hard'].map(diff => (
                      <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                          selectedDifficulty === diff
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
                  onClick={() => handlePatternPractice()}
                  disabled={practiceLoading || (!selectedPattern && !selectedTopic)}
                  className={`w-full py-3.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    practiceLoading || (!selectedPattern && !selectedTopic)
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-[#FFA116] text-white hover:bg-[#FFB143] active:bg-[#FF9800]'
                  }`}
                >
                  {practiceLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
                      <span>Generating Challenge...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Generate Question</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface border border-border rounded-lg px-4 py-3 flex items-center gap-2.5">
                <Brain className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-xs font-medium text-foreground-muted">AI-Generated Problem</span>
              </div>
              <div className="bg-surface border border-border rounded-lg px-4 py-3 flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-accent-amber flex-shrink-0" />
                <span className="text-xs font-medium text-foreground-muted">Custom Edge Cases</span>
              </div>
              <div className="bg-surface border border-border rounded-lg px-4 py-3 flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-xs font-medium text-foreground-muted">Pattern Invariants</span>
              </div>
            </div>

            {/* Quote Section */}
            <div className="mt-4">
              <MotivationalQuote category="Discipline" variant="card" className="!bg-[#1a1a1a] !border-gray-800" />
            </div>
          </div>

          {/* Right Column - Quick Start */}
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-yellow-500" />
                  Quick Start
                </h3>
              </div>
              <div className="p-4 space-y-2">
                {SUGGESTED_PATTERNS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => handlePatternPractice(p.name)}
                    className="w-full group px-4 py-3.5 rounded-lg bg-black/40 border border-gray-800 hover:border-gray-700 hover:bg-black/60 transition-all text-left flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{p.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{p.desc}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-6">
              <h4 className="text-base font-semibold text-white mb-2">Mastered any pattern?</h4>
              <p className="text-sm text-gray-400 mb-4">
                The AI tracks your performance. Solving more problems in a specific pattern will unlock advanced variants and edge cases.
              </p>
              <div className="inline-flex items-center gap-1.5 text-blue-400 font-medium text-sm hover:text-blue-300 cursor-pointer transition-colors">
                View your stats <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatternPracticePage;
