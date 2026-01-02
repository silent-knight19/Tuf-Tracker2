import { useState, useEffect } from 'react';
import { BookOpen, Zap, X, Target, Brain, ChevronRight, Activity, Code2, Clock, Terminal, Lightbulb, Trophy, AlertCircle, Star, CheckCircle, Database, Layers, Building2, Hash, List, GitBranch, Network, Box, Search, ArrowRightLeft, LayoutList, GitMerge, RefreshCcw, ArrowUpNarrowWide } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../utils/api';
import SearchableSelect from '../components/ui/SearchableSelect';
import CodeHighlighter from '../components/ui/CodeHighlighter';
import { DSA_PATTERNS, DSA_TOPICS } from '../utils/dsaConstants';
import { auth } from '../config/firebase';
import MotivationalQuote from '../components/ui/MotivationalQuote';

function LearnPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  // Selection State
  const [learnPattern, setLearnPattern] = useState('');
  const [learnTopic, setLearnTopic] = useState('');
  
  // Content State
  const [learningNotes, setLearningNotes] = useState(null);

  // Cooldown State
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleGenerateLearningNotes = async () => {
    if (!learnPattern && !learnTopic) return;
    if (cooldown > 0) return;

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
      
      // Only apply cooldown for non-whitelisted users
      const whitelist = (import.meta.env.VITE_WHITELISTED_EMAILS || '').split(',').map(e => e.trim());
      const isWhitelisted = user?.email && whitelist.includes(user.email);
      
      if (!isWhitelisted) {
        setCooldown(30); // 30s cooldown for regular users
      }
    } catch (error) {
      console.error('Failed to generate learning notes:', error);
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
      <div className="min-h-full bg-[#0a0a0a] overflow-y-auto custom-scrollbar selection:bg-orange-500/30">
        <div className="max-w-[1400px] mx-auto px-8 py-12">
          {/* LeetCode-Style Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-white mb-2">Learn</h1>
            <p className="text-sm text-[#8c8c8c]">Master DSA patterns and topics with AI-powered insights</p>
          </div>

          {/* Filter Bar */}
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-xs font-medium text-[#8c8c8c] uppercase tracking-wider">Data Structure / Algorithm</label>
                <SearchableSelect
                  options={DSA_TOPICS}
                  value={learnTopic}
                  onChange={setLearnTopic}
                  placeholder="Select a topic..."
                  className="!bg-[#0a0a0a] !border-[#262626] !text-white"
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-xs font-medium text-[#8c8c8c] uppercase tracking-wider">Pattern</label>
                <SearchableSelect
                  options={DSA_PATTERNS}
                  value={learnPattern}
                  onChange={setLearnPattern}
                  placeholder="Select a pattern..."
                  className="!bg-[#0a0a0a] !border-[#262626] !text-white"
                />
              </div>
              <button
                onClick={handleGenerateLearningNotes}
                disabled={loading || (!learnPattern && !learnTopic) || cooldown > 0}
                className="px-8 py-3 bg-[#ffa116] hover:bg-[#ffb547] disabled:bg-[#262626] disabled:text-[#8c8c8c] text-black font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-sm min-w-[160px]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : cooldown > 0 ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Wait {cooldown}s</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Access Section - Popular Topics */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-[#ffa116]" /> 
              Popular Topics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { name: 'Arrays', id: 'Array', icon: LayoutList, color: '#00b8a3' },
                { name: 'Strings', id: 'String', icon: Code2, color: '#ffc01e' },
                { name: 'Hash Table', id: 'Hash Table', icon: Hash, color: '#ffa116' },
                { name: 'Dynamic Programming', id: 'Dynamic Programming', icon: Activity, color: '#ef4743' },
                { name: 'Graphs', id: 'Graph', icon: Network, color: '#8b5cf6' },
                { name: 'Trees', id: 'Tree', icon: GitBranch, color: '#00b8a3' },
                { name: 'Binary Search', id: 'Binary Search', icon: Search, color: '#ffc01e' },
                { name: 'Linked List', id: 'LinkedList', icon: List, color: '#ffa116' },
                { name: 'Stack', id: 'Stack', icon: Layers, color: '#ef4743' },
                { name: 'Heaps', id: 'Heap (Priority Queue)', icon: Box, color: '#8b5cf6' },
                { name: 'Matrix', id: 'Matrix', icon: LayoutList, color: '#00b8a3' },
                { name: 'Bit Manipulation', id: 'Bit Manipulation', icon: Code2, color: '#ffc01e' },
                { name: 'Greedy', id: 'Greedy', icon: Target, color: '#ffa116' },
                { name: 'Backtracking', id: 'Backtracking', icon: GitMerge, color: '#ef4743' },
                { name: 'Queue', id: 'Queue', icon: Layers, color: '#8b5cf6' }
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setLearnTopic(item.id);
                    setLearnPattern(''); // Clear pattern when selecting topic
                  }}
                  className={`group p-3 bg-[#1a1a1a] border rounded-lg text-left transition-all hover:bg-[#262626] ${
                    learnTopic === item.id ? 'border-[#ffa116] bg-[#262626]' : 'border-[#262626]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#262626] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate">{item.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Access Section - Popular Patterns */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#00b8a3]" />
              Popular Patterns
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { name: 'Two Pointers', id: 'Two Pointers', icon: Target, color: '#00b8a3' },
                { name: 'Sliding Window', id: 'Sliding Window', icon: Activity, color: '#ffc01e' },
                { name: 'Merge Intervals', id: 'Merge Intervals', icon: GitMerge, color: '#ffa116' },
                { name: 'Cyclic Sort', id: 'Cyclic Sort', icon: RefreshCcw, color: '#ef4743' },
                { name: 'Fast & Slow', id: 'Fast & Slow Pointers', icon: Activity, color: '#8b5cf6' },
                { name: 'Two Heaps', id: 'Two Heaps', icon: Layers, color: '#00b8a3' },
                { name: 'Topological Sort', id: 'Topological Sort (Graph)', icon: Network, color: '#ffc01e' },
                { name: 'Union Find', id: 'Union Find', icon: GitBranch, color: '#ffa116' },
                { name: 'Monotonic Stack', id: 'Monotonic Stack', icon: Layers, color: '#ef4743' },
                { name: 'Kadane Algo', id: "Kadane's Algorithm", icon: Activity, color: '#8b5cf6' },
                { name: 'Tree BFS', id: 'Tree Breadth First Search', icon: Network, color: '#00b8a3' },
                { name: 'Tree DFS', id: 'Tree Depth First Search', icon: GitBranch, color: '#ffc01e' },
                { name: 'Subsets', id: 'Subsets', icon: Layers, color: '#ffa116' },
                { name: 'Modified Binary Search', id: 'Modified Binary Search', icon: Search, color: '#ef4743' },
                { name: 'Top K Elements', id: 'Top K Elements', icon: Box, color: '#8b5cf6' }
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setLearnPattern(item.id);
                    setLearnTopic(''); // Clear topic when selecting pattern
                  }}
                  className={`group p-3 bg-[#1a1a1a] border rounded-lg text-left transition-all hover:bg-[#262626] ${
                    learnPattern === item.id ? 'border-[#00b8a3] bg-[#262626]' : 'border-[#262626]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#262626] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate">{item.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Motivational Quote at bottom */}
          <div className="mt-8">
            <MotivationalQuote category="Learning" variant="card" className="!bg-[#1a1a1a] !border-[#262626]" />
          </div>
        </div>
      </div>
    );
  }

  // Display Learning Notes - Premium LeetCode-Inspired UI
  return (
    <div className="p-0 h-full overflow-y-auto custom-scrollbar bg-[#0a0a0a] selection:bg-orange-500/30">
      {/* Subtle gradient background effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ffa116]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00b8a3]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full px-8 lg:px-16 py-10 space-y-8 max-w-[1600px] mx-auto">
        
        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f] border border-[#262626] p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-[#ffa116]/5 via-transparent to-[#00b8a3]/5" />
          <div className="relative flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ffa116] to-[#ff8c00] flex items-center justify-center shadow-lg shadow-[#ffa116]/20">
                  <Brain className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white">{learningNotes.title}</h1>
                  <p className="text-base text-[#8c8c8c] mt-1">Complete Mastery Guide</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleReset}
              className="px-5 py-3 bg-[#262626]/50 backdrop-blur-sm border border-[#404040] rounded-xl text-[#8c8c8c] hover:text-white hover:bg-[#404040] hover:border-[#525252] transition-all flex items-center gap-2 text-base group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        {/* Overview Card - Glassmorphism Style */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a1a]/90 to-[#0f0f0f]/90 backdrop-blur-xl border border-[#262626] p-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ffa116]/10 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-[#ffa116]/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#ffa116]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Overview</h2>
            </div>
            <p className="text-[#b8b8b8] text-lg leading-[1.8] tracking-wide">
              {learningNotes.type === 'topic' && learningNotes.conceptFoundation 
                ? learningNotes.conceptFoundation.definition 
                : learningNotes.overview}
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TOPIC-SPECIFIC RENDERING (Data Structures/Algorithms) */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {learningNotes.type === 'topic' && (
          <>
            {/* Concept Foundation */}
            {learningNotes.conceptFoundation && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-[#8b5cf6]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Concept Foundation</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {learningNotes.conceptFoundation.realWorldAnalogy && (
                    <div className="p-5 rounded-xl bg-[#1a1a1a] border border-[#262626]">
                      <span className="text-sm font-bold text-[#ffa116] uppercase tracking-wider mb-2 block">Real-World Analogy</span>
                      <p className="text-[#c4c4c4] leading-relaxed">{learningNotes.conceptFoundation.realWorldAnalogy}</p>
                    </div>
                  )}
                  {learningNotes.conceptFoundation.whyItExists && (
                    <div className="p-5 rounded-xl bg-[#1a1a1a] border border-[#262626]">
                      <span className="text-sm font-bold text-[#00b8a3] uppercase tracking-wider mb-2 block">Why It Exists</span>
                      <p className="text-[#c4c4c4] leading-relaxed">{learningNotes.conceptFoundation.whyItExists}</p>
                    </div>
                  )}
                  {learningNotes.conceptFoundation.visualDescription && (
                    <div className="lg:col-span-2 p-5 rounded-xl bg-[#0f0f0f] border border-[#262626]">
                      <span className="text-sm font-bold text-[#8b5cf6] uppercase tracking-wider mb-3 block flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Visual Representation
                      </span>
                      <pre className="text-[#b8b8b8] font-mono text-sm whitespace-pre-wrap leading-relaxed">
                        {learningNotes.conceptFoundation.visualDescription}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Technical Anatomy */}
            {learningNotes.technicalAnatomy && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00b8a3]/10 flex items-center justify-center">
                    <Database className="w-5 h-5 text-[#00b8a3]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Technical Anatomy</h2>
                </div>
                
                {/* Components */}
                {Array.isArray(learningNotes.technicalAnatomy.components) && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white">Components</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {learningNotes.technicalAnatomy.components.map((comp, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[#1a1a1a] border border-[#262626]">
                          <div className="w-6 h-6 rounded bg-[#00b8a3]/20 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-[#00b8a3]">{i + 1}</span>
                          </div>
                          <span className="text-[#c4c4c4] leading-relaxed text-sm">{comp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Properties */}
                {Array.isArray(learningNotes.technicalAnatomy.properties) && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white">Properties & Rules</h3>
                    <div className="space-y-2">
                      {learningNotes.technicalAnatomy.properties.map((prop, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-[#ffa116]/10 to-[#1a1a1a] border border-[#ffa116]/20">
                          <CheckCircle className="w-5 h-5 text-[#ffa116] shrink-0 mt-0.5" />
                          <span className="text-[#c4c4c4] leading-relaxed">{prop}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Java Class Blueprint */}
                {learningNotes.technicalAnatomy.javaClassBlueprint && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-[#8b5cf6]" /> Java Class Blueprint
                    </h3>
                    <div className="rounded-xl overflow-hidden border border-[#262626]">
                      <div className="bg-[#1a1a1a] px-4 py-2 border-b border-[#262626] flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-[#ef4743]" />
                          <div className="w-3 h-3 rounded-full bg-[#ffc01e]" />
                          <div className="w-3 h-3 rounded-full bg-[#00b8a3]" />
                        </div>
                        <span className="text-xs text-[#8c8c8c] ml-2">DataStructure.java</span>
                      </div>
                      <CodeHighlighter code={learningNotes.technicalAnatomy.javaClassBlueprint} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Operations */}
            {Array.isArray(learningNotes.operations) && learningNotes.operations.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ffa116] to-[#ff8c00] flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-black" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Operations</h2>
                </div>
                
                <div className="space-y-8">
                  {learningNotes.operations.map((op, i) => (
                    <div key={i} className="relative overflow-hidden rounded-2xl bg-[#1a1a1a] border border-[#262626] p-6">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#ffa116]/5 to-transparent rounded-full blur-xl" />
                      
                      {/* Operation Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-[#ffa116]/20 flex items-center justify-center text-sm font-bold text-[#ffa116]">
                            {i + 1}
                          </span>
                          {op.name}
                        </h3>
                        {op.timeComplexity && (
                          <div className="flex gap-2 text-xs">
                            <span className="px-2 py-1 rounded bg-[#00b8a3]/10 text-[#00b8a3]">
                              Best: {op.timeComplexity.best}
                            </span>
                            <span className="px-2 py-1 rounded bg-[#ffc01e]/10 text-[#ffc01e]">
                              Avg: {op.timeComplexity.average}
                            </span>
                            <span className="px-2 py-1 rounded bg-[#ef4743]/10 text-[#ef4743]">
                              Worst: {op.timeComplexity.worst}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Explanation */}
                      <p className="text-[#b8b8b8] leading-relaxed mb-4">{op.explanation}</p>
                      
                      {/* Edge Cases */}
                      {Array.isArray(op.edgeCases) && op.edgeCases.length > 0 && (
                        <div className="mb-4">
                          <span className="text-sm font-bold text-[#ffc01e] uppercase tracking-wider mb-2 block">Edge Cases</span>
                          <div className="flex flex-wrap gap-2">
                            {op.edgeCases.map((edge, j) => (
                              <span key={j} className="text-xs px-3 py-1.5 rounded-full bg-[#ffc01e]/10 text-[#ffc01e] border border-[#ffc01e]/20">
                                {edge}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Code */}
                      {op.code && (
                        <div className="rounded-xl overflow-hidden border border-[#262626]">
                          <div className="bg-[#0f0f0f] px-4 py-2 border-b border-[#262626] flex items-center gap-2">
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-[#ef4743]" />
                              <div className="w-3 h-3 rounded-full bg-[#ffc01e]" />
                              <div className="w-3 h-3 rounded-full bg-[#00b8a3]" />
                            </div>
                            <span className="text-xs text-[#8c8c8c] ml-2">{op.name}.java</span>
                          </div>
                          <CodeHighlighter code={op.code} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Complexity Table */}
            {learningNotes.complexityTable && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#ef4743]/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#ef4743]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Complexity Analysis</h2>
                </div>
                
                <div className="rounded-xl overflow-hidden border border-[#262626]">
                  <table className="w-full">
                    <thead className="bg-[#1a1a1a]">
                      <tr>
                        {learningNotes.complexityTable.headers?.map((header, i) => (
                          <th key={i} className="px-4 py-3 text-left text-sm font-bold text-[#8c8c8c] uppercase tracking-wider border-b border-[#262626]">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-[#0f0f0f]">
                      {learningNotes.complexityTable.rows?.map((row, i) => (
                        <tr key={i} className="border-b border-[#262626] hover:bg-[#1a1a1a] transition-colors">
                          {row.map((cell, j) => (
                            <td key={j} className={`px-4 py-3 text-sm ${j === 0 ? 'font-semibold text-white' : 'text-[#b8b8b8] font-mono'}`}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {learningNotes.complexityTable.explanation && (
                  <p className="text-[#8c8c8c] text-sm leading-relaxed p-4 bg-[#1a1a1a] rounded-xl border border-[#262626]">
                    {learningNotes.complexityTable.explanation}
                  </p>
                )}
              </div>
            )}

            {/* Industry Applications */}
            {Array.isArray(learningNotes.industryApplications) && learningNotes.industryApplications.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00b8a3]/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#00b8a3]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Industry Applications</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {learningNotes.industryApplications.map((app, i) => (
                    <div key={i} className="p-5 rounded-xl bg-[#1a1a1a] border border-[#262626] hover:border-[#00b8a3]/30 transition-colors">
                      <h4 className="font-bold text-white mb-2">{app.application}</h4>
                      <p className="text-[#8c8c8c] text-sm leading-relaxed mb-3">{app.explanation}</p>
                      {Array.isArray(app.companies) && app.companies.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {app.companies.map((company, j) => (
                            <span key={j} className="text-xs px-2 py-1 rounded bg-[#00b8a3]/10 text-[#00b8a3]">
                              {company}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interview Problems */}
            {Array.isArray(learningNotes.interviewProblems) && learningNotes.interviewProblems.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#8b5cf6]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Interview Problems</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {learningNotes.interviewProblems.map((prob, i) => (
                    <div key={i} className="p-5 rounded-xl bg-[#1a1a1a] border border-[#262626]">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-white">{prob.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          prob.difficulty === 'Easy' ? 'bg-[#00b8a3]/10 text-[#00b8a3]' :
                          prob.difficulty === 'Medium' ? 'bg-[#ffc01e]/10 text-[#ffc01e]' :
                          'bg-[#ef4743]/10 text-[#ef4743]'
                        }`}>{prob.difficulty}</span>
                      </div>
                      {prob.leetcodeNumber && (
                        <span className="text-xs text-[#8c8c8c]">LeetCode #{prob.leetcodeNumber}</span>
                      )}
                      <p className="text-[#b8b8b8] text-sm mt-2">{prob.whyThisProblem}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mastery Checklist */}
            {Array.isArray(learningNotes.masteryChecklist) && learningNotes.masteryChecklist.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#ffa116]/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-[#ffa116]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Mastery Checklist</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {learningNotes.masteryChecklist.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[#1a1a1a] border border-[#262626]">
                      <div className="w-6 h-6 rounded border-2 border-[#ffa116] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs text-[#ffa116]">✓</span>
                      </div>
                      <span className="text-[#c4c4c4] leading-relaxed">{typeof item === 'string' ? item : item.content || JSON.stringify(item)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Common Mistakes & Pro Tips for Topics */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Common Mistakes */}
              {Array.isArray(learningNotes.commonMistakes) && learningNotes.commonMistakes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#ef4743]/10 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-[#ef4743]" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Common Mistakes</h2>
                  </div>
                  <div className="space-y-3">
                    {learningNotes.commonMistakes.map((m, i) => (
                      <div key={i} className="p-5 rounded-xl bg-gradient-to-r from-[#ef4743]/10 to-[#1a1a1a] border border-[#ef4743]/20">
                        <h4 className="font-bold text-[#ef4743] mb-2">{m.mistake || m}</h4>
                        {m.why && <p className="text-sm text-[#8c8c8c] mb-1"><span className="text-[#b8b8b8]">Why:</span> {m.why}</p>}
                        {m.consequence && <p className="text-sm text-[#8c8c8c] mb-1"><span className="text-[#b8b8b8]">Consequence:</span> {m.consequence}</p>}
                        {m.fix && <p className="text-sm text-[#00b8a3]"><span className="text-[#b8b8b8]">Fix:</span> {m.fix}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pro Tips */}
              {Array.isArray(learningNotes.proTips) && learningNotes.proTips.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#ffa116]/10 flex items-center justify-center">
                      <Star className="w-5 h-5 text-[#ffa116]" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Pro Tips</h2>
                  </div>
                  <div className="space-y-3">
                    {learningNotes.proTips.map((t, i) => (
                      <div key={i} className="p-5 rounded-xl bg-gradient-to-r from-[#ffa116]/10 to-[#1a1a1a] border border-[#ffa116]/20">
                        <h4 className="font-bold text-[#ffa116] mb-2">{t.tip || 'Pro Tip'}</h4>
                        <p className="text-[#c4c4c4] leading-relaxed">{t.content || t}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PATTERN-SPECIFIC RENDERING (Algorithmic Techniques) */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {learningNotes.type !== 'topic' && (
          <>

        {/* When to Use - Enhanced Cards */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00b8a3]/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-[#00b8a3]" />
            </div>
            <h2 className="text-2xl font-bold text-white">When to Use</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-[#262626] to-transparent ml-4" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.isArray(learningNotes.whenToUse) && learningNotes.whenToUse.map((signal, i) => {
              const isGoldenRule = typeof signal === 'string' && (signal.includes('GOLDEN RULE') || signal.includes('90%'));
              return (
                <div 
                  key={i} 
                  className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-[1.01] ${
                    isGoldenRule 
                      ? 'bg-gradient-to-r from-[#ffa116]/10 to-[#1a1a1a] border-[#ffa116]/30 hover:border-[#ffa116]/50' 
                      : 'bg-[#1a1a1a] border-[#262626] hover:border-[#404040]'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${isGoldenRule ? 'from-[#ffa116]/5' : 'from-[#00b8a3]/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative flex items-start gap-4 p-5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isGoldenRule ? 'bg-[#ffa116]/20' : 'bg-[#00b8a3]/20'
                    }`}>
                      {isGoldenRule ? (
                        <Trophy className="w-4 h-4 text-[#ffa116]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#00b8a3]" />
                      )}
                    </div>
                    <span className="text-[#c4c4c4] text-base leading-relaxed">
                      {typeof signal === 'string' ? signal : JSON.stringify(signal)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Complexity - Visual Cards Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#8b5cf6]" />
            </div>
            <h2 className="text-2xl font-bold text-white">Complexity Analysis</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-[#262626] to-transparent ml-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Time Complexity */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#ffa116]/10 to-[#1a1a1a] border border-[#ffa116]/20 p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#ffa116]/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-[#ffa116]" />
                  <span className="text-sm font-semibold text-[#ffa116] uppercase tracking-wider">Time</span>
                </div>
                <p className="text-lg text-white font-mono leading-relaxed">{learningNotes.complexity?.time}</p>
              </div>
            </div>

            {/* Space Complexity */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#00b8a3]/10 to-[#1a1a1a] border border-[#00b8a3]/20 p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#00b8a3]/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-5 h-5 text-[#00b8a3]" />
                  <span className="text-sm font-semibold text-[#00b8a3] uppercase tracking-wider">Space</span>
                </div>
                <p className="text-lg text-white font-mono leading-relaxed">{learningNotes.complexity?.space}</p>
              </div>
            </div>
          </div>

          {/* Best/Worst Case */}
          {(learningNotes.complexity?.bestCase || learningNotes.complexity?.worstCase) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learningNotes.complexity?.bestCase && (
                <div className="rounded-xl bg-[#1a1a1a] border border-[#262626] p-5">
                  <span className="text-sm font-medium text-[#00b8a3] block mb-2">Best Case Scenario</span>
                  <p className="text-[#b8b8b8] leading-relaxed">{learningNotes.complexity.bestCase}</p>
                </div>
              )}
              {learningNotes.complexity?.worstCase && (
                <div className="rounded-xl bg-[#1a1a1a] border border-[#262626] p-5">
                  <span className="text-sm font-medium text-[#ef4743] block mb-2">Worst Case Scenario</span>
                  <p className="text-[#b8b8b8] leading-relaxed">{learningNotes.complexity.worstCase}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Core Approach - Premium Styled */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#262626] p-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzI2MjYyNiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiBvcGFjaXR5PSIwLjMiLz48L3N2Zz4=')] opacity-30" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ffa116] to-[#ff8c00] flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-black" />
              </div>
              <h2 className="text-2xl font-bold text-white">Approach</h2>
            </div>
          
            <div className="space-y-10">
              {/* Intuition - Highlighted Quote Style */}
              {learningNotes.coreApproach?.intuition && (
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-[#ffa116] via-[#ffa116]/50 to-transparent rounded-full" />
                  <div className="pl-6 py-4">
                    <h3 className="text-lg font-bold text-[#ffa116] mb-4 flex items-center gap-2">
                      <Terminal className="w-5 h-5" />
                      Core Intuition
                    </h3>
                    <p className="text-[#d4d4d4] text-lg leading-[1.9] italic">
                      "{learningNotes.coreApproach.intuition}"
                    </p>
                  </div>
                </div>
              )}

              {/* Steps - Timeline Style */}
              {Array.isArray(learningNotes.coreApproach?.steps) && learningNotes.coreApproach.steps.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-[#00b8a3]" />
                    Step-by-Step Process
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {learningNotes.coreApproach.steps.map((step, i) => (
                      <div key={i} className="relative flex items-start gap-5 group">
                        {/* Step number circle */}
                        <div className="relative z-10 w-10 h-10 rounded-full bg-[#0a0a0a] border-2 border-[#ffa116] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-[#00b8a3] transition-all duration-300">
                          <span className="text-sm font-bold text-[#ffa116] group-hover:text-[#00b8a3] transition-colors">{i + 1}</span>
                        </div>
                        {/* Step content */}
                        <div className="flex-1 p-5 rounded-xl bg-[#0f0f0f] border border-[#262626] group-hover:border-[#404040] transition-colors">
                          <p className="text-[#c4c4c4] leading-relaxed">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Edge Cases */}
              {Array.isArray(learningNotes.coreApproach?.edgeCases) && learningNotes.coreApproach.edgeCases.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-[#ffc01e]" />
                    Edge Cases to Handle
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {learningNotes.coreApproach.edgeCases.map((edge, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[#ffc01e]/5 border border-[#ffc01e]/20 hover:border-[#ffc01e]/40 transition-colors">
                        <AlertCircle className="w-5 h-5 text-[#ffc01e]" />
                        <span className="text-[#b8b8b8] leading-relaxed text-sm">{edge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pseudocode */}
              {learningNotes.coreApproach?.pseudocode && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-[#8b5cf6]" />
                    Pseudocode Template
                  </h3>
                  <div className="rounded-xl overflow-hidden border border-[#262626] shadow-lg shadow-black/20">
                    <div className="bg-[#1a1a1a] px-4 py-2 border-b border-[#262626] flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#ef4743]" />
                        <div className="w-3 h-3 rounded-full bg-[#ffc01e]" />
                        <div className="w-3 h-3 rounded-full bg-[#00b8a3]" />
                      </div>
                      <span className="text-xs text-[#8c8c8c] ml-2">template.py</span>
                    </div>
                    <CodeHighlighter code={learningNotes.coreApproach.pseudocode} language="python" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Example Problems - Card Gallery */}
        {Array.isArray(learningNotes.exampleProblems) && learningNotes.exampleProblems.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#ef4743]/10 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-[#ef4743]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Example Problems</h2>
              <span className="px-2.5 py-1 rounded-full bg-[#262626] text-xs text-[#8c8c8c]">{learningNotes.exampleProblems.length} problems</span>
              <div className="flex-1 h-px bg-gradient-to-r from-[#262626] to-transparent ml-4" />
            </div>

            <div className="space-y-6">
              {learningNotes.exampleProblems.map((problem, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#262626] hover:border-[#404040] transition-all duration-300">
                  {/* Difficulty accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    problem.difficulty === 'Easy' ? 'bg-gradient-to-r from-[#00b8a3] to-[#00b8a3]/50' :
                    problem.difficulty === 'Medium' ? 'bg-gradient-to-r from-[#ffc01e] to-[#ffc01e]/50' :
                    'bg-gradient-to-r from-[#ef4743] to-[#ef4743]/50'
                  }`} />
                  
                  <div className="p-8">
                    {/* Problem Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-white group-hover:text-[#ffa116] transition-colors">{problem.name}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${
                            problem.difficulty === 'Easy' ? 'bg-[#00b8a3]/20 text-[#00b8a3]' :
                            problem.difficulty === 'Medium' ? 'bg-[#ffc01e]/20 text-[#ffc01e]' :
                            'bg-[#ef4743]/20 text-[#ef4743]'
                          }`}>{problem.difficulty}</span>
                          {Array.isArray(problem.companies) && problem.companies.map((company, j) => (
                            <span key={j} className="text-xs px-3 py-1.5 rounded-full bg-[#262626] text-[#8c8c8c] hover:bg-[#404040] transition-colors">
                              {company}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[#b8b8b8] leading-[1.8] mb-6">
                      {problem.description}
                    </p>

                    {/* Strategy Box */}
                    {problem.intuition && (
                      <div className="relative mb-6 p-5 rounded-xl bg-gradient-to-r from-[#00b8a3]/10 to-transparent border-l-4 border-[#00b8a3]">
                        <span className="text-xs font-bold text-[#00b8a3] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Lightbulb className="w-4 h-4" /> Strategy</span>
                        <p className="text-[#c4c4c4] leading-relaxed">{problem.intuition}</p>
                      </div>
                    )}
                    
                    {/* Code Block */}
                    <div className="rounded-xl overflow-hidden border border-[#262626] shadow-lg shadow-black/20">
                      <div className="bg-[#1a1a1a] px-4 py-2 border-b border-[#262626] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-[#ef4743]" />
                            <div className="w-3 h-3 rounded-full bg-[#ffc01e]" />
                            <div className="w-3 h-3 rounded-full bg-[#00b8a3]" />
                          </div>
                          <span className="text-xs text-[#8c8c8c] ml-2">Solution.java</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          problem.difficulty === 'Easy' ? 'bg-[#00b8a3]/20 text-[#00b8a3]' :
                          problem.difficulty === 'Medium' ? 'bg-[#ffc01e]/20 text-[#ffc01e]' :
                          'bg-[#ef4743]/20 text-[#ef4743]'
                        }`}>{problem.difficulty}</span>
                      </div>
                      <CodeHighlighter code={problem.code} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Mistakes & Pro Tips - Side by Side on Large Screens */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Common Mistakes */}
          {Array.isArray(learningNotes.commonMistakes) && learningNotes.commonMistakes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#ef4743]/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-[#ef4743]" />
                </div>
                <h2 className="text-xl font-bold text-white">Common Mistakes</h2>
              </div>
              <div className="space-y-3">
                {learningNotes.commonMistakes.map((mistake, i) => (
                  <div key={i} className="group flex items-start gap-4 p-5 rounded-xl bg-gradient-to-r from-[#ef4743]/10 to-[#1a1a1a] border border-[#ef4743]/20 hover:border-[#ef4743]/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-[#ef4743]/20 flex items-center justify-center shrink-0">
                      <X className="w-4 h-4 text-[#ef4743]" />
                    </div>
                    <span className="text-[#c4c4c4] leading-relaxed">{mistake}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pro Tips */}
          {Array.isArray(learningNotes.proTips) && learningNotes.proTips.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#ffa116]/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[#ffa116]" />
                </div>
                <h2 className="text-xl font-bold text-white">Pro Tips</h2>
              </div>
              <div className="space-y-3">
                {learningNotes.proTips.map((tip, i) => (
                  <div key={i} className="group flex items-start gap-4 p-5 rounded-xl bg-gradient-to-r from-[#ffa116]/10 to-[#1a1a1a] border border-[#ffa116]/20 hover:border-[#ffa116]/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-[#ffa116]/20 flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 text-[#ffa116] fill-[#ffa116]" />
                    </div>
                    <span className="text-[#c4c4c4] leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
          </>
        )}

        {/* Motivational Quote at bottom */}
        <div className="mt-8">
          <MotivationalQuote category="Learning" variant="card" className="!bg-[#1a1a1a] !border-[#262626]" />
        </div>

      </div>
    </div>
  );
}

export default LearnPage;

