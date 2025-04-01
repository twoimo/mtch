
import React from 'react';
import JobList from '@/components/JobList';
import { Briefcase, RefreshCw } from 'lucide-react';

interface JobsTabProps {
  jobs: any[];
}

// 추천 채용 정보 탭 컴포넌트
const JobsTab: React.FC<JobsTabProps> = ({ jobs }) => {
  return (
    <div className="animate-fade-in">
      {jobs.length > 0 ? (
        <>
          <div className="flex items-center mb-4 bg-blue-50 p-3 rounded-lg">
            <Briefcase className="text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-blue-800">추천 채용 정보 ({jobs.length}개)</h2>
          </div>
          <JobList jobs={jobs} />
        </>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-gray-50 shadow-sm transition-all duration-300">
          <RefreshCw className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">추천 채용 정보를 조회해주세요.</p>
          <p className="text-gray-400 mt-2">오른쪽 상단의 '추천 채용 정보 조회' 버튼을 클릭하세요.</p>
        </div>
      )}
    </div>
  );
};

export default JobsTab;
