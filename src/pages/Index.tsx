import { useApiActions } from '@/hooks/useApiActions';
import ApiButtonGroup from '@/components/ApiButtonGroup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, LayoutDashboard, Terminal, Info, Bookmark, BookmarkCheck, Command, Calendar } from 'lucide-react';
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
import { useNavigate, useLocation } from 'react-router-dom';
import { getBookmarkedJobs } from '@/utils/bookmarkUtils';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import MobileNavBar from '@/components/MobileNavBar';
import MobileSearchSheet from '@/components/MobileSearchSheet';

const AUTO_FETCH_STORAGE_KEY = 'auto-fetch-jobs-enabled';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const { isOpen, setIsOpen } = useCommandPalette();
  const isMobile = useIsMobile();
  
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
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      code: 'KeyK',
      ctrlKey: true,
      bubbles: true
    });
    document.dispatchEvent(event);
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

  // State for mobile UI components
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Handle mobile search button click
  const handleSearchClick = () => {
    setIsSearchSheetOpen(true);
  };
  
  // Handle mobile menu button click
  const handleMenuClick = () => {
    // Toggle command palette or other menu
    setIsOpen(true);
  };
  
  // Apply search
  const handleApplySearch = () => {
    // Reset to first page, scroll to top, etc.
    window.scrollTo(0, 0);
  };
  
  // Mobile bottom padding to prevent content from being hidden behind nav bar
  const mobileBottomPadding = isMobile ? "pb-20" : "";
  
  return (
    <div className={cn("container mx-auto py-6", isMobile && "px-3 py-4")}>
      <div className={cn(
        "flex items-center justify-between mb-6", 
        isMobile && "flex-col items-start gap-3 mb-4"
      )}>
        <div>
          <h1 className={cn(
            "text-3xl font-bold tracking-tight",
            isMobile && "text-2xl"
          )}>
            사람인 채용 연동 시스템
          </h1>
          <p className={cn(
            "text-muted-foreground mt-1",
            isMobile && "text-sm"
          )}>
            API를 통해 사람인 채용 정보를 조회하고 관리합니다
          </p>
        </div>
        
        <div className={cn(
          "flex items-center space-x-4",
          isMobile && "w-full justify-between"
        )}>
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-fetch"
              checked={autoFetchEnabled}
              onCheckedChange={toggleAutoFetch}
            />
            <Label htmlFor="auto-fetch" className={isMobile ? "text-sm" : ""}>자동 데이터 가져오기</Label>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={() => navigate('/bookmarks')}
                  className={cn(
                    "gap-2", 
                    isMobile && "text-xs"
                  )}
                >
                  <Bookmark className={cn("h-4 w-4", isMobile && "h-3.5 w-3.5")} />
                  북마크된 항목
                  <Badge variant="secondary" className={isMobile ? "text-[10px]" : "text-xs"}>
                    {bookmarkCount}
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent>북마크한 채용 공고를 확인합니다</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
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
      
      <div className={cn("space-y-6", mobileBottomPadding)}>
        <div>
          <Card className={cn(
            "border-l-4 border-l-blue-500",
            isMobile ? "p-3" : "p-4"
          )}>
            <CardHeader className={cn("pb-2", isMobile && "p-2")}>
              <CardTitle className={cn(
                "text-lg flex items-center gap-2",
                isMobile && "text-base"
              )}>
                <Info className="h-5 w-5 text-blue-500" />
                API 작업
              </CardTitle>
              <CardDescription className={isMobile && "text-xs"}>
                사람인 API를 호출하여 채용 정보를 관리할 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "py-2 px-2" : "py-2"}>
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
        </div>
        
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className={cn("w-full", isMobile && "sticky top-0 z-10 bg-background/80 backdrop-blur-sm")}>
            <TabsTrigger value="jobs" className={cn("flex-1", isMobile && "py-2.5")}>
              <Briefcase className="mr-2 h-4 w-4" />
              채용 목록
            </TabsTrigger>
            <TabsTrigger value="calendar" className={cn("flex-1", isMobile && "py-2.5")}>
              <Calendar className="mr-2 h-4 w-4" />
              캘린더
            </TabsTrigger>
            <TabsTrigger value="console" className={cn("flex-1", isMobile && "py-2.5")}>
              <Terminal className="mr-2 h-4 w-4" />
              콘솔 결과
            </TabsTrigger>
          </TabsList>
          
          <div className={cn("mt-4", isMobile && "mt-2")}>
            <TabsContent value="jobs" className="m-0">
              <JobsTab
                jobs={recommendedJobs}
                filteredJobs={filteredJobs}
                filters={safeFilters}
                onUpdateFilters={updateFilters}
                onResetFilters={resetFilters}
              />
            </TabsContent>
            
            <TabsContent value="calendar" className="m-0">
              <CalendarTab jobs={recommendedJobs} filteredJobs={filteredJobs} />
            </TabsContent>
            
            <TabsContent value="console" className="m-0">
              <ConsoleTab
                testResult={testResult}
                recommendedJobs={recommendedJobs}
                autoMatchingResult={autoMatchingResult}
                applyResult={applyResult}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      {/* Mobile-specific UI components */}
      {isMobile && (
        <>
          <MobileNavBar 
            onSearchClick={handleSearchClick}
            onMenuClick={handleMenuClick}
          />
          
          <MobileSearchSheet
            isOpen={isSearchSheetOpen}
            onOpenChange={setIsSearchSheetOpen}
            filters={safeFilters}
            onUpdateFilters={updateFilters}
            onResetFilters={resetFilters}
            onSearch={handleApplySearch}
          />
        </>
      )}
      
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
