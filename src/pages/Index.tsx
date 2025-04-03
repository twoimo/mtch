import { useApiActions } from '@/hooks/useApiActions';
import ApiButtonGroup from '@/components/ApiButtonGroup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, LayoutDashboard, Terminal, Info, BookmarkCheck, Command, Calendar, Menu, Moon, Sun, RotateCw } from 'lucide-react';
import { Icons } from '@/components/icons';
import JobsTab from '@/components/tabs/JobsTab';
import ConsoleTab from '@/components/tabs/ConsoleTab';
import CalendarTab from '@/components/tabs/CalendarTab';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { Progress } from '@/components/ui/progress';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import BookmarkList from '@/components/BookmarkList';
import { getBookmarkedJobs } from '@/utils/bookmarkUtils';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/lib/theme-context';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetFooter 
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/mobile/BottomNav';

const AUTO_FETCH_STORAGE_KEY = 'auto-fetch-jobs-enabled';

const Index = () => {
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const { toggle: toggleCommandPalette } = useCommandPalette();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  
  const {
    testResult,
    recommendedJobs = [],
    filteredJobs = [],
    filters,
    autoMatchingResult,
    applyResult,
    
    isTestLoading,
    isRecommendedLoading,
    isAutoMatchingLoading,
    isApplyLoading,
    
    handleTestApi,
    handleGetRecommendedJobs,
    handleRunAutoJobMatching,
    handleApplySaraminJobs,
    
    updateFilters,
    resetFilters
  } = useApiActions();

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
  
  const [autoFetchEnabled, setAutoFetchEnabled] = useState<boolean>(() => {
    const savedSetting = localStorage.getItem(AUTO_FETCH_STORAGE_KEY);
    return savedSetting === null ? true : savedSetting === 'true';
  });

  const toggleAutoFetch = () => {
    setAutoFetchEnabled(prev => !prev);
  };

  const triggerCommandPalette = () => {
    toggleCommandPalette();
  };

  useEffect(() => {
    const updateBookmarkCount = () => {
      const bookmarks = getBookmarkedJobs();
      setBookmarkCount(bookmarks.length);
    };
    
    updateBookmarkCount();
    
    const handleStorageChange = () => {
      updateBookmarkCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bookmarks-changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookmarks-changed', handleStorageChange);
    };
  }, []);

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
      const timer = setTimeout(() => {
        setProgress(0);
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnyLoading]);
  
  useEffect(() => {
    localStorage.setItem(AUTO_FETCH_STORAGE_KEY, autoFetchEnabled.toString());
  }, [autoFetchEnabled]);

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
    
    startScrapingScheduler();
  }, []);

  useEffect(() => {
    if (autoFetchEnabled && recommendedJobs.length === 0 && !isRecommendedLoading) {
      const timer = setTimeout(() => {
        handleGetRecommendedJobs();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [autoFetchEnabled, recommendedJobs.length, isRecommendedLoading, handleGetRecommendedJobs]);

  return (
    <div className={cn(
      "container mx-auto py-3 px-3 min-h-screen flex flex-col",
      "sm:py-6 sm:px-4 safe-top safe-bottom"
    )}>
      <header className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">채용 정보 대시보드</h1>
              <Badge variant="outline" className="ml-1 sm:ml-2 bg-primary/10">v1.2.0</Badge>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              사람인 채용 정보 자동화 시스템
            </p>
          </div>
          
          {isMobile && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setMenuOpen(true)}
              className="sm:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {isMobile ? (
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetContent side="right" className="w-[240px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle>설정</SheetTitle>
              </SheetHeader>
              <div className="py-4 flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="mobile-auto-fetch"
                    checked={autoFetchEnabled}
                    onCheckedChange={toggleAutoFetch}
                  />
                  <Label htmlFor="mobile-auto-fetch">자동 조회</Label>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={triggerCommandPalette}
                  >
                    <Command className="h-4 w-4 mr-2" />
                    명령어 팔레트
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    asChild
                  >
                    <a href="https://github.com/twoimo" target="_blank" rel="noopener noreferrer">
                      <Icons.gitHub className="h-4 w-4 mr-2" />
                      GitHub 저장소
                    </a>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    <div className="flex items-center">
                      {theme === "dark" ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                      {theme === "dark" ? "다크 모드" : "라이트 모드"}
                    </div>
                    <RotateCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <SheetFooter>
                <Button 
                  variant="ghost" 
                  onClick={() => setMenuOpen(false)}
                >
                  닫기
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ) : (
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
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={triggerCommandPalette}
                  >
                    <Command className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>명령어 팔레트 (단축키: Ctrl+K)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
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
        )}
      </header>
      
      {isAnyLoading && (
        <div className="mb-4 sm:mb-6 w-full">
          <div className="flex justify-between items-center mb-2 text-xs sm:text-sm">
            <span className="text-muted-foreground">
              {isTestLoading ? '사람인 스크래핑 중...' : 
               isRecommendedLoading ? '추천 채용 정보 가져오는 중...' : 
               isAutoMatchingLoading ? '채용 매칭 실행 중...' : 
               isApplyLoading ? '채용 지원 중...' : '로딩 중...'}
            </span>
            <span className="font-mono">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5 sm:h-2 animate-pulse" />
        </div>
      )}
      
      <Card className="mb-4 sm:mb-6 border-t-4 border-t-primary shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center text-lg sm:text-xl gap-2">
            <Info className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            API 작업
          </CardTitle>
          <CardDescription className="text-sm">
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
          {/* Hide tabs on mobile devices since we have bottom navigation */}
          {!isMobile && (
            <TabsList className="grid mb-4 w-full grid-cols-4">
              <TabsTrigger value="jobs" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>채용 정보</span>
                {filteredJobs && filteredJobs.length > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-primary/20">
                    {filteredJobs.length}
                  </Badge>
                )}
              </TabsTrigger>
              
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>캘린더</span>
              </TabsTrigger>
              
              <TabsTrigger value="bookmarks" className="flex items-center gap-2">
                <BookmarkCheck className="h-4 w-4" />
                <span>북마크</span>
                {bookmarkCount > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-primary/20">
                    {bookmarkCount}
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
          )}
          
          <TabsContent value="jobs" className="mt-0">
            <div className="pb-6 sm:pb-8 content-visibility-auto">
              <JobsTab 
                jobs={recommendedJobs || []}
                filteredJobs={filteredJobs || []}
                filters={safeFilters}
                onUpdateFilters={updateFilters}
                onResetFilters={resetFilters}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-0">
            <div className="pb-6 sm:pb-8 content-visibility-auto">
              <CalendarTab 
                jobs={recommendedJobs || []}
                filteredJobs={filteredJobs || []}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="bookmarks" className="mt-0">
            <div className="pb-6 sm:pb-8 content-visibility-auto">
              <BookmarkList />
            </div>
          </TabsContent>
          
          <TabsContent value="console" className="mt-0">
            <div className="pb-6 sm:pb-8 content-visibility-auto">
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
      
      <footer className={cn(
        "mt-8 sm:mt-12 py-3 sm:py-4 border-t border-border/60", 
        "text-xs sm:text-sm text-muted-foreground"
      )}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            © 2023 채용 정보 대시보드 - 모든 권리 보유
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <a href="#" className="hover:text-primary transition-colors">이용약관</a>
            <a href="#" className="hover:text-primary transition-colors">개인정보처리방침</a>
            <a href="#" className="hover:text-primary transition-colors">도움말</a>
          </div>
        </div>
      </footer>
      
      {isMobile && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          bookmarkCount={bookmarkCount}
          consoleCount={[(testResult), (recommendedJobs && recommendedJobs.length > 0), autoMatchingResult, applyResult].filter(Boolean).length}
        />
      )}
      
      <Toaster />
    </div>
  );
};

export default Index;