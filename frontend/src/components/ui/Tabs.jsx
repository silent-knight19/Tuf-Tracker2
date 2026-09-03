import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export default function Tabs({
  tabs,
  activeTab,
  onChange,
  className = '',
  size = 'md',
  layoutId = 'activeTabIndicator',
}) {
  const sizeStyles = {
    sm: 'p-0.5 text-xs rounded-lg gap-1',
    md: 'p-1 text-xs rounded-xl gap-1',
  };

  const itemSizeStyles = {
    sm: 'px-2.5 py-1 rounded-md text-xs',
    md: 'px-3 py-1.5 rounded-lg text-xs',
  };

  return (
    <div
      role="tablist"
      className={`inline-flex items-center bg-surface border border-border shadow-inner-rim ${
        sizeStyles[size] || sizeStyles.md
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center justify-center gap-1.5 font-medium transition-colors select-none outline-none focus-visible:ring-1 focus-visible:ring-primary ${
              itemSizeStyles[size] || itemSizeStyles.md
            } ${
              isActive
                ? 'text-foreground font-semibold'
                : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover/50'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 bg-surface-raised border border-border-strong rounded-lg shadow-sm"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}

            <span className="relative z-10 flex items-center gap-1.5">
              {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive
                      ? 'bg-primary/20 text-indigo-300'
                      : 'bg-surface-hover text-foreground-subtle'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      count: PropTypes.number,
      icon: PropTypes.elementType,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md']),
  layoutId: PropTypes.string,
};
