import { useState } from 'react';
import { BookOpen, Zap, X } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../utils/api';
import SearchableSelect from '../components/ui/SearchableSelect';
import CodeHighlighter from '../components/ui/CodeHighlighter';
import { DSA_PATTERNS, DSA_TOPICS } from '../utils/dsaConstants';
import { auth } from '../config/firebase';

function LearnPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  // Selection State
  const [learnPattern, setLearnPattern] = useState('');
  const [learnTopic, setLearnTopic] = useState('');
  
  // Content State
  const [learningNotes, setLearningNotes] = useState(null);

  const handleGenerateLearningNotes = async () => {
    if (!learnPattern && !learnTopic) {
      alert('Please select at least a pattern or topic');
      return;
    }

    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await api.post('/ai/learning-notes', {
        pattern: learnPattern || undefined,
        topic: learnTopic || undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLearningNotes(response.data);
    } catch (error) {
      console.error('Failed to generate learning notes:', error);
      alert('Failed to generate learning notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setLearningNotes(null);
    setLearnPattern('');
    setLearnTopic('');
  };

  if (!learningNotes) {
    return (
      <div className="p-6 h-full overflow-y-auto custom-scrollbar flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in zoom-in duration-300">
          
          <div className="space-y-4">
            <div className="w-20 h-20 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-cyan-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">AI Learning Center</h1>
            <p className="text-xl text-dark-400 max-w-lg mx-auto leading-relaxed">
              Master any Data Structure algorithm or pattern with our intelligent AI tutor.
            </p>
          </div>

          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-8 shadow-xl text-left space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Topic</label>
                <SearchableSelect
                  options={DSA_TOPICS}
                  value={learnTopic}
                  onChange={setLearnTopic}
                  placeholder="e.g. Dynamic Programming"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Pattern</label>
                <SearchableSelect
                  options={DSA_PATTERNS}
                  value={learnPattern}
                  onChange={setLearnPattern}
                  placeholder="e.g. Sliding Window"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateLearningNotes}
              disabled={loading || (!learnPattern && !learnTopic)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-lg shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-current" /> Generate Detailed Notes
                </>
              )}
            </button>
          </div>

          <p className="text-sm text-dark-500">
            Powered by Gemini AI • Generates comprehensive guides, intuition, and examples
          </p>
        </div>
      </div>
    );
  }

  // Display Learning Notes
  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-cyan-400" />
              </div>
              <h1 className="text-3xl font-bold text-white">{learningNotes.title}</h1>
            </div>
            <p className="text-dark-400 text-lg">AI Generated Study Guide</p>
          </div>
          <button 
            onClick={handleReset}
            className="px-4 py-2 rounded-lg bg-dark-900 border border-dark-800 text-dark-300 hover:text-white hover:bg-dark-800 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Close
          </button>
        </div>

        {/* Content */}
        <div className="space-y-8">
          
          {/* Overview */}
          <section className="bg-dark-900 border border-dark-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
              📖 Overview
            </h2>
            <p className="text-dark-200 whitespace-pre-line text-lg leading-relaxed">
              {learningNotes.overview}
            </p>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* When to Use */}
            {learningNotes.whenToUse && (
              <section className="bg-dark-900 border border-dark-800 rounded-2xl p-6 h-full">
                <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                  🎯 When to Use
                </h2>
                <ul className="space-y-3">
                  {learningNotes.whenToUse.map((signal, i) => (
                    <li key={i} className="text-dark-200 flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center text-sm">•</span> 
                      <span className="pt-0.5">{signal}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Complexity */}
            {learningNotes.complexity && (
              <section className="bg-dark-900 border border-dark-800 rounded-2xl p-6 h-full">
                <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                  ⏱️ Complexity
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-dark-950 rounded-xl p-4 border border-dark-800">
                      <span className="text-sm text-dark-400 uppercase tracking-wider block mb-1">Time</span>
                      <p className="text-dark-200 font-mono font-medium text-lg">{learningNotes.complexity.time}</p>
                    </div>
                    <div className="bg-dark-950 rounded-xl p-4 border border-dark-800">
                      <span className="text-sm text-dark-400 uppercase tracking-wider block mb-1">Space</span>
                      <p className="text-dark-200 font-mono font-medium text-lg">{learningNotes.complexity.space}</p>
                    </div>
                  </div>
                  {learningNotes.complexity.bestCase && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <span className="font-bold text-green-400">Best Case:</span>
                      <span className="text-dark-200">{learningNotes.complexity.bestCase}</span>
                    </div>
                  )}
                  {learningNotes.complexity.worstCase && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <span className="font-bold text-red-400">Worst Case:</span>
                      <span className="text-dark-200">{learningNotes.complexity.worstCase}</span>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Core Approach */}
          {learningNotes.coreApproach && (
            <section className="bg-dark-900 border border-dark-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-2">
                🔧 Core Approach
              </h2>
              
              <div className="space-y-8">
                {/* Intuition */}
                {learningNotes.coreApproach.intuition && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                      💡 Intuition
                    </h3>
                    <p className="text-dark-200 whitespace-pre-line leading-relaxed">
                      {learningNotes.coreApproach.intuition}
                    </p>
                  </div>
                )}
                
                {/* Steps */}
                <div className="pl-2">
                  <h3 className="text-lg font-bold text-white mb-4">Implementation Steps</h3>
                  <div className="space-y-4 relative border-l-2 border-dark-800 ml-3 pl-8 pb-2">
                    {learningNotes.coreApproach.steps?.map((step, i) => (
                      <div key={i} className="relative">
                        <span className="absolute -left-[41px] w-8 h-8 rounded-full bg-dark-800 border-4 border-dark-900 text-blue-400 flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <p className="text-dark-200 text-lg leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Pseudocode */}
                {learningNotes.coreApproach.pseudocode && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Pseudocode</h3>
                    <div className="rounded-xl overflow-hidden border border-dark-700 shadow-lg">
                      <CodeHighlighter code={learningNotes.coreApproach.pseudocode} />
                    </div>
                  </div>
                )}
                
                {/* Edge Cases */}
                {learningNotes.coreApproach.edgeCases && (
                  <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-red-400 mb-3">⚡ Edge Cases</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {learningNotes.coreApproach.edgeCases.map((edge, i) => (
                        <div key={i} className="flex items-center gap-2 text-dark-200">
                          <span className="text-red-400">•</span> {edge}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Example Problems */}
          {learningNotes.exampleProblems && (
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                💡 Example Problems
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {learningNotes.exampleProblems.map((problem, i) => (
                  <div key={i} className="bg-dark-900 border border-dark-800 rounded-2xl p-6 hover:border-purple-500/30 transition-colors">
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <h3 className="font-bold text-white text-xl">{problem.name}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                        problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{problem.difficulty}</span>
                      {problem.companies?.map((company, j) => (
                        <span key={j} className="text-xs px-2.5 py-1 rounded-full bg-dark-800 text-dark-300 border border-dark-700">
                          {company}
                        </span>
                      ))}
                    </div>
                    
                    <p className="text-dark-300 mb-6 text-lg">{problem.description}</p>
                    
                    <div className="space-y-4">
                      {problem.intuition && (
                        <div className="bg-dark-950 rounded-xl p-4 border-l-4 border-purple-500">
                          <span className="text-sm text-purple-400 font-bold uppercase tracking-wider block mb-2">Intuition</span>
                          <p className="text-dark-200">{problem.intuition}</p>
                        </div>
                      )}
                      
                      <div>
                        <span className="text-sm text-dark-400 font-bold uppercase tracking-wider block mb-2">Approach</span>
                        <p className="text-dark-200 mb-4">{problem.approach}</p>
                        <div className="rounded-xl overflow-hidden text-sm">
                          <CodeHighlighter code={problem.code} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Common Mistakes & Pro Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {learningNotes.commonMistakes && (
              <section className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                  ⚠️ Common Mistakes
                </h2>
                <ul className="space-y-3">
                  {learningNotes.commonMistakes.map((mistake, i) => (
                    <li key={i} className="text-dark-200 flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-sm">!</span>
                      <span className="pt-0.5">{mistake}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {learningNotes.proTips && (
              <section className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-brand-orange mb-4 flex items-center gap-2">
                  💪 Pro Tips
                </h2>
                <ul className="space-y-3">
                  {learningNotes.proTips.map((tip, i) => (
                    <li key={i} className="text-dark-200 flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center text-sm">★</span>
                      <span className="pt-0.5">{tip}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default LearnPage;
