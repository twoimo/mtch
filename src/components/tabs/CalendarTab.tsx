
import React, { useState, useMemo } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';

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

// 고용 형태 문자열 간소화 함수 (추가)
const simplifyEmploymentType = (type: string): string => {
  if (!type) return '';
  
  // "정규직, 병역특례근무형태상세보기정규직 수습기간 3개월병역특례 전문연구요원..." 패턴 처리
  if (type.includes(',') || type.includes('상세보기')) {
    const firstType = type.split(',')[0].trim();
    return firstType || '정규직';
  }
  
  return type;
};

const CalendarTab: React.FC<CalendarTabProps> = ({ jobs, filteredJobs }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const isMobile = useIsMobile();
  
  // 월 변경 핸들러
  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };
  
  // 날짜별 채용 정보 그룹화
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
  
  // 선택한 날짜의 채용 정보
  const selectedDateJobs = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return jobsByDate[dateKey] || [];
  }, [jobsByDate, selectedDate]);
  
  // 특정 날짜의 채용 정보 수 가져오기
  const getJobCountForDate = (date: Date): number => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return (jobsByDate[dateKey] || []).length;
  };
  
  return (
    <div className="space-y-4">
      <Card className="border-t-4 border-t-primary shadow-sm">
        <CardHeader className={isMobile ? "pb-2 pt-3 px-2 sm:px-3" : "pb-2"}>
          <div className="flex items-center justify-between flex-wrap gap-1">
            <CardTitle className="flex items-center gap-1 text-base sm:text-xl">
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="whitespace-nowrap">채용 마감일</span>
            </CardTitle>
            
            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-1 h-7 w-auto text-xs sm:text-sm px-2"
                  >
                    <CalendarIcon className="h-3 w-3" />
                    <span>{format(currentDate, isMobile ? 'yy.MM' : 'yyyy년 MM월', { locale: ko })}</span>
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
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handlePreviousMonth}
                  className="h-7 w-7"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleNextMonth}
                  className="h-7 w-7"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className={isMobile ? "px-2 pb-3" : ""}>
          <div className="grid grid-cols-7 gap-1 text-center text-sm mb-1">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
              <div 
                key={day} 
                className={cn(
                  "font-medium py-1 text-xs",
                  i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : ""
                )}
              >
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {(() => {
              const monthStart = startOfMonth(currentDate);
              const monthEnd = endOfMonth(currentDate);
              const startDate = monthStart;
              const endDate = monthEnd;
              
              const days = eachDayOfInterval({ start: startDate, end: endDate });
              
              // 첫 날의 요일을 기준으로 빈 칸 채우기
              const startDay = monthStart.getDay();
              const prevBlankCells = Array(startDay).fill(null);
              
              // 마지막 날 이후 빈 칸 채우기
              const endDay = monthEnd.getDay();
              const nextBlankCells = Array(6 - endDay).fill(null);
              
              return (
                <>
                  {/* 이전 달 빈 칸 */}
                  {prevBlankCells.map((_, index) => (
                    <div key={`prev-${index}`} className="h-14 sm:h-20 border border-border/40 bg-muted/20 rounded-md opacity-50" />
                  ))}
                  
                  {/* 이번 달 날짜 */}
                  {days.map(day => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const jobsForDay = jobsByDate[dateKey] || [];
                    const jobCount = jobsForDay.length;
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                    
                    return (
                      <div
                        key={dateKey}
                        className={cn(
                          "h-14 sm:h-20 p-1 border border-border/40 rounded-md transition-all duration-200",
                          isToday(day) ? "bg-primary/5 border-primary/30" : "bg-card hover:bg-accent/10",
                          isSelected ? "ring-1 ring-primary" : "",
                          "flex flex-col cursor-pointer"
                        )}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div className="flex justify-between items-start">
                          <span
                            className={cn(
                              "inline-flex justify-center items-center h-5 w-5 rounded-full text-center text-xs font-medium",
                              isToday(day) ? "bg-primary text-primary-foreground" : "",
                              day.getDay() === 0 ? "text-red-500" : day.getDay() === 6 ? "text-blue-500" : ""
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
                                      "h-4 min-w-4 flex items-center justify-center rounded-full text-[10px]",
                                      "bg-primary/20"
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
                        
                        {/* 채용 정보 미리보기 (모바일에서는 1개만) */}
                        <div className="mt-0.5 space-y-0.5 overflow-y-auto flex-grow text-[8px] sm:text-xs">
                          {jobsForDay.slice(0, isMobile ? 1 : 2).map(job => (
                            <div 
                              key={job.id} 
                              className="truncate rounded px-1 py-0.5 bg-accent/20"
                              title={`${job.companyName} - ${job.jobTitle}`}
                            >
                              {job.companyName}
                            </div>
                          ))}
                          {jobCount > (isMobile ? 1 : 2) && (
                            <div className="text-[8px] sm:text-xs text-muted-foreground px-1">
                              +{jobCount - (isMobile ? 1 : 2)}개
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* 다음 달 빈 칸 */}
                  {nextBlankCells.map((_, index) => (
                    <div key={`next-${index}`} className="h-14 sm:h-20 border border-border/40 bg-muted/20 rounded-md opacity-50" />
                  ))}
                </>
              );
            })()}
          </div>
        </CardContent>
      </Card>
      
      {/* 선택한 날짜의 채용 정보 목록 */}
      {selectedDate && (
        <Card>
          <CardHeader className={isMobile ? "pb-2 px-3 pt-3" : "pb-2"}>
            <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
              <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              {format(selectedDate, isMobile ? 'yy.MM.dd' : 'yyyy년 MM월 dd일', { locale: ko })} 마감
              <Badge variant="outline" className="ml-auto text-xs">
                {selectedDateJobs.length}개
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className={isMobile ? "px-3 py-2" : ""}>
            {selectedDateJobs.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Info className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm">이 날짜에 마감되는 채용 공고가 없습니다.</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[350px] pr-3 -mr-3" scrollBarClassName="hidden">
                <div className="space-y-2">
                  {selectedDateJobs.map(job => {
                    // 고용형태 간소화
                    const simplifiedType = simplifyEmploymentType(job.employmentType || '');
                    
                    return (
                      <div 
                        key={job.id} 
                        className="p-2 sm:p-3 border border-border rounded-md hover:bg-accent/10 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate pr-2">
                              <a href={job.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                                {job.jobTitle}
                              </a>
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">{job.companyName}</p>
                          </div>
                          <Badge 
                            variant={job.score >= 70 ? "default" : "secondary"} 
                            className="text-xs whitespace-nowrap shrink-0"
                          >
                            {job.score || job.matchScore || 0}점
                          </Badge>
                        </div>
                        
                        <div className="mt-2 flex flex-wrap gap-1">
                          {simplifiedType && (
                            <Badge variant="outline" className="text-[10px]">{simplifiedType}</Badge>
                          )}
                          {job.jobType && (
                            <Badge variant="outline" className="text-[10px]">{job.jobType}</Badge>
                          )}
                          {job.jobLocation && (
                            <Badge variant="outline" className="text-[10px]">{job.jobLocation}</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalendarTab;
