import { useEffect, useMemo } from 'react';
import { useAnalyticsStore } from '../../stores/analyticsStore';

function ActivityHeatmap() {
  const { heatmap, fetchHeatmap } = useAnalyticsStore();

  useEffect(() => {
    fetchHeatmap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate last 365 days
  const days = useMemo(() => {
    const today = new Date();
    const dates = [];
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    return dates;
  }, []);

  // Map data to dates
  const activityMap = useMemo(() => {
    const map = {};
    if (Array.isArray(heatmap)) {
      heatmap.forEach(item => {
        map[item.date] = item.count;
      });
    }
    return map;
  }, [heatmap]);

  const getColor = (count) => {
    if (!count) return 'bg-white/[0.03]';
    if (count === 1) return 'bg-brand-orange/30';
    if (count <= 3) return 'bg-brand-orange/50';
    if (count <= 5) return 'bg-brand-orange/70';
    return 'bg-brand-orange';
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="inline-block p-6 bg-dark-950/40 border border-white/[0.03] rounded-[2rem] overflow-x-auto no-scrollbar max-w-full">
        <div className="flex flex-col gap-3 min-w-[800px]">
          {/* Months Header */}
          <div className="flex gap-[3.5px] text-[9px] font-black text-dark-600 uppercase tracking-widest h-4 ml-2">
            {Array.from({ length: 53 }).map((_, weekIndex) => {
              const dayIndex = weekIndex * 7;
              if (dayIndex >= days.length) return null;
              const date = days[dayIndex];
              const isFirstWeekOfMonth = date.getDate() <= 7;
              
              return (
                <div key={weekIndex} className="w-3 shrink-0">
                  {isFirstWeekOfMonth && (
                    <span className="whitespace-nowrap">
                      {date.toLocaleString('default', { month: 'short' })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-[4px] p-2">
            {/* Weeks */}
            {Array.from({ length: 53 }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[4px]">
                {/* Days in week */}
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const dayOfYear = weekIndex * 7 + dayIndex;
                  if (dayOfYear >= days.length) return null;
                  
                  const date = days[dayOfYear];
                  const dateStr = formatDate(date);
                  const count = activityMap[dateStr] || 0;

                  return (
                    <div
                      key={dateStr}
                      title={`${count} submissions on ${date.toLocaleDateString()}`}
                      className={`w-3 h-3 rounded-[2px] ${getColor(count)} transition-all duration-300 hover:scale-125 hover:z-10 hover:shadow-[0_0_10px_rgba(249,115,22,0.3)] cursor-pointer`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend Cluster */}
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5 grayscale opacity-50">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg" alt="Gemini" className="h-2.5" />
                  <span className="text-[8px] font-black text-dark-600 uppercase tracking-widest">Active Analysis</span>
               </div>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-dark-600 uppercase tracking-wider">
              <span>Less</span>
              <div className="flex gap-1.5 px-2 py-1 bg-dark-900/50 rounded-lg border border-white/[0.03]">
                <div className="w-2.5 h-2.5 rounded-[1px] bg-white/[0.03]" />
                <div className="w-2.5 h-2.5 rounded-[1px] bg-brand-orange/30" />
                <div className="w-2.5 h-2.5 rounded-[1px] bg-brand-orange/50" />
                <div className="w-2.5 h-2.5 rounded-[1px] bg-brand-orange/70" />
                <div className="w-2.5 h-2.5 rounded-[1px] bg-brand-orange" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityHeatmap;
