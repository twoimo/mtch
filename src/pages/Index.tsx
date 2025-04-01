import { useApiActions } from '@/hooks/useApiActions';
import ApiButtonGroup from '@/components/ApiButtonGroup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Search, LayoutDashboard, Terminal, Info, Github } from 'lucide-react';
import JobsTab from '@/components/tabs/JobsTab';
import ConsoleTab from '@/components/tabs/ConsoleTab';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { Progress } from '@/components/ui/progress';
import { ThemeToggle } from '@/components/theme-toggle';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

const Index = () => {
  const {
    // 상태
    testResult,
    recommendedJobs,
    autoMatchingResult,
    applyResult,
    
    // 로딩 상태
    isTestLoading,
    isRecommendedLoading,
    isAutoMatchingLoading,
    isApplyLoading,
    
    // 액션 메서드
    handleTestApi,
    handleGetRecommendedJobs,
    handleRunAutoJobMatching,
    handleApplySaraminJobs
  } = useApiActions();

  const [activeTab, setActiveTab] = useState<string>("jobs");
  const [progress, setProgress] = useState<number>(0);
  const isMobile = useIsMobile();
  const isAnyLoading = isTestLoading || isRecommendedLoading || isAutoMatchingLoading || isApplyLoading;

  // 로딩 중 프로그레스 바 애니메이션
  useEffect(() => {
    let interval: number | undefined;
    
    if (isAnyLoading) {
      setProgress(0);
      interval = window.setInterval(() => {
        setProgress(prev => {
          const increment = Math.random() * 10;
          const newProgress = Math.min(prev + increment, 95);
          return newProgress;
        });
      }, 400);
    } else {
      setProgress(100);
      // 프로그레스 바가 100%에 도달하면 잠시 후 리셋
      const timer = setTimeout(() => {
        setProgress(0);
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnyLoading]);

  return (
    <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4 min-h-screen flex flex-col">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">채용 정보 대시보드</h1>
            <Badge variant="outline" className="ml-2 bg-primary/10">v1.0.0</Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            사람인 채용 정보 자동화 시스템
          </p>
        </div>
        
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" asChild>
                  <a href="https://github.com/your-username/wheel-micro-service-boilerplate-study" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>GitHub 저장소 방문</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <ThemeToggle />
        </div>
      </header>
      
      {/* 로딩 프로그레스 바 */}
      {isAnyLoading && (
        <div className="mb-6 w-full">
          <div className="flex justify-between items-center mb-2 text-sm">
            <span className="text-muted-foreground">
              {isTestLoading ? '사람인 스크래핑 중...' : 
               isRecommendedLoading ? '추천 채용 정보 가져오는 중...' : 
               isAutoMatchingLoading ? '채용 매칭 실행 중...' : 
               isApplyLoading ? '채용 지원 중...' : '로딩 중...'}
            </span>
            <span className="font-mono">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 animate-pulse" />
        </div>
      )}
      
      {/* API 작업 버튼 그룹 - 복원된 부분 */}
      <Card className="mb-6 border-t-4 border-t-primary shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-xl gap-2">
            <Info className="h-5 w-5 text-primary" />
            API 작업
          </CardTitle>
          <CardDescription>
            아래 버튼을 클릭하여 원하는 API 작업을 실행하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiButtonGroup 
            onTestApi={handleTestApi}
            onGetRecommendedJobs={handleGetRecommendedJobs}
            onRunAutoJobMatching={handleRunAutoJobMatching}
            onApplySaraminJobs={handleApplySaraminJobs}
            
            isTestLoading={isTestLoading}
            isRecommendedLoading={isRecommendedLoading}
            isAutoMatchingLoading={isAutoMatchingLoading}
            isApplyLoading={isApplyLoading}
          />
        </CardContent>
      </Card>
      
      <div className="h-full">
        <Tabs 
          defaultValue="jobs" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full flex flex-col h-[calc(100vh-350px)]"
        >
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>채용 정보</span>
              {recommendedJobs.length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-primary/20">
                  {recommendedJobs.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="console" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              <span>콘솔 출력</span>
              {(testResult || autoMatchingResult || applyResult) && (
                <Badge variant="secondary" className="ml-1 bg-primary/20">
                  {[testResult, recommendedJobs.length > 0, autoMatchingResult, applyResult].filter(Boolean).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="jobs" className="flex-1 mt-0 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4 pb-4">
                <JobsTab jobs={recommendedJobs} />
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="console" className="flex-1 mt-0 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4 pb-4">
                <ConsoleTab 
                  testResult={testResult}
                  recommendedJobs={recommendedJobs}
                  autoMatchingResult={autoMatchingResult}
                  applyResult={applyResult}
                />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
      
      <footer className="mt-12 py-4 border-t border-border/60 text-sm text-muted-foreground">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            © 2023 채용 정보 대시보드 - 모든 권리 보유
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary transition-colors">이용약관</a>
            <a href="#" className="hover:text-primary transition-colors">개인정보처리방침</a>
            <a href="#" className="hover:text-primary transition-colors">도움말</a>
          </div>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
};

export default Index;
