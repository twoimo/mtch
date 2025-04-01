import React, { useState, useEffect, useRef, useCallback } from 'react';
import JobCard from './JobCard';
import { ArrowUp, ArrowDownUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

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
}

interface JobListProps {
  jobs: Job[];
  isLoading?: boolean;
}

// 채용 정보 목록을 표시하는 컴포넌트
const JobList: React.FC<JobListProps> = ({ jobs, isLoading = false }) => {
  const [displayedJobs, setDisplayedJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sortOrder, setSortOrder] = useState<'score' | 'apply'>('score');
  const loaderRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 9;

  // 정렬 함수
  const sortJobs = (jobsToSort: Job[], order: 'score' | 'apply') => {
    if (order === 'score') {
      return [...jobsToSort].sort((a, b) => b.score - a.score);
    } else {
      return [...jobsToSort].sort((a, b) => {
        if (a.apply_yn !== b.apply_yn) {
          return b.apply_yn - a.apply_yn; // 지원 가능한 것을 먼저
        }
        return b.score - a.score; // 동점이면 점수로 정렬
      });
    }
  };

  // 초기 데이터 로드 및 jobs prop이 변경될 때 실행
  useEffect(() => {
    if (jobs.length > 0) {
      const sortedJobs = sortJobs(jobs, sortOrder);
      setDisplayedJobs(sortedJobs.slice(0, itemsPerPage));
      setPage(1);
    } else {
      setDisplayedJobs([]);
    }
  }, [jobs, sortOrder]);

  // 추가 데이터 로드 함수 - useCallback으로 메모이제이션
  const loadMoreJobs = useCallback(() => {
    const sortedJobs = sortJobs(jobs, sortOrder);
    const nextItems = sortedJobs.slice(0, (page + 1) * itemsPerPage);
    if (nextItems.length > displayedJobs.length) {
      setDisplayedJobs(nextItems);
      setPage(page + 1);
    }
  }, [jobs, sortOrder, page, displayedJobs.length, itemsPerPage]);

  // 스크롤 감지하여 추가 데이터 로드
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoading) {
          loadMoreJobs();
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [page, jobs, isLoading, sortOrder, loadMoreJobs]);

  // 스크롤 위치 감지
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 페이지 상단으로 스크롤
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 정렬 순서 변경
  const handleSortChange = (value: string) => {
    setSortOrder(value as 'score' | 'apply');
  };

  // 로딩 중인 경우 스켈레톤 UI 표시
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1">
        {Array(6).fill(0).map((_, index) => (
          <Card key={index} className="mb-4">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-20 w-full mb-2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-1/3" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-gray-500 text-lg">표시할 채용 정보가 없습니다.</div>
        <div className="text-gray-400 text-sm mt-2">새로운 추천 채용 정보를 가져오려면 '추천 채용 정보 가져오기' 버튼을 클릭하세요.</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-semibold">
          총 <span className="text-blue-600">{jobs.length}</span>개의 추천 채용정보
        </div>
        <div className="flex items-center">
          <div className="flex items-center mr-2">
            <ArrowDownUp className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-sm text-gray-600">정렬:</span>
          </div>
          <Select value={sortOrder} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[150px] h-8">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">매칭 점수순</SelectItem>
              <SelectItem value="apply">지원 가능 우선</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1">
        {displayedJobs.map((job, index) => (
          <div 
            key={job.id} 
            className="transition-all duration-300 opacity-0 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
          >
            <JobCard job={job} />
          </div>
        ))}
      </div>
      
      {/* 더 로드하기 위한 관찰자 요소 */}
      {displayedJobs.length < jobs.length && (
        <div 
          ref={loaderRef} 
          className="w-full h-20 flex items-center justify-center my-4"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* 페이지 상단으로 이동 버튼 */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 z-50"
          aria-label="페이지 상단으로 이동"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
      
      {/* 로드된 항목 수 표시 */}
      <div className="text-center text-sm text-gray-500 mt-4">
        {displayedJobs.length}개 표시 중 (총 {jobs.length}개)
      </div>
    </div>
  );
};

export default JobList;
