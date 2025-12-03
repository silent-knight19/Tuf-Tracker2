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
    // Start from 365 days ago
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
    heatmap.forEach(item => {
      // item.date is YYYY-MM-DD
      map[item.date] = item.count;
    });
    return map;
  }, [heatmap]);

  const getColor = (count) => {
    if (!count) return 'bg-dark-800';
    if (count === 1) return 'bg-brand-orange/40';
    if (count <= 3) return 'bg-brand-orange/60';
    if (count <= 5) return 'bg-brand-orange/80';
    return 'bg-brand-orange';
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="card w-full overflow-x-auto">
      <h3 className="text-lg font-semibold text-dark-100 mb-4">Submission Activity</h3>
      
      <div className="min-w-[800px]">
        {/* Months Row */}
        <div className="flex gap-1 mb-2 text-xs text-dark-400 h-5 relative">
          {Array.from({ length: 53 }).map((_, weekIndex) => {
            const dayIndex = weekIndex * 7;
            if (dayIndex >= days.length) return null;
            
            const date = days[dayIndex];
            const isFirstWeekOfMonth = date.getDate() <= 7;
            
            // Only show month label if it's the first week of the month
            // and we haven't shown this month recently (to avoid crowding)
            if (isFirstWeekOfMonth) {
              return (
                <div key={weekIndex} className="w-3 overflow-visible relative">
                  <span className="absolute top-0 left-0">
                    {date.toLocaleString('default', { month: 'short' })}
                  </span>
                </div>
              );
            }
            return <div key={weekIndex} className="w-3" />;
          })}
        </div>

        <div className="flex gap-1">
          {/* Weeks */}
          {Array.from({ length: 53 }).map((_, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
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
                    className={`w-3 h-3 rounded-sm ${getColor(count)} transition-colors hover:ring-1 hover:ring-white/50 relative group`}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 whitespace-nowrap">
                      <div className="bg-dark-700 text-white text-xs px-2 py-1 rounded shadow-lg">
                        {count} submissions on {date.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-dark-400">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-dark-800" />
          <div className="w-3 h-3 rounded-sm bg-brand-orange/40" />
          <div className="w-3 h-3 rounded-sm bg-brand-orange/60" />
          <div className="w-3 h-3 rounded-sm bg-brand-orange/80" />
          <div className="w-3 h-3 rounded-sm bg-brand-orange" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

export default ActivityHeatmap;
