import PropTypes from 'prop-types';

export default function Badge({
  variant = 'subtle',
  size = 'md',
  dot = false,
  children,
  className = '',
  ...props
}) {
  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 rounded gap-1 leading-tight',
    md: 'text-[11px] px-2 py-0.5 rounded-md gap-1.5 leading-tight font-medium',
    lg: 'text-xs px-2.5 py-1 rounded-md gap-1.5 leading-normal font-medium',
  };

  const variantStyles = {
    easy: 'bg-difficulty-easy/10 text-emerald-400 border border-difficulty-easy/25',
    medium: 'bg-difficulty-medium/10 text-amber-400 border border-difficulty-medium/25',
    hard: 'bg-difficulty-hard/10 text-rose-400 border border-difficulty-hard/25',
    primary: 'bg-primary/10 text-indigo-300 border border-primary/25',
    amber: 'bg-accent-amber/10 text-amber-300 border border-accent-amber/25',
    subtle: 'bg-surface-raised text-foreground-muted border border-border-subtle',
    platform: 'bg-surface-hover text-foreground border border-border font-semibold',
    company: 'bg-surface-raised text-foreground-muted border border-border hover:border-border-strong',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/25',
    info: 'bg-sky-500/10 text-sky-400 border border-sky-500/25',
  };

  const dotColorStyles = {
    easy: 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]',
    medium: 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]',
    hard: 'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]',
    primary: 'bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]',
    amber: 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]',
    subtle: 'bg-foreground-subtle',
    platform: 'bg-indigo-400',
    company: 'bg-foreground-muted',
    success: 'bg-emerald-400',
    danger: 'bg-rose-400',
    info: 'bg-sky-400',
  };

  return (
    <span
      className={`inline-flex items-center tracking-tight select-none ${
        sizeStyles[size] || sizeStyles.md
      } ${variantStyles[variant] || variantStyles.subtle} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            dotColorStyles[variant] || 'bg-current'
          }`}
        />
      )}
      <span>{children}</span>
    </span>
  );
}

Badge.propTypes = {
  variant: PropTypes.oneOf([
    'easy',
    'medium',
    'hard',
    'primary',
    'amber',
    'subtle',
    'platform',
    'company',
    'success',
    'danger',
    'info',
  ]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  dot: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
