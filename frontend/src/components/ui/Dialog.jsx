import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-xl',
  className = '',
}) {
  const dialogRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${maxWidth} bg-surface-elevated border border-border-strong rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] ${className}`}
          >
            {/* Header */}
            {(title || description) && (
              <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 border-b border-border-subtle shrink-0">
                <div>
                  {title && (
                    <h2 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-foreground-subtle hover:text-foreground hover:bg-surface-hover transition-colors shrink-0"
                  title="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Content Body */}
            <div className="px-6 py-5 overflow-y-auto custom-scrollbar flex-1 text-sm text-foreground-muted">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-3.5 bg-surface/50 border-t border-border-subtle flex items-center justify-end gap-2.5 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

Dialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  description: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
  maxWidth: PropTypes.string,
  className: PropTypes.string,
};
