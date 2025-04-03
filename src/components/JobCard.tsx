import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, Star, CheckCircle2, XCircle, MapPin, Building, 
  Info, Calendar, Copy, Share2, Bookmark, BookmarkCheck,
  AlertCircle, CheckSquare
} from 'lucide-react';
import { 
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator 
} from '@/components/ui/context-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { isBookmarked, toggleBookmark } from '@/utils/bookmarkUtils';
import { useIsMobile, useIsTouchDevice } from '@/hooks/use-mobile';

interface JobCardProps {
  job: {
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
    isApplied?: number;
    isGptChecked?: number;
    matchScore?: number;
    createdAt?: string;
    jobSalary?: string;
    jobType?: string;
    employmentType?: string;
  };
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const [bookmarked, setBookmarked] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const isTouchDevice = useIsTouchDevice();
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    setBookmarked(isBookmarked(job.id));
  }, [job.id]);
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
    if (score >= 80) return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
    return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700';
  };

  const getScoreText = (score: number) => {
    if (score >= 90) return '최상';
    if (score >= 80) return '상';
    if (score >= 70) return '중';
    return '보통';
  };
  
  const getBorderColor = (score: number) => {
    if (score >= 90) return 'rgb(34, 197, 94)'; 
    if (score >= 80) return 'rgb(59, 130, 246)'; 
    if (score >= 70) return 'rgb(234, 179, 8)'; 
    return 'rgb(156, 163, 175)';
  };
  
  const getApplyBadgeVariant = (apply_yn: number) => {
    return apply_yn === 1 
      ? "bg-green-100 hover:bg-green-200 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700" 
      : "bg-red-100 hover:bg-red-200 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700";
  };

  const copyToClipboard = async () => {
    try {
      const textToCopy = `
직무: ${job.jobTitle}
회사: ${job.companyName}
위치: ${job.jobLocation}
회사유형: ${job.companyType}
매칭도: ${job.score}점
장점: ${job.strength}
약점: ${job.weakness}
사람인 링크: ${job.url}
      `;
      
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: '복사 완료',
        description: '채용 정보가 클립보드에 복사되었습니다',
        variant: 'success',
      });
    } catch (_) {
      toast({
        title: '복사 실패',
        description: '복사 중 오류가 발생했습니다',
        variant: 'destructive',
      });
    }
  };

  const shareJob = () => {
    if (navigator.share) {
      navigator.share({
        title: `${job.jobTitle} - ${job.companyName}`,
        text: `${job.companyName}의 ${job.jobTitle} 채용 정보를 확인해보세요!`,
        url: job.url,
      }).then(() => {
        toast({
          title: '공유 완료',
          description: '채용 정보가 공유되었습니다',
          variant: 'success',
        });
      }).catch((_) => {
        toast({
          title: '공유 실패',
          description: '공유 중 오류가 발생했습니다',
          variant: 'destructive',
        });
      });
    } else {
      copyToClipboard();
    }
  };

  const handleToggleBookmark = () => {
    const result = toggleBookmark(job);
    setBookmarked(!bookmarked);
    
    toast({
      title: bookmarked ? '북마크 제거' : '북마크 추가',
      description: bookmarked ? '북마크에서 제거되었습니다' : '북마크에 추가되었습니다',
      variant: 'default',
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className={cn(
          "transition-transform duration-300 hover:-translate-y-1 h-full", 
          isMobile && "hover:transform-none"
        )}>
          <Card 
            className={cn(
              "mb-4 transition-all duration-300 overflow-hidden border-t-4",
              "hover:shadow-lg focus-within:shadow-lg",
              "shadow-md h-full flex flex-col",
              job.isApplied ? "border-l-4 border-l-blue-500" : "",
              bookmarked ? "border-r-4 border-r-purple-500" : "",
              isMobile ? "rounded-xl shadow-lg" : ""
            )}
            style={{ borderTopColor: getBorderColor(job.score || job.matchScore || 0) }}
          >
            <CardHeader className={cn(
              "pb-2 bg-gray-50 dark:bg-gray-800/50",
              isMobile && "p-3"
            )}>
              <div className={cn(
                "flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2",
                isMobile && "gap-1"
              )}>
                <div className="flex-1 min-w-0">
                  <CardTitle className={cn(
                    "text-lg font-bold line-clamp-2 hover:line-clamp-none transition-all duration-300",
                    isMobile && "text-base line-clamp-2"
                  )}>
                    {job.jobTitle}
                  </CardTitle>
                  <CardDescription className={cn(
                    "text-base font-medium mt-1 truncate",
                    isMobile && "text-sm mt-0.5"
                  )}>
                    {job.companyName}
                  </CardDescription>
                </div>
                <div className={cn(
                  "flex flex-wrap sm:flex-col items-start sm:items-end gap-2 sm:flex-shrink-0",
                  isMobile && "flex-row gap-1 pt-0"
                )}>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge 
                            className={cn(
                              `font-medium ${getScoreColor(job.score || job.matchScore || 0)}`,
                              isMobile && "text-xs"
                            )}
                          >
                            <Star className="h-3 w-3 mr-1 inline" fill="currentColor" />
                            {getScoreText(job.score || job.matchScore || 0)} ({job.score || job.matchScore || 0}점)
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>이 채용공고와 귀하의 이력서 매칭 점수입니다</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge 
                            className={cn(
                              getApplyBadgeVariant(job.apply_yn),
                              isMobile && "text-xs"
                            )}
                          >
                            {job.apply_yn === 1 ? 
                              <CheckCircle2 className="h-3 w-3 mr-1 inline" /> : 
                              <XCircle className="h-3 w-3 mr-1 inline" />
                            }
                            {job.apply_yn === 1 ? '지원 가능' : '지원 불가'}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{job.apply_yn === 1 ? '이 공고에 지원할 수 있습니다' : '이 공고에는 지원할 수 없습니다'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {job.isApplied !== undefined && !isMobile && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge 
                              variant={job.isApplied ? "default" : "outline"}
                              className={job.isApplied ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" : ""}
                            >
                              {job.isApplied ? 
                                <CheckSquare className="h-3 w-3 mr-1 inline" /> : 
                                <AlertCircle className="h-3 w-3 mr-1 inline" />
                              }
                              {job.isApplied ? '지원 완료' : '미지원'}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{job.isApplied ? '이 채용공고에 지원이 완료되었습니다' : '아직 지원하지 않은 채용공고입니다'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent 
              className={cn(
                "pt-4 pb-2 flex-grow overflow-auto",
                isMobile && "p-3 pt-2 pb-1",
                isMobile && !isExpanded && "max-h-[150px]"
              )}
              onClick={() => isMobile && setIsExpanded(!isExpanded)}
            >
              <div className="grid gap-3 text-sm">
                <div className={cn("flex items-start", isMobile && "gap-1.5")}>
                  <MapPin className={cn(
                    "h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0 dark:text-gray-400",
                    isMobile && "h-3.5 w-3.5 mr-1.5 mt-0"
                  )} />
                  <span className={cn("dark:text-gray-300", isMobile && "text-xs")}>
                    {job.jobLocation}
                  </span>
                </div>
                <div className={cn("flex items-start", isMobile && "gap-1.5")}>
                  <Building className={cn(
                    "h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0 dark:text-gray-400",
                    isMobile && "h-3.5 w-3.5 mr-1.5 mt-0"
                  )} />
                  <span className={cn("line-clamp-2 dark:text-gray-300", isMobile && "text-xs")}>
                    {job.companyType}
                  </span>
                </div>
                
                {job.jobType && (
                  <div className={cn("flex items-start", isMobile && "gap-1.5")}>
                    <Info className={cn(
                      "h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0 dark:text-gray-400",
                      isMobile && "h-3.5 w-3.5 mr-1.5 mt-0"
                    )} />
                    <span className={cn("dark:text-gray-300", isMobile && "text-xs")}>
                      <span className="font-medium text-gray-700 dark:text-gray-300">경력:</span> {job.jobType}
                    </span>
                  </div>
                )}
                
                {job.jobSalary && (
                  <div className={cn("flex items-start", isMobile && "gap-1.5")}>
                    <Info className={cn(
                      "h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0 dark:text-gray-400",
                      isMobile && "h-3.5 w-3.5 mr-1.5 mt-0"
                    )} />
                    <span className={cn("dark:text-gray-300", isMobile && "text-xs")}>
                      <span className="font-medium text-gray-700 dark:text-gray-300">급여:</span> {job.jobSalary}
                    </span>
                  </div>
                )}
                
                {job.employmentType && (
                  <div className={cn("flex items-start", isMobile && "gap-1.5")}>
                    <Info className={cn(
                      "h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0 dark:text-gray-400",
                      isMobile && "h-3.5 w-3.5 mr-1.5 mt-0"
                    )} />
                    <span className={cn("dark:text-gray-300", isMobile && "text-xs")}>
                      <span className="font-medium text-gray-700 dark:text-gray-300">고용형태:</span> {' '}
                      {(() => {
                        const empType = job.employmentType.toLowerCase();
                        const types = [];
                        
                        if (empType.includes('정규직')) types.push('정규직');
                        if (empType.includes('계약직') || empType.includes('계약')) types.push('계약직');
                        if (empType.includes('인턴') || empType.includes('인턴십')) types.push('인턴');
                        
                        return types.length > 0 ? types.join(', ') : job.employmentType;
                      })()}
                    </span>
                  </div>
                )}
                
                {job.deadline && (
                  <div className={cn("flex items-start", isMobile && "gap-1.5")}>
                    <Calendar className={cn(
                      "h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0 dark:text-gray-400",
                      isMobile && "h-3.5 w-3.5 mr-1.5 mt-0"
                    )} />
                    <span className={cn("dark:text-gray-300", isMobile && "text-xs")}>
                      마감일: {job.deadline}
                    </span>
                  </div>
                )}
                
                {job.reason && (
                  <div className={cn("flex items-start", isMobile && "gap-1.5")}>
                    <Info className={cn(
                      "h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0 dark:text-gray-400",
                      isMobile && "h-3.5 w-3.5 mr-1.5 mt-0"
                    )} />
                    <span className={cn("line-clamp-2 dark:text-gray-300", isMobile && "text-xs")}>
                      {job.reason}
                    </span>
                  </div>
                )}
                
                <div className={cn(
                  "mt-1 grid gap-2 transition-all duration-300 ease-in-out",
                  isMobile && "gap-1.5 mt-0"
                )}>
                  {job.strength && (
                    <div className={cn("flex items-start bg-green-50 p-2 rounded-md dark:bg-green-900/20", isMobile && "p-1.5")}>
                      <CheckCircle2 className={cn(
                        "h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0 dark:text-green-400",
                        isMobile && "h-3.5 w-3.5 mr-1.5 mt-0"
                      )} />
                      <span className={cn(
                        "text-green-800 dark:text-green-300",
                        isMobile ? (isExpanded ? "" : "line-clamp-2") : "line-clamp-3",
                        isMobile && "text-xs"
                      )}>
                        {job.strength}
                      </span>
                    </div>
                  )}
                  {job.weakness && (
                    <div className={cn("flex items-start bg-red-50 p-2 rounded-md dark:bg-red-900/20", isMobile && "p-1.5")}>
                      <XCircle className={cn(
                        "h-4 w-4 mr-2 text-red-600 mt-0.5 flex-shrink-0 dark:text-red-400",
                        isMobile && "h-3.5 w-3.5 mr-1.5 mt-0"
                      )} />
                      <span className={cn(
                        "text-red-800 dark:text-red-300",
                        isMobile ? (isExpanded ? "" : "line-clamp-2") : "line-clamp-3",
                        isMobile && "text-xs"
                      )}>
                        {job.weakness}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 모바일에서만 보여주는 확장 표시 */}
              {isMobile && (
                <div className={cn(
                  "text-center text-xs text-blue-500 mt-2",
                  isExpanded ? "hidden" : "block"
                )}>
                  터치하여 모두 보기
                </div>
              )}
            </CardContent>
            
            <CardFooter className={cn(
              "pt-2 pb-3 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center mt-auto",
              isMobile && "py-2 px-3"
            )}>
              <div className="flex gap-2">
                <a 
                  href={job.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={cn(
                    "text-blue-600 hover:text-blue-800 inline-flex items-center text-sm font-medium hover:underline dark:text-blue-400 dark:hover:text-blue-300",
                    isMobile && "text-xs"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  사람인에서 보기 <ExternalLink className={cn("ml-1 h-3.5 w-3.5", isMobile && "h-3 w-3")} />
                </a>
              </div>
              
              <div className={cn("flex items-center gap-2", isMobile && "gap-1")}>
                {/* 북마크 표시 (모바일에서는 작게) */}
                {bookmarked && !isMobile && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge 
                          className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                        >
                          <BookmarkCheck className="h-3 w-3 mr-1 inline" />
                          북마크됨
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>이 채용공고는 북마크되었습니다</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleToggleBookmark();
                  }}
                  className={cn(
                    "rounded-full transition-colors",
                    bookmarked 
                      ? 'text-purple-600 hover:text-purple-700 bg-purple-100 hover:bg-purple-200 dark:text-purple-300 dark:hover:text-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-800/40' 
                      : 'text-gray-500 hover:text-purple-600 hover:bg-purple-100 dark:text-gray-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/30',
                    isMobile ? 'p-2' : 'p-1.5',
                    isTouchDevice && "active:scale-150 transition-transform"
                  )}
                  aria-label={bookmarked ? "북마크 제거" : "북마크 추가"}
                >
                  {bookmarked ? 
                    <BookmarkCheck className={cn("h-4 w-4", isMobile && "h-3.5 w-3.5")} /> : 
                    <Bookmark className={cn("h-4 w-4", isMobile && "h-3.5 w-3.5")} />
                  }
                </button>
                
                {job.createdAt && !isMobile && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </ContextMenuTrigger>
      
      {/* 컨텍스트 메뉴는 모바일에서도 작동하게 */}
      <ContextMenuContent className={cn(
        "w-48",
        isMobile && "w-56"
      )}>
        <ContextMenuItem 
          onClick={() => window.open(job.url, '_blank')}
          className={isMobile && "py-3"}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          사람인에서 보기
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={copyToClipboard}
          className={isMobile && "py-3"}
        >
          <Copy className="mr-2 h-4 w-4" />
          정보 복사하기
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={shareJob}
          className={isMobile && "py-3"}
        >
          <Share2 className="mr-2 h-4 w-4" />
          공유하기
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem 
          onClick={handleToggleBookmark}
          className={isMobile && "py-3"}
        >
          {bookmarked ? (
            <>
              <BookmarkCheck className="mr-2 h-4 w-4" />
              북마크 제거
            </>
          ) : (
            <>
              <Bookmark className="mr-2 h-4 w-4" />
              북마크 추가
            </>
          )}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default JobCard;
