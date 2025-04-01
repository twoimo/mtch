import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Star, CheckCircle2, XCircle, MapPin, Building, Info } from 'lucide-react';

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
  // 매칭 점수에 따른 색상 및 텍스트 결정
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 80) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getScoreText = (score: number) => {
    if (score >= 90) return '최상';
    if (score >= 80) return '상';
    if (score >= 70) return '중';
    return '보통';
  };

  return (
    <Card className="mb-4 hover:shadow-lg transition-all duration-300 overflow-hidden border-t-4" 
          style={{ borderTopColor: `${job.score >= 90 ? 'rgb(34, 197, 94)' : job.score >= 80 ? 'rgb(59, 130, 246)' : job.score >= 70 ? 'rgb(234, 179, 8)' : 'rgb(156, 163, 175)'}` }}>
      <CardHeader className="pb-2 bg-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold line-clamp-2">{job.jobTitle}</CardTitle>
            <CardDescription className="text-base font-medium mt-1">{job.companyName}</CardDescription>
          </div>
          <div className="flex flex-col items-end">
            <Badge 
              className={`font-medium mb-2 ${getScoreColor(job.score)}`}
            >
              <Star className="h-3 w-3 mr-1 inline" fill="currentColor" />
              매칭도: {getScoreText(job.score)} ({job.score}점)
            </Badge>
            <Badge variant={job.apply_yn === 1 ? "default" : "destructive"} className="text-xs">
              {job.apply_yn === 1 ? '지원 가능' : '지원 불가'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 pb-2">
        <div className="grid gap-3 text-sm">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
            <span>{job.jobLocation}</span>
          </div>
          <div className="flex items-start">
            <Building className="h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{job.companyType}</span>
          </div>
          <div className="flex items-start">
            <Info className="h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{job.reason}</span>
          </div>
          
          <div className="mt-1 grid gap-2">
            <div className="flex items-start bg-green-50 p-2 rounded-md">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-green-800 line-clamp-3">{job.strength}</span>
            </div>
            <div className="flex items-start bg-red-50 p-2 rounded-md">
              <XCircle className="h-4 w-4 mr-2 text-red-600 mt-0.5 flex-shrink-0" />
              <span className="text-red-800 line-clamp-3">{job.weakness}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-3 bg-gray-50">
        <a 
          href={job.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:text-blue-800 inline-flex items-center text-sm font-medium hover:underline"
        >
          사람인에서 보기 <ExternalLink className="ml-1 h-4 w-4" />
        </a>
      </CardFooter>
    </Card>
  );
};

export default JobCard;
