import { Zap, Trophy, UserCircle, Target } from 'lucide-react';

function DashboardHeader({ user, counts }) {
  const totalDue = counts.dueToday + counts.overdue;

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
           <div className="p-2.5 bg-brand-orange/10 rounded-2xl border border-brand-orange/20 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
             <UserCircle className="w-7 h-7 text-brand-orange" />
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">
             Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-dark-400">{user?.displayName?.split(' ')[0] || 'Candidate'}</span>
           </h1>
        </div>
        
        <p className="text-dark-400 text-base flex items-center gap-2 pl-1">
          {totalDue > 0 ? (
            <>
              <Target className="w-4 h-4 text-brand-yellow/60" />
              <span>You have <span className="text-white font-bold">{totalDue} missions</span> to debrief today.</span>
            </>
          ) : (
            <span>Your mission queue is currently clear. Excellent work.</span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Streak Pill */}
        <div className="group flex items-center gap-3 bg-dark-900/40 backdrop-blur-xl border border-dark-800/60 rounded-2xl p-3 pr-5 transition-all hover:border-brand-orange/30 hover:shadow-2xl hover:shadow-brand-orange/5">
          <div className="w-11 h-11 rounded-xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20 shadow-inner group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5 text-brand-orange drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
          </div>
          <div>
            <div className="text-xl font-black text-white leading-none tracking-tight">{user?.currentStreak || 0}</div>
            <div className="text-[10px] uppercase font-black tracking-widest text-dark-500 mt-1">Day Streak</div>
          </div>
        </div>

        {/* XP Pill */}
        <div className="group flex items-center gap-3 bg-dark-900/40 backdrop-blur-xl border border-dark-800/60 rounded-2xl p-3 pr-5 transition-all hover:border-brand-yellow/30 hover:shadow-2xl hover:shadow-brand-yellow/5">
          <div className="w-11 h-11 rounded-xl bg-brand-yellow/10 flex items-center justify-center border border-brand-yellow/20 shadow-inner group-hover:scale-110 transition-transform">
            <Trophy className="w-5 h-5 text-brand-yellow drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
          </div>
          <div>
            <div className="text-xl font-black text-white leading-none tracking-tight">{Math.floor(user?.totalXP || 0).toLocaleString()}</div>
            <div className="text-[10px] uppercase font-black tracking-widest text-dark-500 mt-1">Total XP</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
