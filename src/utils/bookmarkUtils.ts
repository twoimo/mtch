
// Define the BookmarkedJob type
export interface BookmarkedJob {
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
  salary?: string;
  deadline?: string;
  experience?: string;
  education?: string;
  position?: string;
  required_skills?: string[];
  preferred_skills?: string[];
  employmentType?: string;
  bookmarkedAt: Date;
}

const BOOKMARK_KEY = 'saramin-bookmarked-jobs';

/**
 * 북마크 추가
 */
export const addBookmark = (job: Omit<BookmarkedJob, 'bookmarkedAt'>) => {
  const bookmarks = getBookmarkedJobs();
  
  // 중복 체크
  if (bookmarks.some(bookmark => bookmark.id === job.id)) {
    return false;
  }
  
  // 북마크 추가 (현재 시간을 북마크 시간으로 저장)
  const newBookmark: BookmarkedJob = {
    ...job,
    bookmarkedAt: new Date()
  };
  
  bookmarks.push(newBookmark);
  saveBookmarks(bookmarks);
  
  // 북마크 변경 이벤트 발생
  window.dispatchEvent(new CustomEvent('bookmarks-changed'));
  
  return true;
};

/**
 * 북마크 제거
 */
export const removeBookmark = (jobId: number) => {
  const bookmarks = getBookmarkedJobs();
  const filteredBookmarks = bookmarks.filter(job => job.id !== jobId);
  
  if (filteredBookmarks.length !== bookmarks.length) {
    saveBookmarks(filteredBookmarks);
    
    // 북마크 변경 이벤트 발생
    window.dispatchEvent(new CustomEvent('bookmarks-changed'));
    
    return true;
  }
  
  return false;
};

/**
 * 북마크 저장
 */
export const saveBookmarks = (bookmarks: BookmarkedJob[]) => {
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks));
};

/**
 * 북마크 목록 가져오기
 */
export const getBookmarkedJobs = (): BookmarkedJob[] => {
  const bookmarksJson = localStorage.getItem(BOOKMARK_KEY);
  
  if (!bookmarksJson) {
    return [];
  }
  
  try {
    return JSON.parse(bookmarksJson);
  } catch (e) {
    console.error('북마크 데이터 파싱 오류:', e);
    return [];
  }
};

/**
 * 북마크 여부 확인
 */
export const isBookmarked = (jobId: number): boolean => {
  const bookmarks = getBookmarkedJobs();
  return bookmarks.some(job => job.id === jobId);
};
