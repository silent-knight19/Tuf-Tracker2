import PropTypes from 'prop-types';

export default function Skeleton({
  variant = 'text',
  className = '',
  count = 1,
}) {
  const variantStyles = {
    text: 'h-4 w-full rounded-md',
    title: 'h-6 w-3/4 rounded-md',
    avatar: 'h-9 w-9 rounded-xl',
    card: 'h-32 w-full rounded-xl',
    row: 'h-11 w-full rounded-lg',
    badge: 'h-5 w-16 rounded-md',
    button: 'h-9 w-24 rounded-lg',
    editor: 'h-96 w-full rounded-xl',
  };

  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={`bg-surface-raised/60 border border-border-subtle animate-pulse ${
            variantStyles[variant] || variantStyles.text
          } ${className}`}
        />
      ))}
    </>
  );
}

Skeleton.propTypes = {
  variant: PropTypes.oneOf([
    'text',
    'title',
    'avatar',
    'card',
    'row',
    'badge',
    'button',
    'editor',
  ]),
  className: PropTypes.string,
  count: PropTypes.number,
};
