import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, Repeat, ArrowUpRight, Code, Eye } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function ProblemRow({
  problem,
  onPreview,
  revision,
}) {
  const navigate = useNavigate();

  const isSolved = Boolean(
    problem.status === 'Solved' ||
      problem.status === 'Completed' ||
      problem.solvedAt
  );

  return (
    <tr
      onClick={() => onPreview && onPreview(problem)}
      className="group hover:bg-surface-hover/70 transition-colors duration-150 cursor-pointer text-xs select-none"
    >
      {/* 1. Status Checkmark */}
      <td className="py-3 px-4 w-10 text-center">
        {isSolved ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
        ) : (
          <div className="w-3.5 h-3.5 rounded-full border border-border-strong group-hover:border-primary mx-auto transition-colors" />
        )}
      </td>

      {/* 2. Problem Title */}
      <td className="py-3 px-4 min-w-[220px]">
        <div className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
          {problem.title}
        </div>
      </td>

      {/* 3. Difficulty */}
      <td className="py-3 px-4 w-28">
        <Badge
          variant={
            problem.difficulty === 'Easy'
              ? 'easy'
              : problem.difficulty === 'Hard'
              ? 'hard'
              : 'medium'
          }
          size="sm"
          dot
        >
          {problem.difficulty || 'Medium'}
        </Badge>
      </td>

      {/* 4. Pattern & Topics */}
      <td className="py-3 px-4 min-w-[180px]">
        <div className="flex flex-wrap items-center gap-1.5 truncate">
          {problem.patterns?.[0] && (
            <span className="text-[10px] font-medium text-indigo-300 bg-primary/10 border border-primary/20 px-1.5 py-0.2 rounded">
              {problem.patterns[0]}
            </span>
          )}
          {problem.topics?.slice(0, 2).map((t) => (
            <span
              key={t}
              className="text-[10px] font-medium text-foreground-subtle bg-surface px-1.5 py-0.2 rounded border border-border-subtle"
            >
              {t}
            </span>
          ))}
        </div>
      </td>

      {/* 5. Platform */}
      <td className="py-3 px-4 w-24">
        <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">
          {problem.platform || 'LeetCode'}
        </span>
      </td>

      {/* 6. Spaced Revision Status */}
      <td className="py-3 px-4 w-28">
        {revision ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-accent-amber/10 border border-accent-amber/20 px-1.5 py-0.2 rounded">
            <Repeat className="w-2.5 h-2.5" />
            {revision.bucket ? revision.bucket : 'In Queue'}
          </span>
        ) : (
          <span className="text-[10px] text-foreground-subtle">—</span>
        )}
      </td>

      {/* 7. Action CTA */}
      <td className="py-3 px-4 w-32 text-right">
        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              if (onPreview) onPreview(problem);
            }}
            title="Inspect problem details"
            className="h-7 w-7 p-0"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/problem/${problem.id}`);
            }}
            className="h-7 px-2 text-[11px]"
            rightIcon={ArrowUpRight}
          >
            Solve
          </Button>
        </div>
      </td>
    </tr>
  );
}

ProblemRow.propTypes = {
  problem: PropTypes.object.isRequired,
  onPreview: PropTypes.func,
  revision: PropTypes.object,
};
