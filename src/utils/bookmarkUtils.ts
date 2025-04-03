// Define more specific types instead of using any

// Base interface with common properties
interface BaseJob {
  id: number;
  score: number;
  reason?: string;
  strength?: string;
  weakness?: string;
  apply_yn?: number;
  companyName: string;
  jobTitle: string;
  jobLocation?: string;
  companyType?: string;
  url: string;
  deadline?: string;
  matchScore?: number;
  isApplied?: number;
  isRecommended?: number;
  jobType?: string;
  jobSalary?: string;
  employmentType?: string;
  createdAt?: string;
  isGptChecked?: number;
  salary?: string;
  experience?: string;
  education?: string;
  position?: string;
  required_skills?: string[];
  preferred_skills?: string[];
}

// Define the BookmarkedJob type
export interface BookmarkedJob extends BaseJob {
  bookmarkedAt: string;
  // Allow additional properties that may be added during runtime
  [key: string]: unknown;
}

// Job type for adding bookmarks
export interface Job extends BaseJob {
  // Allow additional properties that may be added during runtime
  [key: string]: unknown;
}

// Add this constant at the top
export const BOOKMARK_KEY = 'saramin-bookmarked-jobs';

/**
 * 북마크 추가
 */
export const addBookmark = (job: Job): boolean => {
  // 이미 북마크된 경우 추가하지 않음
  if (isBookmarked(job.id)) {
    return false;
  }
  
  // 신규 북마크 추가
  const bookmarks = getBookmarkedJobs();
  const newBookmark: BookmarkedJob = {
    ...job,
    bookmarkedAt: new Date().toISOString()
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

/**
 * 북마크 토글 (추가/제거)
 */
export const toggleBookmark = (job: Job): boolean => {
  if (isBookmarked(job.id)) {
    return removeBookmark(job.id);
  } else {
    return addBookmark(job);
  }
};

/**
 * 모든 북마크 삭제
 */
export const clearAllBookmarks = (): void => {
  localStorage.removeItem(BOOKMARK_KEY);
  window.dispatchEvent(new CustomEvent('bookmarks-changed'));
};
