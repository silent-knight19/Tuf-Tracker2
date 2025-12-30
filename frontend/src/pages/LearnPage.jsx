import { useState } from 'react';
import { BookOpen, Zap, X, Target, Brain, Sparkles, ChevronRight, Activity, Code2, Clock, Terminal, Lightbulb, Trophy, AlertCircle } from 'lucide-react';
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

  const handleGenerateLearningNotes = async () => {
    if (!learnPattern && !learnTopic) return;

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
      <div className="min-h-full bg-dark-950 p-0 overflow-y-auto custom-scrollbar relative selection:bg-cyan-500/30">
        {/* Cinematic Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="max-w-[1600px] mx-auto px-8 py-12 space-y-8 relative z-10">
          {/* Header Intelligence Briefing */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-white/[0.03] pb-4">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em]">Cognitive Engine Active</span>
              </div>
              <h1 className="text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                 Skill <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Architecture</span>
              </h1>
              <p className="text-xl text-dark-400 font-medium leading-relaxed">
                Deploy advanced AI protocols to deconstruct complex algorithmic patterns into architectural blueprints for mastery.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                 <div className="text-[10px] font-black text-dark-500 uppercase tracking-widest mb-1.5">Learning Status</div>
                 <div className="px-5 py-2.5 bg-dark-900 border border-dark-800 rounded-2xl flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                   <span className="text-xs font-black text-white uppercase tracking-tighter">System Ready</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Custom Mission Control */}
            <div className="lg:col-span-8 group relative h-full">
              <div className="absolute inset-0 bg-cyan-500/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative bg-dark-900/40 backdrop-blur-2xl border border-white/[0.05] rounded-[3.5rem] p-12 overflow-hidden flex flex-col">
                <div>
                   <div className="flex items-center gap-6 mb-12">
                     <div className="w-14 h-14 bg-dark-950 border border-white/[0.05] rounded-2xl flex items-center justify-center shadow-xl">
                        <Zap className="w-7 h-7 text-cyan-400 fill-current" />
                     </div>
                     <div>
                       <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Custom Payload</h2>
                       <p className="text-[10px] font-black text-dark-500 uppercase tracking-widest mt-1.5">Configure specific learning parameters</p>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[10px] font-black text-dark-500 uppercase tracking-widest leading-none">Domain Topic</label>
                          <Activity className="w-3.5 h-3.5 text-cyan-500" />
                        </div>
                        <SearchableSelect
                          options={DSA_TOPICS}
                          value={learnTopic}
                          onChange={setLearnTopic}
                          placeholder="Select Domain..."
                        />
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[10px] font-black text-dark-500 uppercase tracking-widest leading-none">Core Pattern</label>
                          <Target className="w-3.5 h-3.5 text-purple-500" />
                        </div>
                        <SearchableSelect
                          options={DSA_PATTERNS}
                          value={learnPattern}
                          onChange={setLearnPattern}
                          placeholder="Select Pattern..."
                        />
                     </div>
                   </div>
                </div>

                <div className="mt-4">
                   <button
                    onClick={handleGenerateLearningNotes}
                    disabled={loading || (!learnPattern && !learnTopic)}
                    className="group relative w-full h-[44px] bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl overflow-hidden transition-all hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative h-full flex items-center justify-center gap-2.5">
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-white fill-current group-hover:scale-110 transition-transform" />
                          <span className="text-white font-black text-[10px] uppercase tracking-[0.25em] transition-transform group-hover:translate-x-0.5">Initialize Generation</span>
                          <ChevronRight className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-all group-hover:translate-x-1" />
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Inspiration */}
            <div className="lg:col-span-4 space-y-8">
               <div className="bg-dark-900/40 backdrop-blur-2xl border border-white/[0.05] rounded-[3rem] p-10 h-full">
                  <div className="flex flex-col h-full justify-between gap-12">
                     <div>
                       <div className="text-[10px] font-black text-dark-500 uppercase tracking-widest mb-6 px-1">Inspiration Loop</div>
                       <MotivationalQuote category="Vision" variant="card" size="md" className="!bg-transparent !p-0 border-none shadow-none" />
                     </div>
                     
                     <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-dark-950 border border-white/[0.05] flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-brand-orange" />
                           </div>
                           <span className="text-[10px] font-black text-white uppercase tracking-widest">Advanced Protocols</span>
                        </div>
                        <p className="text-xs text-dark-500 leading-relaxed font-medium">
                          Our cognitive maps use advanced heuristic analysis to break down algorithms into digestible, high-impact blocks.
                        </p>
                        <div className="pt-4 flex items-center gap-4 border-t border-white/[0.03]">
                           <img src="https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg" alt="Gemini" className="h-3.5 opacity-40" />
                           <div className="w-1 h-1 rounded-full bg-dark-800" />
                           <span className="text-[9px] font-black text-dark-600 uppercase tracking-widest">v4.2 Stable</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Quick Access Grid (Now Below) */}
            <div className="lg:col-span-12 space-y-8 mt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Rapid Deployment</h2>
                  <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">High-impact neural patterns for immediate initialization</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: 'Sliding Window', id: 'sliding-window', icon: Brain, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                  { name: 'Two Pointers', id: 'two-pointers', icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { name: 'Dynamic Programming', id: 'dynamic-programming', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                  { name: 'Graph Theory', id: 'graphs', icon: Sparkles, color: 'text-green-400', bg: 'bg-green-500/10' }
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      setLearnPattern(item.name);
                    }}
                    className={`group relative p-8 bg-dark-900/40 backdrop-blur-3xl border rounded-[2.5rem] text-left transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] ${
                      learnPattern === item.name ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 'border-white/[0.05] hover:border-white/[0.1]'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-10 transition-transform group-hover:-rotate-6 duration-700`}>
                      <item.icon className="w-7 h-7" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-tight group-hover:text-cyan-400 transition-colors">{item.name}</h3>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Protocol 1.0</span>
                          <ChevronRight className={`w-5 h-5 ${item.color} opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1`} />
                       </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Display Learning Notes
  return (
    <div className="p-0 h-full overflow-y-auto custom-scrollbar bg-dark-950/20 selection:bg-cyan-500/30">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[150px] rounded-full" />
      </div>
      
      <div className="max-w-[1400px] mx-auto px-8 py-10 space-y-16 animate-in slide-in-from-right duration-700">
        
        {/* Intelligence Briefing Banner */}
        <div className="relative group">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 pb-12 border-b border-white/[0.03]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest leading-none">Neural Architecture Map</span>
              </div>
              <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                {learningNotes.title}
              </h1>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3">
                   <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                   <span className="text-[10px] font-black text-dark-300 uppercase tracking-[0.2em]">Protocol Verified</span>
                 </div>
                 <div className="w-1 h-1 rounded-full bg-dark-800" />
                 <p className="text-sm font-medium text-dark-500 italic">Structural deconstruction of {learningNotes.title} for deployment.</p>
              </div>
            </div>
            
            <button 
              onClick={handleReset}
              className="group shrink-0 px-8 h-16 bg-dark-950 border border-white/[0.05] rounded-2xl text-dark-400 hover:text-white transition-all flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] hover:bg-white/[0.02]"
            >
              <X className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Reset Terminal
            </button>
          </div>
        </div>

        {/* Dynamic Display Cluster */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Executive Summary Section */}
          <div className="lg:col-span-12 relative overflow-hidden group">
            <div className="absolute inset-0 bg-cyan-500/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative bg-dark-900/40 backdrop-blur-2xl border border-white/[0.05] rounded-[3rem] p-12 overflow-hidden">
               <div className="flex items-center gap-6 mb-10">
                  <div className="w-14 h-14 bg-dark-950 border border-white/[0.05] rounded-2xl flex items-center justify-center shadow-xl">
                    <Terminal className="w-7 h-7 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Abstract</h2>
                    <p className="text-[10px] font-black text-dark-500 uppercase tracking-widest mt-1.5 italic">High-level architectural overview</p>
                  </div>
               </div>
               
               <p className="text-xl font-medium text-dark-100 leading-relaxed selection:bg-cyan-500/20">
                 {learningNotes.overview}
               </p>
            </div>
          </div>

          {/* Operational Metrics Cluster */}
          <div className="lg:col-span-12 space-y-10">
            {/* Deploy Signals */}
            <section className="bg-dark-900/30 backdrop-blur-md border border-white/[0.05] rounded-[3rem] p-10 h-fit">
               <div className="flex flex-col items-center text-center mb-10">
                  <div className="w-14 h-14 bg-dark-950 border border-white/[0.05] rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                    <Target className="w-7 h-7 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Trigger Signals</h2>
                  <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest mt-1">When to initialize this protocol</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {learningNotes.whenToUse?.map((signal, i) => (
                    <div key={i} className="flex items-start gap-4 p-5 bg-dark-950/40 border border-white/[0.03] rounded-2xl group/sig transition-all hover:bg-white/[0.02]">
                       <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0 group-hover/sig:scale-150 transition-transform shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                       <span className="text-dark-200 font-bold leading-relaxed">{signal}</span>
                    </div>
                  ))}
               </div>
            </section>

            {/* Performance Complexities */}
            <section className="bg-dark-900/30 backdrop-blur-md border border-white/[0.05] rounded-[3rem] p-10 h-fit">
               <div className="flex flex-col items-center text-center mb-10">
                  <div className="w-14 h-14 bg-dark-950 border border-white/[0.05] rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                    <Clock className="w-7 h-7 text-brand-orange" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Computational Cost</h2>
                  <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest mt-1">Algorithmic efficiency profile</p>
               </div>
               
               <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-dark-950 p-6 rounded-2xl border border-white/[0.03] flex flex-col items-center text-center">
                       <span className="text-[9px] font-black text-dark-600 uppercase tracking-[.2em] mb-2">Temporal</span>
                       <div className="text-2xl font-black text-brand-orange font-mono tracking-tighter">{learningNotes.complexity?.time}</div>
                    </div>
                    <div className="bg-dark-950 p-6 rounded-2xl border border-white/[0.03] flex flex-col items-center text-center">
                       <span className="text-[9px] font-black text-dark-600 uppercase tracking-[.2em] mb-2">Spatial</span>
                       <div className="text-2xl font-black text-blue-400 font-mono tracking-tighter">{learningNotes.complexity?.space}</div>
                    </div>
                  </div>
                  
                  {learningNotes.complexity?.bestCase && (
                    <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-2xl flex items-center gap-4">
                       <div className="px-3 py-1 bg-green-500/20 rounded-lg text-[10px] font-black text-green-400 uppercase tracking-widest">Best Case</div>
                       <span className="text-sm font-medium text-dark-300">{learningNotes.complexity.bestCase}</span>
                    </div>
                  )}
                  {learningNotes.complexity?.worstCase && (
                    <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center gap-4">
                       <div className="px-3 py-1 bg-red-500/20 rounded-lg text-[10px] font-black text-red-400 uppercase tracking-widest">Worst Case</div>
                       <span className="text-sm font-medium text-dark-300">{learningNotes.complexity.worstCase}</span>
                    </div>
                  )}
               </div>
            </section>
          </div>

          {/* Core Architecture Cluster */}
          <div className="lg:col-span-12 space-y-10">
            <section className="bg-dark-900/40 backdrop-blur-2xl border border-white/[0.05] rounded-[3.5rem] p-12 h-full">
               <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-12 flex items-center gap-4">
                 <Terminal className="w-8 h-8 text-cyan-400" /> Structural Blueprint
               </h2>
               
               <div className="space-y-12">
                  {/* Intuition Pod */}
                  <div className="relative p-8 bg-cyan-500/[0.03] border border-cyan-500/10 rounded-[2.5rem] overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                        <Lightbulb className="w-32 h-32 text-cyan-400" />
                     </div>
                     <div className="relative z-10">
                        <h3 className="text-xl font-black text-cyan-400 uppercase tracking-tight mb-4 flex items-center gap-3">
                           <Lightbulb className="w-5 h-5 fill-current" /> Core Intuition
                        </h3>
                        <p className="text-dark-200 text-lg leading-relaxed font-medium italic">
                          {learningNotes.coreApproach?.intuition}
                        </p>
                     </div>
                  </div>

                  {/* Deployment Steps */}
                  <div className="space-y-6">
                     <h3 className="text-[10px] font-black text-dark-500 uppercase tracking-[0.3em] ml-2">Execution Pipeline</h3>
                     <div className="space-y-4">
                        {learningNotes.coreApproach?.steps?.map((step, i) => (
                          <div key={i} className="flex items-start gap-6 group/step">
                             <div className="w-10 h-10 rounded-xl bg-dark-950 border border-white/[0.05] flex items-center justify-center shrink-0 group-hover/step:border-cyan-500/50 transition-colors">
                                <span className="text-sm font-black text-cyan-400">0{i + 1}</span>
                             </div>
                             <div className="pt-2 text-lg font-medium text-dark-200 leading-relaxed border-b border-white/[0.02] pb-6 w-full">
                                {step}
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Edge Cases Pod */}
                  {learningNotes.coreApproach?.edgeCases?.length > 0 && (
                    <div className="space-y-6">
                       <h3 className="text-[10px] font-black text-dark-500 uppercase tracking-[0.3em] ml-2">Boundary Conditions</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {learningNotes.coreApproach.edgeCases.map((edgeCase, i) => (
                            <div key={i} className="flex items-start gap-4 p-5 bg-orange-500/[0.03] border border-orange-500/10 rounded-2xl group/edge hover:bg-orange-500/[0.05] transition-colors">
                               <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
                               <span className="text-dark-200 font-medium leading-relaxed">{edgeCase}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {/* Operational Logic (Pseudocode) */}
                  {learningNotes.coreApproach?.pseudocode && (
                    <div className="space-y-4">
                       <h3 className="text-[10px] font-black text-dark-500 uppercase tracking-[0.3em] ml-2">Operational Logic</h3>
                       <div className="rounded-[2rem] overflow-hidden border border-white/[0.05] shadow-2xl">
                          <CodeHighlighter code={learningNotes.coreApproach.pseudocode} />
                       </div>
                    </div>
                  )}
               </div>
            </section>
          </div>

          {/* Real-world Scenarios Section */}
          <div className="lg:col-span-12 space-y-10 mt-10">
             <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-dark-950 border border-white/[0.05] rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
                   <Trophy className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Mission Deployment</h2>
                <p className="text-[10px] font-bold text-dark-500 uppercase tracking-[0.3em] mt-2 italic px-3 py-1 bg-dark-950 rounded-full border border-dark-800">Verified LeetCode Field Scenarios</p>
             </div>

             <div className="grid grid-cols-1 gap-12">
                {learningNotes.exampleProblems?.map((problem, i) => (
                  <div key={i} className="group relative bg-dark-900/40 backdrop-blur-3xl border border-white/[0.05] rounded-[3rem] p-10 hover:border-purple-500/30 transition-all duration-700 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-8">
                       <div className="space-y-4">
                          <h3 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-purple-400 transition-colors">{problem.name}</h3>
                          <div className="flex items-center gap-3 flex-wrap">
                             <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${
                               problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                               problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                               'bg-red-500/10 text-red-400 border border-red-500/20'
                             }`}>{problem.difficulty}</span>
                             {problem.companies?.map((company, j) => (
                               <span key={j} className="text-[9px] font-black px-3 py-1 rounded-lg bg-dark-950 text-dark-400 border border-white/[0.03] uppercase tracking-widest leading-none">
                                 {company}
                               </span>
                             ))}
                          </div>
                       </div>
                       <Trophy className="w-6 h-6 text-purple-500/40 group-hover:rotate-12 transition-transform" />
                    </div>

                    <p className="text-dark-300 font-medium leading-relaxed mb-10 selection:bg-purple-500/20">
                      {problem.description}
                    </p>

                    <div className="mt-auto space-y-6">
                       {problem.intuition && (
                         <div className="p-6 bg-purple-500/[0.03] border-l-4 border-purple-500 rounded-r-2xl">
                            <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Strategy</h4>
                            <p className="text-sm font-medium text-dark-200 leading-relaxed">{problem.intuition}</p>
                         </div>
                       )}
                       
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-dark-500 uppercase tracking-widest ml-1">Deployment Logic</h4>
                          <div className="rounded-2xl overflow-hidden border border-white/[0.05] shadow-xl text-sm">
                             <CodeHighlighter code={problem.code} />
                          </div>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Defensive Programming Cluster */}
          <div className="lg:col-span-12 mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
             {/* Critical Fail Points */}
             <div className="bg-red-500/[0.02] backdrop-blur-md border border-red-500/10 rounded-[3rem] p-10">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-14 h-14 bg-dark-950 border border-red-500/20 rounded-2xl flex items-center justify-center">
                    <Activity className="w-7 h-7 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Fail Points</h2>
                    <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest mt-1">Common structural weaknesses</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {learningNotes.commonMistakes?.map((mistake, i) => (
                    <div key={i} className="flex items-start gap-4 p-5 bg-dark-950/40 border border-white/[0.03] rounded-2xl group/mistake hover:bg-red-500/[0.02] transition-colors">
                       <span className="text-red-400 font-black text-xl">!</span>
                       <span className="text-dark-200 font-bold leading-relaxed">{mistake}</span>
                    </div>
                  ))}
                </div>
             </div>

             {/* Mastery Enhancers */}
             <div className="bg-orange-500/[0.02] backdrop-blur-md border border-orange-500/10 rounded-[3rem] p-10">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-14 h-14 bg-dark-950 border border-orange-500/20 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-brand-orange" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Optimization</h2>
                    <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest mt-1">Mastery enhancement protocols</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {learningNotes.proTips?.map((tip, i) => (
                    <div key={i} className="flex items-start gap-4 p-5 bg-dark-950/40 border border-white/[0.03] rounded-2xl group/tip hover:bg-orange-500/[0.02] transition-colors">
                       <span className="text-brand-orange font-black text-xl">★</span>
                       <span className="text-dark-200 font-bold leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LearnPage;

