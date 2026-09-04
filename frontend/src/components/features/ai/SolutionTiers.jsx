import { useState } from 'react';
import PropTypes from 'prop-types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, Cpu, Clock, Layers } from 'lucide-react';
import Button from '../../ui/Button';

export default function SolutionTiers({ solutions, className = '' }) {
  const [activeTier, setActiveTier] = useState('optimal');
  const [copied, setCopied] = useState(false);

  if (!solutions || Object.keys(solutions).length === 0) {
    return (
      <div className="p-4 rounded-xl border border-border bg-surface text-center text-xs text-foreground-subtle">
        No solution tiers available.
      </div>
    );
  }

  const tiers = ['brute', 'better', 'optimal'].filter((tier) => Boolean(solutions[tier]));
  const currentSolution = solutions[activeTier] || solutions[tiers[0]];

  const handleCopy = () => {
    if (!currentSolution?.code) return;
    navigator.clipboard.writeText(currentSolution.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tier Switcher Pills */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-1.5 bg-surface border border-border rounded-lg p-1">
          {tiers.map((tier) => {
            const isActive = activeTier === tier;
            return (
              <button
                key={tier}
                onClick={() => setActiveTier(tier)}
                className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'bg-surface-raised text-foreground border border-border shadow-sm'
                    : 'text-foreground-subtle hover:text-foreground'
                }`}
              >
                {tier === 'brute' ? 'Brute Force' : tier === 'better' ? 'Better Approach' : 'Optimal'}
              </button>
            );
          })}
        </div>

        {/* Complexity Meters */}
        {currentSolution?.complexity && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-300 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
              <Clock className="w-3 h-3" />
              {currentSolution.complexity}
            </span>
          </div>
        )}
      </div>

      {/* Explanation */}
      {currentSolution?.explanation && (
        <div className="rounded-xl border border-border bg-surface p-4 text-xs text-foreground-muted leading-relaxed">
          {Array.isArray(currentSolution.explanation) ? (
            <div className="space-y-1">
              {currentSolution.explanation.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-primary font-mono font-bold">{i + 1}.</span>
                  <span>{typeof s === 'string' ? s : JSON.stringify(s)}</span>
                </div>
              ))}
            </div>
          ) : typeof currentSolution.explanation === 'string' ? (
            currentSolution.explanation
          ) : (
            JSON.stringify(currentSolution.explanation)
          )}
        </div>
      )}

      {/* Code Block with Header & Copy Button */}
      {currentSolution?.code && (
        <div className="rounded-xl border border-border bg-canvas overflow-hidden shadow-inner-rim">
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-border bg-surface text-xs text-foreground-subtle select-none">
            <span className="font-mono text-[11px] font-medium text-foreground-muted">
              Solution.java
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] text-foreground-subtle hover:text-foreground hover:bg-surface-hover px-2 py-1 rounded transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3 text-xs overflow-x-auto custom-scrollbar">
            <SyntaxHighlighter
              language="java"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                background: 'transparent',
                fontSize: '12px',
                lineHeight: '1.6',
              }}
              showLineNumbers={true}
            >
              {currentSolution.code}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
    </div>
  );
}

SolutionTiers.propTypes = {
  solutions: PropTypes.shape({
    brute: PropTypes.object,
    better: PropTypes.object,
    optimal: PropTypes.object,
  }).isRequired,
  className: PropTypes.string,
};
