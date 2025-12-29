import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook for auto-hiding header based on scroll direction
 * @param {Object} scrollTarget - Optional scroll target element ref for custom scroll container
 * @returns {boolean} headerVisible - Whether the header should be visible
 */
export function useAutoHideHeader(scrollTarget = null) {
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = (e) => {
      let currentScrollY;
      
      // Get scroll position from the event target or fallback
      const scrollElement = e?.target || scrollTarget?.current;
      
      if (scrollElement && scrollElement !== document && scrollElement !== window) {
        currentScrollY = scrollElement.scrollTop;
      } else {
        currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      }
      
      // At the top of the page - always show header
      if (currentScrollY <= 10) {
        setHeaderVisible(true);
      } 
      // Scrolling down - hide header
      else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setHeaderVisible(false);
      } 
      // Scrolling up - show header
      else if (currentScrollY < lastScrollY.current) {
        setHeaderVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    const eventOptions = { passive: true, capture: true };
    
    // Attach to the specific scroll target if provided
    if (scrollTarget?.current) {
      scrollTarget.current.addEventListener('scroll', handleScroll, eventOptions);
    }
    
    // Always also listen to window scroll as fallback
    window.addEventListener('scroll', handleScroll, eventOptions);
    
    // Also capture scroll events bubbling up from nested containers
    document.addEventListener('scroll', handleScroll, eventOptions);
    
    return () => {
      if (scrollTarget?.current) {
        scrollTarget.current.removeEventListener('scroll', handleScroll, eventOptions);
      }
      window.removeEventListener('scroll', handleScroll, eventOptions);
      document.removeEventListener('scroll', handleScroll, eventOptions);
    };
  }, [scrollTarget]);

  return headerVisible;
}
