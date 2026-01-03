import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useProblemStore } from '../stores/problemStore';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  ArrowLeft, 
  ExternalLink, 
  Cpu, 
  Terminal, 
  RotateCw, 
  Lightbulb, 
  Edit2, 
  List,
  Check,
  X,
  Plus,
  Zap,
  Target,
  AlertCircle,
  Link,
  CheckCircle2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function ProblemViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { problems, updateProblem, generateNotes, generateDescription, fetchProblems, fetchProblem, addProblem, loading } = useProblemStore();
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
  
  // Track which problems have had full details fetched (prevents infinite loops)
  const fetchedDetailsRef = useRef(new Set());

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
    if (id) {
      const foundProblem = problems.find(p => p.id === id);
      
      if (foundProblem) {
        setProblem(foundProblem);
        setNotes(foundProblem.notes || '');
        setIsViewOnly(false);
        setNotFound(false);
        
        // If description is missing AND we haven't already fetched full details, fetch them
        // The ref prevents infinite loops when the store updates
        if ((!foundProblem.description || !foundProblem.code) && !fetchedDetailsRef.current.has(id)) {
          fetchedDetailsRef.current.add(id); // Mark as fetching/fetched BEFORE the call
          fetchProblem(id).catch(err => console.error("Failed to fetch full problem details:", err));
        }
      } else {
        // If not found in store at all, try fetching it (only once)
        if (!fetchedDetailsRef.current.has(id)) {
          fetchedDetailsRef.current.add(id);
          fetchProblem(id)
            .catch(() => setNotFound(true));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, problems, location.state]);

  // Auto-generate content if missing
  const autoGenRef = useRef({ description: false, notes: false });
  
  useEffect(() => {
    if (!problem || !id || isViewOnly) return; 

    const autoGenerate = async () => {
       // 1. Auto-generate Description if missing (and not already generating)
       if (!problem.description && !autoGenRef.current.description) {
         autoGenRef.current.description = true;
         console.log('Auto-generating description...');
         try {
           const description = await generateDescription(problem.id);
           setProblem(prev => ({ ...prev, description }));
         } catch (e) {
           console.error('Auto-gen description failed', e);
         }
       }

       // 2. Auto-generate AI Notes if missing (and not already generating)
       if (!problem.aiNotes && !autoGenRef.current.notes) {
         autoGenRef.current.notes = true;
         console.log('Auto-generating notes...');
         try {
            await handleGenerateNotes();
         } catch (e) {
           console.error('Auto-gen notes failed', e);
         }
       }
    };

    autoGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem, id, isViewOnly]); // Depend on problem state so it runs after fetch

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
      // Determine if this is a regeneration (already has notes)
      const isRegenerate = !!problem?.aiNotes;
      
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
            patterns: problem.patterns || [],
            forceRefresh: isRegenerate // Force fresh generation if regenerating
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate notes');
        }
        
        const data = await response.json();
        setProblem(prev => ({ ...prev, aiNotes: data.notes }));
      } else {
        // For saved problems, generate and save notes
        const generatedNotes = await generateNotes(problem.id, isRegenerate);
        await updateProblem(problem.id, { aiNotes: generatedNotes });
        // Update local state directly with generated notes
        setProblem(prev => ({ ...prev, aiNotes: generatedNotes }));
      }
    } catch (error) {
      console.error('Failed to generate notes:', error);
      alert('Failed to generate notes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const parseAINotes = (notesData) => {
    if (!notesData) return null;

    // Handle already objects
    if (typeof notesData === 'object') {
      return notesData;
    }

    // Try to parse if it's a string
    if (typeof notesData === 'string') {
      try {
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
            // Keep original if second parse fails
          }
        }
        
        if (typeof parsed === 'object' && parsed !== null) {
          // Helper to recursively replace \n (sometimes LLMs return literal \n instead of actual newlines)
          const replaceNewlines = (obj) => {
            if (typeof obj === 'string') return obj.replace(/\\n/g, '\n');
            if (typeof obj === 'object' && obj !== null) {
              const newObj = Array.isArray(obj) ? [] : {};
              Object.keys(obj).forEach(key => {
                newObj[key] = replaceNewlines(obj[key]);
              });
              return newObj;
            }
            return obj;
          };

          const processed = replaceNewlines(parsed);
          return processed;
        }
        
        return { raw: typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2), isRaw: true };
      } catch (e) {
        // Not JSON, return as raw string
        return { raw: notesData, isRaw: true };
      }
    }

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
          {problem.platformUrl && (
            <a 
              href={problem.platformUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 hover:text-amber-400 rounded-lg text-sm font-bold transition-all border border-amber-500/20 hover:border-amber-500/50 flex items-center gap-2 shadow-lg shadow-amber-500/5"
              title={`Open on ${problem.platform}`}
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">LeetCode</span>
            </a>
          )}
          {!isViewOnly && (
            <button
              onClick={() => window.open(`/solve/${problem.id}`, '_blank')}
              className="text-white hover:text-white text-sm flex items-center gap-1.5 font-bold bg-brand-orange hover:bg-orange-600 px-3 py-1.5 rounded-lg border border-brand-orange/20 transition-all shadow-lg shadow-brand-orange/20"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span className="hidden sm:inline">Solve with AI</span>
            </button>
          )}
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
                    <div className="text-dark-200 font-medium leading-loose mb-8">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, children}) => <p className="mb-4 last:mb-0 leading-7 text-[15px] tracking-wide">{children}</p>,
                          strong: ({node, children}) => <strong className="text-brand-orange font-bold">{children}</strong>,
                          code: ({node, inline, className, children, ...props}) => {
                            // Check if this is inline code (not wrapped in pre)
                            const isInline = !className && (inline !== false);
                            return isInline ? (
                              <code className="bg-dark-800/80 text-brand-orange px-1.5 py-0.5 rounded text-sm font-mono border border-dark-700" {...props}>{children}</code>
                            ) : (
                              <pre className="bg-dark-900 rounded-lg p-3 my-4 border border-dark-800 overflow-x-auto">
                                <code className="text-sm text-dark-200 font-mono" {...props}>{children}</code>
                              </pre>
                            );
                          },
                          ul: ({node, children}) => <ul className="list-disc list-inside space-y-2 my-4 ml-2">{children}</ul>,
                          ol: ({node, children}) => <ol className="list-decimal list-inside space-y-2 my-4 ml-2">{children}</ol>,
                          li: ({node, children}) => <li className="text-dark-300 leading-relaxed">{children}</li>,
                          h1: ({node, children}) => <h1 className="text-xl font-bold text-white mt-6 mb-3">{children}</h1>,
                          h2: ({node, children}) => <h2 className="text-lg font-bold text-white mt-5 mb-2">{children}</h2>,
                          h3: ({node, children}) => <h3 className="text-base font-bold text-white mt-4 mb-2">{children}</h3>,
                          blockquote: ({node, children}) => <blockquote className="border-l-4 border-brand-orange/50 pl-4 my-4 text-dark-300 italic">{children}</blockquote>
                        }}
                      >
                        {typeof problem.description === 'string' 
                          ? problem.description 
                          : problem.description?.statement || problem.description?.description || ''}
                      </ReactMarkdown>
                    </div>

                    {/* Examples */}
                    {problem.description.examples?.map((example, idx) => (
                      <div key={idx} className="mb-4">
                        <h3 className="text-white font-bold mb-2">Example {idx + 1}:</h3>
                        <div className="bg-dark-900 rounded p-3 font-mono text-sm">
                          <div className="text-dark-300 font-medium">
                            <span className="text-dark-400">Input:</span> {typeof example.input === 'object' ? JSON.stringify(example.input) : example.input}
                          </div>
                          <div className="text-dark-300 font-medium">
                            <span className="text-dark-400">Output:</span> {typeof example.output === 'object' ? JSON.stringify(example.output) : example.output}
                          </div>
                          {example.explanation && (
                            <div className="text-dark-300 mt-2 font-medium">
                              <span className="text-dark-400">Explanation:</span> {typeof example.explanation === 'object' ? JSON.stringify(example.explanation) : example.explanation}
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
                            • <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ p: ({children}) => <span className="inline-block">{children}</span> }}>
                                {constraint}
                              </ReactMarkdown>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Follow ups (Related Problems) */}
                    {aiSections?.relatedProblems && Array.isArray(aiSections.relatedProblems) && (
                      <div className="mb-6">
                        <h3 className="text-white font-black mb-3 flex items-center gap-2 uppercase text-xs tracking-widest">
                          <Link className="w-4 h-4 text-brand-orange" />
                          Follow ups
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {aiSections.relatedProblems.map((p, idx) => {
                            const isObject = typeof p === 'object' && p !== null;
                            const title = isObject ? p.title : p;
                            
                            // Try to find a matching problem in our bank to link to our solve page
                            const matchedProblem = problems.find(bp => 
                              bp.title?.toLowerCase() === title?.toLowerCase() || 
                              title?.toLowerCase().includes(bp.title?.toLowerCase())
                            );

                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  if (matchedProblem) {
                                    window.open(`/solve/${matchedProblem.id}`, '_blank');
                                  } else {
                                    // Fallback: search for this problem in the solve view
                                    window.open(`/solve/search?q=${encodeURIComponent(title)}`, '_blank');
                                  }
                                }}
                                className="px-3 py-2 bg-brand-orange/10 text-brand-orange rounded-xl text-[10px] border border-brand-orange/20 font-black uppercase tracking-wider hover:bg-brand-orange hover:text-white transition-all flex items-center gap-2 group shadow-lg shadow-brand-orange/5"
                              >
                                <Zap className="w-3.5 h-3.5 fill-current" />
                                {title}
                              </button>
                            );
                          })}
                        </div>
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
                      <Cpu className="w-4 h-4" />
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
                <Cpu className="w-3 h-3" />
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
                    {aiSections ? <RotateCw className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
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
                    {/* Modern Educational Schema Sections */}
                    {aiSections.keyInsights && Array.isArray(aiSections.keyInsights) && (
                      <div className="bg-dark-950 rounded-lg p-4">
                        <h3 className="text-sm font-bold text-brand-orange mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Key Insights
                        </h3>
                        <ul className="space-y-2">
                          {aiSections.keyInsights.map((insight, idx) => (
                            <li key={idx} className="text-sm font-medium text-dark-300 flex gap-2">
                              <span className="text-brand-orange text-xs mt-1 shrink-0 px-1.5 py-0.5 bg-brand-orange/10 rounded">{idx + 1}</span>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiSections.approach && (
                      <div className="bg-dark-950 rounded-lg p-4">
                        <h3 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Approach
                        </h3>
                        {Array.isArray(aiSections.approach) ? (
                          <ul className="space-y-2">
                            {aiSections.approach.map((step, idx) => (
                              <li key={idx} className="text-sm font-medium text-dark-300 flex gap-2">
                                <span className="text-blue-400 mt-1.5 shrink-0">•</span>
                                {step}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-sm font-medium text-dark-300 leading-relaxed whitespace-pre-wrap">
                            {aiSections.approach}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Shared Solution Rendering Logic (supports both legacy and new solutions object) */}
                    {(() => {
                      const solutions = aiSections.solutions || {
                        brute: aiSections.bruteForce,
                        better: aiSections.better,
                        optimal: aiSections.optimal
                      };

                      if (!solutions.brute && !solutions.better && !solutions.optimal) return null;

                      return (
                        <div className="bg-dark-950 rounded-lg p-4">
                          <div className="flex gap-2 mb-4">
                            {solutions.brute?.code && (
                              <button
                                onClick={() => setSolutionTab('brute')}
                                className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                                  solutionTab === 'brute' ? 'bg-brand-orange text-white' : 'bg-dark-800 text-dark-400'
                                }`}
                              >
                                Brute Force
                              </button>
                            )}
                            {solutions.better?.code && (
                              <button
                                onClick={() => setSolutionTab('better')}
                                className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                                  solutionTab === 'better' ? 'bg-brand-orange text-white' : 'bg-dark-800 text-dark-400'
                                }`}
                              >
                                Better
                              </button>
                            )}
                            {solutions.optimal?.code && (
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
                          {['brute', 'better', 'optimal'].map(type => {
                            if (solutionTab !== type || !solutions[type]?.code) return null;
                            const sol = solutions[type];
                            return (
                              <div key={type}>
                                {sol.explanation && (
                                  <div className="text-sm font-medium text-dark-300 leading-relaxed mb-4 pb-4 border-b border-dark-800">
                                    {Array.isArray(sol.explanation) ? (
                                      <ul className="space-y-2 mb-2">
                                        {sol.explanation.map((step, i) => (
                                          <li key={i} className="flex gap-2">
                                            <span className="text-dark-500 font-bold">{i + 1}.</span>
                                            {step}
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <div className="whitespace-pre-wrap">{sol.explanation}</div>
                                    )}
                                    {sol.complexity && (
                                      <div className="mt-2 text-brand-orange font-bold text-xs uppercase tracking-wider bg-brand-orange/5 px-2 py-1 rounded w-fit">
                                        {sol.complexity}
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
                                  {sol.code}
                                </SyntaxHighlighter>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {aiSections.commonMistakes && Array.isArray(aiSections.commonMistakes) && (
                      <div className="bg-dark-950 rounded-lg p-4">
                        <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Common Mistakes
                        </h3>
                        <ul className="space-y-2">
                          {aiSections.commonMistakes.map((mistake, idx) => (
                            <li key={idx} className="text-sm font-medium text-dark-300 flex gap-2">
                              <span className="text-red-400 mt-1.5 shrink-0">•</span>
                              {mistake}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiSections.practiceRecommendations && Array.isArray(aiSections.practiceRecommendations) && (
                      <div className="bg-dark-950 rounded-lg p-4">
                        <h3 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Practice Tips
                        </h3>
                        <ul className="space-y-2">
                          {aiSections.practiceRecommendations.map((tip, idx) => (
                            <li key={idx} className="text-sm font-medium text-dark-300 flex gap-2 border-l-2 border-green-500/20 pl-3">
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}



                    {/* Fallback Legacy/Solution-Centric Sections (if not handled by the new logic) */}
                    {aiSections.understanding && !aiSections.keyInsights && (
                      <div className="bg-dark-950 rounded-lg p-4">
                        <h3 className="text-sm font-bold text-dark-300 mb-2">Problem Understanding</h3>
                        <div className="text-sm font-medium text-dark-300 leading-relaxed whitespace-pre-wrap">
                          {aiSections.understanding}
                        </div>
                      </div>
                    )}

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

                    {/* Catch-all for any other strings in the object */}
                    {Object.keys(aiSections).filter(key => 
                      !['raw', 'isRaw', 'keyInsights', 'approach', 'commonMistakes', 'relatedProblems', 'practiceRecommendations', 
                        'understanding', 'bruteForce', 'optimal', 'better', 'takeaways', 'solutions'].includes(key)
                    ).map(key => (
                      <div key={key} className="bg-dark-950 rounded-lg p-4">
                        <h3 className="text-sm font-bold text-dark-400 mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
                        <div className="text-sm font-medium text-dark-300 leading-relaxed whitespace-pre-wrap">
                          {typeof aiSections[key] === 'object' ? JSON.stringify(aiSections[key], null, 2) : String(aiSections[key])}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center text-dark-500">
                <div>
                  {isViewOnly ? (
                    <>
                      <Cpu className="w-12 h-12 text-dark-600 mx-auto mb-3" />
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
