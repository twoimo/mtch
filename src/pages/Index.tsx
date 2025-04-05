import { useApiActions } from '@/hooks/useApiActions';
import ApiButtonGroup from '@/components/ApiButtonGroup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Info, Bookmark, Command, User, ChevronDown, ChevronUp } from 'lucide-react';
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
import HamburgerMenu from '@/components/HamburgerMenu';
import BottomNavigation from '@/components/BottomNavigation';

const AUTO_FETCH_STORAGE_KEY = 'auto-fetch-jobs-enabled';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const { isOpen, setIsOpen } = useCommandPalette();
  const [apiCardExpanded, setApiCardExpanded] = useState(!isMobile);
  
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

  // Initialize active tab from URL state if available
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (location.state && location.state.tab) {
      return location.state.tab;
    }
    return "jobs";
  });
  
  const [progress, setProgress] = useState<number>(0);
  const isAnyLoading = isTestLoading || isRecommendedLoading || isAutoMatchingLoading || isApplyLoading;
  
  const [autoFetchEnabled, setAutoFetchEnabled] = useState<boolean>(() => {
    const savedSetting = localStorage.getItem(AUTO_FETCH_STORAGE_KEY);
    return savedSetting === null ? true : savedSetting === 'true';
  });

  const toggleAutoFetch = () => {
    setAutoFetchEnabled(prev => !prev);
  };

  const toggleApiCard = () => {
    setApiCardExpanded(prev => !prev);
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

  return (
    <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4 min-h-screen flex flex-col">
      <header className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <div className="flex items-center">
            <LayoutDashboard className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground whitespace-nowrap">채용 정보 대시보드</h1>
            <Badge variant="outline" className="ml-2 bg-primary/10">v1.2.0</Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isMobile && (
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
          )}
          
          {!isMobile && (
            <>
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
            </>
          )}
          
          {isMobile && (
            <HamburgerMenu 
              autoFetchEnabled={autoFetchEnabled}
              toggleAutoFetch={toggleAutoFetch}
              triggerCommandPalette={triggerCommandPalette}
            />
          )}
        </div>
      </header>
      
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
      
      <Card className="mb-6 border-t-4 border-t-primary shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className={`${isMobile ? 'py-3' : 'pb-3'}`}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-xl gap-2">
              <Info className="h-5 w-5 text-primary" />
              API 요청
            </CardTitle>
            
            {isMobile && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleApiCard}
                className="h-8 w-8 p-0"
              >
                {apiCardExpanded ? 
                  <ChevronUp className="h-5 w-5" /> : 
                  <ChevronDown className="h-5 w-5" />
                }
              </Button>
            )}
          </div>
        </CardHeader>
        
        {(apiCardExpanded || !isMobile) && (
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
        )}
      </Card>
      
      <div className="h-full">
        {!isMobile ? (
          <Tabs 
            defaultValue="jobs" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="jobs" className="flex items-center gap-2">
                <span>채용 정보</span>
                {filteredJobs && filteredJobs.length > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-primary/20">
                    {filteredJobs.length}
                  </Badge>
                )}
              </TabsTrigger>
              
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <span>캘린더</span>
              </TabsTrigger>
              
              <TabsTrigger value="bookmarks" className="flex items-center gap-2">
                <span>북마크</span>
                {bookmarkCount > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-primary/20">
                    {bookmarkCount}
                  </Badge>
                )}
              </TabsTrigger>
              
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <span>마이페이지</span>
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
            
            <TabsContent value="calendar" className="mt-0">
              <div className="pb-8">
                <CalendarTab 
                  jobs={recommendedJobs || []}
                  filteredJobs={filteredJobs || []}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="bookmarks" className="mt-0">
              <div className="pb-8">
                <BookmarkList />
              </div>
            </TabsContent>
            
            <TabsContent value="profile" className="mt-0">
              <div className="pb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      마이페이지
                    </CardTitle>
                    <CardDescription>
                      계정 정보 및 설정을 관리하세요
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                      마이페이지 기능은 준비 중입니다.
                    </p>
                  </CardContent>
                </Card>
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
        ) : (
          // Mobile content without tab list, directly show the active content
          <div className="pb-16">
            {activeTab === "jobs" && (
              <JobsTab 
                jobs={recommendedJobs || []}
                filteredJobs={filteredJobs || []}
                filters={safeFilters}
                onUpdateFilters={updateFilters}
                onResetFilters={resetFilters}
              />
            )}
            
            {activeTab === "calendar" && (
              <CalendarTab 
                jobs={recommendedJobs || []}
                filteredJobs={filteredJobs || []}
              />
            )}
            
            {activeTab === "bookmarks" && (
              <BookmarkList />
            )}
            
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    마이페이지
                  </CardTitle>
                  <CardDescription>
                    계정 정보 및 설정을 관리하세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    마이페이지 기능은 준비 중입니다.
                  </p>
                </CardContent>
              </Card>
            )}
            
            {activeTab === "console" && (
              <ConsoleTab 
                testResult={testResult}
                recommendedJobs={recommendedJobs || []}
                autoMatchingResult={autoMatchingResult}
                applyResult={applyResult}
              />
            )}
          </div>
        )}
      </div>
      
      {!isMobile && (
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
      )}
      
      {isMobile && (
        <BottomNavigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          bookmarkCount={bookmarkCount}
        />
      )}
      
      <Toaster />
    </div>
  );
};

export default Index;
