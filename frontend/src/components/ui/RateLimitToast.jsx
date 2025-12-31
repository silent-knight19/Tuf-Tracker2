import { useEffect } from 'react';
import { useRateLimitStore } from '../../stores/rateLimitStore';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';

function RateLimitToast() {
  const { isVisible, message, type, hideToast, remaining, limit, resetTime } = useRateLimitStore();

  if (!isVisible) return null;

  const isError = type === 'error';
  const bgColor = isError ? 'bg-red-500/10' : 'bg-brand-orange/10';
  const borderColor = isError ? 'border-red-500/20' : 'border-brand-orange/20';
  const textColor = isError ? 'text-red-400' : 'text-brand-orange';
  const Icon = isError ? AlertCircle : AlertTriangle;

  return (
    <div className={`fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-right-10 duration-300`}>
      <div className={`backdrop-blur-md border ${borderColor} ${bgColor} rounded-xl shadow-2xl p-4 flex gap-4 items-start`}>
        <div className={`p-2 rounded-lg ${isError ? 'bg-red-500/10' : 'bg-brand-orange/10'}`}>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
        
        <div className="flex-1">
          <h3 className={`font-bold text-sm ${textColor} mb-1`}>
            {isError ? 'Limit Reached' : 'Usage Warning'}
          </h3>
          <p className="text-dark-200 text-xs leading-relaxed">
            {message}
          </p>
          
          {/* Progress Bar */}
          <div className="mt-3 h-1.5 w-full bg-dark-900/50 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isError ? 'bg-red-500' : 'bg-brand-orange'}`}
              style={{ width: `${((limit - remaining) / limit) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-dark-500 font-medium">Used: {limit - remaining}/{limit}</span>
            {resetTime && (
              <span className="text-[10px] text-dark-500">Resets: {resetTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            )}
          </div>
        </div>

        <button 
          onClick={hideToast}
          className="text-dark-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default RateLimitToast;
