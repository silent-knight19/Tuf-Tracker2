import React, { useState } from 'react';
import { Target, Zap, Sparkles, Brain, Trophy, ChevronRight } from 'lucide-react';
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
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Target className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Pattern Focus</h1>
          </div>
          <p className="text-dark-400 text-lg max-w-xl">
            Target specific algorithmic weaknesses. Our AI generates novel problems designed to test your mastery of a single pattern.
          </p>
        </div>
        
        <div className="flex items-center gap-6 px-6 py-3 bg-dark-900/50 border border-dark-800 rounded-2xl backdrop-blur-sm">
          <div className="text-center">
            <div className="text-xs font-bold text-dark-500 uppercase tracking-widest mb-1">Patterns</div>
            <div className="text-xl font-black text-white">{uniquePatterns.length}</div>
          </div>
          <div className="w-px h-8 bg-dark-800" />
          <div className="text-center">
            <div className="text-xs font-bold text-dark-500 uppercase tracking-widest mb-1">Topics</div>
            <div className="text-xl font-black text-white">{uniqueTopics.length}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Selection Card */}
        <div className="lg:col-span-7">
          <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20" />
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-dark-400 uppercase tracking-widest mb-3">Target Pattern</label>
                  <SearchableSelect
                    options={uniquePatterns}
                    value={selectedPattern}
                    onChange={setSelectedPattern}
                    placeholder="e.g. Sliding Window"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark-400 uppercase tracking-widest mb-3">Related Topic</label>
                  <SearchableSelect
                    options={uniqueTopics}
                    value={selectedTopic}
                    onChange={setSelectedTopic}
                    placeholder="All Topics"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-dark-400 uppercase tracking-widest mb-3">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Easy', 'Medium', 'Hard'].map(diff => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-3.5 rounded-xl text-sm font-bold transition-all border-2 ${
                        selectedDifficulty === diff
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
                  onClick={() => handlePatternPractice()}
                  disabled={practiceLoading || (!selectedPattern && !selectedTopic)}
                  className="w-full relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                  <div className="relative px-8 py-5 bg-blue-600 rounded-2xl leading-none flex items-center justify-center gap-3 transition-transform duration-200 group-hover:scale-[1.01] group-active:scale-[0.98]">
                    {practiceLoading ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-lg font-black text-white">Generating Challenge...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-6 h-6 fill-white text-white" />
                        <span className="text-lg font-black text-white">Start Focused Session</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-dark-900/50 border border-dark-800 rounded-xl flex items-center gap-3">
              <Brain className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-dark-300">AI-Generated Problem</span>
            </div>
            <div className="p-4 bg-dark-900/50 border border-dark-800 rounded-xl flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-dark-300">Custom Edge Cases</span>
            </div>
            <div className="p-4 bg-dark-900/50 border border-dark-800 rounded-xl flex items-center gap-3">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium text-dark-300">Pattern Mastery</span>
            </div>
          </div>

          {/* Left Bottom Quote Section - Inside the column for tighter spacing */}
          <div className="mt-8 max-w-2xl animate-in fade-in slide-in-from-left duration-1000">
            <MotivationalQuote category="Discipline" variant="card" className="!bg-dark-900/40 border-dark-800/40" />
          </div>
        </div>

        {/* Suggested Patterns Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Quick Start
            </h3>
            <div className="space-y-3">
              {SUGGESTED_PATTERNS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => handlePatternPractice(p.name)}
                  className="w-full group p-4 rounded-xl bg-dark-800/30 border border-dark-700 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-10 rounded-full bg-${p.color}-500/20 border border-${p.color}-500/40`} />
                    <div>
                      <div className="text-white font-bold">{p.name}</div>
                      <div className="text-xs text-dark-500 font-medium">{p.desc}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-dark-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-8 relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:w-48 group-hover:h-48 transition-all duration-700" />
            <h4 className="text-xl font-black text-white mb-2 relative z-10">Mastered any pattern?</h4>
            <p className="text-dark-400 text-sm mb-6 relative z-10">
              The AI tracks your performance. Solving more problems in a specific pattern will unlock advanced variants and edge cases.
            </p>
            <div className="inline-flex items-center gap-2 text-blue-400 font-bold text-sm hover:text-blue-300 cursor-pointer transition-colors relative z-10">
              View your stats <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
      

    </div>
  );
}

export default PatternPracticePage;
