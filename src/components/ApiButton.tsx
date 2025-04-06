
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ApiButtonProps {
  label: string;
  onClick: () => Promise<void>;
  isLoading: boolean;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  icon?: React.ReactNode;
  tooltip?: string;
  disabled?: boolean;
}

/**
 * API 요청을 실행하는 버튼 컴포넌트
 * 로딩 상태와 아이콘, 툴팁을 지원합니다.
 */
const ApiButton: React.FC<ApiButtonProps> = ({ 
  label, 
  onClick, 
  isLoading, 
  className = '',
  variant = 'default',
  icon,
  tooltip,
  disabled = false
}) => {
  const isMobile = useIsMobile();
  
  // 모바일에서 라벨 텍스트 길이 제한
  const buttonLabel = isMobile ? (label.length > 12 ? `${label.substring(0, 10)}...` : label) : label;
  
  const buttonContent = (
    <Button 
      onClick={onClick} 
      disabled={isLoading || disabled} 
      className={cn(
        "min-w-[160px] transition-all duration-300",
        "relative overflow-hidden",
        isLoading ? "animate-pulse" : "hover:scale-105 hover:shadow-md",
        className
      )}
      variant={variant}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span className="animate-pulse">로딩 중...</span>
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {buttonLabel}
        </>
      )}
      
      {/* 로딩 시 애니메이션 효과 */}
      {isLoading && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shine_1.5s_ease-in-out_infinite] pointer-events-none" />
      )}
    </Button>
  );
  
  // 툴팁 존재 시 툴팁 적용
  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return buttonContent;
};

export default ApiButton;
