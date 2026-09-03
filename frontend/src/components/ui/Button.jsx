import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(function Button(
  {
    variant = 'secondary',
    size = 'md',
    isLoading = false,
    disabled = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    children,
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'h-8 px-2.5 text-xs rounded-lg gap-1.5',
    md: 'h-9 px-3.5 text-xs rounded-lg gap-2',
    lg: 'h-11 px-5 text-sm rounded-xl gap-2.5',
    icon: 'h-8 w-8 rounded-lg p-0',
    'icon-sm': 'h-7 w-7 rounded-md p-0',
  };

  const variantStyles = {
    primary: 'bg-primary hover:bg-primary-hover active:bg-primary-active text-white border border-primary-border shadow-sm hover:shadow-md hover:shadow-primary/20',
    secondary: 'bg-surface-raised hover:bg-surface-hover active:bg-surface-active text-foreground border border-border hover:border-border-strong shadow-inner-rim',
    ghost: 'bg-transparent hover:bg-surface-hover text-foreground-muted hover:text-foreground active:bg-surface-active',
    outline: 'bg-transparent hover:bg-surface text-foreground-muted hover:text-foreground border border-border hover:border-border-strong',
    danger: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 active:bg-rose-500/30',
    subtle: 'bg-surface hover:bg-surface-raised text-foreground-muted hover:text-foreground border border-border-subtle',
    amber: 'bg-accent-amber/15 hover:bg-accent-amber/25 text-amber-300 border border-accent-amber/30 active:bg-accent-amber/30',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.secondary} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : LeftIcon ? (
        <LeftIcon className="w-3.5 h-3.5 shrink-0" />
      ) : null}

      {children && <span className="truncate">{children}</span>}

      {!isLoading && RightIcon && <RightIcon className="w-3.5 h-3.5 shrink-0" />}
    </button>
  );
});

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'outline', 'danger', 'subtle', 'amber']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'icon', 'icon-sm']),
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  leftIcon: PropTypes.elementType,
  rightIcon: PropTypes.elementType,
  children: PropTypes.node,
  className: PropTypes.string,
  type: PropTypes.string,
};

export default Button;
