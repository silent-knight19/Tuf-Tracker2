import { useState } from 'react';
import PropTypes from 'prop-types';
import { Lightbulb, ChevronRight, CheckCircle2 } from 'lucide-react';
import Button from '../../ui/Button';

export default function ProgressiveHints({ hints = [], className = '' }) {
  const [revealedCount, setRevealedCount] = useState(1);

  if (!hints || hints.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-border bg-surface text-center text-xs text-foreground-subtle">
        No hints generated yet for this problem.
      </div>
    );
  }

  const stepLabels = [
    'Intuition & Mental Model',
    'Algorithmic Pattern & Strategy',
    'Optimal Data Structures',
    'Implementation & Edge Nuances',
  ];

  const handleRevealNext = () => {
    if (revealedCount < hints.length) {
      setRevealedCount((prev) => prev + 1);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-300 flex items-center justify-center">
            <Lightbulb className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Progressive Guidance
          </h3>
        </div>

        <span className="text-[11px] font-mono text-foreground-subtle bg-surface px-2 py-0.5 rounded border border-border">
          {revealedCount} / {hints.length} revealed
        </span>
      </div>

      {/* Hints List */}
      <div className="space-y-3">
        {hints.slice(0, revealedCount).map((hint, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-border bg-surface p-4 shadow-inner-rim space-y-2 transition-all"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-amber-300 uppercase tracking-wider">
                Step {idx + 1}: {stepLabels[idx] || `Step ${idx + 1}`}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xs text-foreground-muted leading-relaxed">
              {typeof hint === 'string' ? hint : (hint?.hint || hint?.text || JSON.stringify(hint))}
            </p>
          </div>
        ))}
      </div>

      {/* Reveal Next Action */}
      {revealedCount < hints.length && (
        <div className="pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRevealNext}
            rightIcon={ChevronRight}
            className="w-full justify-center text-xs"
          >
            Reveal Step {revealedCount + 1}: {stepLabels[revealedCount] || 'Next Hint'}
          </Button>
        </div>
      )}
    </div>
  );
}

ProgressiveHints.propTypes = {
  hints: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string,
};
