import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useProblemStore } from '../stores/problemStore';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  ArrowLeft, 
  ExternalLink, 
  Sparkles, 
  RotateCw, 
  Lightbulb, 
  Edit2, 
  List,
  Check,
  X,
  Plus
} from 'lucide-react';

function ProblemViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { problems, updateProblem, generateNotes, generateDescription, fetchProblems, addProblem, loading } = useProblemStore();
  const [problem, setProblem] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);

  const [notesTab, setNotesTab] = useState('my-notes');
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [solutionTab, setSolutionTab] = useState('brute');
  const [notFound, setNotFound] = useState(false);

  // Resizable pane state
  const [leftWidth, setLeftWidth] = useState(50); // Percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  // Ensure problems are loaded
  useEffect(() => {
    if (problems.length === 0 && !loading) {
      fetchProblems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Find problem by ID or use state data
  useEffect(() => {
    // Check if problem data was passed via state (view-only mode)
    if (location.state?.problemData) {
      setProblem(location.state.problemData);
      setIsViewOnly(true);
      setNotFound(false);
      return;
    }

    // Check for localId in URL (new tab view-only mode)
    const params = new URLSearchParams(location.search);
    const localId = params.get('localId');
    if (localId) {
      try {
        const storedData = localStorage.getItem(`view_problem_${localId}`);
        if (storedData) {
          setProblem(JSON.parse(storedData));
          setIsViewOnly(true);
          setNotFound(false);
          return;
        }
      } catch (e) {
        console.error('Failed to load problem from storage', e);
      }
    }

    // Otherwise, find problem by ID from store
    if (id && problems.length > 0) {
      const foundProblem = problems.find(p => p.id === id);
      if (foundProblem) {
        setProblem(foundProblem);
        setNotes(foundProblem.notes || '');
        setIsViewOnly(false);
        setNotFound(false);
        
        // Auto-generate description if missing
        if (!foundProblem.description && !isGenerating && id && id !== 'undefined') {
          setIsGenerating(true);
          generateDescription(id)
            .then((description) => {
              setProblem(prev => ({ ...prev, description }));
            })
            .catch((error) => {
              console.error('Failed to auto-generate description:', error);
            })
            .finally(() => {
              setIsGenerating(false);
            });
        }
      } else {
        setNotFound(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, problems, location.state]);

  // Resizable pane handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Limit width between 20% and 80%
    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftWidth(newLeftWidth);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleSave = async () => {
    try {
      await updateProblem(problem.id, { notes });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update notes:', error);
    }
  };

  const handleGenerateNotes = async () => {
    setIsGenerating(true);
    try {
      // For view-only problems, generate notes without saving
      if (isViewOnly) {
        // Call the backend with problem data
        const response = await fetch(`${import.meta.env.VITE_API_URL}/problems/generate-notes-preview`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: problem.title,
            platform: problem.platform || 'LeetCode',
            platformUrl: problem.platformUrl || '',
            difficulty: problem.difficulty || 'Medium',
            topics: problem.topics || [],
            patterns: problem.patterns || []
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate notes');
        }
        
        const data = await response.json();
        setProblem(prev => ({ ...prev, aiNotes: data.notes }));
      } else {
        // For saved problems, generate and save notes
        const generatedNotes = await generateNotes(problem.id);
        await updateProblem(problem.id, { aiNotes: generatedNotes });
        // Refresh problem data
        const updatedProblem = problems.find(p => p.id === id);
        setProblem(updatedProblem);
      }
    } catch (error) {
      console.error('Failed to generate notes:', error);
      alert('Failed to generate notes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const parseAINotes = (notesData) => {
    // console.log('parseAINotes input:', typeof notesData, notesData);
    if (!notesData) return null;

    // If it's already an object (from JSON response), return it
    if (typeof notesData === 'object' && notesData.understanding) {
      return notesData;
    }

    // Try to parse if it's a JSON string
    if (typeof notesData === 'string') {
      try {
        // Clean up any potential markdown code blocks
        let cleanJson = notesData.trim();
        if (cleanJson.startsWith('```json')) cleanJson = cleanJson.slice(7);
        if (cleanJson.startsWith('```')) cleanJson = cleanJson.slice(3);
        if (cleanJson.endsWith('```')) cleanJson = cleanJson.slice(0, -3);

        let parsed = JSON.parse(cleanJson);
        
        // Handle double-stringified JSON
        if (typeof parsed === 'string') {
          try {
            parsed = JSON.parse(parsed);
          } catch (e) {
            console.warn("Failed to parse double-stringified JSON", e);
          }
        }
        
        // Return parsed object if it has the expected structure
        if (parsed.understanding || parsed.bruteForce || parsed.optimal) {
          // Helper to recursively replace \n
          const replaceNewlines = (obj) => {
            if (typeof obj === 'string') return obj.replace(/\\n/g, '\n');
            if (typeof obj === 'object' && obj !== null) {
              Object.keys(obj).forEach(key => {
                obj[key] = replaceNewlines(obj[key]);
              });
            }
            return obj;
          };
          return replaceNewlines(parsed);
        }
      } catch (e) {
        // Try to extract JSON using regex if direct parsing failed
        try {
          const jsonMatch = notesData.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.understanding || parsed.bruteForce || parsed.optimal) {
              // Helper to recursively replace \n
              const replaceNewlines = (obj) => {
                if (typeof obj === 'string') return obj.replace(/\\n/g, '\n');
                if (typeof obj === 'object' && obj !== null) {
                  Object.keys(obj).forEach(key => {
                    obj[key] = replaceNewlines(obj[key]);
                  });
                }
                return obj;
              };
              return replaceNewlines(parsed);
            }
          }
        } catch (e2) {
          console.warn("Failed to parse extracted JSON", e2);
        }

        // If JSON parse fails, fall back to raw display (legacy support)
        console.warn("Failed to parse AI notes JSON, treating as raw markdown", e);
        console.log("Failed JSON string:", notesData);
      }
    }

    // Legacy/Fallback for raw markdown
    return { raw: String(notesData), isRaw: true };
  };

  const aiSections = parseAINotes(problem?.aiNotes);

  // Loading state
  if (loading || (!problem && !notFound)) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange mx-auto mb-4"></div>
          <p className="text-dark-400">Loading problem...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (notFound || !problem) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Problem Not Found</h2>
          <p className="text-dark-400 mb-4">The problem you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/problems')} className="btn btn-primary">
            Back to Problems
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-dark-950">
      {/* Top Bar */}
      <div className="h-12 bg-dark-900 border-b border-dark-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="text-dark-400 hover:text-dark-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-dark-400 text-sm">
            {isViewOnly ? 'Preview' : 'Problem List'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isViewOnly && (
            <button 
              onClick={async () => {
                try {
                  const newProblem = await addProblem({
                    title: problem.title,
                    platform: problem.platform || 'LeetCode',
                    platformUrl: problem.platformUrl || '',
                    difficulty: problem.difficulty || 'Medium',
                    topics: problem.topics || [],
                    patterns: problem.patterns || [],
                    status: 'Todo'
                  });
                  if (newProblem?.id) {
                    navigate(`/problem/${newProblem.id}`, { replace: true });
                  }
                } catch (error) {
                  console.error('Failed to add problem:', error);
                }
              }}
              className="btn btn-primary text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add to My Problems
            </button>
          )}
          <button className="btn btn-ghost text-sm">
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden" ref={containerRef}>
        {/* Left Panel - Problem Description */}
        <div 
          className="flex flex-col border-r border-dark-800"
          style={{ width: `${leftWidth}%` }}
        >
          {/* Problem Header */}
          <div className="p-4 border-b border-dark-800">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl font-extrabold text-white">{problem.title}</h1>
              <span className={`badge font-medium ${
                problem.difficulty === 'Hard' ? 'badge-hard' :
                problem.difficulty === 'Medium' ? 'badge-medium' :
                'badge-easy'
              }`}>
                {problem.difficulty}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {problem.topics?.map(topic => (
                <span key={topic} className="badge bg-dark-800 text-dark-300 border-dark-700 text-xs font-medium">
                  {topic}
                </span>
              ))}
              {problem.patterns?.map(pattern => (
                <span key={pattern} className="badge bg-brand-orange/10 text-brand-orange border-brand-orange/20 text-xs font-medium">
                  {pattern}
                </span>
              ))}
            </div>
            
            {problem.companies && problem.companies.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 items-center">
                <span className="text-xs text-dark-400 mr-1 font-medium">Companies:</span>
                {problem.companies.map(company => (
                  <span key={company} className="px-2 py-0.5 rounded text-[10px] bg-dark-800 text-dark-400 border border-dark-700 font-medium">
                    {company}
                  </span>
                ))}
              </div>
            )}

            {(() => {
              const platformUrl = problem.platformUrl || (
                problem.platform === 'LeetCode' 
                  ? `https://leetcode.com/problems/${problem.title.toLowerCase().replace(/\s+/g, '-')}/`
                  : null
              );

              if (!platformUrl) return null;

              return (
                <a 
                  href={platformUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand-orange hover:underline text-sm flex items-center gap-1 font-medium"
                >
                  View on {problem.platform}
                  <ExternalLink className="w-4 h-4" />
                </a>
              );
            })()}
          </div>

          {/* Description Content */}
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              <div className="prose prose-invert prose-sm max-w-none">
                {isGenerating ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-dark-400">Generating description...</p>
                  </div>
                ) : problem.description ? (
                  <>
                    {/* Problem Statement */}
                    <div className="text-dark-200 font-medium leading-relaxed mb-6">
                      <span dangerouslySetInnerHTML={{ 
                        __html: problem.description.statement.replace(
                          /`([^`]+)`/g, 
                          '<code class="text-blue-400 bg-dark-800 px-1.5 py-0.5 rounded text-sm">$1</code>'
                        )
                      }} />
                    </div>

                    {/* Examples */}
                    {problem.description.examples?.map((example, idx) => (
                      <div key={idx} className="mb-4">
                        <h3 className="text-white font-bold mb-2">Example {idx + 1}:</h3>
                        <div className="bg-dark-900 rounded p-3 font-mono text-sm">
                          <div className="text-dark-300 font-medium">
                            <span className="text-dark-400">Input:</span> {example.input}
                          </div>
                          <div className="text-dark-300 font-medium">
                            <span className="text-dark-400">Output:</span> {example.output}
                          </div>
                          {example.explanation && (
                            <div className="text-dark-300 mt-2 font-medium">
                              <span className="text-dark-400">Explanation:</span> {example.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Constraints */}
                    {problem.description.constraints && problem.description.constraints.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-white font-bold mb-2">Constraints:</h3>
                        <ul className="list-none space-y-1">
                          {problem.description.constraints.map((constraint, idx) => (
                            <li key={idx} className="text-dark-300 text-sm font-medium">
                              • <span dangerouslySetInnerHTML={{ 
                                __html: constraint.replace(
                                  /`([^`]+)`/g, 
                                  '<code class="text-blue-400 bg-dark-800 px-1.5 py-0.5 rounded text-xs">$1</code>'
                                )
                              }} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Follow-up */}
                    {problem.description.followUp && (
                      <div className="mt-6 pt-4 border-t border-dark-800">
                        <h3 className="text-white font-bold mb-2">Follow-up:</h3>
                        <p className="text-dark-300 text-sm font-medium">{problem.description.followUp}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-dark-400 mb-4">No description available yet.</p>
                    <button
                      onClick={async () => {
                        setIsGenerating(true);
                        try {
                          // For view-only problems, generate description without ID
                          if (isViewOnly) {
                            const response = await fetch(`${import.meta.env.VITE_API_URL}/problems/generate-description-preview`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                title: problem.title,
                                platform: problem.platform || 'LeetCode',
                                difficulty: problem.difficulty || 'Medium',
                                topics: problem.topics || [],
                                patterns: problem.patterns || []
                              })
                            });
                            
                            if (!response.ok) {
                              throw new Error('Failed to generate description');
                            }
                            
                            const data = await response.json();
                            setProblem(prev => ({ ...prev, description: data.description }));
                          } else {
                            const description = await generateDescription(problem.id);
                            setProblem(prev => ({ ...prev, description }));
                          }
                        } catch (error) {
                          console.error('Failed to generate description:', error);
                          alert('Failed to generate description. Please try again.');
                        } finally {
                          setIsGenerating(false);
                        }
                      }}
                      disabled={isGenerating}
                      className="btn btn-primary flex items-center gap-2 mx-auto"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Description
                    </button>
                  </div>
                )}
              </div>

          </div>
        </div>

        {/* Resizer Handle */}
        <div
          className={`w-1 bg-dark-800 hover:bg-brand-orange cursor-col-resize flex items-center justify-center transition-colors z-10 ${isDragging ? 'bg-brand-orange' : ''}`}
          onMouseDown={handleMouseDown}
        >
          <div className="h-8 w-1 bg-dark-600 rounded-full" />
        </div>

        {/* Right Panel - Notes */}
        <div 
          className="flex flex-col bg-dark-900"
          style={{ width: `${100 - leftWidth}%` }}
        >
          {/* Notes Tab Selector */}
          <div className="h-12 border-b border-dark-800 flex items-center justify-between px-4 shrink-0">
            <div className="flex gap-2">
              <button
                onClick={() => setNotesTab('my-notes')}
                className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                  notesTab === 'my-notes'
                    ? 'bg-dark-700 text-white'
                    : 'text-dark-400 hover:text-dark-200'
                }`}
              >
                My Notes
              </button>
              <button
                onClick={() => setNotesTab('ai-guide')}
                className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors flex items-center gap-2 ${
                  notesTab === 'ai-guide'
                    ? 'bg-dark-700 text-white'
                    : 'text-dark-400 hover:text-dark-200'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                AI Study Guide
              </button>
            </div>

            {notesTab === 'my-notes' && !isViewOnly && (
              <div className="flex gap-2">
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="btn btn-secondary text-sm px-3 py-1 flex items-center gap-1">
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                ) : (
                  <>
                    <button onClick={() => setIsEditing(false)} className="btn btn-ghost text-sm px-3 py-1 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      Cancel
                    </button>
                    <button onClick={handleSave} className="btn btn-primary text-sm px-3 py-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Save
                    </button>
                  </>
                )}
              </div>
            )}

            {notesTab === 'ai-guide' && (
              <button
                onClick={handleGenerateNotes}
                disabled={isGenerating}
                className="btn btn-primary text-sm px-3 py-1.5 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    {aiSections ? <RotateCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    {aiSections ? 'Regenerate' : 'Generate'}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Notes Content */}
          <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
            {notesTab === 'my-notes' ? (
              isViewOnly ? (
                <div className="bg-dark-950 rounded-lg p-6 text-center">
                  <Lightbulb className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                  <p className="text-dark-400 mb-2">This is a preview mode</p>
                  <p className="text-dark-500 text-sm">Add this problem to your list to take notes</p>
                </div>
              ) : isEditing ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input w-full h-full font-mono text-sm resize-none"
                  placeholder="Write your notes here..."
                />
              ) : (
                <div className="bg-dark-950 rounded-lg p-4 text-dark-200 whitespace-pre-wrap min-h-full text-sm">
                  {notes || <span className="text-dark-500 italic">No notes yet. Click Edit to add your notes.</span>}
                </div>
              )
            ) : aiSections ? (
              <div className="space-y-4">
                {aiSections.isRaw ? (
                  // Fallback for raw markdown
                  <div className="bg-dark-950 rounded-lg p-4 prose prose-invert prose-sm max-w-none">
                     <div dangerouslySetInnerHTML={{ __html: aiSections.raw.replace(/\n/g, '<br/>') }} />
                  </div>
                ) : (
                  <>
                    {/* Problem Understanding */}
                    {aiSections.understanding && (
                      <div className="bg-dark-950 rounded-lg p-4">
                        <h3 className="text-sm font-bold text-dark-300 mb-2">Problem Understanding</h3>
                        <div className="text-sm font-medium text-dark-300 leading-relaxed whitespace-pre-wrap">
                          {aiSections.understanding}
                        </div>
                      </div>
                    )}

                    {/* Solution Tabs */}
                    <div className="bg-dark-950 rounded-lg p-4">
                      <div className="flex gap-2 mb-4">
                        {aiSections.bruteForce?.code && (
                          <button
                            onClick={() => setSolutionTab('brute')}
                            className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                              solutionTab === 'brute' ? 'bg-brand-orange text-white' : 'bg-dark-800 text-dark-400'
                            }`}
                          >
                            Brute Force
                          </button>
                        )}
                        {aiSections.better?.code && (
                          <button
                            onClick={() => setSolutionTab('better')}
                            className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                              solutionTab === 'better' ? 'bg-brand-orange text-white' : 'bg-dark-800 text-dark-400'
                            }`}
                          >
                            Better
                          </button>
                        )}
                        {aiSections.optimal?.code && (
                          <button
                            onClick={() => setSolutionTab('optimal')}
                            className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                              solutionTab === 'optimal' ? 'bg-brand-orange text-white' : 'bg-dark-800 text-dark-400'
                            }`}
                          >
                            Optimal
                          </button>
                        )}
                      </div>

                      {/* Code Display */}
                      {solutionTab === 'brute' && aiSections.bruteForce?.code && (
                        <div>
                          {aiSections.bruteForce.explanation && (
                            <div className="text-sm font-medium text-dark-300 leading-relaxed mb-4 pb-4 border-b border-dark-800 whitespace-pre-wrap">
                              {aiSections.bruteForce.explanation}
                              {aiSections.bruteForce.complexity && (
                                <div className="mt-2 text-dark-400 font-medium">
                                  {aiSections.bruteForce.complexity}
                                </div>
                              )}
                            </div>
                          )}
                          <SyntaxHighlighter
                            language="java"
                            style={vscDarkPlus}
                            customStyle={{
                              margin: 0,
                              borderRadius: '0.5rem',
                              fontSize: '0.75rem',
                              lineHeight: '1.5'
                            }}
                            showLineNumbers={false}
                          >
                            {aiSections.bruteForce.code}
                          </SyntaxHighlighter>
                        </div>
                      )}
                      {solutionTab === 'better' && aiSections.better?.code && (
                        <div>
                          {aiSections.better.explanation && (
                            <div className="text-sm font-medium text-dark-300 leading-relaxed mb-4 pb-4 border-b border-dark-800 whitespace-pre-wrap">
                              {aiSections.better.explanation}
                              {aiSections.better.complexity && (
                                <div className="mt-2 text-dark-400 font-medium">
                                  {aiSections.better.complexity}
                                </div>
                              )}
                            </div>
                          )}
                          <SyntaxHighlighter
                            language="java"
                            style={vscDarkPlus}
                            customStyle={{
                              margin: 0,
                              borderRadius: '0.5rem',
                              fontSize: '0.75rem',
                              lineHeight: '1.5'
                            }}
                            showLineNumbers={false}
                          >
                            {aiSections.better.code}
                          </SyntaxHighlighter>
                        </div>
                      )}
                      {solutionTab === 'optimal' && aiSections.optimal?.code && (
                        <div>
                          {aiSections.optimal.explanation && (
                            <div className="text-sm font-medium text-dark-300 leading-relaxed mb-4 pb-4 border-b border-dark-800 whitespace-pre-wrap">
                              {aiSections.optimal.explanation}
                              {aiSections.optimal.complexity && (
                                <div className="mt-2 text-dark-400 font-medium">
                                  {aiSections.optimal.complexity}
                                </div>
                              )}
                            </div>
                          )}
                          <SyntaxHighlighter
                            language="java"
                            style={vscDarkPlus}
                            customStyle={{
                              margin: 0,
                              borderRadius: '0.5rem',
                              fontSize: '0.75rem',
                              lineHeight: '1.5'
                            }}
                            showLineNumbers={false}
                          >
                            {aiSections.optimal.code}
                          </SyntaxHighlighter>
                        </div>
                      )}
                    </div>

                    {/* Key Takeaways */}
                    {aiSections.takeaways && (
                      <div className="bg-dark-950 rounded-lg p-4">
                        <h3 className="text-sm font-bold text-brand-yellow mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Key Takeaways
                        </h3>
                        <div className="text-sm font-medium text-dark-300 leading-relaxed whitespace-pre-wrap">{aiSections.takeaways}</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center text-dark-500">
                <div>
                  {isViewOnly ? (
                    <>
                      <Sparkles className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                      <p className="text-dark-400 mb-2">AI Study Guide unavailable in preview</p>
                      <p className="text-sm">Add this problem to generate AI-powered notes</p>
                    </>
                  ) : (
                    <>
                      <p className="mb-2">No AI study guide generated yet.</p>
                      <p className="text-sm">Click "Generate" to create comprehensive notes.</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemViewPage;
