import { useState, useEffect } from 'react';
import { useProblemStore } from '../../stores/problemStore';
import { useScrollLock } from '../../hooks/useScrollLock';
import { Cpu, RotateCw, Lightbulb, X, ExternalLink } from 'lucide-react';
import { isSafeHttpUrl } from '../ui/SafeMarkdown';
import StudyGuideView from './ai/StudyGuideView';

function ProblemDetailsModal({ problem, isOpen, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState('');
  const [approach, setApproach] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { updateProblem, generateNotes } = useProblemStore();

  useScrollLock(isOpen);

  useEffect(() => {
    if (problem) {
      setNotes(problem.notes || '');
      setApproach(problem.approach || '');
    }
  }, [problem]);

  const handleSave = async () => {
    try {
      await updateProblem(problem.id, { notes, approach });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update problem:', error);
    }
  };

  const handleGenerateNotes = async () => {
    setIsGenerating(true);
    try {
      const generatedNotes = await generateNotes(problem.id);
      // Store in problem's aiNotes field, not user notes
      await updateProblem(problem.id, { aiNotes: generatedNotes });
    } catch (error) {
      console.error('Failed to generate notes:', error);
      alert('Failed to generate notes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Parse AI notes to extract sections
  const parseAINotes = (markdown) => {
    if (!markdown) return null;

    // If it's already an object (from JSON response), return it
    if (typeof markdown === 'object' && (markdown.understanding || markdown.bruteForce || markdown.optimal)) {
      return markdown;
    }

    const sections = {
      understanding: '',
      bruteForce: { explanation: '', code: '', complexity: '' },
      better: { explanation: '', code: '', complexity: '' },
      optimal: { explanation: '', code: '', complexity: '' },
      takeaways: ''
    };

    // 1. Try parsing as JSON first (New Format)
    try {
      if (typeof markdown === 'string') {
        // Clean up any potential markdown code blocks if they exist in the stored note
        let cleanJson = markdown.trim();
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
        
        // Map JSON fields to sections
        if (parsed.understanding) sections.understanding = parsed.understanding.replace(/\\n/g, '\n');
        if (parsed.takeaways) sections.takeaways = parsed.takeaways.replace(/\\n/g, '\n');
        
        if (parsed.bruteForce) {
          sections.bruteForce = {
            explanation: (parsed.bruteForce.explanation || '').replace(/\\n/g, '\n'),
            code: (parsed.bruteForce.code || '').replace(/\\n/g, '\n'),
            complexity: (parsed.bruteForce.complexity || '').replace(/\\n/g, '\n')
          };
        }
      
      if (parsed.better) {
        sections.better = {
          explanation: (parsed.better.explanation || '').replace(/\\n/g, '\n'),
          code: (parsed.better.code || '').replace(/\\n/g, '\n'),
          complexity: (parsed.better.complexity || '').replace(/\\n/g, '\n')
        };
      }
      
        if (parsed.optimal) {
          sections.optimal = {
            explanation: (parsed.optimal.explanation || '').replace(/\\n/g, '\n'),
            code: (parsed.optimal.code || '').replace(/\\n/g, '\n'),
            complexity: (parsed.optimal.complexity || '').replace(/\\n/g, '\n')
          };
        }
        
        return sections;
      }
    } catch (e) {
      // Try to extract JSON using regex if direct parsing failed
      try {
        const jsonMatch = markdown.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // Map JSON fields to sections
          if (parsed.understanding) sections.understanding = parsed.understanding.replace(/\\n/g, '\n');
          if (parsed.takeaways) sections.takeaways = parsed.takeaways.replace(/\\n/g, '\n');
          
          if (parsed.bruteForce) {
            sections.bruteForce = {
              explanation: (parsed.bruteForce.explanation || '').replace(/\\n/g, '\n'),
              code: (parsed.bruteForce.code || '').replace(/\\n/g, '\n'),
              complexity: (parsed.bruteForce.complexity || '').replace(/\\n/g, '\n')
            };
          }
          
          if (parsed.better) {
            sections.better = {
              explanation: (parsed.better.explanation || '').replace(/\\n/g, '\n'),
              code: (parsed.better.code || '').replace(/\\n/g, '\n'),
              complexity: (parsed.better.complexity || '').replace(/\\n/g, '\n')
            };
          }
          
          if (parsed.optimal) {
            sections.optimal = {
              explanation: (parsed.optimal.explanation || '').replace(/\\n/g, '\n'),
              code: (parsed.optimal.code || '').replace(/\\n/g, '\n'),
              complexity: (parsed.optimal.complexity || '').replace(/\\n/g, '\n')
            };
          }
          
          return sections;
        }
      } catch (e2) {
        // console.log('Failed to parse extracted JSON', e2);
      }

      // JSON parsing failed, fall back to Regex (Old Markdown Format)
      // console.log('Falling back to markdown parsing', e);
    }

    // 2. Fallback: Extract code blocks and text between headings (Old Format)
    const bruteMatch = markdown.match(/\*\*a\) Brute Force Approach\*\*([\s\S]*?)(?=\*\*b\) Better Approach|\*\*c\) Optimal Approach|4\. \*\*Key Takeaways|$)/i);
    const betterMatch = markdown.match(/\*\*b\) Better Approach\*\*([\s\S]*?)(?=\*\*c\) Optimal Approach|4\. \*\*Key Takeaways|$)/i);
    const optimalMatch = markdown.match(/\*\*c\) Optimal Approach\*\*([\s\S]*?)(?=4\. \*\*Key Takeaways|$)/i);
    const understandingMatch = markdown.match(/1\. \*\*Problem Understanding\*\*([\s\S]*?)(?=2\. \*\*Approach Discussion|3\. \*\*Solution Approaches|$)/i);
    const takeawaysMatch = markdown.match(/4\. \*\*Key Takeaways\*\*([\s\S]*?)$/i);

    const extractCodeAndText = (text) => {
      if (!text) return { explanation: '', code: '', complexity: '' };
      const codeMatch = text.match(/```java\n([\s\S]*?)```/);
      const code = codeMatch ? codeMatch[1].trim() : '';
      const explanation = text.replace(/```java[\s\S]*?```/g, '').trim();
      return { explanation, code, complexity: '' };
    };

    if (bruteMatch) sections.bruteForce = extractCodeAndText(bruteMatch[1]);
    if (betterMatch) sections.better = extractCodeAndText(betterMatch[1]);
    if (optimalMatch) sections.optimal = extractCodeAndText(optimalMatch[1]);
    if (understandingMatch) sections.understanding = understandingMatch[1].trim();
    if (takeawaysMatch) sections.takeaways = takeawaysMatch[1].trim();

    return sections;
  };

  const aiSections = parseAINotes(problem?.aiNotes);
  const [activeTab, setActiveTab] = useState('brute');

  if (!isOpen || !problem) return null;

  return (
    <div className="modal-overlay fixed inset-0 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="modal-content max-w-6xl w-full h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-800">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-dark-100">{problem.title}</h2>
              <span className={`badge ${
                problem.difficulty === 'Hard' ? 'badge-hard' :
                problem.difficulty === 'Medium' ? 'badge-medium' :
                'badge-easy'
              }`}>
                {problem.difficulty}
              </span>
            </div>
            <div className="flex gap-2 text-sm text-dark-400">
              <span>{problem.platform}</span>
              {isSafeHttpUrl(problem.platformUrl) && (
                <>
                  <span>•</span>
                  <a href={problem.platformUrl} target="_blank" rel="noopener noreferrer" className="text-brand-orange hover:underline flex items-center gap-1">
                    View Problem
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-dark-400 hover:text-dark-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Left Column: User Notes */}
            <div className="space-y-6">
              {/* Metadata */}
              <div className="card">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-dark-400 mb-2">Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {problem.topics?.map(topic => (
                        <span key={topic} className="badge bg-dark-800 text-dark-300 border-dark-700">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-dark-400 mb-2">Patterns</h3>
                    <div className="flex flex-wrap gap-2">
                      {problem.patterns?.map(pattern => (
                        <span key={pattern} className="badge bg-brand-orange/10 text-brand-orange border-brand-orange/20">
                          {pattern}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* My Personal Notes */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-dark-100">My Notes</h3>
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="btn btn-secondary text-sm px-3 py-1">
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setIsEditing(false)} className="btn btn-ghost text-sm px-3 py-1">
                        Cancel
                      </button>
                      <button onClick={handleSave} className="btn btn-primary text-sm px-3 py-1">
                        Save
                      </button>
                    </div>
                  )}
                </div>
                {isEditing ? (
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input w-full min-h-[120px] font-mono text-sm"
                    placeholder="Your personal notes, key insights, mistakes made..."
                  />
                ) : (
                  <div className="bg-dark-900 rounded-lg p-4 text-dark-200 whitespace-pre-wrap min-h-[80px] text-sm">
                    {notes || <span className="text-dark-500 italic">No personal notes yet.</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: AI Study Guide */}
            <div className="space-y-6">
              <div className="card p-5 bg-surface border border-border">
                <StudyGuideView
                  notes={aiSections}
                  isGenerating={isGenerating}
                  onRegenerate={handleGenerateNotes}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemDetailsModal;
