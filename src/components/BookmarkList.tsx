
import React, { useState, useEffect } from 'react';
import { getBookmarkedJobs, BookmarkedJob, clearAllBookmarks } from '@/utils/bookmarkUtils';
import JobCard from './JobCard';
import { Bookmark, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const BookmarkList: React.FC = () => {
  const [bookmarkedJobs, setBookmarkedJobs] = useState<BookmarkedJob[]>([]);
  const { toast } = useToast();
  
  // 북마크 목록 가져오기
  const fetchBookmarks = () => {
    const bookmarks = getBookmarkedJobs();
    // 북마크 시간 기준으로 정렬
    bookmarks.sort((a, b) => new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime());
    setBookmarkedJobs(bookmarks);
  };
  
  // 모든 북마크 삭제
  const handleClearAllBookmarks = () => {
    clearAllBookmarks();
    setBookmarkedJobs([]);
    toast({
      title: "북마크 삭제 완료",
      description: "모든 북마크가 삭제되었습니다",
      variant: "default",
    });
  };
  
  // 컴포넌트 마운트 시 북마크 가져오기
  useEffect(() => {
    fetchBookmarks();
    
    // 스토리지 변경 이벤트 감지하여 북마크 목록 업데이트
    const handleStorageChange = () => {
      fetchBookmarks();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // 커스텀 이벤트 리스너 추가
    window.addEventListener('bookmarks-changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookmarks-changed', handleStorageChange);
    };
  }, []);
  
  if (bookmarkedJobs.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <Bookmark className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500" />
        <div className="text-gray-500 text-lg mt-4 dark:text-gray-400">북마크된 채용 정보가 없습니다</div>
        <div className="text-gray-400 text-sm mt-2 dark:text-gray-500">관심 있는 채용 정보를 북마크해보세요</div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-semibold">
          총 <span className="text-blue-600 dark:text-blue-400">{bookmarkedJobs.length}</span>개의 북마크
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-1" />
              전체 삭제
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>모든 북마크 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                정말로 모든 북마크를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearAllBookmarks}>삭제</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <div className="grid gap-4 grid-cols-1">
        {bookmarkedJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};

export default BookmarkList;
