import { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_BASE_URL = API_URL.replace('/api', '');

/**
 * BackendHealthCheck - Detects cold starts and shows user-friendly messaging
 * instead of leaving users confused with a long-loading spinner.
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
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout (2 minutes for cold starts)
        
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

  // Show cold start message if taking too long
  if (status === 'checking' || status === 'waking') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange mx-auto mb-4"></div>
          {status === 'waking' && (
            <>
              <h2 className="text-xl font-semibold text-dark-100 mb-2">
                Waking up server...
              </h2>
              <p className="text-dark-400 text-sm mb-2">
                This happens when the server has been idle. Please wait.
              </p>
              <p className="text-dark-500 text-xs">
                {elapsedSeconds > 0 && `${elapsedSeconds}s elapsed`}
              </p>
              {elapsedSeconds > 30 && (
                <p className="text-brand-orange text-xs mt-2">
                  Almost there, this can take up to 60 seconds...
                </p>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Show error state
  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-950">
        <div className="text-center max-w-md px-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-dark-100 mb-2">
            Connection Failed
          </h2>
          <p className="text-dark-400 text-sm mb-4">
            Unable to connect to the server. Please check your internet connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Backend is ready - render the app
  return children;
}

export default BackendHealthCheck;
