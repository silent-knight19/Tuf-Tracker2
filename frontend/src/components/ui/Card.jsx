import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Card = forwardRef(function Card(
  {
    children,
    className = '',
    interactive = false,
    onClick,
    ...props
  },
  ref
) {
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`bg-surface-raised border border-border rounded-xl p-4 transition-all duration-200 shadow-inner-rim ${
        interactive
          ? 'cursor-pointer hover:border-border-strong hover:bg-surface-hover hover:-translate-y-0.5 active:translate-y-0'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  interactive: PropTypes.bool,
  onClick: PropTypes.func,
};

export default Card;
