import { useEffect, useMemo, useState } from 'react';
import { useAnalyticsStore } from '../../stores/analyticsStore';

export default function ActivityHeatmap() {
  const { heatmap, fetchHeatmap } = useAnalyticsStore();
  const [hoveredDay, setHoveredDay] = useState(null);

  useEffect(() => {
    fetchHeatmap();
  }, [fetchHeatmap]);

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
      heatmap.forEach((item) => {
        map[item.date] = item.count;
      });
    }
    return map;
  }, [heatmap]);

  const getColor = (count) => {
    if (!count) return 'bg-surface border border-border-subtle';
    if (count === 1) return 'bg-primary/25 border border-primary/30';
    if (count <= 3) return 'bg-primary/50 border border-primary/50';
    if (count <= 5) return 'bg-primary/75 border border-primary/70';
    return 'bg-primary border border-primary-hover shadow-sm shadow-primary/30';
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full p-4 bg-surface-raised/40 border border-border rounded-xl overflow-x-auto custom-scrollbar shadow-inner-rim">
        <div className="flex flex-col gap-2 min-w-[720px]">
          {/* Months Header */}
          <div className="flex gap-[3.5px] text-[10px] font-mono font-semibold text-foreground-subtle uppercase tracking-wider h-4 ml-2">
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

          {/* 7-Row Grid */}
          <div className="flex gap-[3.5px]">
            {Array.from({ length: 53 }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3.5px]">
                {Array.from({ length: 7 }).map((_, dayOfWeek) => {
                  const dayIndex = weekIndex * 7 + dayOfWeek;
                  if (dayIndex >= days.length) return null;

                  const date = days[dayIndex];
                  const dateStr = formatDate(date);
                  const count = activityMap[dateStr] || 0;

                  return (
                    <div
                      key={dayOfWeek}
                      onMouseEnter={() => setHoveredDay({ date: dateStr, count })}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-3 h-3 rounded-[3px] transition-all cursor-pointer hover:scale-125 ${getColor(
                        count
                      )}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer with Legend & Hover readout */}
          <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-[11px] text-foreground-subtle">
            <div>
              {hoveredDay ? (
                <span className="text-foreground font-medium">
                  {hoveredDay.count} problems solved on {hoveredDay.date}
                </span>
              ) : (
                <span>365-day solve velocity</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] select-none">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-[2px] bg-surface border border-border-subtle" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/25 border border-primary/30" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/50 border border-primary/50" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/75 border border-primary/70" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-primary border border-primary-hover" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
