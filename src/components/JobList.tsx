
import React from 'react';
import JobCard from './JobCard';

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
  if (!jobs || jobs.length === 0) {
    return <div className="text-center py-4">표시할 채용 정보가 없습니다.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job, index) => (
        <div 
          key={job.id} 
          className="transition-all duration-300 opacity-0 animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
        >
          <JobCard job={job} />
        </div>
      ))}
    </div>
  );
};

export default JobList;
