
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ConsoleOutputProps {
  title: string;
  data: any;
}

// 콘솔 출력을 웹 페이지에 표시하는 컴포넌트
const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ title, data }) => {
  const formatOutput = (data: any) => {
    if (!data) return '데이터 없음';
    
    if (typeof data === 'string') return data;
    
    return JSON.stringify(data, null, 2);
  };

  return (
    <Card className="mb-4 bg-slate-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">{title}</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <pre className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-x-auto max-h-[400px] text-sm">
          {formatOutput(data)}
        </pre>
      </CardContent>
    </Card>
  );
};

export default ConsoleOutput;
