
import React, { useState, useEffect, useRef } from 'react';
import JobCard from './JobCard';
import { ArrowUp } from 'lucide-react';

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
}

// 채용 정보 목록을 표시하는 컴포넌트
const JobList: React.FC<JobListProps> = ({ jobs }) => {
  const [displayedJobs, setDisplayedJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 9;

  // 초기 데이터 로드 및 jobs prop이 변경될 때 실행
  useEffect(() => {
    if (jobs.length > 0) {
      setDisplayedJobs(jobs.slice(0, itemsPerPage));
      setPage(1);
    } else {
      setDisplayedJobs([]);
    }
  }, [jobs]);

  // 스크롤 감지하여 추가 데이터 로드
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
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
  }, [page, jobs]);

  // 스크롤 위치 감지
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 추가 데이터 로드 함수
  const loadMoreJobs = () => {
    const nextItems = jobs.slice(0, (page + 1) * itemsPerPage);
    if (nextItems.length > displayedJobs.length) {
      setDisplayedJobs(nextItems);
      setPage(page + 1);
    }
  };

  // 페이지 상단으로 스크롤
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!jobs || jobs.length === 0) {
    return <div className="text-center py-4">표시할 채용 정보가 없습니다.</div>;
  }

  return (
    <div className="relative">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
