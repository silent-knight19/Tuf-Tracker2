import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Cpu, 
  RotateCw, 
  Copy, 
  Check, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Target, 
  ExternalLink, 
  Code2, 
  Layers, 
  Sparkles, 
  HelpCircle, 
  Terminal,
  Zap,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SafeMarkdown from '../../ui/SafeMarkdown';
import Button from '../../ui/Button';

export default function StudyGuideView({ 
  notes, 
  isGenerating, 
  onRegenerate, 
  onSolveInIDE 
}) {
  const [activeTier, setActiveTier] = useState('optimal');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedNotes, setCopiedNotes] = useState(false);

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="relative mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
            <Cpu className="w-7 h-7 text-primary animate-spin" />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-primary/20 blur-lg -z-10 animate-pulse" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Synthesizing Algorithmic Study Guide</h3>
        <p className="text-xs text-foreground-muted max-w-sm">
          Extracting mathematical invariants, building complexity progression, and mapping interview traps...
        </p>
      </div>
    );
  }

  if (!notes) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-surface-raised border border-border flex items-center justify-center mb-4 text-foreground-subtle">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-1">No Study Guide Generated</h3>
        <p className="text-xs text-foreground-muted mb-4 max-w-xs">
          Generate an in-depth, interview-grade study guide with complexity matrices, invariants, and pitfall analysis.
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={onRegenerate}
          leftIcon={Cpu}
        >
          Generate Study Guide
        </Button>
      </div>
    );
  }

  // Check if raw markdown fallback
  if (notes.isRaw) {
    return (
      <div className="p-4 bg-surface rounded-xl border border-border prose prose-invert prose-sm max-w-none">
        <SafeMarkdown>{notes.raw}</SafeMarkdown>
      </div>
    );
  }

  // Schema normalization (supports both new rich schema and legacy schema)
  const summary = notes.summary || null;
  const complexityMatrix = notes.complexityMatrix || [];
  const solutions = notes.solutions || {
    optimal: notes.optimal,
    better: notes.better,
    brute: notes.bruteForce
  };
  const activeSolution = solutions?.[activeTier] || solutions?.optimal || solutions?.better || solutions?.brute;
  const pitfalls = notes.pitfallsAndTraps || notes.pitfallsAndAntiPatterns || notes.interviewPlaybook?.pitfallsAndTraps || notes.interviewPlaybook?.pitfallsAndAntiPatterns || [];
  const interviewPlaybook = notes.interviewPlaybook || null;
  const isomorphicLadder = notes.isomorphicLadder || notes.relatedProblems || notes.interviewPlaybook?.canonicalProblems || notes.interviewPlaybook?.solvedProblems || [];

  // Legacy fallback fields
  const keyInsights = notes.keyInsights || [];
  const commonMistakes = notes.commonMistakes || [];
  const practiceTips = notes.practiceRecommendations || [];

  const handleCopyCode = (codeText) => {
    if (!codeText) return;
    navigator.clipboard.writeText(codeText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyAllNotes = () => {
    const markdown = `# ${summary?.corePattern || 'Algorithmic Study Guide'}\n\n` +
      `**Pattern Trigger:** ${summary?.patternTrigger || ''}\n` +
      `**Invariant:** ${summary?.mathematicalInvariant || ''}\n` +
      `**Optimal Complexity:** ${summary?.timeComplexity || ''} Time, ${summary?.spaceComplexity || ''} Space\n\n` +
      (activeSolution?.code ? `## Optimal Code\n\`\`\`java\n${activeSolution.code}\n\`\`\`\n` : '');
    navigator.clipboard.writeText(markdown);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  return (
    <div className="space-y-6 text-foreground">
      {/* 1. Header Toolbar & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
            Study Module
          </span>
          {summary?.corePattern && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/25">
              {summary.corePattern}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyAllNotes}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-foreground-subtle hover:text-foreground bg-surface-raised hover:bg-surface-hover rounded-lg border border-border transition-colors"
            title="Copy markdown study notes"
          >
            {copiedNotes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedNotes ? 'Copied' : 'Export'}</span>
          </button>

          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-foreground-subtle hover:text-foreground bg-surface-raised hover:bg-surface-hover rounded-lg border border-border transition-colors"
              title="Regenerate guide"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          )}

          {onSolveInIDE && (
            <Button
              variant="primary"
              size="sm"
              onClick={onSolveInIDE}
              leftIcon={Code2}
              className="text-xs h-7.5 px-3"
            >
              Solve in IDE
            </Button>
          )}
        </div>
      </div>

      {/* 2. Hero: Pattern Trigger & Mathematical Invariant */}
      {summary && (
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] via-surface to-surface-raised p-4 sm:p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-1">
                <Target className="w-3.5 h-3.5" />
                Pattern Recognition Trigger
              </span>
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {summary.patternTrigger}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-surface-raised border border-border text-foreground">
                {summary.timeComplexity || 'O(N)'} Time
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-surface-raised border border-border text-foreground-muted">
                {summary.spaceComplexity || 'O(N)'} Space
              </span>
            </div>
          </div>

          {summary.mathematicalInvariant && (
            <div className="mt-3 pt-3 border-t border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-subtle block mb-1">
                Core Mathematical Invariant
              </span>
              <div className="px-3 py-2 rounded-lg bg-canvas/80 border border-border font-mono text-xs text-indigo-300 overflow-x-auto">
                {summary.mathematicalInvariant}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legacy Key Insights (if summary not present) */}
      {!summary && keyInsights.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Key Insights
          </h3>
          <ul className="space-y-2">
            {keyInsights.map((insight, idx) => {
              const text = typeof insight === 'string' ? insight : (insight?.insight || insight?.point || insight?.text || JSON.stringify(insight));
              return (
                <li key={idx} className="text-xs sm:text-sm text-foreground-muted flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 3. Complexity Evolution Matrix Table */}
      {complexityMatrix.length > 0 && (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-surface-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Complexity Evolution Matrix
              </h3>
            </div>
            <span className="text-[11px] text-foreground-subtle">
              Click a tier to inspect solution code
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-raised/50 border-b border-border text-foreground-subtle">
                <tr>
                  <th className="px-3.5 py-2.5 font-semibold">Tier</th>
                  <th className="px-3.5 py-2.5 font-semibold font-mono">Time</th>
                  <th className="px-3.5 py-2.5 font-semibold font-mono">Space</th>
                  <th className="px-3.5 py-2.5 font-semibold">Core Strategy</th>
                  <th className="px-3.5 py-2.5 font-semibold">The Bottleneck</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {complexityMatrix.map((item, idx) => {
                  const tierKey = item.tier?.toLowerCase().includes('optimal')
                    ? 'optimal'
                    : item.tier?.toLowerCase().includes('better')
                    ? 'better'
                    : 'brute';
                  const isSelected = activeTier === tierKey;

                  return (
                    <tr
                      key={idx}
                      onClick={() => setActiveTier(tierKey)}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-primary/10 hover:bg-primary/15' 
                          : 'hover:bg-surface-hover/50'
                      }`}
                    >
                      <td className="px-3.5 py-2.5 font-semibold flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          tierKey === 'optimal' ? 'bg-emerald-400' :
                          tierKey === 'better' ? 'bg-amber-400' : 'bg-rose-400'
                        }`} />
                        <span className={isSelected ? 'text-primary font-bold' : 'text-foreground'}>
                          {item.tier}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-foreground">{item.time}</td>
                      <td className="px-3.5 py-2.5 font-mono text-foreground-muted">{item.space}</td>
                      <td className="px-3.5 py-2.5 text-foreground leading-relaxed">{item.coreIdea}</td>
                      <td className="px-3.5 py-2.5 text-foreground-subtle leading-relaxed">{item.bottleneck}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Multi-Tier Solution Code & Key Invariants */}
      {solutions && (solutions.optimal || solutions.better || solutions.brute) && (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          {/* Solution Selector Tabs */}
          <div className="flex items-center justify-between border-b border-border bg-surface-subtle px-3 pt-2">
            <div className="flex items-center gap-1">
              {['optimal', 'better', 'brute'].map((tier) => {
                const sol = solutions[tier];
                if (!sol) return null;
                const label = tier === 'optimal' ? 'Optimal' : tier === 'better' ? 'Better' : 'Brute Force';
                const isActive = activeTier === tier;

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
                    {label}
                  </button>
                );
              })}
            </div>

            {activeSolution?.complexity && (
              <span className="text-[11px] font-mono text-primary font-semibold px-2 py-0.5 rounded bg-primary/10 border border-primary/20 mb-1">
                {activeSolution.complexity}
              </span>
            )}
          </div>

          {/* Active Solution Content */}
          {activeSolution && (
            <div className="p-4 space-y-4">
              {/* Solution Name & Copy */}
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-foreground">
                  {activeSolution.name || `${activeTier.toUpperCase()} Approach`}
                </h4>
                {activeSolution.code && (
                  <button
                    type="button"
                    onClick={() => handleCopyCode(activeSolution.code)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-foreground-subtle hover:text-foreground bg-surface-raised hover:bg-surface-hover rounded border border-border transition-colors"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                )}
              </div>

              {/* Step-by-Step Derivation */}
              {activeSolution.derivation && Array.isArray(activeSolution.derivation) && (
                <div className="space-y-1.5 text-xs text-foreground-muted bg-surface-subtle p-3 rounded-lg border border-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-subtle block mb-1">
                    Algorithmic Derivation
                  </span>
                  {activeSolution.derivation.map((step, idx) => {
                    const text = typeof step === 'string' ? step : (step?.step || step?.text || JSON.stringify(step));
                    return (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-primary font-mono font-bold">{idx + 1}.</span>
                        <span className="leading-relaxed">{text}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Legacy Explanation */}
              {activeSolution.explanation && !activeSolution.derivation && (
                <div className="text-xs text-foreground-muted bg-surface-subtle p-3 rounded-lg border border-border leading-relaxed">
                  {Array.isArray(activeSolution.explanation) ? (
                    <div className="space-y-1">
                      {activeSolution.explanation.map((s, i) => {
                        const text = typeof s === 'string' ? s : (s?.text || s?.explanation || JSON.stringify(s));
                        return (
                          <div key={i} className="flex gap-2">
                            <span className="text-primary font-mono font-bold">{i + 1}.</span>
                            <span>{text}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    activeSolution.explanation
                  )}
                </div>
              )}

              {/* Syntax Highlighted Code Viewer */}
              {activeSolution.code && (
                <div className="relative rounded-lg overflow-hidden border border-border bg-canvas">
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
                    {activeSolution.code}
                  </SyntaxHighlighter>
                </div>
              )}

              {/* Key Line Invariants Callouts */}
              {activeSolution.keyLineCallouts && activeSolution.keyLineCallouts.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-subtle block">
                    Critical Line Invariants
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeSolution.keyLineCallouts.map((callout, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-surface-raised border border-border text-xs flex flex-col justify-between gap-1.5"
                      >
                        <code className="px-1.5 py-0.5 rounded bg-canvas border border-border font-mono text-[11px] text-indigo-300 w-fit">
                          {callout.line}
                        </code>
                        <span className="text-foreground-muted leading-relaxed">
                          {callout.note}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. Traps, Pitfalls & Concrete Failing Cases */}
      {pitfalls.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Candidate Traps & Concrete Failure Cases
            </h3>
          </div>

          <div className="space-y-3">
            {pitfalls.map((item, idx) => {
              const isObj = typeof item === 'object' && item !== null;
              const trapText = isObj ? (item.trap || item.pitfall || item.mistake || item.title || '') : String(item || '');
              const failingCase = isObj ? (item.failingCase || item.consequence || item.whyItFails || item.why || '') : '';
              const fixText = isObj ? (item.fix || item.correctAlternative || item.solution || '') : '';

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-surface-raised border border-border hover:border-rose-500/25 transition-colors space-y-2 text-xs"
                >
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-[10px] uppercase shrink-0 mt-0.5">
                      The Trap
                    </span>
                    <span className="font-semibold text-foreground leading-relaxed">
                      {trapText}
                    </span>
                  </div>

                  {failingCase && (
                    <div className="flex items-center gap-2 text-foreground-muted pl-2 border-l-2 border-border font-mono text-[11px]">
                      <span className="text-foreground-subtle text-[10px] uppercase tracking-wider shrink-0">Fails on:</span>
                      <span className="text-rose-300 truncate">{failingCase}</span>
                    </div>
                  )}

                  {fixText && (
                    <div className="flex items-start gap-2 text-emerald-400 pl-2 border-l-2 border-emerald-500/30">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 shrink-0 mt-0.5">Safe Fix:</span>
                      <span className="text-foreground-muted leading-relaxed">{fixText}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legacy Common Mistakes (if pitfalls not present) */}
      {pitfalls.length === 0 && commonMistakes.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Common Mistakes
          </h3>
          <ul className="space-y-2">
            {commonMistakes.map((mistake, idx) => {
              const isObj = typeof mistake === 'object' && mistake !== null;
              const mistakeText = isObj ? (mistake.mistake || mistake.pitfall || mistake.trap || mistake.title || '') : String(mistake || '');
              const whyText = isObj ? (mistake.why || mistake.consequence || mistake.whyItFails || '') : '';
              const fixText = isObj ? (mistake.fix || mistake.solution || mistake.correctAlternative || '') : '';

              if (isObj && (whyText || fixText)) {
                return (
                  <li key={idx} className="text-xs sm:text-sm text-foreground-muted flex items-start gap-2.5 p-3 rounded-lg bg-surface-raised border border-border">
                    <span className="text-rose-400 mt-0.5 shrink-0 font-bold">•</span>
                    <div className="space-y-1.5 flex-1">
                      {mistakeText && (
                        <div className="leading-relaxed font-semibold text-rose-300">
                          {mistakeText}
                        </div>
                      )}
                      {whyText && (
                        <div className="text-[11px] text-foreground-muted">
                          <span className="font-semibold text-foreground-subtle">Why it fails: </span>
                          {whyText}
                        </div>
                      )}
                      {fixText && (
                        <div className="text-[11px] text-emerald-400">
                          <span className="font-semibold text-emerald-500">Fix: </span>
                          {fixText}
                        </div>
                      )}
                    </div>
                  </li>
                );
              }

              return (
                <li key={idx} className="text-xs sm:text-sm text-foreground-muted flex items-start gap-2">
                  <span className="text-rose-400 mt-1 shrink-0">•</span>
                  <span className="leading-relaxed">{mistakeText}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 6. FAANG Interview Playbook */}
      {interviewPlaybook && (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-surface-subtle flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              FAANG Interview Execution Playbook
            </h3>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {/* Verbal Elevator Pitch */}
            {interviewPlaybook.verbalPitch && (
              <div className="p-3.5 rounded-xl bg-primary/[0.06] border border-primary/20 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  The 2-Minute Intuition Pitch
                </span>
                <p className="text-xs sm:text-sm text-foreground leading-relaxed italic">
                  "{interviewPlaybook.verbalPitch}"
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Minute 0 Clarifying Questions */}
              {interviewPlaybook.minute0Clarifications && (
                <div className="p-3.5 rounded-xl bg-surface-raised border border-border space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-subtle flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-amber-400" />
                    Minute 0: Verbalize Out Loud
                  </span>
                  <ul className="space-y-1.5">
                    {interviewPlaybook.minute0Clarifications.map((q, idx) => {
                      const text = typeof q === 'string' ? q : (q?.question || q?.text || JSON.stringify(q));
                      return (
                        <li key={idx} className="text-xs text-foreground-muted flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">•</span>
                          <span className="leading-relaxed">{text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Edge Cases to Dry Run */}
              {interviewPlaybook.edgeCasesToDryRun && (
                <div className="p-3.5 rounded-xl bg-surface-raised border border-border space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-subtle flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Dry-Run Invariant Checklist
                  </span>
                  <ul className="space-y-1.5">
                    {interviewPlaybook.edgeCasesToDryRun.map((c, idx) => {
                      const text = typeof c === 'string' ? c : (c?.case || c?.edgeCase || c?.text || JSON.stringify(c));
                      return (
                        <li key={idx} className="text-xs text-foreground-muted flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5">✓</span>
                          <span className="leading-relaxed">{text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legacy Practice Tips */}
      {!interviewPlaybook && practiceTips.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Practice Recommendations
          </h3>
          <ul className="space-y-2">
            {practiceTips.map((tip, idx) => {
              const text = typeof tip === 'string' ? tip : (tip?.tip || tip?.recommendation || tip?.text || JSON.stringify(tip));
              return (
                <li key={idx} className="text-xs sm:text-sm text-foreground-muted flex items-start gap-2 pl-2 border-l-2 border-emerald-500/30">
                  <span className="leading-relaxed">{text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 7. Isomorphic Problem Curriculum Ladder */}
      {isomorphicLadder.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Isomorphic Practice Ladder
              </h3>
            </div>
            <span className="text-[11px] text-foreground-subtle">
              Master the same invariant across variations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {isomorphicLadder.map((prob, idx) => {
              const url = prob.url || (prob.title ? `https://leetcode.com/problemset/all/?search=${encodeURIComponent(prob.title)}` : '#');
              return (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-lg bg-surface-raised border border-border hover:border-primary/40 hover:bg-surface-hover transition-all flex flex-col justify-between gap-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                      {prob.title}
                      <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </span>
                    {prob.difficulty && (
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                        prob.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        prob.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {prob.difficulty}
                      </span>
                    )}
                  </div>
                  {prob.relationship && (
                    <span className="text-[11px] text-foreground-subtle leading-relaxed">
                      {prob.relationship}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

StudyGuideView.propTypes = {
  notes: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  isGenerating: PropTypes.bool,
  onRegenerate: PropTypes.func,
  onSolveInIDE: PropTypes.func
};
