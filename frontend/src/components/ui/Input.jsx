import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

const Input = forwardRef(function Input(
  {
    value,
    onChange,
    onClear,
    placeholder = 'Search or enter value...',
    icon: Icon,
    shortcut,
    error,
    size = 'md',
    className = '',
    type = 'text',
    disabled = false,
    ...props
  },
  ref
) {
  const sizeStyles = {
    sm: 'h-8 px-2.5 text-xs rounded-lg',
    md: 'h-9 px-3 text-xs rounded-lg',
    lg: 'h-11 px-4 text-sm rounded-xl',
  };

  return (
    <div className={`relative flex items-center w-full group ${className}`}>
      {Icon && (
        <div className="absolute left-3 flex items-center pointer-events-none text-foreground-subtle group-focus-within:text-primary transition-colors">
          <Icon className="w-3.5 h-3.5" />
        </div>
      )}

      <input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full bg-surface border transition-all duration-150 outline-none text-foreground placeholder-foreground-subtle shadow-inner-rim disabled:opacity-50 disabled:cursor-not-allowed ${
          error
            ? 'border-rose-500/60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30'
            : 'border-border hover:border-border-strong focus:border-primary/60 focus:ring-2 focus:ring-primary/20'
        } ${sizeStyles[size] || sizeStyles.md} ${Icon ? 'pl-9' : ''} ${
          shortcut || onClear ? 'pr-12' : ''
        }`}
        {...props}
      />

      <div className="absolute right-2.5 flex items-center gap-1.5">
        {onClear && value && (
          <button
            type="button"
            onClick={onClear}
            className="p-1 rounded-md text-foreground-subtle hover:text-foreground hover:bg-surface-hover transition-colors"
            title="Clear input"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {shortcut && (
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-foreground-subtle bg-surface-raised border border-border rounded shadow-sm select-none">
            {shortcut}
          </kbd>
        )}
      </div>
    </div>
  );
});

Input.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onClear: PropTypes.func,
  placeholder: PropTypes.string,
  icon: PropTypes.elementType,
  shortcut: PropTypes.string,
  error: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  type: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Input;
