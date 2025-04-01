
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ApiButtonProps {
  label: string;
  onClick: () => Promise<void>;
  isLoading: boolean;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

// API 요청을 실행하는 버튼 컴포넌트
const ApiButton: React.FC<ApiButtonProps> = ({ 
  label, 
  onClick, 
  isLoading, 
  className = '',
  variant = 'default'
}) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={isLoading} 
      className={`min-w-[160px] transition-all duration-300 hover:scale-105 ${className}`}
      variant={variant}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          로딩 중...
        </>
      ) : (
        label
      )}
    </Button>
  );
};

export default ApiButton;
