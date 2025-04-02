
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Trash2 } from 'lucide-react';

// Cache Key Constants
const CACHE_KEYS = {
  RECOMMENDED_JOBS: 'recommended-jobs-cache',
  TEST_RESULT: 'test-result-cache',
  AUTO_MATCHING: 'auto-matching-cache',
  APPLY_RESULT: 'apply-result-cache',
  SCROLL_POSITION: 'job-list-scroll-position',
  SORT_ORDER: 'job-list-sort-order'
};

interface CacheItem {
  key: string;
  exists: boolean;
  size: number;
  valid: boolean;
  age: string;
  expired: boolean;
}

interface CacheDebuggerProps {
  onClearCache: () => void;
}

export function CacheDebugger({ onClearCache }: CacheDebuggerProps) {
  const [cacheStatus, setCacheStatus] = useState<CacheItem[]>([]);
  
  const checkCache = React.useCallback(() => {
    try {
      const keys = Object.values(CACHE_KEYS);
      const status = keys.map(key => {
        const item = localStorage.getItem(key);
        let parsedData = null;
        let isValid = false;
        let age = null;
        let expired = false;
        
        try {
          if (item) {
            if (key === CACHE_KEYS.SCROLL_POSITION || key === CACHE_KEYS.SORT_ORDER) {
              // 단순 값 캐시는 항상 유효
              isValid = true;
              age = 'N/A';
              expired = false;
            } else {
              parsedData = JSON.parse(item);
              isValid = true;
              if (parsedData.timestamp) {
                age = Math.round((Date.now() - parsedData.timestamp) / 1000);
                // 30분 캐시 TTL 체크
                expired = Date.now() - parsedData.timestamp > 30 * 60 * 1000;
              }
            }
          }
        } catch (e) {
          // 파싱 실패
          console.error(`Cache parsing error for ${key}:`, e);
        }
        
        return {
          key,
          exists: !!item,
          size: item ? new Blob([item]).size : 0, // 정확한 바이트 크기 계산
          valid: isValid,
          age: age !== null ? `${age}초` : 'N/A',
          expired
        };
      });
      
      setCacheStatus(status);
    } catch (error) {
      console.error("Error checking cache:", error);
    }
  }, []);
  
  // 페이지 로드 시 캐시 확인
  useEffect(() => {
    checkCache();
    
    // 5초마다 자동 갱신
    const interval = setInterval(checkCache, 5000);
    return () => clearInterval(interval);
  }, [checkCache]);

  // 캐시 삭제 처리
  const handleClearCache = () => {
    onClearCache();
    setTimeout(checkCache, 100); // 캐시 상태 업데이트
  };

  return (
    <Card className="mb-6 border-dashed">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm text-muted-foreground">캐시 상태 디버거</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={checkCache}>
              <RefreshCw className="h-4 w-4 mr-1" /> 새로고침
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClearCache}>
              <Trash2 className="h-4 w-4 mr-1" /> 캐시 삭제
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>키</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>크기</TableHead>
              <TableHead>유효성</TableHead>
              <TableHead>경과 시간</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cacheStatus.map((item) => (
              <TableRow key={item.key}>
                <TableCell className="font-mono text-xs">{item.key}</TableCell>
                <TableCell>
                  <span className={item.exists ? "text-green-500" : "text-red-500"}>
                    {item.exists ? "존재함" : "없음"}
                  </span>
                </TableCell>
                <TableCell>{item.size} 바이트</TableCell>
                <TableCell>
                  <span className={item.valid ? "text-green-500" : "text-red-500"}>
                    {item.valid ? "유효" : "무효"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={item.expired ? "text-red-500" : ""}>
                    {item.age}
                    {item.expired && " (만료됨)"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {cacheStatus.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  캐시 정보가 없습니다
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
