import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  Zap,
  Repeat,
  CheckCircle2,
  Building2,
  Clock,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import Drawer from '../ui/Drawer';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import SafeMarkdown from '../ui/SafeMarkdown';

export default function ProblemDetailDrawer({
  problem,
  isOpen,
  onClose,
  revision,
  onAddToRevision,
}) {
  const navigate = useNavigate();
  if (!problem) return null;

  const isSolved = Boolean(
    problem.status === 'Solved' ||
      problem.status === 'Completed' ||
      problem.solvedAt
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={problem.title}
      subtitle={`${problem.platform || 'LeetCode'} · ${problem.difficulty || 'Medium'}`}
      width="max-w-lg"
    >
      <div className="space-y-6 text-xs text-foreground-muted">
        {/* Top Badges & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                problem.difficulty === 'Easy'
                  ? 'easy'
                  : problem.difficulty === 'Hard'
                  ? 'hard'
                  : 'medium'
              }
              size="md"
              dot
            >
              {problem.difficulty || 'Medium'}
            </Badge>

            {isSolved ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3 h-3" /> Solved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground-subtle bg-surface px-2 py-0.5 rounded-md border border-border-subtle">
                <Clock className="w-3 h-3" /> Unsolved
              </span>
            )}
          </div>

          {problem.platformUrl && (
            <a
              href={problem.platformUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
              Original Problem <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              onClose();
              navigate(`/problem/${problem.id}`);
            }}
            leftIcon={Zap}
            className="w-full justify-center"
          >
            Solve Workspace
          </Button>

          {revision ? (
            <Button
              variant="amber"
              size="md"
              onClick={() => {
                onClose();
                navigate(`/revision/${revision.id}`);
              }}
              leftIcon={Repeat}
              className="w-full justify-center"
            >
              Review Notes
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="md"
              onClick={() => onAddToRevision && onAddToRevision(problem)}
              leftIcon={Repeat}
              className="w-full justify-center"
            >
              Queue Revision
            </Button>
          )}
        </div>

        {/* Patterns & Topics Section */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-semibold text-foreground-subtle uppercase tracking-wider">
            Patterns & Topics
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {problem.patterns?.map((pattern) => (
              <span
                key={pattern}
                className="text-xs font-medium text-indigo-300 bg-primary/10 border border-primary/25 px-2.5 py-1 rounded-md"
              >
                {pattern}
              </span>
            ))}
            {problem.topics?.map((topic) => (
              <span
                key={topic}
                className="text-xs font-medium text-foreground-muted bg-surface-raised border border-border px-2.5 py-1 rounded-md"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Companies Row */}
        {problem.companies && problem.companies.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold text-foreground-subtle uppercase tracking-wider">
              Asked at Companies
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {problem.companies.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 text-xs text-foreground bg-surface border border-border px-2 py-1 rounded-md"
                >
                  <Building2 className="w-3 h-3 text-foreground-subtle" />
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description / Summary */}
        {problem.description && (
          <div className="space-y-2 pt-2 border-t border-border-subtle">
            <h4 className="text-[11px] font-semibold text-foreground-subtle uppercase tracking-wider">
              Problem Statement
            </h4>
            <div className="text-xs leading-relaxed max-h-60 overflow-y-auto custom-scrollbar p-3 bg-surface border border-border rounded-xl">
              <SafeMarkdown content={typeof problem.description === 'string' ? problem.description : problem.description?.description || ''} />
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

ProblemDetailDrawer.propTypes = {
  problem: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  revision: PropTypes.object,
  onAddToRevision: PropTypes.func,
};
