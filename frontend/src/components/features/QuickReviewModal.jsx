import { useState } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

function QuickReviewModal({ revision, onClose, onComplete }) {
  const [checklist, setChecklist] = useState({
    pattern: false,
    algorithm: false,
    edgeCases: false,
    code: false
  });
  const [confidence, setConfidence] = useState(3);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCheck = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onComplete({
        confidence,
        notes,
        checklist
      });
      onClose();
    } catch (error) {
      console.error('Error completing review:', error);
      setIsSubmitting(false);
    }
  };

  const allChecked = Object.values(checklist).every(v => v);
  const confidenceLabels = {
    1: '❌ Forgot completely',
    2: '🤔 Struggled but got it',
    3: '✅ Comfortable',
    4: '🎯 Mastered',
    5: '🎯 Perfected'
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="card bg-dark-900 border-dark-700 max-w-lg w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-dark-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-2">Quick Review</h2>
          <p className="text-sm text-dark-400">{revision.problemTitle || 'Problem Review'}</p>
          {revision.pattern && (
            <span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-brand-orange/20 text-brand-orange">
              {revision.pattern}
            </span>
          )}
        </div>

        {/* Checklist */}
        <div className="space-y-3 mb-6">
          <div
            onClick={() => toggleCheck('pattern')}
            className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors ${
              checklist.pattern ? 'bg-green-500/20 border border-green-500/50' : 'bg-dark-800 border border-dark-700 hover:border-dark-600'
            }`}
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              checklist.pattern ? 'bg-green-500 border-green-500' : 'border-dark-600'
            }`}>
              {checklist.pattern && <span className="text-white text-sm">✓</span>}
            </div>
            <span className="text-sm text-white">I remember the pattern</span>
          </div>

          <div
            onClick={() => toggleCheck('algorithm')}
            className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors ${
              checklist.algorithm ? 'bg-green-500/20 border border-green-500/50' : 'bg-dark-800 border border-dark-700 hover:border-dark-600'
            }`}
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              checklist.algorithm ? 'bg-green-500 border-green-500' : 'border-dark-600'
            }`}>
              {checklist.algorithm && <span className="text-white text-sm">✓</span>}
            </div>
            <span className="text-sm text-white">I can explain the algorithm</span>
          </div>

          <div
            onClick={() => toggleCheck('edgeCases')}
            className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors ${
              checklist.edgeCases ? 'bg-green-500/20 border border-green-500/50' : 'bg-dark-800 border border-dark-700 hover:border-dark-600'
            }`}
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              checklist.edgeCases ? 'bg-green-500 border-green-500' : 'border-dark-600'
            }`}>
              {checklist.edgeCases && <span className="text-white text-sm">✓</span>}
            </div>
            <span className="text-sm text-white">I know the edge cases</span>
          </div>

          <div
            onClick={() => toggleCheck('code')}
            className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors ${
              checklist.code ? 'bg-green-500/20 border border-green-500/50' : 'bg-dark-800 border border-dark-700 hover:border-dark-600'
            }`}
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              checklist.code ? 'bg-green-500 border-green-500' : 'border-dark-600'
            }`}>
              {checklist.code && <span className="text-white text-sm">✓</span>}
            </div>
            <span className="text-sm text-white">I could code it correctly</span>
          </div>
        </div>

        {/* Confidence Slider */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-3">
            Confidence Level: <span className="text-brand-orange">{confidenceLabels[confidence]}</span>
          </label>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                onClick={() => setConfidence(level)}
                className={`flex-1 py-2 rounded text-sm font-medium transition-all ${
                  confidence === level
                    ? 'bg-brand-orange text-white scale-110'
                    : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any insights or mistakes..."
            className="w-full bg-dark-800 border border-dark-700 rounded px-3 py-2 text-sm text-white placeholder-dark-500 resize-none focus:border-brand-orange focus:outline-none"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded bg-dark-800 text-white hover:bg-dark-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded bg-brand-orange text-white hover:bg-brand-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? 'Submitting...' : 'Complete Review'}
          </button>
        </div>

        {/* XP Preview */}
        <div className="mt-4 text-center text-xs text-dark-400">
          Expected XP: {10 + (confidence >= 4 ? 5 : 0) + (allChecked ? 5 : 0)}
        </div>
      </div>
    </div>
  );
}

QuickReviewModal.propTypes = {
  revision: PropTypes.shape({
    id: PropTypes.string.isRequired,
    problemTitle: PropTypes.string,
    pattern: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired
};

export default QuickReviewModal;
