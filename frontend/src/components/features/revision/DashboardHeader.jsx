import { Zap, Star, Hand } from 'lucide-react';

function DashboardHeader({ user, counts }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
          Welcome back, {user?.displayName?.split(' ')[0] || 'User'} <Hand className="w-8 h-8 text-brand-orange animate-wave" />
        </h1>
        <p className="text-dark-400 text-base">
          You have {counts.dueToday + counts.overdue} problems to review today.
        </p>
      </div>

      <div className="flex items-center gap-3 bg-dark-900/50 backdrop-blur-sm border border-dark-800 rounded-xl p-2">
        {/* Streak */}
        <div className="flex items-center gap-3 px-3 py-1.5 border-r border-dark-800">
          <div className="w-9 h-9 rounded-full bg-brand-orange/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-brand-orange" />
          </div>
          <div>
            <div className="text-lg font-bold text-white leading-none">{user?.currentStreak || 0}</div>
            <div className="text-[10px] uppercase tracking-wider text-dark-400 font-medium mt-0.5">Day Streak</div>
          </div>
        </div>

        {/* XP */}
        <div className="flex items-center gap-3 px-3 py-1.5">
          <div className="w-9 h-9 rounded-full bg-brand-yellow/10 flex items-center justify-center">
            <Star className="w-4 h-4 text-brand-yellow" />
          </div>
          <div>
            <div className="text-lg font-bold text-white leading-none">{user?.totalXP || 0}</div>
            <div className="text-[10px] uppercase tracking-wider text-dark-400 font-medium mt-0.5">Total XP</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
