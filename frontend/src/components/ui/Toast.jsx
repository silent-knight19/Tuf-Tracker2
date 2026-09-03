import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({
  isVisible,
  onClose,
  title,
  message,
  type = 'info',
  action,
  duration = 4000,
}) {
  useEffect(() => {
    if (!isVisible || !duration) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle2,
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/25',
    },
    warning: {
      icon: AlertTriangle,
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/25',
    },
    error: {
      icon: AlertCircle,
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/25',
    },
    info: {
      icon: Info,
      textColor: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/25',
    },
  };

  const current = config[type] || config.info;
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed bottom-6 right-6 z-50 max-w-sm w-full bg-surface-elevated border ${current.borderColor} rounded-xl p-4 shadow-2xl flex items-start gap-3 select-none`}
        >
          <div className={`p-1.5 rounded-lg ${current.bgColor} ${current.textColor} shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            {title && (
              <h4 className={`text-xs font-semibold ${current.textColor} mb-0.5`}>
                {title}
              </h4>
            )}
            <p className="text-xs text-foreground-muted leading-relaxed">
              {message}
            </p>
            {action && (
              <div className="mt-2 flex items-center gap-2">
                {action}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-foreground-subtle hover:text-foreground transition-colors p-1"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

Toast.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  message: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['success', 'warning', 'error', 'info']),
  action: PropTypes.node,
  duration: PropTypes.number,
};
