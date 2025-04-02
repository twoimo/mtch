import { useApiActions } from '@/hooks/useApiActions';
import ApiButtonGroup from '@/components/ApiButtonGroup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, LayoutDashboard, Terminal, Info } from 'lucide-react';
import { Icons } from '@/components/icons';
import JobsTab from '@/components/tabs/JobsTab';
import ConsoleTab from '@/components/tabs/ConsoleTab';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { Progress } from '@/components/ui/progress';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// 로컬 스토리지 키
const AUTO_FETCH_STORAGE_KEY = 'auto-fetch-jobs-enabled';

const Index = () => {
  const {
    // 상태
    testResult,
    recommendedJobs = [], // Default to empty array
    filteredJobs = [], // Default to empty array
    filters,
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
    handleApplySaraminJobs,
    
    // 필터 관련 메서드
    updateFilters,
    resetFilters
  } = useApiActions();

  // More robust approach to ensure filters is always defined with arrays initialized
  const safeFilters = {
    keyword: filters?.keyword || '',
    minScore: filters?.minScore || 0,
    employmentType: Array.isArray(filters?.employmentType) ? [...filters.employmentType] : [],
    companyType: filters?.companyType || 'all',
    jobType: Array.isArray(filters?.jobType) ? [...filters.jobType] : [],
    salaryRange: filters?.salaryRange || 'all',
    onlyApplicable: filters?.onlyApplicable || false
  };

  const [activeTab, setActiveTab] = useState<string>("jobs");
  const [progress, setProgress] = useState<number>(0);
  const isAnyLoading = isTestLoading || isRecommendedLoading || isAutoMatchingLoading || isApplyLoading;
  
  // 자동 데이터 불러오기 설정 상태
  const [autoFetchEnabled, setAutoFetchEnabled] = useState<boolean>(() => {
    const savedSetting = localStorage.getItem(AUTO_FETCH_STORAGE_KEY);
    // 기본값은 true (활성화)
    return savedSetting === null ? true : savedSetting === 'true';
  });

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
  
  // 자동 데이터 불러오기 설정 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem(AUTO_FETCH_STORAGE_KEY, autoFetchEnabled.toString());
  }, [autoFetchEnabled]);

  // 웹사이트 접속 시 스크래핑 스케줄링 API 호출
  useEffect(() => {
    const startScrapingScheduler = async () => {
      try {
        const response = await fetch('/api/developer/main_service_communicate/run', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          console.log('스크래핑 스케줄러가 성공적으로 시작되었습니다.');
        } else {
          console.warn('스크래핑 스케줄러 시작 실패:', response.status);
        }
      } catch (error) {
        console.error('스크래핑 스케줄러 시작 중 오류 발생:', error);
      }
    };
    
    // 앱 시작 시 한 번만 실행
    startScrapingScheduler();
  }, []);

  // 웹사이트 접속 시 자동으로 추천 채용 정보 불러오기
  useEffect(() => {
    // 자동 데이터 불러오기가 활성화되어 있고 데이터가 없을 때만 실행
    if (autoFetchEnabled && recommendedJobs.length === 0 && !isRecommendedLoading) {
      // 약간의 지연 후 실행하여 UI가 준비된 후 데이터를 불러옴
      const timer = setTimeout(() => {
        handleGetRecommendedJobs();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [autoFetchEnabled, recommendedJobs.length, isRecommendedLoading, handleGetRecommendedJobs]);

  const toggleAutoFetch = () => {
    setAutoFetchEnabled(prev => !prev);
  };

  return (
    <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4 min-h-screen flex flex-col">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">채용 정보 대시보드</h1>
            <Badge variant="outline" className="ml-2 bg-primary/10">v1.1.0</Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            사람인 채용 정보 자동화 시스템
          </p>
        </div>
        
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center space-x-2 mr-2">
            <Switch
              id="auto-fetch"
              checked={autoFetchEnabled}
              onCheckedChange={toggleAutoFetch}
            />
            <Label htmlFor="auto-fetch" className="text-sm">
              자동 조회
            </Label>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" asChild>
                  <a href="https://github.com/twoimo" target="_blank" rel="noopener noreferrer">
                    <Icons.gitHub className="h-4 w-4" />
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
      
      {/* API 작업 버튼 그룹 */}
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
          className="w-full flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>채용 정보</span>
              {filteredJobs && filteredJobs.length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-primary/20">
                  {filteredJobs.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="console" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              <span>콘솔 출력</span>
              {(testResult || (recommendedJobs && recommendedJobs.length > 0) || autoMatchingResult || applyResult) && (
                <Badge variant="secondary" className="ml-1 bg-primary/20">
                  {[(testResult), (recommendedJobs && recommendedJobs.length > 0), autoMatchingResult, applyResult].filter(Boolean).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="jobs" className="mt-0">
            <div className="pb-8">
              <JobsTab 
                jobs={recommendedJobs || []}
                filteredJobs={filteredJobs || []}
                filters={safeFilters}
                onUpdateFilters={updateFilters}
                onResetFilters={resetFilters}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="console" className="mt-0">
            <div className="pb-8">
              <ConsoleTab 
                testResult={testResult}
                recommendedJobs={recommendedJobs || []}
                autoMatchingResult={autoMatchingResult}
                applyResult={applyResult}
              />
            </div>
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
