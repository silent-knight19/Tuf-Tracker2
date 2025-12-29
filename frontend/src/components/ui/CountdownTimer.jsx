import React, { useState, useEffect } from 'react';
import { Timer, Zap } from 'lucide-react';

const CountdownTimer = ({ targetDate = '2026-04-01T00:00:00' }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeft = {};

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      } else {
        timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      setTimeLeft(timeLeft);
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); // Initial call

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeBlock = ({ value, label, primary = false }) => (
    <div className="flex flex-col items-center min-w-[3.1rem] relative group/block">
      {/* Block Background with Glassmorphism */}
      <div className={`relative px-2 py-2 rounded-lg border transition-all duration-500 overflow-hidden ${
        primary 
          ? 'bg-brand-orange/10 border-brand-orange/30 shadow-[0_0_15px_rgba(249,115,22,0.1)] group-hover/block:border-brand-orange/50 animate-breath-active' 
          : 'bg-dark-900/50 border-dark-800 group-hover/block:border-dark-700'
      }`}>
        {/* Unit Value */}
        <div className={`text-[22px] font-black tracking-tight leading-none font-mono transition-all duration-500 ${
          primary ? 'text-brand-orange' : 'text-white'
        }`}>
          {value.toString().padStart(2, '0')}
        </div>
        
        {/* Subtle Shine/Glow for Primary */}
        {primary && (
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-orange/5 to-transparent opacity-50" />
        )}
      </div>

      {/* Label */}
      <div className="text-[8px] font-black text-dark-600 uppercase tracking-[0.2em] mt-1 transition-colors group-hover/block:text-dark-400">
        {label}
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-3.5 animate-in fade-in zoom-in duration-1000">
      <div className="relative group">
        <div className="relative flex items-center gap-2 p-1 bg-dark-950/40 backdrop-blur-3xl border border-white/[0.03] rounded-xl shadow-2xl">
          <div className="flex items-center gap-1">
            <TimeBlock value={timeLeft.days} label="Days" primary={true} />
            <div className="w-0.5 h-2.5 rounded-full bg-dark-800 mx-1" />
            <TimeBlock value={timeLeft.hours} label="Hrs" />
            <div className="w-0.5 h-2.5 rounded-full bg-dark-800 mx-1" />
            <TimeBlock value={timeLeft.minutes} label="Min" />
            <div className="w-0.5 h-2.5 rounded-full bg-dark-800 mx-1" />
            <TimeBlock value={timeLeft.seconds} label="Sec" />
          </div>

          <div className="h-9 w-px bg-white/[0.05] mx-1.5" />

          {/* "LEFT" Status Panel */}
          <div className="pr-3 pl-1 py-0.5 flex flex-col justify-center">
             <div className="flex items-center gap-1 mb-0.5">
               <div className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
               <span className="text-[8px] font-black text-dark-600 uppercase tracking-widest">Active</span>
             </div>
             <div className="text-[12px] font-black text-brand-orange border-b border-brand-orange/30 italic tracking-[0.1em] leading-none">
               LEFT
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
