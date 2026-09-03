import { useAuthStore } from '../stores/authStore';
import { useEffect, useState } from 'react';

// Animated background orb component
const FloatingOrb = ({ className, delay = 0 }) => (
  <div 
    className={`absolute rounded-full blur-3xl opacity-20 animate-pulse ${className}`}
    style={{ animationDelay: `${delay}s`, animationDuration: '8s' }}
  />
);

// Code bracket decoration
const CodeBracket = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 9l-3 3 3 3m8 0l3-3-3-3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Algorithm node decoration
const AlgorithmNode = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="5" r="2" />
    <circle cx="5" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
    <path d="M12 7v4l-5 3M12 13l5 3" strokeLinecap="round" />
  </svg>
);

function LoginPage() {
  const { signInWithGoogle, loading, error } = useAuthStore();

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingOrb 
          className="w-96 h-96 bg-brand-orange -top-48 -left-48" 
          delay={0} 
        />
        <FloatingOrb 
          className="w-80 h-80 bg-brand-yellow top-1/2 -right-40" 
          delay={2} 
        />
        <FloatingOrb 
          className="w-64 h-64 bg-brand-orange bottom-20 left-1/4" 
          delay={4} 
        />
        
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,161,22,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,161,22,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <CodeBracket className="absolute top-20 left-10 w-8 h-8 text-dark-800 rotate-12 opacity-50" />
        <CodeBracket className="absolute bottom-32 right-16 w-10 h-10 text-dark-800 -rotate-12 opacity-40" />
        <AlgorithmNode className="absolute top-1/3 right-20 w-12 h-12 text-dark-800 opacity-30" />
        <AlgorithmNode className="absolute bottom-20 left-20 w-6 h-6 text-dark-800 opacity-40" />
      </div>

      {/* Main Card */}
      <div className="relative z-10 max-w-md w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Glassmorphism Card */}
        <div className="relative bg-dark-900/60 backdrop-blur-xl border border-dark-800/60 rounded-2xl p-8 shadow-2xl">
          {/* Top Glow Line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-brand-orange/50 to-transparent" />
          
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-brand-orange/30 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-brand-orange/30 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-brand-orange/30 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-brand-orange/30 rounded-br-2xl" />

          {/* Header Section */}
          <div className="text-center mb-8">
            {/* Logo Icon */}
            <div className="flex justify-center mb-8">
              <img 
                src="/logo.png" 
                alt="TufTracker" 
                className="w-30 h-24 object-contain"
              />
            </div>
            
            {/* Subtitle */}
            <p className="text-dark-400 text-lg font-light tracking-wide">
              Master Data Structures & Algorithms
            </p>
            
            {/* Tagline */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="h-px w-8 bg-dark-700" />
              <span className="text-dark-500 text-xs uppercase tracking-wider">Track. Learn. Succeed.</span>
              <span className="h-px w-8 bg-dark-700" />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-difficulty-hard/10 border border-difficulty-hard/20 text-difficulty-hard px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group w-full font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-3 
                       bg-dark-800 hover:bg-dark-700 text-dark-100 
                       border border-dark-700 hover:border-dark-600
                       transition-all duration-300 ease-out
                       focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:ring-offset-2 focus:ring-offset-dark-900
                       disabled:opacity-50 disabled:cursor-not-allowed
                       shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-dark-400 border-t-brand-orange rounded-full animate-spin" />
            ) : (
              <>
                <div className="w-5 h-5 relative">
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
                <span className="group-hover:text-white transition-colors">Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-dark-700 to-transparent" />
            <span className="text-dark-600 text-xs uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-dark-700 to-transparent" />
          </div>

          {/* Guest Info */}
          <div className="text-center">
            <p className="text-dark-500 text-sm">
              Sign in to track your progress and access all features
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-dark-800/60">
            <p className="text-dark-600 text-xs text-center leading-relaxed">
              By continuing, you agree to our{' '}
              <a href="#" className="text-brand-orange/70 hover:text-brand-orange transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-brand-orange/70 hover:text-brand-orange transition-colors">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Bottom decorative text */}
        <p className="text-center text-dark-700 text-xs mt-6 tracking-widest uppercase">
          Level up your coding journey
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
