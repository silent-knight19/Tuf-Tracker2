import PropTypes from 'prop-types';
import { AlertCircle, Copy, Check, Play } from 'lucide-react';
import { useState } from 'react';
import Button from '../../ui/Button';

export default function EdgeCaseInspector({ edgeCases = [], onApplyInput }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!edgeCases || edgeCases.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-border bg-surface text-center text-xs text-foreground-subtle">
        No edge cases generated. Run tests or click "Generate Cases".
      </div>
    );
  }

  const handleCopy = (input, index) => {
    navigator.clipboard.writeText(input);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-3">
      {edgeCases.map((caseItem, idx) => {
        const inputStr =
          typeof caseItem.input === 'object'
            ? JSON.stringify(caseItem.input)
            : String(caseItem.input || '');

        return (
          <div
            key={idx}
            className="rounded-xl border border-border bg-surface p-3.5 space-y-2 shadow-inner-rim"
          >
            {/* Header / Rationale */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Case {idx + 1}: {caseItem.title || caseItem.name || 'Boundary Condition'}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(inputStr, idx)}
                  className="p-1 rounded text-foreground-subtle hover:text-foreground hover:bg-surface-hover transition-colors"
                  title="Copy input string"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>

                {onApplyInput && (
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => onApplyInput(inputStr)}
                    className="h-6 px-2 text-[10px]"
                  >
                    Test Input
                  </Button>
                )}
              </div>
            </div>

            {/* Why it matters */}
            {caseItem.reason && (
              <p className="text-[11px] text-foreground-subtle leading-relaxed italic">
                Why this matters: {caseItem.reason}
              </p>
            )}

            {/* Input & Expected Value */}
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-canvas border border-border-subtle overflow-x-auto">
                <span className="text-[10px] uppercase font-sans font-semibold text-foreground-subtle block mb-0.5">
                  Input
                </span>
                <span className="text-foreground">{inputStr}</span>
              </div>
              <div className="p-2 rounded-lg bg-canvas border border-border-subtle overflow-x-auto">
                <span className="text-[10px] uppercase font-sans font-semibold text-foreground-subtle block mb-0.5">
                  Expected
                </span>
                <span className="text-emerald-400">
                  {caseItem.expectedOutput !== undefined
                    ? String(caseItem.expectedOutput)
                    : 'Valid Execution'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

EdgeCaseInspector.propTypes = {
  edgeCases: PropTypes.array.isRequired,
  onApplyInput: PropTypes.func,
};
