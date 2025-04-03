
import { CACHE_KEYS, loadFromStorage, saveToStorage } from './storage';

// 북마크를 위한 스토리지 키
export const BOOKMARK_STORAGE_KEY = 'job-bookmarks';

// 채용 정보 북마크 인터페이스
export interface BookmarkedJob {
  id: number;
  score: number;
  reason?: string;
  strength?: string;
  weakness?: string;
  apply_yn: number;
  companyName: string;
  jobTitle: string;
  jobLocation: string;
  companyType: string;
  url: string;
  bookmarkedAt: string; // 북마크 저장 시간
  deadline?: string;
  isApplied?: number;
  isGptChecked?: number;
  matchScore?: number;
  createdAt?: string;
  jobSalary?: string;
  jobType?: string;
  employmentType?: string;
}

/**
 * 모든 북마크된 채용 정보를 가져옵니다.
 */
export function getBookmarkedJobs(): BookmarkedJob[] {
  const bookmarks = localStorage.getItem(BOOKMARK_STORAGE_KEY);
  if (!bookmarks) return [];
  
  try {
    return JSON.parse(bookmarks);
  } catch (error) {
    console.error('북마크 parsing 오류:', error);
    return [];
  }
}

/**
 * 채용 정보가 북마크되어 있는지 확인합니다.
 */
export function isJobBookmarked(jobId: number): boolean {
  const bookmarks = getBookmarkedJobs();
  return bookmarks.some(job => job.id === jobId);
}

/**
 * 채용 정보를 북마크에 추가합니다.
 */
export function addBookmark(job: BookmarkedJob): boolean {
  const bookmarks = getBookmarkedJobs();
  
  // 이미 북마크되어 있는지 확인
  if (bookmarks.some(item => item.id === job.id)) {
    return false; // 이미 북마크됨
  }
  
  // 북마크 시간 추가
  const jobWithTimestamp = {
    ...job,
    bookmarkedAt: new Date().toISOString()
  };
  
  // 북마크 목록에 추가
  const updatedBookmarks = [...bookmarks, jobWithTimestamp];
  localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(updatedBookmarks));
  
  return true;
}

/**
 * 북마크에서 채용 정보를 제거합니다.
 */
export function removeBookmark(jobId: number): boolean {
  const bookmarks = getBookmarkedJobs();
  const updatedBookmarks = bookmarks.filter(job => job.id !== jobId);
  
  if (updatedBookmarks.length === bookmarks.length) {
    return false; // 변경 없음
  }
  
  localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(updatedBookmarks));
  return true;
}

/**
 * 북마크 상태를 토글합니다. 이미 북마크되어 있으면 제거하고, 아니면 추가합니다.
 */
export function toggleBookmark(job: BookmarkedJob): boolean {
  if (isJobBookmarked(job.id)) {
    return removeBookmark(job.id);
  } else {
    return addBookmark(job);
  }
}

/**
 * 모든 북마크를 삭제합니다.
 */
export function clearAllBookmarks(): void {
  localStorage.removeItem(BOOKMARK_STORAGE_KEY);
}
