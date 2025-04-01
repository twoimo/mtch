import React from 'react';
import JobCard from '@/components/JobCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface JobsTabProps {
  jobs: any[];
}

const JobsTab: React.FC<JobsTabProps> = ({ jobs }) => {
  const isMobile = useIsMobile();

  if (!jobs || jobs.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-muted/20 rounded-lg border border-border/40">
        <p className="text-muted-foreground text-center">
          추천 채용정보가 없습니다. '추천 채용 정보 조회' 버튼을 눌러 채용정보를 불러오세요.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* 항상 세로 한 열 레이아웃으로 표시 */}
      <div className="w-full grid grid-cols-1 gap-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};

export default JobsTab;
