import { create } from 'zustand';

export const useRateLimitStore = create((set, get) => ({
  limit: 20,
  remaining: 20,
  resetTime: null,
  isBlocked: false,
  isVisible: false,
  message: '',
  type: 'info',
  hasShownWarning: false, // Prevent spamming the warning

  // Update state from headers
  updateFromHeaders: (headers) => {
    // Axios headers are lowercase
    const limitHeader = headers['ratelimit-limit'] || headers['x-ratelimit-limit'];
    const remainingHeader = headers['ratelimit-remaining'] || headers['x-ratelimit-remaining'];
    const resetHeader = headers['ratelimit-reset'] || headers['x-ratelimit-reset'];

    if (limitHeader !== undefined && remainingHeader !== undefined) {
      const limit = parseInt(limitHeader, 10);
      const remaining = parseInt(remainingHeader, 10);
      let resetDate = null;

      if (resetHeader) {
        const resetValue = parseInt(resetHeader, 10);
        // Robust check: If value is small (< 1 year in seconds), treat as duration (Draft-6/v6)
        // If value is large (likely timestamp), treat as timestamp (Draft-7/v7)
        if (resetValue < 31536000) { // < 1 year
           resetDate = new Date(Date.now() + resetValue * 1000);
        } else {
           resetDate = new Date(resetValue * 1000);
        }
      }
      
      const usage = limit - remaining;
      const currentState = get();

      // Reset warning flag if quota replenished (e.g. remaining went up)
      if (usage < 10 && currentState.hasShownWarning) {
        set({ hasShownWarning: false });
      }
      
      // Update state
      set({ 
        limit, 
        remaining, 
        resetTime: resetDate,
        isBlocked: remaining === 0
      });

      // Warning at 50% usage (Remaining: 10)
      if (remaining <= 10 && remaining > 0 && !currentState.hasShownWarning) {
         get().showToast(
           `You've used 50% of your AI quota (${remaining} attempts remaining).`,
           'warning'
         );
         set({ hasShownWarning: true });
      }
      
      // Error at 100% usage (0 requests remaining)
      // We allow this to show multiple times if they keep trying, as immediate feedback
      if (remaining === 0) {
        get().showToast(
          'AI Usage Limit Reached. Quota resets in 1 hour.',
          'error'
        );
      }
    }
  },

  showToast: (message, type = 'info') => {
    set({ isVisible: true, message, type });
    // Auto-hide after 5 seconds for warnings, keep errors longer
    if (type !== 'error') {
      setTimeout(() => {
        set({ isVisible: false });
      }, 5000);
    }
  },

  hideToast: () => set({ isVisible: false }),
}));
