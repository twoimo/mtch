
export interface Job {
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
  deadline?: string;
}

export interface JobListProps {
  jobs: Job[];
  isLoading?: boolean;
  hideExpired?: boolean;
  onToggleHideExpired?: (hide: boolean) => void;
  title?: string;
  onOpenFilters?: () => void;
}
