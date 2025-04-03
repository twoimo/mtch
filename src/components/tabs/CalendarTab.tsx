import React, { useState, useMemo, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, parseISO, addMonths, subMonths, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useIsMobile } from '@/hooks/use-mobile';

// 채용 정보 인터페이스
interface Job {
  id: number;
  score: number;
  reason: string;
  strength: string;
  weakness: string;
  apply_yn: number;
  companyName: string;
  jobTitle: string;
  jobLocation: string;
  companyType: string;
  url: string;
  deadline?: string;
  matchScore?: number;
  isApplied?: number;
  isRecommended?: number;
  jobType?: string;
  jobSalary?: string;
  employmentType?: string;
  createdAt?: string;
  isGptChecked?: number;
}

interface CalendarTabProps {
  jobs: Job[];
  filteredJobs: Job[];
}

// 캘린더 구현을 위한 상수
const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

const CalendarTab: React.FC<CalendarTabProps> = React.memo(({ jobs, filteredJobs }) => {
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // 캘린더 월 변경 핸들러 - 메모이제이션
  const handlePreviousMonth = useCallback(() => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  }, []);
  
  const handleNextMonth = useCallback(() => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  }, []);
  
  // 모바일 최적화를 위한 상수
  const mobileDayHeight = isMobile ? 'h-[100px]' : 'h-[140px]';
  const gridGap = isMobile ? 'gap-0.5' : 'gap-1';
  
  // 날짜별 채용 정보 그룹화 - 메모이제이션
  const jobsByDate = useMemo(() => {
    const result: Record<string, Job[]> = {};
    
    // 현재 달의 모든 날짜 생성
    const firstDay = startOfMonth(currentDate);
    const lastDay = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });
    
    // 각 날짜에 빈 배열 초기화
    daysInMonth.forEach(day => {
      result[format(day, 'yyyy-MM-dd')] = [];
    });
    
    // 마감일 기준으로 채용 정보 그룹화
    filteredJobs.forEach(job => {
      if (job.deadline) {
        let deadlineDate: Date;
        
        // 마감일 형식 처리 (YYYY.MM.DD 또는 YYYY-MM-DD)
        if (job.deadline.includes('.')) {
          const [year, month, day] = job.deadline.split('.').map(num => parseInt(num));
          deadlineDate = new Date(year, month - 1, day);
        } else {
          deadlineDate = parseISO(job.deadline);
        }
        
        // 해당 날짜에 채용 정보 추가
        const dateKey = format(deadlineDate, 'yyyy-MM-dd');
        if (result[dateKey]) {
          result[dateKey].push(job);
        }
      }
    });
    
    return result;
  }, [filteredJobs, currentDate]);
  
  // 선택한 날짜의 채용 정보 - 메모이제이션
  const selectedDateJobs = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return jobsByDate[dateKey] || [];
  }, [jobsByDate, selectedDate]);
  
  // 캘린더 생성에 필요한 날짜 계산 - 메모이제이션
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDay = monthStart.getDay(); // 첫 날의 요일 (0-6)
    const endDay = monthEnd.getDay(); // 마지막 날의 요일 (0-6)
    
    const days = eachDayOfInterval({ 
      start: monthStart, 
      end: monthEnd 
    });
    
    return {
      days,
      prevBlankCells: Array(startDay).fill(null),
      nextBlankCells: Array(6 - endDay).fill(null)
    };
  }, [currentDate]);
  
  // 날짜 셀 렌더링 - 성능 개선을 위한 컴포넌트 분리
  const DateCell = React.memo(({ day }: { day: Date }) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const jobsForDay = jobsByDate[dateKey] || [];
    const jobCount = jobsForDay.length;
    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
    
    return (
      <div
        className={cn(
          "p-1 border border-border/40 rounded-md transition-all duration-200",
          isToday(day) ? "bg-primary/5 border-primary/30" : "bg-card hover:bg-accent/10",
          isSelected ? "ring-2 ring-primary ring-offset-2" : "",
          "flex flex-col cursor-pointer",
          mobileDayHeight,
          isMobile && "p-0.5"
        )}
        onClick={() => setSelectedDate(day)}
      >
        <div className="flex justify-between items-start">
          <span
            className={cn(
              "inline-block rounded-full text-center leading-6 text-sm font-medium",
              isToday(day) ? "bg-primary text-primary-foreground h-6 w-6" : "",
              day.getDay() === 0 ? "text-red-500" : day.getDay() === 6 ? "text-blue-500" : "",
              isMobile && "text-xs h-5 w-5 leading-5"
            )}
          >
            {format(day, 'd')}
          </span>
          
          {jobCount > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "h-5 min-w-5 flex items-center justify-center rounded-full text-xs",
                      "bg-primary/20",
                      isMobile && "h-4 min-w-4 text-[10px]"
                    )}
                  >
                    {jobCount}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{jobCount}개의 채용공고 마감</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {/* 채용 정보 미리보기 (최대 3개) */}
        <div className={cn("mt-1 space-y-0.5 overflow-y-auto flex-grow", isMobile && "space-y-0")}>
          {jobsForDay.slice(0, isMobile ? 2 : 3).map(job => (
            <div 
              key={job.id} 
              className={cn(
                "text-xs truncate rounded px-1 py-0.5 bg-accent/20",
                isMobile && "text-[10px] py-0.5"
              )}
              title={`${job.companyName} - ${job.jobTitle}`}
            >
              {job.companyName}
            </div>
          ))}
          {jobCount > (isMobile ? 2 : 3) && (
            <div className={cn("text-xs text-muted-foreground px-1", isMobile && "text-[10px]")}>
              +{jobCount - (isMobile ? 2 : 3)}개 더보기
            </div>
          )}
        </div>
      </div>
    );
  });
  
  // 선택된 날짜의 채용 정보 항목 - 성능 개선을 위한 컴포넌트 분리
  const JobItem = React.memo(({ job }: { job: Job }) => {
    return (
      <div 
        className={cn(
          "p-3 border border-border rounded-md hover:bg-accent/10 transition-colors",
          isMobile && "p-2"
        )}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className={cn("font-medium", isMobile && "text-sm")}>
              <a href={job.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                {job.jobTitle}
              </a>
            </h3>
            <p className={cn("text-sm text-muted-foreground", isMobile && "text-xs")}>{job.companyName}</p>
          </div>
          <Badge variant={job.score >= 70 ? "default" : "secondary"} className={isMobile && "text-xs"}>
            {job.score || job.matchScore || 0}점
          </Badge>
        </div>
        
        <div className={cn("mt-2 flex flex-wrap gap-2", isMobile && "mt-1 gap-1")}>
          {job.employmentType && (
            <Badge variant="outline" className={cn("text-xs", isMobile && "text-[10px]")}>
              {job.employmentType}
            </Badge>
          )}
          {job.jobType && (
            <Badge variant="outline" className={cn("text-xs", isMobile && "text-[10px]")}>
              {job.jobType}
            </Badge>
          )}
          {job.jobLocation && (
            <Badge variant="outline" className={cn("text-xs", isMobile && "text-[10px]")}>
              {job.jobLocation}
            </Badge>
          )}
        </div>
      </div>
    );
  });
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-t-4 border-t-primary shadow-sm">
        <CardHeader className={cn("pb-2", isMobile && "p-3")}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <span className={cn("text-xl", isMobile && "text-lg")}>
                채용 마감일 캘린더
              </span>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={cn("gap-2 h-8", isMobile && "px-2 text-xs")}
                  >
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span className={isMobile ? "text-xs" : ""}>
                      {format(currentDate, isMobile ? 'yy년 MM월' : 'yyyy년 MM월', { locale: ko })}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={currentDate}
                    onSelect={(date) => {
                      if (date) {
                        setCurrentDate(date);
                        setSelectedDate(date);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handlePreviousMonth}
                  className={cn("h-8 w-8", isMobile && "h-7 w-7")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleNextMonth}
                  className={cn("h-8 w-8", isMobile && "h-7 w-7")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className={cn(isMobile && "p-2 pt-0")}>
          <div className={cn("grid grid-cols-7", gridGap, "text-center text-sm mb-1")}>
            {DAYS_OF_WEEK.map((day, i) => (
              <div 
                key={day} 
                className={cn(
                  "font-medium py-1",
                  i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "",
                  isMobile && "text-xs py-0.5"
                )}
              >
                {day}
              </div>
            ))}
          </div>
          
          <div className={cn("grid grid-cols-7", gridGap)}>
            {calendarDays.prevBlankCells.map((_, index) => (
              <div key={`prev-${index}`} className={cn("border border-border/40 bg-muted/20 rounded-md opacity-50", mobileDayHeight)} />
            ))}
            
            {calendarDays.days.map(day => (
              <DateCell key={format(day, 'yyyy-MM-dd')} day={day} />
            ))}
            
            {calendarDays.nextBlankCells.map((_, index) => (
              <div key={`next-${index}`} className={cn("border border-border/40 bg-muted/20 rounded-md opacity-50", mobileDayHeight)} />
            ))}
          </div>
        </CardContent>
      </Card>
      
      {selectedDate && (
        <Card className={cn(isMobile && "animate-fade-scale-mobile")}>
          <CardHeader className={cn("pb-2", isMobile && "p-3")}>
            <CardTitle className={cn("text-lg flex items-center gap-2", isMobile && "text-base")}>
              <CalendarIcon className="h-4 w-4 text-primary" />
              {format(selectedDate, 'yyyy년 MM월 dd일', { locale: ko })} 마감 채용 공고
              <Badge variant="outline" className="ml-2">
                {selectedDateJobs.length}개
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className={cn(isMobile && "p-3 pt-0")}>
            {selectedDateJobs.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Info className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                <p>이 날짜에 마감되는 채용 공고가 없습니다.</p>
              </div>
            ) : (
              <div className={cn("space-y-2", isMobile && "space-y-1.5")}>
                {selectedDateJobs.map(job => (
                  <JobItem key={job.id} job={job} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
});

CalendarTab.displayName = "CalendarTab";
export default CalendarTab;
