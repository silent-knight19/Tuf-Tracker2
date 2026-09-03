import PropTypes from 'prop-types';

export default function BaseCaseLogo({ size = 'md', variant = 'full', className = '', showBadge = false }) {
  const sizeMap = {
    xs: { icon: 'w-6 h-6', text: 'text-xs', badge: 'text-[9px]' },
    sm: { icon: 'w-7 h-7', text: 'text-sm', badge: 'text-[9px]' },
    md: { icon: 'w-[38px] h-[38px]', text: 'text-base', badge: 'text-[10px]' },
    lg: { icon: 'w-12 h-12', text: 'text-xl', badge: 'text-[11px]' },
    xl: { icon: 'w-14 h-14', text: 'text-2xl', badge: 'text-xs' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const IconElement = (
    <div className={`${currentSize.icon} rounded-lg overflow-hidden shrink-0 border border-primary/30 shadow-sm shadow-primary/20 bg-surface flex items-center justify-center relative group`}>
      <img
        src="/basecase-icon.png"
        alt="BaseCase Icon"
        className="w-full h-full object-cover"
      />
    </div>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {IconElement}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {IconElement}
      <div className="flex items-center gap-1.5">
        <span className={`font-bold tracking-tight text-foreground ${currentSize.text}`}>
          Base<span className="text-primary">Case</span>
        </span>
        {showBadge && (
          <span className={`font-mono font-semibold text-indigo-300 bg-primary/15 border border-primary/25 px-1.5 py-0.5 rounded ${currentSize.badge}`}>
            2.0
          </span>
        )}
      </div>
    </div>
  );
}

BaseCaseLogo.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['icon', 'full']),
  className: PropTypes.string,
  showBadge: PropTypes.bool,
};
