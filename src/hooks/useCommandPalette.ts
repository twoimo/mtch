import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * 명령어 팔레트 열기/닫기를 관리하는 커스텀 훅
 * @returns 명령어 팔레트 상태와 상태 변경 함수
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // 명령어 팔레트 열기
  const open = useCallback(() => {
    setIsOpen(true);
  }, []);
  
  // 명령어 팔레트 닫기
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);
  
  // 명령어 팔레트 토글
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);
  
  // 키보드 단축키 이벤트 핸들러 및 커스텀 이벤트 리스너
  useEffect(() => {
    // 키보드 단축키 (Ctrl+K 또는 Command+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      // On mobile, don't use Ctrl+K as it may conflict with keyboard shortcuts
      if (!isMobile && (e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
      
      // ESC 키로 닫기
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    };
    
    // 문서 이벤트 리스너 (전역 이벤트)
    document.addEventListener('keydown', handleKeyDown);
    
    // Mobile double-tap detection for showing command palette
    let lastTap = 0;
    const handleDoubleTap = (event: TouchEvent) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 500 && tapLength > 0) {
        // Double tap detected
        if (
          !isOpen && 
          event.target instanceof Element && 
          !['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(event.target.tagName)
        ) {
          toggle();
        }
      }
      lastTap = currentTime;
    };

    // Only add double-tap for mobile
    if (isMobile) {
      document.addEventListener('touchend', handleDoubleTap);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (isMobile) {
        document.removeEventListener('touchend', handleDoubleTap);
      }
    };
  }, [toggle, close, isOpen, isMobile]);
  
  return { isOpen, setIsOpen, open, close, toggle };
}
