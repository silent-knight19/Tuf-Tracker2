import { useEffect } from 'react';

/**
 * Hook to lock body scroll when a modal or overlay is open.
 * @param {boolean} lock - Whether to lock the scroll.
 */
export const useScrollLock = (lock) => {
  useEffect(() => {
    if (lock) {
      // Helper to detect if an element is part of a modal/overlay
      const isPartOfModal = (element) => {
        let curr = element;
        while (curr && curr !== document.documentElement) {
          const style = window.getComputedStyle(curr);
          const zIndex = parseInt(style.zIndex);
          // Modals in this app are fixed with z-index >= 40
          if (style.position === 'fixed' && !isNaN(zIndex) && zIndex >= 40) {
            return true;
          }
          curr = curr.parentElement;
        }
        return false;
      };

      // Elements that might be scrolling the background
      const elementsToLock = [
        document.body,
        document.querySelector('main'),
        ...Array.from(document.querySelectorAll('.overflow-y-auto, .overflow-y-scroll'))
      ].filter(el => el && !isPartOfModal(el));

      // Capture original styles to restore them later
      const originalStyles = elementsToLock.map(el => ({
        el,
        overflow: el.style.overflow,
        paddingRight: el.style.paddingRight
      }));

      // Calculate scrollbar width for the body to prevent layout shift
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      elementsToLock.forEach(el => {
        el.style.overflow = 'hidden';
        // Only apply padding compensation to the body to prevent "jumping"
        if (scrollBarWidth > 0 && el === document.body) {
          el.style.paddingRight = `${scrollBarWidth}px`;
        }
      });

      return () => {
        originalStyles.forEach(({ el, overflow, paddingRight }) => {
          el.style.overflow = overflow;
          el.style.paddingRight = paddingRight;
        });
      };
    }
  }, [lock]);
};
