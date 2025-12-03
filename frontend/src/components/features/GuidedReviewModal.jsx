import { useState } from 'react';
import PropTypes from 'prop-types';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

function GuidedReviewModal({ revision, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    pattern: '',
    algorithm: '',
    confidence: 3,
    notes: ''
  });
  const [showPatternAnswer, setShowPatternAnswer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onComplete({
        confidence: data.confidence,
        notes: data.notes,
        guidedData: {
          recalledPattern: data.pattern,
          recalledAlgorithm: data.algorithm
        }
      });
      onClose();
    } catch (error) {
      console.error('Error completing review:', error);
      setIsSubmitting(false);
    }
  };

  const confidenceLabels = {
    1: '❌ Forgot completely',
    2: '🤔 Struggled but got it',
    3: '✅ Comfortable',
    4: '🎯 Mastered',
    5: '🎯 Perfected'
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="card bg-dark-900 border-dark-700 max-w-2xl w-full p-8 relative min-h-[500px] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-dark-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-dark-400 mb-2 uppercase tracking-wider font-medium">
            <span>Step {step} of {totalSteps}</span>
            <span>Guided Review</span>
          </div>
          <div className="h-1 bg-dark-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-orange transition-all duration-300 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          
          {/* Step 1: Pattern Recall */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-white">Pattern Recall</h2>
              <p className="text-dark-300 text-lg">
                Without looking, what pattern does the problem <span className="text-white font-semibold">"{revision.problemTitle}"</span> use?
              </p>
              
              <div className="space-y-4">
                <select
                  value={data.pattern}
                  onChange={(e) => setData({ ...data, pattern: e.target.value })}
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-brand-orange focus:outline-none text-lg"
                >
                  <option value="">Select a pattern...</option>
                  <option value="Two Pointers">Two Pointers</option>
                  <option value="Sliding Window">Sliding Window</option>
                  <option value="Binary Search">Binary Search</option>
                  <option value="Dynamic Programming">Dynamic Programming</option>
                  <option value="DFS/BFS">DFS/BFS</option>
                  <option value="Backtracking">Backtracking</option>
                  <option value="Greedy">Greedy</option>
                </select>

                {!showPatternAnswer ? (
                  <button
                    onClick={() => setShowPatternAnswer(true)}
                    className="text-brand-orange hover:underline text-sm font-medium"
                  >
                    Reveal Answer
                  </button>
                ) : (
                  <div className={`p-4 rounded-lg border ${
                    data.pattern === revision.pattern 
                      ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    <div className="font-semibold mb-1">
                      Correct Pattern: {revision.pattern}
                    </div>
                    {data.pattern === revision.pattern ? (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4" /> You got it right!
                      </div>
                    ) : (
                      <div className="text-sm opacity-90">
                        You selected: {data.pattern || 'Nothing'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Algorithm Outline */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-white">Algorithm Outline</h2>
              <p className="text-dark-300">
                Briefly describe the high-level steps to solve this problem.
              </p>
              
              <textarea
                value={data.algorithm}
                onChange={(e) => setData({ ...data, algorithm: e.target.value })}
                placeholder="1. Initialize pointers...&#10;2. Loop while...&#10;3. If condition met..."
                className="w-full h-48 bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder-dark-500 resize-none focus:border-brand-orange focus:outline-none font-mono text-sm"
              />

              <div className="bg-dark-800/50 p-4 rounded-lg border border-dark-700">
                <div className="text-xs font-medium text-dark-400 mb-2 uppercase">Your Saved Notes</div>
                <div className="text-sm text-dark-300 italic">
                  {revision.algorithmSteps?.length > 0 
                    ? revision.algorithmSteps.join('\n') 
                    : 'No saved algorithm notes yet.'}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confidence Check */}
          {step === 3 && (
            <div className="space-y-8 animate-fadeIn">
              <h2 className="text-2xl font-bold text-white">Confidence Check</h2>
              <p className="text-dark-300">
                How well did you remember the solution today?
              </p>
              
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    onClick={() => setData({ ...data, confidence: level })}
                    className={`w-full p-4 rounded-lg border transition-all flex items-center gap-4 ${
                      data.confidence === level
                        ? 'bg-brand-orange/20 border-brand-orange text-white ring-1 ring-brand-orange'
                        : 'bg-dark-800 border-dark-700 text-dark-300 hover:bg-dark-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      data.confidence === level ? 'bg-brand-orange text-white' : 'bg-dark-700 text-dark-400'
                    }`}>
                      {level}
                    </div>
                    <div className="font-medium text-lg">
                      {confidenceLabels[level]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn text-center pt-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              
              <h2 className="text-3xl font-bold text-white">Ready to Complete!</h2>
              <p className="text-dark-300 max-w-md mx-auto">
                Great job reviewing <span className="text-white font-medium">{revision.problemTitle}</span>. 
                Based on your confidence, we'll schedule the next review accordingly.
              </p>

              <div className="bg-dark-800 rounded-lg p-6 max-w-sm mx-auto border border-dark-700">
                <div className="text-sm text-dark-400 mb-1">XP Earned</div>
                <div className="text-3xl font-bold text-brand-yellow mb-4">
                  +{10 + (data.confidence >= 4 ? 5 : 0)} XP
                </div>
                <div className="text-xs text-dark-500">
                  Base (10) + Mastery Bonus ({data.confidence >= 4 ? 5 : 0})
                </div>
              </div>

              <div className="pt-4">
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Any final notes? (Optional)
                </label>
                <textarea
                  value={data.notes}
                  onChange={(e) => setData({ ...data, notes: e.target.value })}
                  className="w-full max-w-md bg-dark-800 border border-dark-700 rounded px-3 py-2 text-sm text-white focus:border-brand-orange focus:outline-none"
                  rows={2}
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-dark-800">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
              step === 1 ? 'text-dark-600 cursor-not-allowed' : 'text-dark-300 hover:text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < totalSteps ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 rounded bg-white text-dark-900 font-bold hover:bg-gray-200 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-2 rounded bg-brand-orange text-white font-bold hover:bg-brand-orange/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Completing...' : 'Finish Review'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

GuidedReviewModal.propTypes = {
  revision: PropTypes.shape({
    id: PropTypes.string.isRequired,
    problemTitle: PropTypes.string,
    pattern: PropTypes.string,
    algorithmSteps: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired
};

export default GuidedReviewModal;
