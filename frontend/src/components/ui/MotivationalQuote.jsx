import { useEffect, useState } from 'react';
import { useQuoteStore } from '../../stores/quoteStore';
import { Quote, Sparkles } from 'lucide-react';

const MotivationalQuote = ({ category = null, className = "", variant = "card", animate = true, hideAuthor = false }) => {
  const { quotes, fetchQuotes, getRandomQuote } = useQuoteStore();
  const [activeQuote, setActiveQuote] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (quotes.length === 0) {
      fetchQuotes();
    }
  }, [quotes.length, fetchQuotes]);

  // Rotate quote with subtle cross-fade
  const rotateQuote = () => {
    setIsVisible(false);
    setTimeout(() => {
      setActiveQuote(getRandomQuote(category));
      setIsVisible(true);
    }, 400);
  };

  useEffect(() => {
    if (quotes.length > 0) {
      const timer = setTimeout(() => {
        rotateQuote();
      }, 50);

      let interval;
      if (animate) {
        interval = setInterval(rotateQuote, 30000);
      }
      return () => {
        clearTimeout(timer);
        if (interval) clearInterval(interval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotes.length, category, animate]);

  if (!activeQuote) return null;

  const transitionClass = isVisible 
    ? "opacity-100 translate-y-0 filter blur-0" 
    : "opacity-0 translate-y-1 filter blur-[1px]";

  if (variant === "subtle") {
    return (
      <div className={`flex items-center gap-2 transition-all duration-500 ease-spring ${transitionClass} ${className}`}>
        <Sparkles className="w-3.5 h-3.5 text-brand-amber shrink-0" />
        <span className="text-xs text-dark-300 italic truncate">"{activeQuote.text}"</span>
        {!hideAuthor && (
          <span className="text-[10px] text-dark-500 font-medium shrink-0">— {activeQuote.author}</span>
        )}
      </div>
    );
  }

  if (variant === "ghost") {
    return (
      <div className={`flex items-center gap-3 px-4 py-2 bg-dark-900/40 backdrop-blur-md border border-white/[0.06] rounded-xl transition-all duration-500 ease-spring ${transitionClass} ${className}`}>
        <Quote className="w-3.5 h-3.5 text-brand-orange/70 shrink-0" />
        <p className="text-xs sm:text-sm text-dark-200 font-medium tracking-tight">
          "{activeQuote.text}"
        </p>
        {!hideAuthor && (
          <span className="text-2xs text-dark-400 font-medium shrink-0 ml-auto pl-2 border-l border-white/[0.06]">
            {activeQuote.author}
          </span>
        )}
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className={`glass-panel rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 transition-all duration-500 ease-spring ${transitionClass} ${className}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center shrink-0">
            <Quote className="w-3 h-3 text-brand-orange" />
          </div>
          <p className="text-xs text-dark-200 font-medium truncate">
            "{activeQuote.text}"
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {!hideAuthor && (
            <span className="text-2xs text-dark-400 font-medium">
              — {activeQuote.author}
            </span>
          )}
          <button
            onClick={rotateQuote}
            title="Next inspirational thought"
            className="p-1 rounded-md text-dark-500 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <Sparkles className="w-3 h-3 text-brand-amber" />
          </button>
        </div>
      </div>
    );
  }

  // Card Variant
  return (
    <div className={`relative overflow-hidden group rounded-2xl glass-panel transition-all duration-500 ease-spring ${transitionClass} ${className}`}>
      {/* Subtle Ambient Radial Highlight */}
      <div className="absolute top-0 right-0 w-48 h-32 bg-brand-orange/[0.04] blur-2xl rounded-full pointer-events-none" />

      <div className="relative z-10 p-4 sm:p-5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center">
              <Quote className="w-3 h-3 text-brand-orange" />
            </div>
            <span className="text-2xs font-semibold uppercase tracking-wider text-dark-400">Daily Directive</span>
          </div>

          {activeQuote.category && (
            <span className="text-2xs font-medium text-brand-amber bg-brand-orange/[0.08] px-2 py-0.5 rounded-md border border-brand-orange/15">
              {activeQuote.category}
            </span>
          )}
        </div>

        <p className="text-sm sm:text-[15px] font-medium text-white/95 leading-relaxed tracking-tight">
          "{activeQuote.text}"
        </p>

        {!hideAuthor && (
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/[0.04]">
            <span className="text-2xs text-dark-400 font-medium tracking-tight">— {activeQuote.author}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MotivationalQuote;
