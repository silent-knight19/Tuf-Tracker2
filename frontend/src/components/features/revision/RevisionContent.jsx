import { useState } from 'react';

import { CheckCircle, Circle, Clock, Activity, Target, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function RevisionContent({ revision, onLogTime }) {
  // Timeline Logic
  const timelineSteps = ['Day 0', 'Day 2', 'Day 7', 'Day 14', 'Day 30', 'Month 2'];
  const currentStepIndex = revision.totalReviews || 0;

  return (
    <div className="space-y-12 pb-20">
      {/* Dynamic Evolution Timeline */}
      <div className="bg-dark-900/40 backdrop-blur-xl border border-dark-800 rounded-[2.5rem] p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-orange/20 to-transparent" />
        
        <div className="flex items-center justify-between mb-16 px-2">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-3">
               <Activity className="w-5 h-5 text-brand-orange" />
               Revision Evolution
            </h3>
            <p className="text-dark-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Spaced Repetition Protocol</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-dark-950 border border-dark-800 rounded-xl">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-black text-dark-300 uppercase tracking-widest">Auto-Sync Enabled</span>
          </div>
        </div>

        <div className="relative px-4">
          {/* Futuristic Connector Line */}
          <div className="absolute top-[22px] left-8 right-8 h-0.5 bg-dark-800 rounded-full overflow-hidden">
             <div 
               className="h-full bg-gradient-to-r from-brand-orange via-orange-400 to-yellow-500 shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-all duration-1000 ease-out"
               style={{ width: `${Math.min((currentStepIndex / (timelineSteps.length - 1)) * 100, 100)}%` }}
             />
          </div>
          
          <div className="relative flex justify-between">
            {timelineSteps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              
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
                <div key={step} className="flex flex-col items-center gap-6 group w-28">
                  {/* Step Node */}
                  <div className="relative">
                    {isCurrent && (
                      <div className="absolute inset-0 bg-brand-orange rounded-full blur-[15px] animate-pulse opacity-50" />
                    )}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 relative ${
                      isCompleted ? 'bg-dark-950 border-brand-orange shadow-[0_0_20px_rgba(249,115,22,0.2)]' :
                      isCurrent ? 'bg-dark-950 border-brand-orange scale-125 z-20 pulse-ring' :
                      'bg-dark-950 border-dark-800'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5 text-brand-orange" /> : 
                       isCurrent ? <div className="w-4 h-4 rounded-full bg-brand-orange shadow-[0_0_10px_rgba(249,115,22,1)]" /> :
                       <div className="w-2 h-2 rounded-full bg-dark-700" />}
                    </div>
                  </div>

                  {/* Info Stack */}
                  <div className="flex flex-col items-center gap-2">
                    <span className={`text-[11px] font-black uppercase tracking-widest transition-colors duration-300 ${
                      isCompleted ? 'text-brand-orange' : isCurrent ? 'text-white' : 'text-dark-600'
                    }`}>
                      {step}
                    </span>
                    
                    {/* Time Module */}
                    <div className={`relative transition-all duration-500 ${isCompleted || isCurrent ? 'opacity-100 scale-100' : 'opacity-30 scale-90 translate-y-2'}`}>
                      <input
                        type="number"
                        placeholder="-"
                        disabled={!isCompleted && !isCurrent}
                        defaultValue={timeTaken}
                        onBlur={(e) => {
                          const val = e.target.value;
                          if (val && val !== String(timeTaken)) {
                            if (onLogTime) onLogTime(revision.id, phaseKey, val);
                          }
                        }}
                        className={`w-16 bg-dark-950/80 border rounded-xl pl-2 pr-7 py-2 text-[11px] font-black text-center focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                          isCompleted || isCurrent
                            ? 'border-dark-700 text-white placeholder-dark-700 focus:border-brand-orange/50' 
                            : 'border-dark-900 text-dark-800 cursor-not-allowed'
                        }`}
                      />
                      <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase pointer-events-none transition-all ${
                        isCompleted || isCurrent ? 'text-dark-500' : 'text-dark-800'
                      }`}>
                        m
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tactical Note Section Header (Optional/Future) */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { title: 'Core Strategy', desc: 'Maintain pattern consistency across solves', icon: Target },
             { title: 'Health Protocol', desc: 'Current revision score based on accuracy', icon: Activity },
             { title: 'Session Drift', desc: 'Deviation from scheduled review windows', icon: Clock }
           ].map((card, i) => (
             <div key={i} className="p-6 rounded-3xl bg-dark-950/40 border border-dark-800 flex items-start gap-4">
                <div className="p-2 rounded-xl bg-dark-900 border border-dark-800">
                  <card.icon className="w-4 h-4 text-dark-400" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{card.title}</div>
                  <div className="text-[10px] font-medium text-dark-500 leading-relaxed">{card.desc}</div>
                </div>
             </div>
           ))}
        </div>

        {/* AI Strategic Advice Section */}
        {revision.aiAdvice && (
          <div className="mt-8 bg-purple-500/5 border border-purple-500/20 rounded-3xl p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
               <BrainCircuit className="w-32 h-32 text-purple-500" />
             </div>
             
             <div className="relative z-10">
               <h3 className="text-lg font-black text-white uppercase tracking-tight mb-4 flex items-center gap-3">
                 <BrainCircuit className="w-6 h-6 text-purple-400" />
                 AI Strategic Advice
               </h3>
               
               <div className="prose prose-invert max-w-none text-dark-200">
                 <ReactMarkdown>{revision.aiAdvice}</ReactMarkdown>
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RevisionContent;
