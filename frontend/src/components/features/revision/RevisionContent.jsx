import { useState } from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';

function RevisionContent({ revision, onLogTime }) {
  // Timeline Logic
  const timelineSteps = ['Day 0', 'Day 2', 'Day 7', 'Day 14', 'Day 30', 'Month 2'];
  const currentStepIndex = revision.totalReviews || 0;

  return (
    <div className="space-y-8">
      {/* Visual Timeline & Time Log */}
      <div className="card bg-dark-900 border-dark-800 p-8">
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-sm font-bold text-dark-400 uppercase tracking-wider">Revision Progress</h3>
          <div className="flex items-center gap-2 text-xs text-dark-500 bg-dark-950 px-3 py-1.5 rounded-full border border-dark-800">
            <Clock className="w-3 h-3" />
            <span>Log time in minutes below each step</span>
          </div>
        </div>

        <div className="relative">
          {/* Progress Bar Background */}
          <div className="absolute top-[18px] left-0 right-0 h-1 bg-dark-700 rounded-full" />
          
          {/* Progress Bar Fill */}
          <div 
            className="absolute top-[18px] left-0 h-1 bg-brand-orange rounded-full transition-all duration-500"
            style={{ width: `${Math.min((currentStepIndex / (timelineSteps.length - 1)) * 100, 100)}%` }}
          />

          <div className="relative flex justify-between">
            {timelineSteps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              
              // Map step label to phase key
              const phaseMap = {
                'Day 0': 'day_0',
                'Day 2': 'day_2',
                'Day 7': 'day_7',
                'Day 14': 'day_14',
                'Day 30': 'day_30',
                'Month 2': 'month_2_week_1'
              };
              
              const phaseKey = phaseMap[step];
              const review = revision.scheduledReviews?.find(r => r.phase === phaseKey);
              const timeTaken = review?.timeTaken || '';
              
              return (
                <div key={step} className="flex flex-col items-center gap-4 group w-24">
                  {/* Circle Indicator */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-dark-900 ${
                    isCompleted ? 'bg-brand-orange border-brand-orange text-white' :
                    isCurrent ? 'border-brand-orange text-brand-orange shadow-[0_0_15px_rgba(255,107,0,0.3)] scale-110' :
                    'border-dark-600 text-dark-600'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : 
                     isCurrent ? <div className="w-3 h-3 rounded-full bg-brand-orange animate-pulse" /> :
                     <Circle className="w-5 h-5" />}
                  </div>

                  {/* Label */}
                  <span className={`text-sm font-medium transition-colors ${
                    isCompleted || isCurrent ? 'text-white' : 'text-dark-500'
                  }`}>
                    {step}
                  </span>

                  {/* Time Input */}
                  <div className={`transition-all duration-300 ${isCompleted ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-0'}`}>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="-"
                        disabled={!isCompleted}
                        defaultValue={timeTaken}
                        onBlur={(e) => {
                          const val = e.target.value;
                          if (val && val !== String(timeTaken)) {
                            if (onLogTime) onLogTime(revision.id, phaseKey, val);
                          }
                        }}
                        className={`w-[60px] bg-dark-950 border rounded pl-2 pr-7 py-1.5 text-xs text-center focus:outline-none focus:border-brand-orange transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                          isCompleted 
                            ? 'border-dark-700 text-white placeholder-dark-600' 
                            : 'border-dark-800 text-dark-600 cursor-not-allowed'
                        }`}
                      />
                      <span className={`absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none transition-colors ${
                        isCompleted ? 'text-dark-400' : 'text-dark-700'
                      }`}>
                        min
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RevisionContent;
