import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Check, 
  Copy, 
  Target, 
  Clock, 
  Layers, 
  Code2, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Terminal
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Button from '../../ui/Button';

export default function WorkspaceSolutionView({
  solutions = {},
  initialTier = 'optimal'
}) {
  const [activeTier, setActiveTier] = useState(initialTier);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isStepsExpanded, setIsStepsExpanded] = useState(true);

  if (!solutions || Object.keys(solutions).length === 0) {
    return null;
  }

  const availableTiers = ['optimal', 'better', 'brute'].filter(tier => !!solutions[tier]);
  const currentTier = solutions[activeTier] ? activeTier : (availableTiers[0] || 'optimal');
  const solution = solutions[currentTier];

  if (!solution) return null;

  const handleCopy = (code) => {
    if (!code) return;
    const text = typeof code === 'object' ? JSON.stringify(code, null, 2) : String(code);
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Helper to extract clean time/space strings
  const timeComplexity = solution.timeComplexity || solution.complexity?.split(',')[0] || 'O(N)';
  const spaceComplexity = solution.spaceComplexity || solution.complexity?.split(',')[1] || 'O(1)';
  const intuitionText = solution.intuition || solution.explanation || solution.approach || '';
  const approachSteps = solution.approachSteps || [];
  const rawCode = typeof solution.code === 'object' ? JSON.stringify(solution.code, null, 2) : (solution.code || '// No code available');

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm space-y-0">
      {/* 1. Header: Tier Selector Tabs */}
      {availableTiers.length > 1 && (
        <div className="flex items-center justify-between border-b border-border bg-surface-subtle px-3 pt-2">
          <div className="flex items-center gap-1">
            {availableTiers.map((tier) => {
              const label = tier === 'optimal' ? 'Optimal' : tier === 'better' ? 'Better' : 'Brute Force';
              const isActive = currentTier === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setActiveTier(tier)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-all border-t border-x ${
                    isActive
                      ? 'border-border bg-surface text-foreground border-b-transparent translate-y-px shadow-sm'
                      : 'border-transparent text-foreground-subtle hover:text-foreground hover:bg-surface-hover/50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      tier === 'optimal' ? 'bg-emerald-400' :
                      tier === 'better' ? 'bg-amber-400' : 'bg-rose-400'
                    }`} />
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="text-[10px] font-mono uppercase tracking-wider text-foreground-subtle px-2 py-0.5">
            Production Solution
          </span>
        </div>
      )}

      <div className="p-4 sm:p-5 space-y-4">
        {/* 2. Asymptotic Complexity Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Time Complexity Card */}
          <div className="p-3 rounded-lg bg-surface-raised border border-border flex flex-col justify-between gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-subtle flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                Time Complexity
              </span>
              <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {timeComplexity.split('-')[0].trim()}
              </span>
            </div>
            {timeComplexity.includes('-') && (
              <p className="text-[11px] text-foreground-muted leading-relaxed line-clamp-2">
                {timeComplexity.split('-').slice(1).join('-').trim()}
              </p>
            )}
          </div>

          {/* Space Complexity Card */}
          <div className="p-3 rounded-lg bg-surface-raised border border-border flex flex-col justify-between gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-subtle flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-400" />
                Space Complexity
              </span>
              <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {spaceComplexity.split('-')[0].trim()}
              </span>
            </div>
            {spaceComplexity.includes('-') && (
              <p className="text-[11px] text-foreground-muted leading-relaxed line-clamp-2">
                {spaceComplexity.split('-').slice(1).join('-').trim()}
              </p>
            )}
          </div>
        </div>

        {/* 3. Intuition & Pattern Callout */}
        {intuitionText && (
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-primary/[0.06] via-surface to-surface-raised border border-primary/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" />
              Core Invariant & Algorithmic Intuition
            </div>
            <p className="text-xs text-foreground leading-relaxed">
              {intuitionText}
            </p>
          </div>
        )}

        {/* 4. Step-by-Step Derivation */}
        {approachSteps.length > 0 && (
          <div className="rounded-lg border border-border bg-surface-subtle overflow-hidden">
            <button
              type="button"
              onClick={() => setIsStepsExpanded(!isStepsExpanded)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-foreground hover:bg-surface-hover/50 transition-colors select-none"
            >
              <span className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-foreground-subtle" />
                Step-by-Step Execution ({approachSteps.length} Steps)
              </span>
              {isStepsExpanded ? <ChevronUp className="w-3.5 h-3.5 text-foreground-subtle" /> : <ChevronDown className="w-3.5 h-3.5 text-foreground-subtle" />}
            </button>

            {isStepsExpanded && (
              <div className="p-3.5 pt-0 space-y-2 border-t border-border/50">
                {approachSteps.map((step, idx) => {
                  const cleanedText = typeof step === 'string' ? step.replace(/^Step\s+\d+:\s*/i, '') : (step?.step || step?.text || JSON.stringify(step));
                  return (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      <span className="w-5 h-5 rounded-md bg-surface-raised border border-border text-foreground-subtle text-[11px] font-mono font-semibold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-foreground-muted leading-relaxed">
                        {cleanedText}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 5. Production Java Code Viewer */}
        <div className="rounded-xl border border-border bg-canvas overflow-hidden">
          {/* Code Header Bar */}
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-border bg-surface-subtle select-none">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-semibold text-foreground">
                Java 17 Solution
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(rawCode)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-foreground-subtle hover:text-foreground bg-surface-raised hover:bg-surface-hover border border-border transition-colors"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Syntax Highlighter */}
          <div className="text-xs leading-relaxed overflow-x-auto">
            <SyntaxHighlighter
              language="java"
              style={vscDarkPlus}
              showLineNumbers={true}
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: 'transparent',
                fontSize: '0.75rem',
                lineHeight: '1.6'
              }}
            >
              {rawCode}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
}

WorkspaceSolutionView.propTypes = {
  solutions: PropTypes.object,
  initialTier: PropTypes.string
};
