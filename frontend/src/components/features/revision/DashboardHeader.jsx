import { Zap, Trophy, Flame } from 'lucide-react';

function DashboardHeader({ user, counts }) {
  const totalDue = counts.dueToday + counts.overdue;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
      {/* User Greeting & Status */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-brand-amber flex items-center justify-center text-white shadow-md shadow-brand-orange/20">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Welcome back, {user?.displayName?.split(' ')[0] || 'Engineer'}
            </h1>
            <p className="text-xs text-dark-400 font-normal">
              {totalDue > 0 ? (
                <span>You have <span className="text-brand-orange font-semibold">{totalDue} revision items</span> ready for spaced review today.</span>
              ) : (
                <span className="text-emerald-400 font-medium">Your spaced repetition queue is fully cleared. Outstanding work!</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Badges */}
      <div className="flex items-center gap-3">
        {/* Streak Pill */}
        <div className="flex items-center gap-3 glass-panel rounded-xl px-4 py-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-orange/15 border border-brand-orange/25 flex items-center justify-center">
            <Zap className="w-4 h-4 text-brand-orange" />
          </div>
          <div>
            <div className="text-base font-bold text-white leading-none">{user?.currentStreak || 0}</div>
            <div className="text-2xs text-dark-400 font-medium mt-0.5">Day Streak</div>
          </div>
        </div>

        {/* XP Pill */}
        <div className="flex items-center gap-3 glass-panel rounded-xl px-4 py-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-base font-bold text-white leading-none">{Math.floor(user?.totalXP || 0).toLocaleString()}</div>
            <div className="text-2xs text-dark-400 font-medium mt-0.5">Total XP</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
