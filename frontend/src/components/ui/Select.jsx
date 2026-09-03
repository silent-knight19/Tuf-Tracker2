import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select(
  {
    options = [],
    value,
    onChange,
    placeholder = 'Select an option...',
    size = 'md',
    error,
    disabled = false,
    className = '',
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
    <div className={`relative flex items-center w-full ${className}`}>
      <select
        ref={ref}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full bg-surface border appearance-none pr-9 text-foreground outline-none transition-all duration-150 cursor-pointer shadow-inner-rim disabled:opacity-50 disabled:cursor-not-allowed ${
          error
            ? 'border-rose-500/60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30'
            : 'border-border hover:border-border-strong focus:border-primary/60 focus:ring-2 focus:ring-primary/20'
        } ${sizeStyles[size] || sizeStyles.md}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="bg-surface text-foreground-subtle">
            {placeholder}
          </option>
        )}
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const label = typeof opt === 'object' ? opt.label : opt;
          return (
            <option
              key={val}
              value={val}
              className="bg-surface text-foreground py-1"
            >
              {label}
            </option>
          );
        })}
      </select>

      <div className="absolute right-3 pointer-events-none text-foreground-subtle">
        <ChevronDown className="w-3.5 h-3.5" />
      </div>
    </div>
  );
});

Select.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.node.isRequired,
      }),
    ])
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  error: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Select;
