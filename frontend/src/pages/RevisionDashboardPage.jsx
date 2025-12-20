import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRevisionStore } from '../stores/revisionStore';
import { useAuthStore } from '../stores/authStore';
import { Zap, Target, Dice3, ChevronDown, ChevronUp, PartyPopper, Briefcase, Play, X, Building, Code } from 'lucide-react';
import RevisionProblemCard from '../components/features/RevisionProblemCard';
import DashboardHeader from '../components/features/revision/DashboardHeader';
import PracticeModeCard from '../components/features/revision/PracticeModeCard';
import PatternProgressList from '../components/features/revision/PatternProgressList';
import SolveProblemsSection from '../components/features/revision/SolveProblemsSection';
import SearchableSelect from '../components/ui/SearchableSelect';
import api from '../utils/api';
import { auth } from '../config/firebase';
import { DSA_PATTERNS, DSA_TOPICS } from '../utils/dsaConstants';

function RevisionDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { dueToday, overdue, upcoming, counts, loading, fetchDueToday, fetchRevisions, revisions } = useRevisionStore();
  const [expandedSections, setExpandedSections] = useState({ day_7: true });
  
  // Practice Modal State
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [practiceCount, setPracticeCount] = useState(1);
  const [practiceMode, setPracticeMode] = useState('solved'); // 'solved' or 'ai'
  const [practiceLoading, setPracticeLoading] = useState(false);

  // Pattern Focus Modal State
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');

  // Company Focus Modal State
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  
  // Upcoming Modal State
  const [showUpcoming, setShowUpcoming] = useState(false);
  
  // Solve Problems Modal State
  const [showSolveProblems, setShowSolveProblems] = useState(false);
  
  // Combine user's solved patterns/topics with standard lists
  const uniquePatterns = [...new Set([
    ...DSA_PATTERNS,
    ...revisions.flatMap(r => r.patterns || [])
  ])].sort();

  const uniqueTopics = [...new Set([
    ...DSA_TOPICS,
    ...revisions.flatMap(r => r.topics || [])
  ])].sort();

  useEffect(() => {
    fetchDueToday();
    fetchRevisions();
  }, [fetchDueToday, fetchRevisions]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleStartPractice = async () => {
    // For AI mode, open tab immediately to avoid popup blockers
    let newTab = null;
    const localId = Date.now().toString();
    
    if (practiceMode === 'ai') {
      newTab = window.open(`/interview/ai?localId=${localId}`, '_blank');
    }

    try {
      setPracticeLoading(true);
      const token = await auth.currentUser.getIdToken();
      
      // Step 1: Get random solved problem(s)
      // For AI mode, we just need 1 to base the new problem on
      const count = practiceMode === 'ai' ? 1 : practiceCount;
      
      const response = await api.post('/revisions/practice-session', {
        count: count
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.sessionIds && response.data.sessionIds.length > 0) {
        if (practiceMode === 'ai') {
          // Step 2: Generate similar problem using AI
          const baseProblemId = response.data.sessionIds[0];
          
          try {
            const aiResponse = await api.post('/ai/similar-problem', {
              problemId: baseProblemId
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            // Step 3: Save to localStorage for the new tab to pick up
            localStorage.setItem(`ai_problem_${localId}`, JSON.stringify(aiResponse.data));
          } catch (aiError) {
            // If AI generation fails, close the tab we opened
            if (newTab) newTab.close();
            throw aiError;
          }
        } else {
          // Standard mode - Open in new tab
          window.open(`/interview/${response.data.sessionIds[0]}`, '_blank');
        }
        setShowPracticeModal(false);
      } else {
        if (newTab) newTab.close();
        alert('No solved problems found to practice!');
      }
    } catch (error) {
      console.error('Failed to start practice session:', error);
      if (newTab) newTab.close();
      alert('Failed to start practice session');
    } finally {
      setPracticeLoading(false);
    }
  };

  const handlePatternPractice = async () => {
    // Open tab immediately to avoid popup blockers
    const localId = Date.now().toString();
    const newTab = window.open(`/interview/ai?localId=${localId}`, '_blank');

    try {
      setPracticeLoading(true);
      const token = await auth.currentUser.getIdToken();

      const aiResponse = await api.post('/ai/custom-problem', {
        pattern: selectedPattern,
        topic: selectedTopic,
        difficulty: selectedDifficulty
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Save to localStorage for the new tab to pick up
      localStorage.setItem(`ai_problem_${localId}`, JSON.stringify(aiResponse.data));
      
      setShowPatternModal(false);
    } catch (error) {
      console.error('Failed to generate pattern problem:', error);
      if (newTab) newTab.close();
      alert('Failed to generate problem');
    } finally {
      setPracticeLoading(false);
    }
  };

  const handleCompanyPractice = async () => {
    if (!selectedCompany) {
      alert('Please enter a company name');
      return;
    }

    // Open tab immediately to avoid popup blockers
    const localId = Date.now().toString();
    const newTab = window.open(`/interview/ai?localId=${localId}`, '_blank');

    try {
      setPracticeLoading(true);
      const token = await auth.currentUser.getIdToken();

      const aiResponse = await api.post('/ai/company-problem', {
        company: selectedCompany,
        topic: selectedTopic || undefined,
        pattern: selectedPattern || undefined,
        difficulty: selectedDifficulty
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Save to localStorage for the new tab to pick up
      localStorage.setItem(`ai_problem_${localId}`, JSON.stringify(aiResponse.data));
      
      setShowCompanyModal(false);
    } catch (error) {
      console.error('Failed to generate company problem:', error);
      if (newTab) newTab.close();
      alert('Failed to generate problem');
    } finally {
      setPracticeLoading(false);
    }
  };

  if (loading && counts.dueToday === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar space-y-6">
      
      <DashboardHeader user={user} counts={counts} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Active Queue (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Overdue Section */}
          {overdue.length > 0 && (
            <div className="card bg-dark-900 border-red-500/30 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-red-400 flex items-center gap-2">
                  ⚠️ {overdue.length} Overdue
                </h3>
                <button className="text-sm text-dark-400 hover:text-white transition-colors">
                  Clear All
                </button>
              </div>
              <div className="space-y-3">
                {overdue.slice(0, 3).map(revision => (
                  <RevisionProblemCard key={revision.id} revision={revision} />
                ))}
                {overdue.length > 3 && (
                  <button className="text-base text-brand-orange hover:underline">
                    See all {overdue.length} overdue problems →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Due Today Section */}
          <div className="card bg-dark-900 border-dark-800 p-4">
            <h3 className="text-xl font-semibold text-brand-orange mb-4 flex items-center gap-2">
              📅 {counts.dueToday} Due Today
            </h3>

            {counts.dueToday === 0 ? (
              <div className="text-center py-12 bg-dark-800/30 rounded-lg border border-dashed border-dark-700">
                <div className="mb-4 flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-brand-orange/10 flex items-center justify-center">
                    <PartyPopper className="w-10 h-10 text-brand-orange animate-bounce" />
                  </div>
                </div>
                <h4 className="text-2xl text-white font-bold mb-2">All caught up!</h4>
                <p className="text-dark-400 text-base max-w-md mx-auto">
                  Great job! You've completed all your reviews for today. Check out the practice modes to keep your streak going.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Render sections dynamically */}
                {Object.entries(dueToday).map(([key, items]) => {
                  if (!items || items.length === 0) return null;
                  
                  const labels = {
                    day_2: 'Day 2/3 Review',
                    day_7: 'Day 7 Review',
                    day_14: 'Day 14 Review',
                    day_30: 'Day 30 Review',
                    month_2: 'Week 2 Review',
                    month_3: 'Month 3 Check',
                    monthly: 'Monthly Mastery'
                  };

                  return (
                    <div key={key}>
                      <button
                        onClick={() => toggleSection(key)}
                        className="flex items-center justify-between w-full text-left mb-2 hover:text-brand-orange transition-colors group"
                      >
                        <span className="text-base font-medium text-dark-300 group-hover:text-brand-orange transition-colors">
                          {labels[key] || key} ({items.length})
                        </span>
                        {expandedSections[key] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      
                      {expandedSections[key] && (
                        <div className="space-y-2 animate-fadeIn">
                          {items.map(revision => (
                            <RevisionProblemCard key={revision.id} revision={revision} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Section (Moved here for better flow) */}
          <div className="card bg-dark-900 border-dark-800 p-4">
            <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
              📅 Upcoming ({upcoming.length})
            </h3>
            {upcoming.length > 0 ? (
              <div className="space-y-2">
                {upcoming.slice(0, 5).map(revision => (
                  <RevisionProblemCard key={revision.id} revision={revision} />
                ))}
                {upcoming.length > 5 && (
                  <button 
                    onClick={() => setShowUpcoming(true)}
                    className="text-sm text-dark-400 hover:text-white w-full text-center py-2"
                  >
                    View all {upcoming.length} upcoming
                  </button>
                )}
              </div>
            ) : (
              <p className="text-dark-400 text-base">No upcoming reviews scheduled.</p>
            )}
          </div>



        </div>

        {/* Right Column: Practice & Progress (1/3 width) */}
        <div className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-dark-400 uppercase tracking-wider">Practice Modes</h3>
            
            <PracticeModeCard 
              title="Pattern Focus"
              subtitle="Deep dive one pattern"
              icon={Target}
              color="blue"
              count="5"
              onClick={() => setShowPatternModal(true)}
            />

            <PracticeModeCard 
              title="Company Focused"
              subtitle="Target specific companies"
              icon={Building}
              color="purple"
              count="Unlimited"
              onClick={() => setShowCompanyModal(true)}
            />

            <PracticeModeCard 
              title="Interview Practice"
              subtitle="Raw mode (No tags/notes)"
              icon={Briefcase}
              color="green"
              count="Custom"
              onClick={() => setShowPracticeModal(true)}
            />

            <PracticeModeCard 
              title="Solve Problems"
              subtitle="Practice your saved problems"
              icon={Code}
              color="orange"
              count={`${revisions.length}`}
              onClick={() => setShowSolveProblems(true)}
            />
          </div>

        </div>
      </div>

      {/* Practice Modal */}
      {showPracticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Interview Practice</h3>
              <button onClick={() => setShowPracticeModal(false)} className="text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Mode Selection */}
              <div className="grid grid-cols-2 gap-3 p-1 bg-dark-950 rounded-lg">
                <button
                  onClick={() => setPracticeMode('solved')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    practiceMode === 'solved' 
                      ? 'bg-dark-800 text-white shadow-sm' 
                      : 'text-dark-400 hover:text-dark-200'
                  }`}
                >
                  Revisit Solved
                </button>
                <button
                  onClick={() => setPracticeMode('ai')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    practiceMode === 'ai' 
                      ? 'bg-brand-orange/10 text-brand-orange shadow-sm border border-brand-orange/20' 
                      : 'text-dark-400 hover:text-dark-200'
                  }`}
                >
                  <Zap className="w-3 h-3" /> New AI Problem
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  {practiceMode === 'solved' ? 'How many questions?' : 'Generate a similar problem based on a random solved one.'}
                </label>
                {practiceMode === 'solved' && (
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={practiceCount}
                    onChange={(e) => setPracticeCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-orange focus:outline-none transition-colors"
                  />
                )}
                {practiceMode === 'ai' && (
                  <p className="text-xs text-dark-400 leading-relaxed">
                    AI will pick a problem you've solved and generate a <strong>brand new</strong> question with the same pattern and difficulty, but a different story. Great for testing true understanding!
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPracticeModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg border border-dark-700 text-dark-300 hover:bg-dark-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartPractice}
                  disabled={practiceLoading}
                  className="flex-1 px-4 py-3 rounded-lg bg-brand-orange text-white hover:bg-brand-orange/90 transition-colors font-bold flex items-center justify-center gap-2"
                >
                  {practiceLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" /> {practiceMode === 'ai' ? 'Generate & Start' : 'Start Session'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pattern Focus Modal */}
      {showPatternModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" /> Pattern Focus
              </h3>
              <button onClick={() => setShowPatternModal(false)} className="text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-dark-400">
                Generate a custom AI problem focused on a specific pattern or topic.
              </p>

              {/* Pattern Selection */}
              <div>
                <SearchableSelect
                  label="Pattern"
                  options={uniquePatterns}
                  value={selectedPattern}
                  onChange={setSelectedPattern}
                  placeholder="Select or search pattern..."
                />
              </div>

              {/* Topic Selection */}
              <div>
                <SearchableSelect
                  label="Topic"
                  options={uniqueTopics}
                  value={selectedTopic}
                  onChange={setSelectedTopic}
                  placeholder="Select or search topic..."
                />
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Easy', 'Medium', 'Hard'].map(diff => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                        selectedDifficulty === diff
                          ? diff === 'Easy' ? 'bg-green-500/10 border-green-500 text-green-400'
                          : diff === 'Medium' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400'
                          : 'bg-red-500/10 border-red-500 text-red-400'
                          : 'border-dark-700 text-dark-400 hover:bg-dark-800'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handlePatternPractice}
                  disabled={practiceLoading}
                  className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors font-bold flex items-center justify-center gap-2"
                >
                  {practiceLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" /> Generate Problem
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Company Focus Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Company Focused Practice</h3>
              <button onClick={() => setShowCompanyModal(false)} className="text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Target Company</label>
                <input
                  type="text"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  placeholder="e.g. Google, Amazon, Uber"
                  className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-orange focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Topic (Optional)</label>
                <SearchableSelect
                  options={uniqueTopics}
                  value={selectedTopic}
                  onChange={setSelectedTopic}
                  placeholder="Any Topic"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Pattern (Optional)</label>
                <SearchableSelect
                  options={uniquePatterns}
                  value={selectedPattern}
                  onChange={setSelectedPattern}
                  placeholder="Any Pattern"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Easy', 'Medium', 'Hard'].map(diff => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedDifficulty === diff
                          ? diff === 'Easy' ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : diff === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-dark-950 text-dark-400 hover:bg-dark-800'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCompanyPractice}
                disabled={practiceLoading || !selectedCompany}
                className="w-full py-3 bg-brand-orange hover:bg-orange-600 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {practiceLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Play className="w-5 h-5" /> Start Interview
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Modal */}
      {showUpcoming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="text-xl font-bold text-white">📅 All Upcoming Reviews ({upcoming.length})</h3>
              <button onClick={() => setShowUpcoming(false)} className="text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2 overflow-y-auto flex-1 pr-2">
              {upcoming.map(revision => (
                <RevisionProblemCard key={revision.id} revision={revision} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Solve Problems Modal */}
      {showSolveProblems && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[85vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-brand-orange" /> Solve Problems
              </h3>
              <button onClick={() => setShowSolveProblems(false)} className="text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[70vh]">
              <SolveProblemsSection />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RevisionDashboardPage;
