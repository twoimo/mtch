import { useState, useEffect, useCallback } from 'react';

/**
 * 명령어 팔레트 열기/닫기를 관리하는 커스텀 훅
 * @returns 명령어 팔레트 상태와 상태 변경 함수
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  
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
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
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
    
    // 단축키 커스텀 이벤트를 위한 리스너 추가
    const handleCustomKeyEvent = (event: Event) => {
      if (event instanceof KeyboardEvent && (event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        toggle();
      }
    };
    document.addEventListener('keydown', handleCustomKeyEvent);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleCustomKeyEvent);
    };
  }, [toggle, close, isOpen]);
  
  return { isOpen, setIsOpen, open, close, toggle };
}
