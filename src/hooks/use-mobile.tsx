import { useState, useEffect } from 'react';

// Default breakpoint for mobile devices (can be adjusted)
const MOBILE_BREAKPOINT = 768;

/**
 * React hook to detect if the current device is a mobile device
 * Uses both screen width and user agent detection for better accuracy
 * @returns boolean - Whether the current device is a mobile device
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Function to check for mobile device based on screen width and user agent
    const checkMobile = () => {
      const width = window.innerWidth;
      const isMobileWidth = width < MOBILE_BREAKPOINT;
      
      // Also check userAgent for mobile devices as fallback
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      setIsMobile(isMobileWidth || isMobileDevice);
    };

    // Check immediately
    checkMobile();

    // Add event listeners for window resize and orientation change
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    // Clean up event listeners
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  return isMobile;
}

/**
 * Hook to get the current device orientation
 * @returns string - 'portrait' or 'landscape'
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    typeof window !== 'undefined' 
      ? window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      : 'portrait'
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
}

/**
 * Hook to detect touch capability
 * @returns boolean - Whether the device supports touch
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState<boolean>(false);
  
  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // Fix TypeScript error by using specific type definition
        navigator.msMaxTouchPoints > 0
      );
    };
    
    checkTouch();
    
    // Also check on visibility change (useful when app returns to foreground)
    document.addEventListener('visibilitychange', checkTouch);
    
    return () => {
      document.removeEventListener('visibilitychange', checkTouch);
    };
  }, []);
  
  return isTouch;
}

/**
 * Hook to get device pixel ratio for high-DPI screens
 * @returns number - The device pixel ratio
 */
export function useDevicePixelRatio(): number {
  const [dpr, setDpr] = useState<number>(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
  
  useEffect(() => {
    const handleChange = () => {
      setDpr(window.devicePixelRatio || 1);
    };
    
    // Some browsers support this event
    const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  return dpr;
}
