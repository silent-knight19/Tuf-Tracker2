import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, ExternalLink, Bot, ChevronRight, Eye, EyeOff, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../utils/api';
import { auth } from '../config/firebase';

function AIInterviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { problem } = location.state || {};

  // AI Assist State
  const [helpData, setHelpData] = useState(null);
  const [loadingHelp, setLoadingHelp] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [activeSolutionTab, setActiveSolutionTab] = useState('brute'); // 'brute', 'better', 'optimal'

  const handleAIAssist = async () => {
    if (helpData) return; // Already fetched

    try {
      setLoadingHelp(true);
      const token = await auth.currentUser.getIdToken();
      const response = await api.post('/ai/problem-help', {
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty
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

  if (!problem) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center text-dark-300">
        <p className="mb-4">No problem data found.</p>
        <button 
          onClick={() => navigate('/revision')}
          className="px-4 py-2 bg-dark-800 rounded hover:bg-dark-700 transition-colors"
        >
          Go Back
        </button>
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
              <span className="px-2 py-1 rounded text-xs font-bold bg-brand-orange/10 text-brand-orange border border-brand-orange/20 flex items-center gap-1">
                <Zap className="w-3 h-3" /> AI GENERATED
              </span>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {problem.difficulty}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{problem.title}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {!helpData && (
              <button 
                onClick={handleAIAssist}
                disabled={loadingHelp}
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

        {/* Problem Description */}
        <div className="prose prose-invert max-w-none bg-dark-900 rounded-xl p-8 border border-dark-800 shadow-lg">
          <ReactMarkdown>{problem.description}</ReactMarkdown>
        </div>

        {/* Examples */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Examples</h2>
          <div className="grid gap-4">
            {problem.examples?.map((example, index) => (
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

        {/* Constraints */}
        {problem.constraints && problem.constraints.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Constraints</h2>
            <ul className="list-disc list-inside space-y-2 text-dark-300 bg-dark-900 p-6 rounded-lg border border-dark-800">
              {problem.constraints.map((constraint, index) => (
                <li key={index}>{constraint}</li>
              ))}
            </ul>
          </div>
        )}

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

export default AIInterviewPage;
