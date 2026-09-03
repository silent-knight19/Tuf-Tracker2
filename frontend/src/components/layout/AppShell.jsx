import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CommandPalette from '../ui/CommandPalette';
import ShortcutsModal from './ShortcutsModal';
import SettingsModal from '../features/settings/SettingsModal';
import RateLimitToast from '../ui/RateLimitToast';
import { useProblemStore } from '../../stores/problemStore';

export default function AppShell({ children, fullBleed = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { problems, fetchProblems } = useProblemStore();

  useEffect(() => {
    if (!problems || problems.length === 0) {
      fetchProblems();
    }
  }, [problems, fetchProblems]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // ⌘K or Ctrl+K -> Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      // ⌘B -> Toggle Sidebar
      else if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
      // ? -> Shortcuts Dialog (only when not in an input or textarea)
      else if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Compute total solved count
  const solvedCount = useMemo(() => {
    if (!problems) return 0;
    return problems.filter(
      (p) => p.status === 'Solved' || p.status === 'Completed' || p.solvedAt
    ).length;
  }, [problems]);

  // Calculate streak based on solved problems
  const streak = useMemo(() => {
    if (!problems || problems.length === 0) return 0;

    const solvedDates = problems
      .filter((p) => p.status === 'Solved' || p.status === 'Completed' || p.solvedAt)
      .map((p) => {
        const dateField = p.solvedAt || p.updatedAt;
        if (!dateField) return null;
        if (dateField._seconds) return new Date(dateField._seconds * 1000);
        if (dateField.seconds) return new Date(dateField.seconds * 1000);
        if (dateField.toDate) return dateField.toDate();
        const parsed = new Date(dateField);
        return isNaN(parsed.getTime()) ? null : parsed;
      })
      .filter(Boolean);

    if (solvedDates.length === 0) return 0;

    const normalizeDate = (d) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    };

    const uniqueDates = [...new Set(solvedDates.map(normalizeDate))].sort((a, b) => b - a);
    if (uniqueDates.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayTime = yesterday.getTime();

    const mostRecent = uniqueDates[0];
    if (mostRecent < yesterdayTime) return 0;

    let count = 0;
    let current = mostRecent === todayTime ? todayTime : yesterdayTime;

    for (let i = 0; i < uniqueDates.length; i++) {
      if (uniqueDates[i] === current) {
        count++;
        const prev = new Date(current);
        prev.setDate(prev.getDate() - 1);
        current = prev.getTime();
      } else if (uniqueDates[i] < current) {
        break;
      }
    }

    return count;
  }, [problems]);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas text-foreground font-sans selection:bg-primary/30 selection:text-white">
      {/* Toast Notifications */}
      <RateLimitToast />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Keyboard Shortcuts Dialog */}
      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      {/* Workspace Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Collapsible Sidebar */}
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <Topbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
          solvedCount={solvedCount}
          streak={streak}
        />

        {/* Viewport Content */}
        <main
          className={`flex-1 overflow-y-auto ${
            fullBleed ? 'p-0 overflow-hidden' : 'custom-scrollbar p-6'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

AppShell.propTypes = {
  children: PropTypes.node,
  fullBleed: PropTypes.bool,
};
