import { useState, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  Code,
  RotateCw,
  BarChart2,
  BookOpen,
  Building2,
  Layers,
  ArrowRight,
  Plus,
  Cpu,
} from 'lucide-react';
import { useProblemStore } from '../../stores/problemStore';

export default function CommandPalette({ isOpen, onClose, onOpenAddProblem }) {
  const navigate = useNavigate();
  const { problems } = useProblemStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Static navigation and actions catalog
  const staticItems = useMemo(
    () => [
      // Navigation
      {
        id: 'nav-dashboard',
        group: 'Navigation',
        title: 'Go to Dashboard',
        subtitle: 'Overview & Today’s Targets',
        icon: LayoutDashboard,
        action: () => navigate('/'),
      },
      {
        id: 'nav-problems',
        group: 'Navigation',
        title: 'Problem Bank',
        subtitle: 'Browse all solved & tracked problems',
        icon: Code,
        action: () => navigate('/problems'),
      },
      {
        id: 'nav-revision',
        group: 'Navigation',
        title: 'Spaced Revision Queue',
        subtitle: 'Review due problems (SM-2)',
        icon: RotateCw,
        action: () => navigate('/revision'),
      },
      {
        id: 'nav-analytics',
        group: 'Navigation',
        title: 'Performance Analytics',
        subtitle: 'Velocity heatmap & pattern mastery',
        icon: BarChart2,
        action: () => navigate('/analytics'),
      },
      {
        id: 'nav-sheets',
        group: 'Navigation',
        title: 'Curated Roadmaps & Sheets',
        subtitle: 'Strivers A2Z, NeetCode 150, Patterns',
        icon: Layers,
        action: () => navigate('/sheets'),
      },
      {
        id: 'nav-learn',
        group: 'Navigation',
        title: 'Learn & DSA Patterns',
        subtitle: 'AI-generated curriculum & explanations',
        icon: BookOpen,
        action: () => navigate('/learn'),
      },
      {
        id: 'nav-companies',
        group: 'Navigation',
        title: 'Company Hub',
        subtitle: 'Target company question sets',
        icon: Building2,
        action: () => navigate('/practice/companies'),
      },
      {
        id: 'nav-interview',
        group: 'Navigation',
        title: 'AI Mock Interview',
        subtitle: 'Interactive live problem solving',
        icon: Cpu,
        action: () => navigate('/practice/interview'),
      },
      // Curated Sheets
      {
        id: 'sheet-strivers',
        group: 'Curated Sheets',
        title: 'Strivers A2Z DSA Sheet',
        subtitle: '455 core algorithmic questions',
        icon: Layers,
        action: () => navigate('/sheets/strivers'),
      },
      {
        id: 'sheet-neetcode',
        group: 'Curated Sheets',
        title: 'NeetCode 150',
        subtitle: 'Silicon Valley interview standard',
        icon: Layers,
        action: () => navigate('/sheets/neetcode'),
      },
      {
        id: 'sheet-patterns',
        group: 'Curated Sheets',
        title: 'Algorithmic Patterns',
        subtitle: 'Core paradigm mastery roadmap',
        icon: Layers,
        action: () => navigate('/sheets/dsa-patterns'),
      },
      // Quick Actions
      {
        id: 'action-add-problem',
        group: 'Actions',
        title: 'Add New Problem',
        subtitle: 'Track custom problem by URL or title',
        icon: Plus,
        action: () => {
          if (onOpenAddProblem) onOpenAddProblem();
          else navigate('/problems');
        },
      },
    ],
    [navigate, onOpenAddProblem]
  );

  // Dynamic search results
  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return staticItems;

    // Filter static commands
    const matchingStatic = staticItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
    );

    // Search real problems from store
    const matchingProblems = (problems || [])
      .filter((p) => {
        const titleMatch = p.title?.toLowerCase().includes(q);
        const topicMatch = p.topics?.some((t) => t.toLowerCase().includes(q));
        const patternMatch = p.patterns?.some((pat) => pat.toLowerCase().includes(q));
        const companyMatch = p.companies?.some((c) => c.toLowerCase().includes(q));
        return titleMatch || topicMatch || patternMatch || companyMatch;
      })
      .slice(0, 8)
      .map((p) => ({
        id: `problem-${p.id}`,
        group: 'Problem Bank',
        title: p.title,
        subtitle: `${p.difficulty || 'Medium'} · ${p.platform || 'LeetCode'} ${
          p.patterns?.[0] ? `· ${p.patterns[0]}` : ''
        }`,
        icon: Code,
        badge: p.difficulty,
        action: () => {
          navigate(`/problem/${p.id}`);
        },
      }));

    return [...matchingStatic, ...matchingProblems];
  }, [query, staticItems, problems, navigate]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev - 1 < 0 ? Math.max(0, filteredItems.length - 1) : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        onClose();
        selected.action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-[12vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Palette Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-surface-elevated border border-border-strong rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[65vh]"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-border gap-3 shrink-0 bg-surface">
              <Search className="w-4 h-4 text-foreground-subtle shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search commands, problems, roadmaps, actions..."
                className="w-full bg-transparent text-sm text-foreground placeholder-foreground-subtle outline-none"
              />
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-foreground-subtle bg-surface-raised border border-border rounded shadow-sm">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onClose();
                        item.action();
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-100 select-none ${
                        isSelected
                          ? 'bg-surface-hover text-foreground'
                          : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-primary/20 text-indigo-300'
                              : 'bg-surface text-foreground-subtle'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate flex items-center gap-2">
                            <span>{item.title}</span>
                            {item.badge && (
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                  item.badge === 'Easy'
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : item.badge === 'Medium'
                                    ? 'bg-amber-500/10 text-amber-400'
                                    : 'bg-rose-500/10 text-rose-400'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-foreground-subtle truncate">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] uppercase font-semibold text-foreground-subtle tracking-wider px-2 py-0.5 rounded bg-surface/80 border border-border-subtle">
                          {item.group}
                        </span>
                        {isSelected && (
                          <ArrowRight className="w-3.5 h-3.5 text-primary" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-foreground-subtle text-xs">
                  No matching commands or problems found.
                </div>
              )}
            </div>

            {/* Footer Toolbar */}
            <div className="px-4 py-2.5 border-t border-border-subtle bg-surface/50 flex items-center justify-between text-[11px] text-foreground-subtle select-none shrink-0">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface border border-border rounded">↑</kbd>
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface border border-border rounded">↓</kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface border border-border rounded">↵</kbd>
                  <span>Select</span>
                </span>
              </div>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface border border-border rounded">ESC</kbd>
                <span>Close</span>
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

CommandPalette.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onOpenAddProblem: PropTypes.func,
};
