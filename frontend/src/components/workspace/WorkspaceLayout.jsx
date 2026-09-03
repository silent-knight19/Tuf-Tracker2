import { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  GripVertical,
  ExternalLink,
  Zap,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  Code2,
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function WorkspaceLayout({
  title,
  difficulty = 'Medium',
  platform = 'LeetCode',
  platformUrl,
  status,
  leftContent,
  rightContent,
  leftTabTitle = 'Description',
  onRunCode,
  isRunning = false,
  cooldown = 0,
}) {
  const navigate = useNavigate();
  const [leftWidth, setLeftWidth] = useState(48); // Percentage
  const [isDragging, setIsDragging] = useState(false);
  const [mobileTab, setMobileTab] = useState('statement'); // 'statement' | 'editor'
  const containerRef = useRef(null);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.max(25, Math.min(75, newWidth)));
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'unset';
      document.body.style.cursor = 'unset';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'unset';
      document.body.style.cursor = 'unset';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Keyboard shortcut: ⌘↵ to run code
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (onRunCode && !isRunning && cooldown <= 0) {
          onRunCode();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRunCode, isRunning, cooldown]);

  const isSolved = status === 'Solved' || status === 'Completed';

  return (
    <div className="h-screen flex flex-col bg-canvas overflow-hidden">
      {/* 1. Unified Workspace Toolbar Header */}
      <div className="h-13 border-b border-border bg-surface px-4 flex items-center justify-between gap-3 shrink-0 select-none">
        {/* Left: Back + Title + Badges */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-foreground-subtle hover:text-foreground hover:bg-surface-hover transition-colors shrink-0"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 truncate">
            <h1 className="text-xs sm:text-sm font-bold text-foreground tracking-tight truncate">
              {title}
            </h1>

            <Badge
              variant={
                difficulty === 'Easy'
                  ? 'easy'
                  : difficulty === 'Hard'
                  ? 'hard'
                  : 'medium'
              }
              size="sm"
              dot
            >
              {difficulty}
            </Badge>

            {isSolved && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                <CheckCircle2 className="w-3 h-3" /> Solved
              </span>
            )}
          </div>
        </div>

        {/* Center: Mobile Tab Switcher */}
        <div className="flex lg:hidden items-center bg-surface-raised border border-border rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setMobileTab('statement')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              mobileTab === 'statement'
                ? 'bg-surface text-foreground shadow-sm'
                : 'text-foreground-subtle'
            }`}
          >
            Problem
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('editor')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              mobileTab === 'editor'
                ? 'bg-surface text-foreground shadow-sm'
                : 'text-foreground-subtle'
            }`}
          >
            Code & Run
          </button>
        </div>

        {/* Right: Actions & Run Code CTA */}
        <div className="flex items-center gap-2 shrink-0">
          {platformUrl && (
            <a
              href={platformUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-xs text-foreground-subtle hover:text-foreground hover:bg-surface-hover px-2.5 py-1.5 rounded-lg border border-border transition-colors"
            >
              <span className="truncate">{platform}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {onRunCode && (
            <Button
              variant="primary"
              size="sm"
              onClick={onRunCode}
              disabled={isRunning || cooldown > 0}
              isLoading={isRunning}
              leftIcon={Play}
              className="px-3"
            >
              {cooldown > 0 ? `Wait ${cooldown}s` : 'Run (⌘↵)'}
            </Button>
          )}
        </div>
      </div>

      {/* 2. Workspace Body: Desktop Dual Pane / Mobile Stack */}
      <div
        ref={containerRef}
        className="flex-1 flex overflow-hidden relative"
      >
        {/* Left Pane (Desktop or Active Mobile) */}
        <div
          style={{ width: `${leftWidth}%` }}
          className={`h-full border-r border-border bg-surface-subtle/50 overflow-hidden flex flex-col ${
            mobileTab === 'statement' ? 'flex w-full' : 'hidden lg:flex'
          }`}
        >
          {leftContent}
        </div>

        {/* Resizable Divider (Desktop Only) */}
        <div
          onMouseDown={() => setIsDragging(true)}
          className="hidden lg:flex items-center justify-center w-1 hover:w-1.5 -mx-0.5 bg-border hover:bg-primary transition-colors cursor-col-resize z-20 select-none group"
        >
          <div className="w-1 h-6 rounded-full bg-foreground-subtle/50 group-hover:bg-white" />
        </div>

        {/* Right Pane (Desktop or Active Mobile) */}
        <div
          style={{ width: `${100 - leftWidth}%` }}
          className={`h-full overflow-hidden flex flex-col bg-surface ${
            mobileTab === 'editor' ? 'flex w-full' : 'hidden lg:flex'
          }`}
        >
          {rightContent}
        </div>
      </div>
    </div>
  );
}

WorkspaceLayout.propTypes = {
  title: PropTypes.string.isRequired,
  difficulty: PropTypes.string,
  platform: PropTypes.string,
  platformUrl: PropTypes.string,
  status: PropTypes.string,
  leftContent: PropTypes.node.isRequired,
  rightContent: PropTypes.node.isRequired,
  leftTabTitle: PropTypes.string,
  onRunCode: PropTypes.func,
  isRunning: PropTypes.bool,
  cooldown: PropTypes.number,
};
