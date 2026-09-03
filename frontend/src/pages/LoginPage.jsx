import { useAuthStore } from '../stores/authStore';
import { Flame, ShieldCheck, Zap, Sparkles } from 'lucide-react';

function LoginPage() {
  const { signInWithGoogle, loading, error } = useAuthStore();

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden selection:bg-brand-orange/30">
      {/* Ambient Atmospheric Radial Lights */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-orange/[0.07] blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/[0.05] blur-[120px] rounded-full pointer-events-none" />
      
      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 0)', backgroundSize: '32px 32px' }}
      />

      {/* Main Glass Card */}
      <div className="relative z-10 max-w-md w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Top Rim Highlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-brand-orange/40 to-transparent" />

          {/* Header Section */}
          <div className="text-center mb-8">
            {/* Geometric Flame Emblem */}
            <div className="inline-flex items-center justify-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-orange via-brand-amber to-amber-600 flex items-center justify-center text-white shadow-lg shadow-brand-orange/25">
                <Flame className="w-8 h-8 fill-white" />
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tuf<span className="text-brand-orange">Tracker</span>
            </h1>
            
            <p className="text-dark-300 text-sm font-normal mt-2 leading-relaxed">
              Master Data Structures & Algorithms with AI Spaced Repetition
            </p>

            {/* Feature Badges */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-2xs font-semibold text-dark-300">
                <Zap className="w-2.5 h-2.5 text-brand-orange" /> SDE Sheets
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-2xs font-semibold text-dark-300">
                <Sparkles className="w-2.5 h-2.5 text-brand-amber" /> AI Debrief
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-2xs font-semibold text-dark-300">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> Retention
              </span>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group w-full font-semibold py-3.5 px-5 rounded-xl flex items-center justify-center gap-3 
                       bg-white/[0.05] hover:bg-white/[0.1] text-white 
                       border border-white/[0.1] hover:border-white/[0.2]
                       transition-all duration-200 ease-spring active:scale-[0.98]
                       focus:outline-none focus:ring-2 focus:ring-brand-orange/40
                       disabled:opacity-50 disabled:cursor-not-allowed
                       shadow-luxe"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-dark-400 border-t-brand-orange rounded-full animate-spin" />
            ) : (
              <>
                <div className="w-5 h-5 shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium">Continue with Google</span>
              </>
            )}
          </button>

          {/* Privacy Note */}
          <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-dark-400 text-2xs leading-relaxed">
              By signing in, you agree to our Terms and Privacy Guidelines.
            </p>
          </div>
        </div>

        {/* Minimalist Footer */}
        <p className="text-center text-dark-500 text-2xs mt-6 tracking-wider uppercase font-semibold">
          Architected for algorithmic mastery
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
