
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Trash2 } from 'lucide-react';

// Cache Key Constants - Consolidated in one place for reusability
export const CACHE_KEYS = {
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

/**
 * CacheDebugger - Displays and manages localStorage cache information
 * @param onClearCache Function to execute when clearing the cache
 */
export function CacheDebugger({ onClearCache }: CacheDebuggerProps) {
  const [cacheStatus, setCacheStatus] = useState<CacheItem[]>([]);
  
  // Improved cache checking with more explicit error handling
  const checkCache = React.useCallback(() => {
    try {
      const keys = Object.values(CACHE_KEYS);
      const status = keys.map(key => {
        const item = localStorage.getItem(key);
        let isValid = false;
        let age = null;
        let expired = false;
        
        try {
          if (item) {
            if (key === CACHE_KEYS.SCROLL_POSITION || key === CACHE_KEYS.SORT_ORDER) {
              // Simple value caches are always valid
              isValid = true;
              age = 'N/A';
              expired = false;
            } else {
              const parsedData = JSON.parse(item);
              isValid = true;
              
              if (parsedData.timestamp) {
                const secondsElapsed = Math.round((Date.now() - parsedData.timestamp) / 1000);
                age = `${secondsElapsed}초`;
                // Check 30 minute TTL
                expired = Date.now() - parsedData.timestamp > 30 * 60 * 1000;
              }
            }
          }
        } catch (e) {
          console.error(`Cache parsing error for ${key}:`, e);
        }
        
        return {
          key,
          exists: !!item,
          size: item ? new Blob([item]).size : 0, // Calculate exact byte size
          valid: isValid,
          age: age !== null ? age : 'N/A',
          expired
        };
      });
      
      setCacheStatus(status);
    } catch (error) {
      console.error("Error checking cache:", error);
    }
  }, []);
  
  // Check cache on page load
  useEffect(() => {
    checkCache();
    
    // Refresh every 5 seconds
    const interval = setInterval(checkCache, 5000);
    return () => clearInterval(interval);
  }, [checkCache]);

  // Handle cache clearing
  const handleClearCache = () => {
    onClearCache();
    setTimeout(checkCache, 100); // Update cache status after clearing
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
