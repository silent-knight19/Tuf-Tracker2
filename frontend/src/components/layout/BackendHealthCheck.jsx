import { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_BASE_URL = API_URL.replace('/api', '');

/**
 * BackendHealthCheck - NON-BLOCKING version
 * Allows the app to load immediately while checking backend status in the background.
 * Shows a subtle indicator if the backend is waking up or unavailable.
 */
function BackendHealthCheck({ children }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'waking' | 'ready' | 'error'
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const statusRef = useRef('checking'); // Track latest status for closures
  
  // Keep ref in sync with state
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    let isMounted = true;
    let startTime = Date.now();
    let intervalId;

    const checkHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout
        
        const response = await fetch(`${BACKEND_BASE_URL}/health`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!isMounted) return;
        
        if (response.ok) {
          const data = await response.json();
          console.log('Backend ready:', data);
          setStatus('ready');
        } else {
          setStatus('error');
        }
      } catch (error) {
        if (!isMounted) return;
        
        if (error.name === 'AbortError') {
          setStatus('error');
        } else {
          // Network error - server might be cold starting
          console.error('Health check failed:', error);
          setStatus('error');
        }
      }
    };

    // Start elapsed time counter after 2 seconds (cold start detection)
    const coldStartTimeout = setTimeout(() => {
      if (isMounted && statusRef.current === 'checking') {
        setStatus('waking');
        intervalId = setInterval(() => {
          if (isMounted) {
            setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
          }
        }, 1000);
      }
    }, 2000);

    checkHealth();

    return () => {
      isMounted = false;
      clearTimeout(coldStartTimeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // RENDER UI status indicators (non-blocking)

  // Connection Error Banner
  if (status === 'error') {
    return (
      <>
        <div className="bg-red-500/10 border-b border-red-500/20 text-red-400 px-4 py-2 flex items-center justify-center gap-2 text-sm">
          <span>⚠️ Connection to server failed. Some features may not work.</span>
          <button 
            onClick={() => window.location.reload()}
            className="underline hover:text-red-300"
          >
            Retry
          </button>
        </div>
        {children}
      </>
    );
  }

  // Waking Up Banner (only show after 2s delay)
  if (status === 'waking') {
    return (
      <>
        {children}
        <div className="fixed bottom-4 right-4 z-50 bg-dark-800 border border-brand-orange/30 shadow-lg rounded-lg p-4 max-w-sm animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-brand-orange"></div>
            <div>
              <h3 className="text-sm font-medium text-dark-100">Connecting to server...</h3>
              <p className="text-xs text-dark-400">
                Waking up free tier server ({elapsedSeconds}s)
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Ready or Checking (just show app)
  return children;
}

export default BackendHealthCheck;
