
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { useToast } from '@/components/ui/use-toast';
import { useApiActions } from '@/hooks/useApiActions';
import { Bookmark, Command as CommandIcon, Search, BookmarkPlus } from 'lucide-react';
import { getBookmarkedJobs } from '@/utils/bookmarkUtils';
import { clearAllCache } from '@/utils/storage';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState(getBookmarkedJobs());
  
  // API 액션 함수들 가져오기
  const {
    handleTestApi,
    handleGetRecommendedJobs,
    handleRunAutoJobMatching,
    handleApplySaraminJobs,
  } = useApiActions();
  
  // 북마크 목록 가져오기
  const fetchBookmarks = useCallback(() => {
    setBookmarks(getBookmarkedJobs());
  }, []);
  
  // 컴포넌트 마운트 및 Palette 열릴 때 북마크 새로고침
  useEffect(() => {
    if (open) {
      fetchBookmarks();
    }
  }, [open, fetchBookmarks]);
  
  // 단축키 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K 또는 Command+K로 열기
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);
  
  const handleAction = (action: () => void, successMessage: string) => {
    onOpenChange(false);
    
    // 액션 실행
    action();
    
    // 성공 메시지 표시
    toast({
      title: "작업 실행",
      description: successMessage,
    });
  };
  
  const openBookmarkInTab = (url: string) => {
    window.open(url, '_blank');
    onOpenChange(false);
  };
  
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-lg border shadow-md">
        <CommandInput placeholder="명령어를 입력하거나 검색하세요..." />
        <CommandList>
          <CommandEmpty>검색 결과가 없습니다</CommandEmpty>
          
          {/* API 작업 명령어 */}
          <CommandGroup heading="API 작업">
            <CommandItem 
              onSelect={() => handleAction(handleTestApi, "사람인 API 테스트가 시작되었습니다.")}
            >
              <CommandIcon className="mr-2 h-4 w-4" />
              <span>사람인 API 테스트 실행</span>
            </CommandItem>
            
            <CommandItem 
              onSelect={() => handleAction(handleGetRecommendedJobs, "추천 채용 정보를 가져오는 중입니다.")}
            >
              <Search className="mr-2 h-4 w-4" />
              <span>추천 채용 정보 가져오기</span>
            </CommandItem>
            
            <CommandItem 
              onSelect={() => handleAction(handleRunAutoJobMatching, "자동 채용 매칭이 시작되었습니다.")}
            >
              <CommandIcon className="mr-2 h-4 w-4" />
              <span>자동 채용 매칭 실행</span>
            </CommandItem>
            
            <CommandItem 
              onSelect={() => handleAction(handleApplySaraminJobs, "채용 지원이 시작되었습니다.")}
            >
              <CommandIcon className="mr-2 h-4 w-4" />
              <span>채용 지원 시작</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          {/* 북마크된 채용 정보 */}
          <CommandGroup heading="북마크한 채용 정보">
            {bookmarks.length === 0 ? (
              <CommandItem disabled>
                <BookmarkPlus className="mr-2 h-4 w-4" />
                <span className="text-muted-foreground">북마크된 채용 정보가 없습니다</span>
              </CommandItem>
            ) : (
              bookmarks.map(job => (
                <CommandItem 
                  key={job.id}
                  onSelect={() => openBookmarkInTab(job.url)}
                >
                  <Bookmark className="mr-2 h-4 w-4" />
                  <span>{job.companyName} - {job.jobTitle}</span>
                </CommandItem>
              ))
            )}
          </CommandGroup>
          
          <CommandSeparator />
          
          {/* 유틸리티 명령어 */}
          <CommandGroup heading="유틸리티">
            <CommandItem 
              onSelect={() => {
                onOpenChange(false);
                clearAllCache();
                toast({
                  title: "캐시 삭제 완료",
                  description: "모든 캐시가 삭제되었습니다.",
                });
              }}
            >
              <CommandIcon className="mr-2 h-4 w-4" />
              <span>캐시 삭제하기</span>
            </CommandItem>
            
            <CommandItem 
              onSelect={() => {
                onOpenChange(false);
                navigate('/');
              }}
            >
              <CommandIcon className="mr-2 h-4 w-4" />
              <span>메인 페이지로 이동</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
};

export default CommandPalette;
