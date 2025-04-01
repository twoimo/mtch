
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

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
  };
}

// 채용 정보를 표시하는 카드 컴포넌트
const JobCard: React.FC<JobCardProps> = ({ job }) => {
  return (
    <Card className="mb-4 hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">{job.jobTitle}</CardTitle>
            <CardDescription className="text-base font-medium">{job.companyName}</CardDescription>
          </div>
          <Badge variant={job.score >= 90 ? "default" : "secondary"} className="ml-2">
            매칭 점수: {job.score}점
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid gap-2 text-sm">
          <div><span className="font-semibold">위치:</span> {job.jobLocation}</div>
          <div><span className="font-semibold">기업 유형:</span> {job.companyType}</div>
          <div><span className="font-semibold">추천 이유:</span> {job.reason}</div>
          <div><span className="font-semibold">강점:</span> {job.strength}</div>
          <div><span className="font-semibold">약점:</span> {job.weakness}</div>
          <div><span className="font-semibold">지원 여부:</span> {job.apply_yn === 1 ? '지원 가능' : '지원 불가'}</div>
        </div>
      </CardContent>
      <CardFooter>
        <a 
          href={job.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:text-blue-800 inline-flex items-center text-sm"
        >
          사람인에서 보기 <ExternalLink className="ml-1 h-4 w-4" />
        </a>
      </CardFooter>
    </Card>
  );
};

export default JobCard;
