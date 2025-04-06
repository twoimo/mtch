
import React from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  onClick: () => void;
  visible: boolean;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ onClick, visible }) => {
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 p-2.5 sm:p-3 bg-primary text-white rounded-full shadow-lg transition-all duration-300 z-50 hover:bg-primary/90"
      aria-label="페이지 상단으로 이동"
    >
      <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
    </button>
  );
};

export default React.memo(ScrollToTopButton);
