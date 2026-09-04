import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  BookOpen, 
  Zap, 
  X, 
  Target, 
  Brain, 
  ChevronRight, 
  Activity, 
  Code2, 
  Clock, 
  Terminal, 
  Lightbulb, 
  Trophy, 
  AlertCircle, 
  Star, 
  CheckCircle, 
  Database, 
  Layers, 
  Building2, 
  Hash, 
  List, 
  GitBranch, 
  Network, 
  Box, 
  Search, 
  LayoutList, 
  GitMerge, 
  RefreshCcw, 
  Cpu,
  Copy,
  Check,
  Compass,
  ArrowRight,
  ShieldAlert,
  Flame,
  CheckSquare,
  Square,
  TrendingUp,
  FileCode,
  Sparkles,
  Workflow
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../utils/api';
import SearchableSelect from '../components/ui/SearchableSelect';
import CodeHighlighter from '../components/ui/CodeHighlighter';
import { DSA_PATTERNS, DSA_TOPICS } from '../utils/dsaConstants';
import { auth } from '../config/firebase';
import MotivationalQuote from '../components/ui/MotivationalQuote';

// Quick Copy Component
function CopyButton({ text, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
        copied 
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
          : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
      } ${className}`}
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      <span>{copied ? 'Copied!' : label}</span>
    </button>
  );
}

// Interactive Mastery Checklist
function InteractiveMasteryChecklist({ items = [], storageKey = 'dsa_checklist' }) {
  const [checked, setChecked] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggle = (idx) => {
    setChecked((prev) => {
      const updated = { ...prev, [idx]: !prev[idx] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  const completedCount = items.filter((_, idx) => checked[idx]).length;
  const pct = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Interview Mastery Checklist</h2>
            <p className="text-xs text-gray-400">Validate your competence against senior interview benchmarks</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            {completedCount} of {items.length} ({pct}%)
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item, idx) => {
          const isDone = Boolean(checked[idx]);
          const text = typeof item === 'string' ? item : item.content || JSON.stringify(item);
          return (
            <div
              key={idx}
              onClick={() => toggle(idx)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-[#141414] border-[#262626] hover:border-dark-600 text-gray-300'
              }`}
            >
              <div className="mt-0.5">
                {isDone ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-dark-500 shrink-0" />
                )}
              </div>
              <span className={`text-xs leading-relaxed ${isDone ? 'line-through opacity-80' : ''}`}>
                {text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LearnPage() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  // Selection State
  const [learnPattern, setLearnPattern] = useState('');
  const [learnTopic, setLearnTopic] = useState('');
  
  // Content State
  const [learningNotes, setLearningNotes] = useState(null);

  // Tab View Filter
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'beginner' | 'implementation' | 'advanced' | 'interview'

  // Selected Operation in DS
  const [selectedOpIdx, setSelectedOpIdx] = useState(0);

  // Selected Solved Problem in Pattern / Algo
  const [selectedProbIdx, setSelectedProbIdx] = useState(0);

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

  const executeFetch = async (targetPattern, targetTopic) => {
    if (!targetPattern && !targetTopic) return;
    if (cooldown > 0) return;

    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await api.post('/ai/learning-notes', {
        pattern: targetPattern || undefined,
        topic: targetTopic || undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLearningNotes(response.data);
      setSelectedOpIdx(0);
      setSelectedProbIdx(0);
      
      const whitelist = (import.meta.env.VITE_WHITELISTED_EMAILS || '').split(',').map(e => e.trim());
      const isWhitelisted = user?.email && whitelist.includes(user.email);
      
      if (!isWhitelisted) {
        setCooldown(30);
      }
    } catch (error) {
      console.error('Failed to generate learning notes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sync URL parameters on mount
  useEffect(() => {
    const urlPattern = searchParams.get('pattern');
    const urlTopic = searchParams.get('topic');
    const auto = searchParams.get('auto') === 'true';

    if (urlPattern) {
      setLearnPattern(urlPattern);
      if (auto) executeFetch(urlPattern, null);
    } else if (urlTopic) {
      setLearnTopic(urlTopic);
      if (auto) executeFetch(null, urlTopic);
    }
  }, [searchParams]);

  const handleGenerateLearningNotes = () => {
    executeFetch(learnPattern, learnTopic);
  };

  const handleReset = () => {
    setLearningNotes(null);
    setLearnPattern('');
    setLearnTopic('');
    setSelectedOpIdx(0);
    setSelectedProbIdx(0);
    setActiveTab('all');
    setSearchParams({});
  };

  // ═══════════════════════════════════════════════════════════════
  // ROADMAP SELECTION VIEW
  // ═══════════════════════════════════════════════════════════════
  if (!learningNotes) {
    return (
      <div className="min-h-full bg-canvas overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-6 pb-4 border-b border-border">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
                  <Brain className="w-6 h-6 text-brand-orange" />
                  Algorithmic Architecture & Study Guide
                </h1>
                <p className="text-xs text-foreground-muted mt-1">
                  Tailored technical guides engineered specifically for Data Structures, Algorithms, and Interview Patterns.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground-subtle bg-surface px-3 py-1.5 rounded-lg border border-border">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Beginner intuition to Senior Staff FAANG depth</span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-surface border border-border rounded-xl p-5 mb-8 shadow-inner-rim">
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-semibold text-foreground-subtle uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  Data Structure / Algorithm Topic
                </label>
                <SearchableSelect
                  options={DSA_TOPICS}
                  value={learnTopic}
                  onChange={(val) => {
                    setLearnTopic(val);
                    if (val) setLearnPattern('');
                  }}
                  placeholder="Select a topic (e.g. Binary Search, Trie, Graph)..."
                  className="!bg-surface-raised !border-border !text-foreground"
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-semibold text-foreground-subtle uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  Algorithmic Pattern Paradigm
                </label>
                <SearchableSelect
                  options={DSA_PATTERNS}
                  value={learnPattern}
                  onChange={(val) => {
                    setLearnPattern(val);
                    if (val) setLearnTopic('');
                  }}
                  placeholder="Select a pattern (e.g. Two Pointers, Sliding Window)..."
                  className="!bg-surface-raised !border-border !text-foreground"
                />
              </div>
              <button
                onClick={handleGenerateLearningNotes}
                disabled={loading || (!learnPattern && !learnTopic) || cooldown > 0}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-surface-elevated disabled:text-foreground-subtle text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-xs min-w-[150px] shadow-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : cooldown > 0 ? (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    <span>Wait {cooldown}s</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Generate Deep Guide</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Access Section - Popular Topics */}
          <div className="space-y-4 mb-8">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" /> 
              Data Structures & Fundamental Algorithms
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { name: 'Arrays & Memory', id: 'Array', icon: LayoutList, color: '#00b8a3' },
                { name: 'Strings', id: 'String', icon: Code2, color: '#ffc01e' },
                { name: 'Hash Table', id: 'Hash Table', icon: Hash, color: '#ffa116' },
                { name: 'Binary Search', id: 'Binary Search', icon: Search, color: '#38bdf8' },
                { name: 'Linked List', id: 'LinkedList', icon: List, color: '#ffa116' },
                { name: 'Trees & BST', id: 'Tree', icon: GitBranch, color: '#10b981' },
                { name: 'Graphs', id: 'Graph', icon: Network, color: '#8b5cf6' },
                { name: 'Stack & Monotonic', id: 'Stack', icon: Layers, color: '#ef4444' },
                { name: 'Heaps & Priority', id: 'Heap (Priority Queue)', icon: Box, color: '#a855f7' },
                { name: 'Dynamic Programming', id: 'Dynamic Programming', icon: Activity, color: '#f43f5e' },
                { name: 'Union Find / DSU', id: 'Union Find', icon: GitMerge, color: '#06b6d4' },
                { name: 'Trie / Prefix Tree', id: 'Trie', icon: Network, color: '#ec4899' },
                { name: 'Backtracking', id: 'Backtracking', icon: GitMerge, color: '#f59e0b' },
                { name: 'Greedy Strategy', id: 'Greedy', icon: Target, color: '#14b8a6' },
                { name: 'Bit Manipulation', id: 'Bit Manipulation', icon: Cpu, color: '#6366f1' }
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setLearnTopic(item.id);
                    setLearnPattern('');
                  }}
                  className={`group p-3 bg-[#171717] border rounded-xl text-left transition-all hover:bg-[#222222] ${
                    learnTopic === item.id ? 'border-brand-orange bg-[#222222] shadow-sm' : 'border-[#262626]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#222] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors truncate">{item.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Access Section - Popular Patterns */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-400" />
              High-Frequency Algorithmic Patterns
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { name: 'Two Pointers', id: 'Two Pointers', icon: Target, color: '#00b8a3' },
                { name: 'Sliding Window', id: 'Sliding Window', icon: Activity, color: '#ffc01e' },
                { name: 'Merge Intervals', id: 'Merge Intervals', icon: GitMerge, color: '#ffa116' },
                { name: 'Cyclic Sort', id: 'Cyclic Sort', icon: RefreshCcw, color: '#ef4743' },
                { name: 'Fast & Slow Pointers', id: 'Fast & Slow Pointers', icon: Activity, color: '#8b5cf6' },
                { name: 'Two Heaps', id: 'Two Heaps', icon: Layers, color: '#00b8a3' },
                { name: 'Topological Sort', id: 'Topological Sort (Graph)', icon: Network, color: '#ffc01e' },
                { name: 'Monotonic Stack', id: 'Monotonic Stack', icon: Layers, color: '#ef4743' },
                { name: 'Kadane Algorithm', id: "Kadane's Algorithm", icon: TrendingUp, color: '#8b5cf6' },
                { name: 'Tree BFS (Level Order)', id: 'Tree Breadth First Search', icon: Network, color: '#00b8a3' },
                { name: 'Tree DFS (Path Sum)', id: 'Tree Depth First Search', icon: GitBranch, color: '#ffc01e' },
                { name: 'Subsets & Combinations', id: 'Subsets', icon: Layers, color: '#ffa116' },
                { name: 'Modified Binary Search', id: 'Modified Binary Search', icon: Search, color: '#ef4743' },
                { name: 'Top K Elements', id: 'Top K Elements', icon: Box, color: '#8b5cf6' },
                { name: '0/1 Knapsack DP', id: '0/1 Knapsack', icon: Activity, color: '#ec4899' }
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setLearnPattern(item.id);
                    setLearnTopic('');
                  }}
                  className={`group p-3 bg-[#171717] border rounded-xl text-left transition-all hover:bg-[#222222] ${
                    learnPattern === item.id ? 'border-emerald-400 bg-[#222222] shadow-sm' : 'border-[#262626]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#222] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors truncate">{item.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Motivational Quote */}
          <div className="mt-8">
            <MotivationalQuote category="Learning" variant="card" className="!bg-[#171717] !border-[#262626]" />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // ACTIVE STUDY GUIDE DISPLAY (Archetype Normalized)
  // ═══════════════════════════════════════════════════════════════
  const isDataStructure = learningNotes.type === 'data_structure';
  const isAlgorithm = learningNotes.type === 'algorithm';
  const isPattern = learningNotes.type === 'pattern';
  const isLegacyTopic = learningNotes.type === 'topic';

  // Extract archetype parts
  const beginner = learningNotes.beginnerTrack || {};
  const advanced = learningNotes.advancedTrack || {};
  const playbook = learningNotes.interviewPlaybook || {};
  const operations = learningNotes.coreOperations || learningNotes.operations || [];
  const canonicalProbs = playbook.canonicalProblems || playbook.solvedProblems || learningNotes.interviewProblems || learningNotes.exampleProblems || [];
  const checklist = playbook.masteryChecklist || learningNotes.masteryChecklist || [];

  return (
    <div className="p-0 h-full overflow-y-auto custom-scrollbar bg-canvas text-foreground">
      <div className="relative w-full px-4 sm:px-6 lg:px-10 py-8 space-y-8 max-w-7xl mx-auto">
        
        {/* Top Header Card */}
        <div className="relative overflow-hidden rounded-2xl bg-surface border border-border p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                  isDataStructure 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : isAlgorithm
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {isDataStructure && <Database className="w-3 h-3" />}
                  {isAlgorithm && <GitBranch className="w-3 h-3" />}
                  {isPattern && <Target className="w-3 h-3" />}
                  {isDataStructure ? 'Data Structure Architecture' : isAlgorithm ? 'Algorithm Deep-Dive' : 'Algorithmic Pattern'}
                </span>

                {(learningNotes.category || learningNotes.paradigm) && (
                  <span className="text-[10px] font-semibold text-foreground-muted bg-surface-raised px-2.5 py-1 rounded-md border border-border">
                    {learningNotes.category || learningNotes.paradigm}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-3xl font-black text-foreground tracking-tight">
                {learningNotes.title}
              </h1>
              <p className="text-xs text-foreground-muted">
                Engineered for both intuitive mechanical clarity and Senior/Staff interview rigor.
              </p>
            </div>
            
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button 
                onClick={handleReset}
                className="px-3.5 py-2 bg-surface-raised border border-border rounded-xl text-foreground-subtle hover:text-foreground hover:bg-surface-hover transition-all flex items-center gap-1.5 text-xs group"
              >
                <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                <span>Roadmaps</span>
              </button>
            </div>
          </div>

          {/* Navigation Mode Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Sections', icon: Sparkles },
              { id: 'beginner', label: '1. Intuition & Foundations', icon: Lightbulb },
              { id: 'implementation', label: '2. Mechanics & Code', icon: FileCode },
              { id: 'advanced', label: '3. Advanced & Invariants', icon: Cpu },
              { id: 'interview', label: '4. Interview Playbook', icon: Trophy }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-raised text-foreground-subtle hover:text-foreground hover:bg-surface-hover border border-border'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c1c1c] to-[#121212] border border-[#2b2b2b] p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-1">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">Executive Overview</h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {learningNotes.overview}
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 1: BEGINNER TRACK (Intuition, Analogies, Visuals)    */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'beginner') && (
          <section className="space-y-6">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Foundations & Physical Intuition
              </h2>
              <span className="text-[11px] text-foreground-muted ml-2">Beginner Track</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Definition / ELI5 */}
              {(beginner.eli5Definition || beginner.coreIntuition || learningNotes.conceptFoundation?.definition) && (
                <div className="p-5 rounded-xl bg-surface border border-border">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" /> Core Concept & Mental Leap
                  </span>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {beginner.eli5Definition || beginner.coreIntuition || learningNotes.conceptFoundation?.definition}
                  </p>
                </div>
              )}

              {/* Real World Analogy */}
              {(beginner.realWorldAnalogy || learningNotes.conceptFoundation?.realWorldAnalogy) && (
                <div className="p-5 rounded-xl bg-surface border border-border">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Real-World Physical Analogy
                  </span>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {beginner.realWorldAnalogy || learningNotes.conceptFoundation?.realWorldAnalogy}
                  </p>
                </div>
              )}

              {/* Why It Exists / Why Brute Force Fails */}
              {(beginner.whyItExists || beginner.whyBruteForceFails || learningNotes.conceptFoundation?.whyItExists) && (
                <div className="md:col-span-2 p-5 rounded-xl bg-rose-500/5 border border-rose-500/20">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" /> Why Simpler / Naive Approaches Fail
                  </span>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {beginner.whyItExists || beginner.whyBruteForceFails || learningNotes.conceptFoundation?.whyItExists}
                  </p>
                </div>
              )}
            </div>

            {/* ASCII Memory Layout (Data Structure) or ASCII Diagram (Pattern) */}
            {(beginner.memoryLayoutAscii || beginner.visualDiagramAscii || learningNotes.conceptFoundation?.visualDescription) && (
              <div className="rounded-xl overflow-hidden bg-[#0d0d0d] border border-[#262626]">
                <div className="bg-[#171717] px-4 py-2.5 border-b border-[#262626] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-xs font-mono text-gray-400 ml-2">
                      {isDataStructure ? 'physical_ram_memory_layout.txt' : 'pattern_visual_trace.txt'}
                    </span>
                  </div>
                  <CopyButton text={beginner.memoryLayoutAscii || beginner.visualDiagramAscii || learningNotes.conceptFoundation?.visualDescription} label="Copy Layout" />
                </div>
                <pre className="p-5 text-emerald-300 font-mono text-xs sm:text-sm overflow-x-auto whitespace-pre leading-relaxed custom-scrollbar">
                  {beginner.memoryLayoutAscii || beginner.visualDiagramAscii || learningNotes.conceptFoundation?.visualDescription}
                </pre>
              </div>
            )}

            {/* Visual Step-by-Step State Trace (Algorithm) */}
            {isAlgorithm && beginner.visualTrace?.steps && beginner.visualTrace.steps.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    Step-by-Step Execution Trace
                  </h3>
                  {beginner.visualTrace.sampleInput && (
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-surface border border-border text-foreground-muted">
                      Input: {beginner.visualTrace.sampleInput}
                    </span>
                  )}
                </div>

                <div className="rounded-xl overflow-hidden border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-raised border-b border-border text-foreground-subtle font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Phase / Step</th>
                        <th className="px-4 py-3">Pointers / State</th>
                        <th className="px-4 py-3">Action / Decision</th>
                        <th className="px-4 py-3">Remaining Space</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                      {beginner.visualTrace.steps.map((st, sIdx) => (
                        <tr key={sIdx} className="hover:bg-surface-hover transition-colors">
                          <td className="px-4 py-3 font-semibold text-primary">{st.phase}</td>
                          <td className="px-4 py-3 font-mono text-foreground-muted">{st.state}</td>
                          <td className="px-4 py-3 text-foreground font-medium">{st.action}</td>
                          <td className="px-4 py-3 font-mono text-foreground-subtle">{st.remaining}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 2: MECHANICS & IMPLEMENTATION (Code & Operations)     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'implementation') && (
          <section className="space-y-6">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <FileCode className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Architecture, Operations & Production Templates
              </h2>
              <span className="text-[11px] text-foreground-muted ml-2">Implementation</span>
            </div>

            {/* DATA STRUCTURE: Interactive Operations Explorer */}
            {isDataStructure && operations.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {operations.map((op, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => setSelectedOpIdx(oIdx)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
                        selectedOpIdx === oIdx
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'bg-surface border border-border text-foreground-subtle hover:text-foreground'
                      }`}
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>{op.name}</span>
                    </button>
                  ))}
                </div>

                {operations[selectedOpIdx] && (
                  <div className="p-6 rounded-2xl bg-surface border border-border space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">
                          {operations[selectedOpIdx].name}
                        </h3>
                        <p className="text-xs text-foreground-muted mt-0.5">
                          {operations[selectedOpIdx].stepByStepExplanation}
                        </p>
                      </div>

                      {/* Complexity Badges */}
                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        {operations[selectedOpIdx].timeComplexity && (
                          <>
                            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                              Best: {operations[selectedOpIdx].timeComplexity.best || 'O(1)'}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                              Avg: {operations[selectedOpIdx].timeComplexity.average || 'O(1)'}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                              Worst: {operations[selectedOpIdx].timeComplexity.worst || 'O(N)'}
                            </span>
                          </>
                        )}
                        {operations[selectedOpIdx].spaceComplexity && (
                          <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                            Space: {operations[selectedOpIdx].spaceComplexity}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Edge Cases */}
                    {Array.isArray(operations[selectedOpIdx].edgeCases) && operations[selectedOpIdx].edgeCases.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-foreground-subtle uppercase tracking-wider font-semibold">Edge Guards:</span>
                        {operations[selectedOpIdx].edgeCases.map((ec, ecIdx) => (
                          <span key={ecIdx} className="text-xs px-2.5 py-0.5 rounded-full bg-surface-raised border border-border text-foreground-muted">
                            {ec}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Code */}
                    {operations[selectedOpIdx].code && (
                      <div className="rounded-xl overflow-hidden border border-border">
                        <div className="bg-[#171717] px-4 py-2 border-b border-[#262626] flex items-center justify-between">
                          <span className="text-xs font-mono text-gray-400">Java 17 Clean Implementation</span>
                          <CopyButton text={operations[selectedOpIdx].code} label="Copy Method" />
                        </div>
                        <CodeHighlighter code={operations[selectedOpIdx].code} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ALGORITHM: Production Template with Line-by-Line Notes */}
            {isAlgorithm && learningNotes.productionTemplate && (
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-border">
                  <div className="bg-[#171717] px-4 py-2.5 border-b border-[#262626] flex items-center justify-between">
                    <span className="text-xs font-mono text-indigo-300 font-semibold flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                      Production Java 17 Boilerplate (Bug-Free Template)
                    </span>
                    <CopyButton text={learningNotes.productionTemplate.code} label="Copy Template" />
                  </div>
                  <CodeHighlighter code={learningNotes.productionTemplate.code} />
                </div>

                {Array.isArray(learningNotes.productionTemplate.lineByLineNotes) && learningNotes.productionTemplate.lineByLineNotes.length > 0 && (
                  <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      Critical Line-by-Line Invariant Annotations
                    </span>
                    <ul className="space-y-1.5 text-xs text-foreground-muted">
                      {learningNotes.productionTemplate.lineByLineNotes.map((note, nIdx) => (
                        <li key={nIdx} className="flex items-start gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* PATTERN: Universal Template with 4-Phase Hooks */}
            {isPattern && (
              <div className="space-y-4">
                {learningNotes.universalTemplate?.code && (
                  <div className="rounded-xl overflow-hidden border border-border">
                    <div className="bg-[#171717] px-4 py-2.5 border-b border-[#262626] flex items-center justify-between">
                      <span className="text-xs font-mono text-emerald-300 font-semibold flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                        Universal Pattern Template
                      </span>
                      <CopyButton text={learningNotes.universalTemplate.code} label="Copy Template" />
                    </div>
                    <CodeHighlighter code={learningNotes.universalTemplate.code} />
                  </div>
                )}

                {/* 4-Phase Hook Cards */}
                {Array.isArray(learningNotes.universalTemplate?.templateHooks) && learningNotes.universalTemplate.templateHooks.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {learningNotes.universalTemplate.templateHooks.map((hook, hIdx) => (
                      <div key={hIdx} className="p-4 rounded-xl bg-surface border border-border space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                            {hIdx + 1}
                          </span>
                          <span className="text-xs font-bold text-foreground uppercase tracking-wider">Hook Phase</span>
                        </div>
                        <p className="text-xs text-foreground-muted leading-relaxed pl-7">{hook}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Legacy Topic Operations Fallback */}
            {isLegacyTopic && operations.length > 0 && (
              <div className="space-y-4">
                {operations.map((op, oIdx) => (
                  <div key={oIdx} className="p-5 rounded-xl bg-surface border border-border space-y-3">
                    <h3 className="font-bold text-white text-base">{op.name}</h3>
                    <p className="text-xs text-gray-400">{op.explanation || op.stepByStepExplanation}</p>
                    {op.code && <CodeHighlighter code={op.code} />}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 3: ADVANCED TRACK (Internals, Invariants, Hardware)   */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'advanced') && (
          <section className="space-y-6">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <Cpu className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Deep Systems Internals, Formal Invariants & Tradeoffs
              </h2>
              <span className="text-[11px] text-foreground-muted ml-2">Senior / Staff FAANG Track</span>
            </div>

            {/* DATA STRUCTURE: Java Collections Internals + Hardware Mechanics */}
            {isDataStructure && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {advanced.javaCollectionsInternals && (
                    <div className="p-5 rounded-xl bg-surface border border-border space-y-2">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Code2 className="w-4 h-4" /> Java Standard Library Internals (JDK Source)
                      </span>
                      <p className="text-xs text-foreground-muted leading-relaxed">
                        {advanced.javaCollectionsInternals}
                      </p>
                    </div>
                  )}

                  {advanced.hardwareAndMemoryMechanics && (
                    <div className="p-5 rounded-xl bg-surface border border-border space-y-2">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Cpu className="w-4 h-4" /> Hardware, L1/L2 Cache Locality & RAM Overhead
                      </span>
                      <p className="text-xs text-foreground-muted leading-relaxed">
                        {advanced.hardwareAndMemoryMechanics}
                      </p>
                    </div>
                  )}
                </div>

                {/* Tradeoff Matrix */}
                {Array.isArray(advanced.tradeoffMatrix) && advanced.tradeoffMatrix.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Workflow className="w-4 h-4 text-emerald-400" />
                      Architectural Tradeoff Matrix (Comparison vs Alternatives)
                    </h3>
                    <div className="rounded-xl overflow-hidden border border-border">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-surface-raised border-b border-border text-foreground-subtle font-semibold uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-3">Compared Structure</th>
                            <th className="px-4 py-3">Advantage (Where This Wins)</th>
                            <th className="px-4 py-3">Disadvantage</th>
                            <th className="px-4 py-3">When to Pick in Interview</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-surface">
                          {advanced.tradeoffMatrix.map((tm, tmIdx) => (
                            <tr key={tmIdx} className="hover:bg-surface-hover transition-colors">
                              <td className="px-4 py-3 font-bold text-primary">{tm.comparedAgainst}</td>
                              <td className="px-4 py-3 text-emerald-400">{tm.advantage}</td>
                              <td className="px-4 py-3 text-rose-400">{tm.disadvantage}</td>
                              <td className="px-4 py-3 text-foreground-muted font-medium">{tm.whenToPickWhich}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ALGORITHM: Formal Invariants & Complexity Recurrence Proofs */}
            {isAlgorithm && (
              <div className="space-y-4">
                {advanced.mathematicalInvariant && (
                  <div className="p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> Inductive Loop Invariant & Formal Proof
                    </span>
                    <p className="text-xs text-indigo-100 leading-relaxed font-mono">
                      {advanced.mathematicalInvariant}
                    </p>
                  </div>
                )}

                {advanced.complexityDerivation && (
                  <div className="p-5 rounded-xl bg-surface border border-border space-y-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">
                      Rigorous Complexity & Recurrence Proof
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-surface-raised border border-border">
                        <span className="text-foreground-subtle block">Time Best</span>
                        <span className="font-mono text-emerald-400 font-bold">{advanced.complexityDerivation.timeBest}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-surface-raised border border-border">
                        <span className="text-foreground-subtle block">Time Average</span>
                        <span className="font-mono text-amber-400 font-bold">{advanced.complexityDerivation.timeAverage}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-surface-raised border border-border">
                        <span className="text-foreground-subtle block">Time Worst</span>
                        <span className="font-mono text-rose-400 font-bold">{advanced.complexityDerivation.timeWorst}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-surface-raised border border-border">
                        <span className="text-foreground-subtle block">Space Aux</span>
                        <span className="font-mono text-cyan-400 font-bold">{advanced.complexityDerivation.space}</span>
                      </div>
                    </div>
                    {advanced.complexityDerivation.recurrenceRelation && (
                      <div className="p-3 rounded-lg bg-surface-raised border border-border text-xs">
                        <span className="text-foreground-subtle block mb-1 font-semibold">Master Theorem / Recurrence:</span>
                        <span className="font-mono text-amber-300">{advanced.complexityDerivation.recurrenceRelation}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Variations & Extensions */}
                {Array.isArray(advanced.variationsAndExtensions) && advanced.variationsAndExtensions.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Advanced Variations & Extensions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {advanced.variationsAndExtensions.map((v, vIdx) => (
                        <div key={vIdx} className="p-4 rounded-xl bg-surface border border-border space-y-2">
                          <h4 className="font-bold text-primary text-sm">{v.variationName}</h4>
                          <p className="text-xs text-foreground-muted">{v.coreDifference}</p>
                          {v.snippet && <CodeHighlighter code={v.snippet} />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PATTERN: Decision Flowchart & Anti-Patterns */}
            {isPattern && (
              <div className="space-y-4">
                {Array.isArray(advanced.decisionFlowchart) && advanced.decisionFlowchart.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Workflow className="w-4 h-4 text-cyan-400" />
                      Pattern Decision Flowchart
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {advanced.decisionFlowchart.map((df, dfIdx) => (
                        <div key={dfIdx} className="p-4 rounded-xl bg-surface border border-border space-y-2">
                          <span className="text-xs font-bold text-cyan-400 block">{df.scenario}</span>
                          <p className="text-xs text-foreground-subtle">
                            <strong className="text-foreground">Trigger Indicator:</strong> {df.indicator}
                          </p>
                          <p className="text-xs text-emerald-400">
                            <strong>Action:</strong> {df.action}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Failure Boundaries / Anti-Patterns */}
                {Array.isArray(advanced.antiPatterns) && advanced.antiPatterns.length > 0 && (
                  <div className="p-5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-3">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> Pattern Failure Boundaries & Traps
                    </span>
                    <ul className="space-y-1.5 text-xs text-rose-200/90">
                      {advanced.antiPatterns.map((ap, apIdx) => (
                        <li key={apIdx} className="flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>{ap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Subtle Invariants (Universal for All Archetypes) */}
            {Array.isArray(advanced.subtleInvariants) && advanced.subtleInvariants.length > 0 && (
              <div className="p-5 rounded-xl bg-surface border border-border space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Fundamental Invariants That Must Strictly Hold
                </span>
                <ul className="space-y-1.5 text-xs text-foreground-muted">
                  {advanced.subtleInvariants.map((inv, iIdx) => (
                    <li key={iIdx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{inv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 4: INTERVIEW PLAYBOOK & PROBLEMS                       */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'interview') && (
          <section className="space-y-6">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Interview Playbook, Traps & Canonical Problems
              </h2>
              <span className="text-[11px] text-foreground-muted ml-2">Interview Track</span>
            </div>

            {/* Trigger Signals */}
            {Array.isArray(playbook.triggerSignals) && playbook.triggerSignals.length > 0 && (
              <div className="p-5 rounded-xl bg-surface border border-border space-y-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4" /> Exact Interview Problem Trigger Signals
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {playbook.triggerSignals.map((sig, sIdx) => (
                    <div key={sIdx} className="p-3 rounded-lg bg-surface-raised border border-border flex items-start gap-2 text-xs text-foreground-muted">
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{sig}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pitfalls & Anti-Patterns */}
            {(Array.isArray(playbook.pitfallsAndAntiPatterns) || Array.isArray(playbook.pitfallsAndTraps)) && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Pitfalls, Bugs & Concrete Defenses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(playbook.pitfallsAndAntiPatterns || playbook.pitfallsAndTraps || []).map((p, pIdx) => (
                    <div key={pIdx} className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                      <h4 className="font-bold text-rose-400 text-xs flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {p.pitfall}
                      </h4>
                      {p.consequence && (
                        <p className="text-[11px] text-gray-400">
                          <strong className="text-gray-300">Consequence:</strong> {p.consequence}
                        </p>
                      )}
                      {p.fix && (
                        <p className="text-[11px] text-emerald-300">
                          <strong className="text-emerald-400">Fix / Defense:</strong> {p.fix}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Canonical / Solved Problems Ladder */}
            {canonicalProbs.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    Canonical Problem Progression Ladder
                  </h3>
                  <span className="text-xs text-foreground-subtle">{canonicalProbs.length} curated challenges</span>
                </div>

                <div className="space-y-4">
                  {canonicalProbs.map((prob, prIdx) => (
                    <div key={prIdx} className="p-6 rounded-2xl bg-surface border border-border space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            prob.difficulty === 'Easy'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : prob.difficulty === 'Medium'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {prob.difficulty || 'Medium'}
                          </span>
                          <h4 className="text-base font-bold text-foreground">
                            {prob.name}
                          </h4>
                          {prob.leetcodeNumber && (
                            <span className="text-xs text-foreground-subtle bg-surface-raised px-2 py-0.5 rounded border border-border">
                              LeetCode #{prob.leetcodeNumber}
                            </span>
                          )}
                        </div>
                        {prob.code && <CopyButton text={prob.code} label="Copy Solution" />}
                      </div>

                      {prob.description && (
                        <p className="text-xs text-foreground-muted leading-relaxed">
                          {prob.description}
                        </p>
                      )}

                      {(prob.whyThisProblem || prob.intuition || prob.keyStrategy) && (
                        <div className="p-3.5 rounded-xl bg-surface-raised border border-border text-xs text-foreground-muted space-y-1">
                          <span className="font-semibold text-primary block">Why this tests mastery & Key Strategy:</span>
                          <p>{prob.whyThisProblem || prob.intuition || prob.keyStrategy}</p>
                        </div>
                      )}

                      {prob.code && (
                        <div className="rounded-xl overflow-hidden border border-border">
                          <CodeHighlighter code={prob.code} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Mastery Checklist */}
            <InteractiveMasteryChecklist 
              items={checklist}
              storageKey={`dsa_mastery_${learningNotes.title?.toLowerCase().replace(/\s+/g, '_')}`}
            />
          </section>
        )}

        {/* Motivational Quote at Bottom */}
        <div className="pt-4">
          <MotivationalQuote category="Learning" variant="card" className="!bg-surface !border-border" />
        </div>

      </div>
    </div>
  );
}

export default LearnPage;
