import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Terminal } from 'lucide-react';

interface ConsoleOutputProps {
  title: string;
  data: unknown;
}

// 콘솔 출력을 웹 페이지에 표시하는 컴포넌트
const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ title, data }) => {
  const formatOutput = (data: unknown): string => {
    if (data === null || data === undefined) return '데이터 없음';
    
    if (typeof data === 'string') return data;
    
    return JSON.stringify(data, null, 2);
  };

  return (
    <Card className="mb-4 bg-slate-50 shadow-md border-l-4 border-l-blue-500 overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-2 flex flex-row items-center">
        <Terminal className="h-5 w-5 text-blue-500 mr-2" />
        <CardTitle className="text-md font-medium text-blue-700">{title}</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <pre className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-x-auto max-h-[400px] text-sm shadow-inner">
          {formatOutput(data)}
        </pre>
      </CardContent>
    </Card>
  );
};

export default ConsoleOutput;
