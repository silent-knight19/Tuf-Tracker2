import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot, ChevronRight, Eye, EyeOff, Lightbulb, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../utils/api';
import { auth } from '../config/firebase';

function InterviewProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Description State
  const [description, setDescription] = useState(null);
  const [loadingDescription, setLoadingDescription] = useState(false);

  // AI Assist State
  const [helpData, setHelpData] = useState(null);
  const [loadingHelp, setLoadingHelp] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [activeSolutionTab, setActiveSolutionTab] = useState('brute');

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/revisions/${id}`);
        const data = response.data || response; // Handle both wrapped and unwrapped responses
        console.log('Fetched problem data:', data);
        console.log('problemTitle:', data.problemTitle);
        console.log('description:', data.description);
        setProblem(data);
        
        // If description is missing, fetch it using AI
        if (!data.description && data.problemTitle) {
          fetchDescription(data.problemTitle);
        } else if (data.description) {
          setDescription(data.description);
        } else {
          console.warn('Problem has no title or description', data);
          setDescription('Problem details unavailable.');
        }
      } catch (err) {
        console.error('Failed to fetch problem:', err);
        setError('Failed to load problem');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProblem();
    }
  }, [id]);

  const fetchDescription = async (title) => {
    try {
      setLoadingDescription(true);
      const token = await auth.currentUser.getIdToken();
      const response = await api.post('/ai/problem-description', {
        title: title
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Response is now a full problem object with description, examples, constraints
      setDescription(response.data);
    } catch (error) {
      console.error('Failed to fetch description:', error);
    } finally {
      setLoadingDescription(false);
    }
  };

  const handleAIAssist = async () => {
    if (helpData) return;

    try {
      setLoadingHelp(true);
      const token = await auth.currentUser.getIdToken();
      const response = await api.post('/ai/problem-help', {
        title: problem.problemTitle,
        description: description?.description || `Problem titled "${problem.problemTitle}"`,
        difficulty: problem.difficulty || 'Medium'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHelpData(response.data);
    } catch (error) {
      console.error('Failed to get AI help:', error);
      alert('Failed to generate AI hints and solutions.');
    } finally {
      setLoadingHelp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center text-red-400">
        {error || 'Problem not found'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-dark-800 pb-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                (problem.difficulty || 'Medium') === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                (problem.difficulty || 'Medium') === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {problem.difficulty || 'Medium'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{problem.problemTitle}</h1>
            <div className="text-dark-400 text-sm mt-1">Interview Practice Mode</div>
          </div>
          
          <div className="flex items-center gap-3">
            {!helpData && (
              <button 
                onClick={handleAIAssist}
                disabled={loadingHelp || loadingDescription}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingHelp ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
                AI Assist
              </button>
            )}
            <button 
              onClick={() => navigate('/revision')}
              className="p-2 hover:bg-dark-800 rounded-full transition-colors text-dark-400 hover:text-white"
              title="Exit Session"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>
        </div>

        {loadingDescription ? (
          <div className="flex flex-col items-center justify-center py-12 text-dark-400">
            <div className="w-8 h-8 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin mb-4" />
            <p>Fetching problem description...</p>
          </div>
        ) : description ? (
          <>
            {/* Problem Description */}
            <div className="prose prose-invert max-w-none bg-dark-900 rounded-xl p-8 border border-dark-800 shadow-lg">
              <ReactMarkdown>{description.description}</ReactMarkdown>
            </div>

            {/* Examples */}
            {description.examples && description.examples.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Examples</h2>
                <div className="grid gap-4">
                  {description.examples.map((example, index) => (
                    <div key={index} className="bg-dark-900 rounded-lg p-6 border border-dark-800">
                      <div className="space-y-2 font-mono text-sm">
                        <div>
                          <span className="text-dark-400">Input:</span> <span className="text-white">{example.input}</span>
                        </div>
                        <div>
                          <span className="text-dark-400">Output:</span> <span className="text-white">{example.output}</span>
                        </div>
                        {example.explanation && (
                          <div className="pt-2 text-dark-300 font-sans">
                            <span className="text-dark-500 font-bold text-xs uppercase tracking-wider block mb-1">Explanation:</span>
                            <ReactMarkdown components={{
                              p: ({node, ...props}) => <span {...props} />,
                              code: ({node, ...props}) => <code className="bg-dark-800 px-1 py-0.5 rounded text-brand-orange text-xs" {...props} />
                            }}>
                              {example.explanation}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Constraints */}
            {description.constraints && description.constraints.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Constraints</h2>
                <ul className="list-disc list-inside space-y-2 text-dark-300 bg-dark-900 p-6 rounded-lg border border-dark-800">
                  {description.constraints.map((constraint, index) => (
                    <li key={index}>{constraint}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="bg-dark-900 rounded-xl p-8 border border-dark-800 shadow-lg">
            <p className="text-dark-300 italic">Description unavailable.</p>
          </div>
        )}

        {/* Original Source Link */}
        <div className="flex gap-4">
          <a 
            href={problem.problemLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-sm text-white transition-colors flex items-center gap-2 border border-dark-700"
          >
            <ExternalLink className="w-4 h-4" /> Open Original Source
          </a>
        </div>

        {/* AI Assist Section */}
        {helpData && (
          <div className="space-y-8 pt-8 border-t border-dark-800 animate-fadeIn">
            
            {/* Hints Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" /> Hints
                </h2>
                <span className="text-sm text-dark-400">
                  {currentHintIndex + 1} / {helpData.hints.length} Revealed
                </span>
              </div>
              
              <div className="space-y-3">
                {helpData.hints.slice(0, currentHintIndex + 1).map((hint, index) => (
                  <div key={index} className="bg-dark-900/50 border border-dark-700 rounded-lg p-4 text-dark-200 animate-slideDown">
                    <span className="font-bold text-brand-orange mr-2">Hint {index + 1}:</span>
                    {hint}
                  </div>
                ))}
              </div>

              {currentHintIndex < helpData.hints.length - 1 && (
                <button
                  onClick={() => setCurrentHintIndex(prev => prev + 1)}
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                >
                  Show Next Hint <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Solutions Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-green-400" /> Solution
                </h2>
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-200 transition-colors"
                >
                  {showSolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showSolution ? 'Hide Solution' : 'Show Solution'}
                </button>
              </div>

              {showSolution && (
                <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden animate-fadeIn">
                  {/* Solution Tabs */}
                  <div className="flex border-b border-dark-800">
                    {['brute', 'better', 'optimal'].map((tab) => (
                      helpData.solutions[tab] && (
                        <button
                          key={tab}
                          onClick={() => setActiveSolutionTab(tab)}
                          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                            activeSolutionTab === tab
                              ? 'border-brand-orange text-white bg-dark-800/50'
                              : 'border-transparent text-dark-400 hover:text-dark-200 hover:bg-dark-800/30'
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)} Approach
                        </button>
                      )
                    ))}
                  </div>

                  {/* Solution Content */}
                  <div className="p-6 space-y-6">
                    {helpData.solutions[activeSolutionTab] ? (
                      <>
                        <div>
                          <h4 className="text-sm font-bold text-dark-400 uppercase tracking-wider mb-2">Complexity</h4>
                          <p className="text-white font-mono text-sm bg-dark-950 inline-block px-3 py-1 rounded border border-dark-800">
                            {helpData.solutions[activeSolutionTab].complexity}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-bold text-dark-400 uppercase tracking-wider mb-2">Explanation</h4>
                          <p className="text-dark-200 leading-relaxed">
                            {helpData.solutions[activeSolutionTab].explanation}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-dark-400 uppercase tracking-wider mb-2">Code (Java)</h4>
                          <div className="bg-dark-950 rounded-lg p-4 border border-dark-800 overflow-x-auto">
                            <pre className="text-sm font-mono text-blue-300">
                              <code>{helpData.solutions[activeSolutionTab].code}</code>
                            </pre>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-dark-400 italic">No specific {activeSolutionTab} approach available for this problem.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewProblemPage;
