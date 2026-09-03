import PropTypes from 'prop-types';
import Dialog from '../ui/Dialog';

export default function ShortcutsModal({ isOpen, onClose }) {
  const shortcutGroups = [
    {
      title: 'Global Navigation',
      items: [
        { key: '⌘K / Ctrl+K', desc: 'Open global command palette & search' },
        { key: '⌘B / [', desc: 'Toggle sidebar collapse / expand' },
        { key: 'Esc', desc: 'Close open dialogs, drawers, or command palette' },
        { key: '?', desc: 'Open this keyboard shortcuts dialog' },
      ],
    },
    {
      title: 'Command Palette',
      items: [
        { key: '↑ / ↓', desc: 'Navigate results' },
        { key: 'Enter', desc: 'Execute action or navigate to page' },
      ],
    },
    {
      title: 'Problem Workspace',
      items: [
        { key: '⌘↵ / Ctrl+Enter', desc: 'Run code against test cases' },
        { key: 'Tab', desc: 'Indent code in Monaco editor' },
      ],
    },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      description="Accelerate your workflow with keyboard-first navigation."
      maxWidth="max-w-lg"
    >
      <div className="space-y-6 pt-2">
        {shortcutGroups.map((group) => (
          <div key={group.title} className="space-y-2.5">
            <h4 className="text-[11px] font-semibold text-foreground-subtle uppercase tracking-wider">
              {group.title}
            </h4>
            <div className="divide-y divide-border-subtle rounded-xl border border-border bg-surface shadow-inner-rim">
              {group.items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between px-3.5 py-2.5 text-xs"
                >
                  <span className="text-foreground-muted">{item.desc}</span>
                  <kbd className="px-2 py-1 text-[11px] font-mono text-foreground bg-surface-raised border border-border rounded-md shadow-sm">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Dialog>
  );
}

ShortcutsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
