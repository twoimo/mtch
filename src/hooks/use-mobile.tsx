
import { useState, useEffect } from 'react';

// Breakpoints match Tailwind's default breakpoints
export enum Breakpoint {
  SM = 640,  // Small devices
  MD = 768,  // Medium devices
  LG = 1024, // Large devices
  XL = 1280, // Extra large devices
  XXL = 1536 // 2XL devices
}

export function useIsMobile(breakpoint: number = Breakpoint.MD) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );
  
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away to set initial state
    handleResize();

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return isMobile;
}

// Additional hook to get the current screen size category
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState<{
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    width: number;
  }>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: typeof window !== 'undefined' ? window.innerWidth : 0
  });
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < Breakpoint.SM,
        isTablet: width >= Breakpoint.SM && width < Breakpoint.LG,
        isDesktop: width >= Breakpoint.LG,
        width
      });
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return screenSize;
}
