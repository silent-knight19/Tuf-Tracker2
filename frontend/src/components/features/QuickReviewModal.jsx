import { useState } from 'react';
import PropTypes from 'prop-types';
import { Check } from 'lucide-react';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';

export default function QuickReviewModal({ revision, onClose, onComplete }) {
  const [checklist, setChecklist] = useState({
    pattern: false,
    algorithm: false,
    edgeCases: false,
    code: false,
  });
  const [confidence, setConfidence] = useState(3);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCheck = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onComplete({
        confidence,
        notes,
        checklist,
      });
      onClose();
    } catch (error) {
      console.error('Error completing review:', error);
      setIsSubmitting(false);
    }
  };

  const confidenceLabels = {
    1: '1 · Forgot completely',
    2: '2 · Struggled with approach',
    3: '3 · Comfortable recall',
    4: '4 · Confident & optimal',
    5: '5 · Mastered instinctively',
  };

  return (
    <Dialog
      isOpen={true}
      onClose={onClose}
      title="Spaced Review Assessment"
      description={`Assess your recall of ${revision.problemTitle || 'this problem'} to update the SM-2 interval.`}
      maxWidth="max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Complete Review
          </Button>
        </div>
      }
    >
      <div className="space-y-5 pt-2">
        {/* Checklist */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Retrieval Checklist
          </label>
          <div className="space-y-1.5">
            {[
              { key: 'pattern', label: 'I identified the correct algorithmic paradigm' },
              { key: 'algorithm', label: 'I can explain the step-by-step logic clearly' },
              { key: 'edgeCases', label: 'I accounted for boundary & edge conditions' },
              { key: 'code', label: 'I can write bug-free code without looking at notes' },
            ].map((item) => (
              <div
                key={item.key}
                onClick={() => toggleCheck(item.key)}
                className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors border select-none ${
                  checklist[item.key]
                    ? 'bg-primary/10 border-primary/30 text-foreground'
                    : 'bg-surface border-border hover:bg-surface-hover text-foreground-muted'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    checklist[item.key]
                      ? 'bg-primary border-primary text-white'
                      : 'border-border-strong'
                  }`}
                >
                  {checklist[item.key] && <Check className="w-3 h-3" />}
                </div>
                <span className="text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence Rating Buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground uppercase tracking-wider">
              Self-Rated Confidence
            </span>
            <span className="font-semibold text-primary">
              {confidenceLabels[confidence]}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setConfidence(level)}
                className={`py-2 rounded-lg text-xs font-bold transition-all border select-none ${
                  confidence === level
                    ? 'bg-primary text-white border-primary-hover shadow-sm'
                    : 'bg-surface text-foreground-subtle border-border hover:bg-surface-hover hover:text-foreground'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Reflection Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Session Reflection (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add key insights or reminders for your next review interval..."
            rows={3}
            className="w-full bg-surface border border-border rounded-xl p-3 text-xs text-foreground placeholder-foreground-subtle outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 custom-scrollbar"
          />
        </div>
      </div>
    </Dialog>
  );
}

QuickReviewModal.propTypes = {
  revision: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
};
