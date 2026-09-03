import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  User,
  Sliders,
  Palette,
  Keyboard,
  LogOut,
  Check,
  Shield,
  Moon,
  Laptop,
} from 'lucide-react';
import Dialog from '../../ui/Dialog';
import Button from '../../ui/Button';
import { useAuthStore } from '../../../stores/authStore';

export default function SettingsModal({ isOpen, onClose }) {
  const { user, logOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  // Preferences saved in localStorage
  const [defaultLanguage, setDefaultLanguage] = useState(
    () => localStorage.getItem('pref_language') || 'java'
  );
  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem('pref_font_size') || '13'
  );
  const [keybindingMode, setKeybindingMode] = useState(
    () => localStorage.getItem('pref_keybindings') || 'standard'
  );

  const handleSaveLanguage = (lang) => {
    setDefaultLanguage(lang);
    localStorage.setItem('pref_language', lang);
  };

  const handleSaveFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('pref_font_size', size);
  };

  const handleSaveKeybindings = (mode) => {
    setKeybindingMode(mode);
    localStorage.setItem('pref_keybindings', mode);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'editor', label: 'Editor & Practice', icon: Sliders },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Settings & Preferences"
      description="Configure workspace preferences, developer defaults, and editor ergonomics."
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col sm:flex-row gap-6 pt-2 min-h-[320px]">
        {/* Left Vertical Nav */}
        <div className="w-full sm:w-44 flex sm:flex-col gap-1 border-b sm:border-b-0 sm:border-r border-border pb-3 sm:pb-0 sm:pr-3 shrink-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-foreground-subtle hover:text-foreground hover:bg-surface-hover'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tab Content */}
        <div className="flex-1 space-y-4">
          {/* 1. Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-border bg-surface flex items-center gap-3">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-12 h-12 rounded-full border border-border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-base">
                    {user?.displayName ? user.displayName[0] : 'U'}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {user?.displayName || 'Anonymous Developer'}
                  </h4>
                  <p className="text-foreground-subtle text-[11px] font-mono">
                    {user?.email || 'No email attached'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-surface text-[11px] text-foreground-subtle space-y-1">
                <p className="font-semibold text-foreground">Security Invariant</p>
                <p>
                  Sessions are authenticated via Firebase Auth token interceptors. Telemetry is end-to-end synchronized.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    await logOut();
                    onClose();
                  }}
                  leftIcon={LogOut}
                >
                  Sign Out of Session
                </Button>
              </div>
            </div>
          )}

          {/* 2. Editor & Practice Tab */}
          {activeTab === 'editor' && (
            <div className="space-y-4 text-xs">
              {/* Default Language */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground uppercase tracking-wider text-[11px] block">
                  Default Programming Language
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['java', 'python', 'cpp', 'javascript'].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleSaveLanguage(lang)}
                      className={`p-2 rounded-lg border text-center font-mono font-medium transition-colors ${
                        defaultLanguage === lang
                          ? 'bg-primary/10 border-primary text-primary shadow-sm'
                          : 'bg-surface border-border text-foreground-subtle hover:text-foreground'
                      }`}
                    >
                      {lang === 'cpp' ? 'C++' : lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground uppercase tracking-wider text-[11px] block">
                  Monaco Editor Font Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['12', '13', '14'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSaveFontSize(size)}
                      className={`p-2 rounded-lg border text-center font-mono font-medium transition-colors ${
                        fontSize === size
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-surface border-border text-foreground-subtle hover:text-foreground'
                      }`}
                    >
                      {size}px
                    </button>
                  ))}
                </div>
              </div>

              {/* Keybindings */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground uppercase tracking-wider text-[11px] block">
                  Keybinding Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'standard', label: 'Standard VS Code' },
                    { id: 'vim', label: 'Vim Emulation' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleSaveKeybindings(mode.id)}
                      className={`p-2.5 rounded-lg border text-left transition-colors ${
                        keybindingMode === mode.id
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-surface border-border text-foreground-subtle hover:text-foreground'
                      }`}
                    >
                      <span className="font-semibold block">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-foreground">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-foreground">Obsidian Dark Theme</h5>
                    <p className="text-[11px] text-foreground-subtle">
                      Tailored HSL dark palette optimized for code readability.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-primary font-mono">Active</span>
              </div>

              <div className="p-4 rounded-xl border border-border bg-surface flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-foreground">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-foreground">Dense Developer Layout</h5>
                    <p className="text-[11px] text-foreground-subtle">
                      High-density tabular rows and tight padding (Linear/Raycast aesthetic).
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 font-mono">Enabled</span>
              </div>
            </div>
          )}

          {/* 4. Keyboard Shortcuts */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-2 text-xs">
              {[
                { shortcut: '⌘K / Ctrl+K', desc: 'Global Command Palette' },
                { shortcut: '⌘B / Ctrl+B', desc: 'Toggle Collapsible Sidebar' },
                { shortcut: '⌘↵ / Ctrl+Enter', desc: 'Execute Code in IDE' },
                { shortcut: 'Esc', desc: 'Dismiss Modals, Drawers & Command Bar' },
                { shortcut: '?', desc: 'Open Shortcuts Cheatsheet' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border"
                >
                  <span className="text-foreground-muted">{item.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-surface-raised border border-border font-mono text-[10px] text-primary">
                    {item.shortcut}
                  </kbd>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}

SettingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
