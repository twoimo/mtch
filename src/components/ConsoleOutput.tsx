import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Terminal, Copy, Check, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ConsoleOutputProps {
  title: string;
  data: unknown;
}

// 콘솔 출력을 웹 페이지에 표시하는 컴포넌트
const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ title, data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const formattedOutput = React.useMemo(() => {
    if (data === null || data === undefined) return '데이터 없음';
    
    if (typeof data === 'string') return data;
    
    return JSON.stringify(data, null, 2);
  }, [data]);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formattedOutput);
      setCopied(true);
      toast({
        title: '복사 완료',
        description: '콘솔 출력이 클립보드에 복사되었습니다.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: '복사 실패',
        description: '클립보드에 복사하지 못했습니다.',
        variant: 'destructive',
      });
    }
  };
  
  const downloadAsJSON = () => {
    const blob = new Blob([formattedOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: '다운로드 완료',
      description: `${title} 데이터가 JSON 파일로 다운로드되었습니다.`,
    });
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const maxHeight = isExpanded ? '800px' : '400px';
  
  return (
    <Card className={cn(
      "mb-4 bg-slate-50 shadow-md border-l-4 border-l-blue-500 overflow-hidden transition-all duration-300",
      "hover:shadow-lg group"
    )}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Terminal className="h-5 w-5 text-blue-500 mr-2" />
          <CardTitle className="text-md font-medium text-blue-700">{title}</CardTitle>
        </div>
        <div className="flex space-x-1">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                  onClick={toggleExpand}
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isExpanded ? '접기' : '펼치기'}</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>클립보드에 복사</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                  onClick={downloadAsJSON}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>JSON 파일로 다운로드</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4 relative">
        <pre 
          className={cn(
            "bg-slate-900 text-slate-50 p-4 rounded-md overflow-auto text-sm shadow-inner",
            "transition-all duration-300 ease-in-out",
            isMobile ? "text-xs" : "text-sm"
          )}
          style={{ maxHeight }}
        >
          {formattedOutput}
        </pre>
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
        )}
      </CardContent>
    </Card>
  );
};

export default ConsoleOutput;
