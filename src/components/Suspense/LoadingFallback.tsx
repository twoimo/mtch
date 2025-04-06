
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type LoadingFallbackProps = {
  message?: string;
};

const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = '컨텐츠를 불러오는 중입니다...' 
}) => {
  return (
    <Card className="w-full shadow animate-pulse">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <Skeleton className="w-3/4 h-8 rounded-md" />
          <Skeleton className="w-full h-4 rounded-md" />
          <Skeleton className="w-full h-4 rounded-md" />
          <Skeleton className="w-1/2 h-4 rounded-md" />
          
          <div className="flex justify-center items-center text-muted-foreground text-sm mt-4">
            {message}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingFallback;
