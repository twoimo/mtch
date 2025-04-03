import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? 
    window.innerWidth < 768 : 
    false
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', checkIfMobile);
    
    // Initial check
    checkIfMobile();
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  return isMobile;
}
