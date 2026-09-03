import { useEffect, useState } from 'react';
import { useQuoteStore } from '../../stores/quoteStore';
import { Quote, Zap } from 'lucide-react';

const MotivationalQuote = ({ category = null, className = "", variant = "card", animate = true, size = "md", hideAuthor = false }) => {
  const { quotes, fetchQuotes, getRandomQuote } = useQuoteStore();
  const [activeQuote, setActiveQuote] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (quotes.length === 0) {
      fetchQuotes();
    }
  }, [quotes.length, fetchQuotes]);

  // Initial quote or rotation function
  const rotateQuote = () => {
    setIsVisible(false);
    setTimeout(() => {
      setActiveQuote(getRandomQuote(category));
      setIsVisible(true);
    }, 500);
  };

  useEffect(() => {
    if (quotes.length > 0) {
      const timer = setTimeout(() => {
        rotateQuote();
      }, 50);
      
      let interval;
      if (animate) {
        interval = setInterval(rotateQuote, 30000); // 30s cycle
      }
      return () => {
        clearTimeout(timer);
        if (interval) clearInterval(interval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotes.length, category, animate]);

  if (!activeQuote) return null;

  const transitionClass = isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1";

  // Size mapping
  const sizes = {
    sm: { padding: "p-3", gap: "gap-2", quoteIcon: "w-3.5 h-3.5", categoryText: "text-[7px]", quoteText: "text-sm", authorText: "text-[8px]", line: "w-3" },
    md: { padding: "p-5", gap: "gap-3.5", quoteIcon: "w-5 h-5", categoryText: "text-[9px]", quoteText: "text-lg", authorText: "text-[10px]", line: "w-5" },
    lg: { padding: "p-6", gap: "gap-4", quoteIcon: "w-6 h-6", categoryText: "text-[9px]", quoteText: "text-[19px]", authorText: "text-[10px]", line: "w-7" },
    xl: { padding: "p-10", gap: "gap-8", quoteIcon: "w-10 h-10", categoryText: "text-xs", quoteText: "text-4xl", authorText: "text-sm", line: "w-12" }
  };

  const s = sizes[size] || sizes.md;

  if (variant === "subtle") {
    return (
      <div className={`flex items-center gap-1.5 transition-all duration-700 ease-out ${transitionClass} ${className}`}>
        <Zap className="w-3.5 h-3.5 text-brand-orange/60" />
        <span className="text-[10px] font-black tracking-tight uppercase text-brand-orange">"{activeQuote.text}"</span>
      </div>
    );
  }

  if (variant === "ghost") {
    return (
      <div className={`flex items-center gap-4 px-5 py-2.5 bg-dark-900/40 backdrop-blur-md border border-dark-800/40 rounded-xl transition-all duration-700 ease-out w-full justify-center ${transitionClass} ${className}`}>
        <Quote className="w-4 h-4 text-brand-orange/50 shrink-0" />
        <p className="text-base font-black text-brand-orange tracking-tight leading-relaxed">
          {activeQuote.text}
        </p>
        {!hideAuthor && (
          <>
            <div className="h-4 w-px bg-dark-800 shrink-0" />
            <span className="text-xs font-black text-dark-500 uppercase tracking-widest shrink-0 whitespace-nowrap">{activeQuote.author}</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden group transition-all duration-700 ease-out ${transitionClass} ${className}`}>
      {/* Background Glow */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-brand-orange/5 blur-[45px] rounded-full group-hover:bg-brand-orange/10 transition-all duration-700" />
      
      <div className={`relative z-10 ${s.padding} bg-dark-900/40 backdrop-blur-xl border border-dark-800/60 rounded-2xl flex flex-col ${s.gap}`}>
        <div className="flex items-center justify-between">
          <Quote className={`${s.quoteIcon} text-brand-orange/60`} />
          <span className={`${s.categoryText} font-black text-dark-600 uppercase tracking-[0.25em]`}>{activeQuote.category || 'Insight'}</span>
        </div>
        
        <p className={`${s.quoteText} font-black text-brand-orange leading-relaxed tracking-tight group-hover:drop-shadow-[0_0_12px_rgba(249,115,22,0.3)] transition-all`}>
          "{activeQuote.text}"
        </p>
        
        <div className="flex items-center justify-end gap-2.5 mt-1.5">
          <div className={`h-px ${s.line} bg-dark-800`} />
          <span className={`${s.authorText} font-black text-dark-500 uppercase tracking-widest`}>{activeQuote.author}</span>
        </div>
      </div>
    </div>
  );
};

export default MotivationalQuote;
