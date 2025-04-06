
import { Job } from "@/types/job";

// Check if a job is expired
export const isJobExpired = (job: Job): boolean => {
  if (!job.deadline) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let deadlineDate: Date;
  if (job.deadline.includes('.')) {
    const [year, month, day] = job.deadline.split('.').map(num => parseInt(num));
    deadlineDate = new Date(year, month - 1, day);
  } else {
    deadlineDate = new Date(job.deadline);
  }
  
  return deadlineDate < today;
};

// Sort jobs based on different criteria
export const sortJobs = (
  jobsToSort: Job[], 
  order: 'score' | 'apply' | 'deadline' | 'recent'
): Job[] => {
  if (order === 'score') {
    return [...jobsToSort].sort((a, b) => b.score - a.score);
  } else if (order === 'apply') {
    return [...jobsToSort].sort((a, b) => {
      if (a.apply_yn !== b.apply_yn) {
        return b.apply_yn - a.apply_yn; // Show applicable jobs first
      }
      return b.score - a.score; // If same applicability, sort by score
    });
  } else if (order === 'deadline') {
    return [...jobsToSort].sort((a, b) => {
      // Process deadline dates for comparison
      const parseDate = (deadline?: string): Date => {
        if (!deadline) return new Date(9999, 11, 31); // Far future for items without deadline
        
        if (deadline.includes('.')) {
          const [year, month, day] = deadline.split('.').map(num => parseInt(num));
          return new Date(year, month - 1, day);
        } else {
          return new Date(deadline);
        }
      };
      
      const dateA = parseDate(a.deadline);
      const dateB = parseDate(b.deadline);
      
      // Sort by deadline (earliest first)
      return dateA.getTime() - dateB.getTime();
    });
  } else if (order === 'recent') {
    // Sort by most recently added (assuming id is sequential)
    return [...jobsToSort].sort((a, b) => b.id - a.id);
  }
  
  // Default sorting
  return [...jobsToSort];
};
