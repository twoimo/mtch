
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
        <div className="transition-transform duration-300 hover:-translate-y-1 h-full">
          <Card 
            className={cn(
              "mb-4 transition-all duration-300 overflow-hidden border-t-4",
              "hover:shadow-lg focus-within:shadow-lg focus-within:ring-2 focus-within:ring-blue-300",
              "shadow-md h-full flex flex-col",
              job.isApplied ? "border-l-4 border-l-blue-500" : "",
              bookmarked ? "border-r-4 border-r-purple-500" : ""
            )}
            style={{ borderTopColor: getBorderColor(job.score || job.matchScore || 0) }}
          >
            <CardHeader className="pb-2 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-4">
                  <CardTitle className="text-lg font-bold line-clamp-2 hover:line-clamp-none transition-all duration-300">
                    {job.jobTitle}
                  </CardTitle>
                  <CardDescription className="text-base font-medium mt-1 truncate">
                    {job.companyName}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <div className="flex items-center gap-2 mb-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge 
                            className={`font-medium ${getScoreColor(job.score || job.matchScore || 0)}`}
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
                    
                    {/* 북마크 배지 제거 (나중에 맨 아래 버튼 옆에 표시할 예정) */}
                  </div>
                  
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge 
                            className={getApplyBadgeVariant(job.apply_yn)}
                          >
                            {job.apply_yn === 1 ? 
                              <CheckCircle2 className="h-3 w-3 mr-1 inline" /> : 
                              <XCircle className="h-3 w-3 mr-1 inline" />
                            }
                            {job.apply_yn === 1 ? '추천' : '비추천'}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{job.apply_yn === 1 ? '이 공고에 지원할 수 있습니다' : '이 공고에는 지원할 수 없습니다'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {job.isApplied !== undefined && (
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
            
            <CardContent className="pt-4 pb-2 flex-grow overflow-auto">
              <div className="grid gap-3 text-sm">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0 dark:text-gray-400" />
                  <span className="dark:text-gray-300">{job.jobLocation}</span>
                </div>
                <div className="flex items-start">
                  <Building className="h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0 dark:text-gray-400" />
                  <span className="line-clamp-2 dark:text-gray-300">{job.companyType}</span>
                </div>
                
                {job.jobType && (
                  <div className="flex items-start">
                    <Info className="h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0 dark:text-gray-400" />
                    <span className="dark:text-gray-300">
                      <span className="font-medium text-gray-700 dark:text-gray-300">경력:</span> {job.jobType}
                    </span>
                  </div>
                )}
                
                {job.jobSalary && (
                  <div className="flex items-start">
                    <Info className="h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0 dark:text-gray-400" />
                    <span className="dark:text-gray-300">
                      <span className="font-medium text-gray-700 dark:text-gray-300">급여:</span> {job.jobSalary}
                    </span>
                  </div>
                )}
                
                {job.employmentType && (
                  <div className="flex items-start">
                    <Info className="h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0 dark:text-gray-400" />
                    <span className="dark:text-gray-300">
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
                  <div className="flex items-start">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0 dark:text-gray-400" />
                    <span className="dark:text-gray-300">마감일: {job.deadline}</span>
                  </div>
                )}
                
                {job.reason && (
                  <div className="flex items-start">
                    <Info className="h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0 dark:text-gray-400" />
                    <span className="line-clamp-2 dark:text-gray-300">{job.reason}</span>
                  </div>
                )}
                
                <div className="mt-1 grid gap-2 transition-all duration-300 ease-in-out">
                  {job.strength && (
                    <div className="flex items-start bg-green-50 p-2 rounded-md dark:bg-green-900/20">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0 dark:text-green-400" />
                      <span className="text-green-800 dark:text-green-300 line-clamp-3">{job.strength}</span>
                    </div>
                  )}
                  {job.weakness && (
                    <div className="flex items-start bg-red-50 p-2 rounded-md dark:bg-red-900/20">
                      <XCircle className="h-4 w-4 mr-2 text-red-600 mt-0.5 flex-shrink-0 dark:text-red-400" />
                      <span className="text-red-800 dark:text-red-300 line-clamp-3">{job.weakness}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-2 pb-3 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center mt-auto">
              <div className="flex gap-2">
                <a 
                  href={job.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-800 inline-flex items-center text-sm font-medium hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  사람인에서 보기 <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </a>
              </div>
              
              <div className="flex items-center gap-2">
                
                {job.createdAt && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                )}

                {bookmarked && (
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
                  className={`p-1.5 rounded-full transition-colors ${
                    bookmarked 
                      ? 'text-purple-600 hover:text-purple-700 bg-purple-100 hover:bg-purple-200 dark:text-purple-300 dark:hover:text-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-800/40' 
                      : 'text-gray-500 hover:text-purple-600 hover:bg-purple-100 dark:text-gray-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/30'
                  }`}
                  aria-label={bookmarked ? "북마크 제거" : "북마크 추가"}
                >
                  {bookmarked ? 
                    <BookmarkCheck className="h-4 w-4" /> : 
                    <Bookmark className="h-4 w-4" />
                  }
                </button>
                

              </div>
            </CardFooter>
          </Card>
        </div>
      </ContextMenuTrigger>
      
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => window.open(job.url, '_blank')}>
          <ExternalLink className="mr-2 h-4 w-4" />
          사람인에서 보기
        </ContextMenuItem>
        <ContextMenuItem onClick={copyToClipboard}>
          <Copy className="mr-2 h-4 w-4" />
          정보 복사하기
        </ContextMenuItem>
        <ContextMenuItem onClick={shareJob}>
          <Share2 className="mr-2 h-4 w-4" />
          공유하기
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleToggleBookmark}>
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
