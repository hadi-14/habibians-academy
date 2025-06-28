import { useState, useEffect } from 'react';

export function useScrollPosition(threshold = 50) {
  const [scrollState, setScrollState] = useState({
    isScrolled: false,
    direction: 'top' // 'top', 'scrolling-down', or 'scrolling-up'
  });

  useEffect(() => {
    let lastScrollY = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine scroll direction
      if (currentScrollY > threshold) {
        if (currentScrollY > lastScrollY) {
          setScrollState({ isScrolled: true, direction: 'scrolling-down' });
        } else {
          setScrollState({ isScrolled: true, direction: 'scrolling-up' });
        }
      } else {
        setScrollState({ isScrolled: false, direction: 'top' });
      }

      lastScrollY = currentScrollY;
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Initial check in case the page is already scrolled
    handleScroll();

    // Cleanup listener on component unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrollState;
}