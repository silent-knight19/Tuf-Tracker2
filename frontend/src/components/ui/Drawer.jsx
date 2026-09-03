import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'max-w-md',
  className = '',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className={`relative w-full ${width} bg-surface-elevated border-l border-border-strong shadow-2xl h-full flex flex-col z-10 ${className}`}
          >
            {/* Header */}
            <div className="h-16 px-6 border-b border-border-subtle flex items-center justify-between gap-4 shrink-0">
              <div>
                {title && (
                  <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs text-foreground-muted truncate mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-foreground-subtle hover:text-foreground hover:bg-surface-hover transition-colors"
                title="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

Drawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  children: PropTypes.node,
  width: PropTypes.string,
  className: PropTypes.string,
};
