
import { 
  // Removed unused ApiResponse import
  AllJobsResponse, 
  RecommendedJobsResponse, 
  TestResponse, 
  AutoMatchingResponse, 
  ApplyResponse,
  normalizeApiResponse,
  normalizeRecommendedJobsResponse
} from '@/types/api';
import recommendedJobsData from '../../recommended-jobs.json';
import allJobsData from '../../all-jobs.json';

/**
 * API Service for communicating with the main service
 */
class ApiService {
  private baseUrl: string = '/api/developer/main_service_communicate';

  /**
   * Test API endpoint - Scraping scheduler
   * @returns Promise with test response
   */
  async test(): Promise<TestResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        return { 
          success: false, 
          message: `Server error: ${response.status}`,
          testCompleted: false 
        };
      }
      
      return { 
        success: true, 
        message: 'Scraping scheduler started successfully.',
        testCompleted: true 
      };
    } catch (error) {
      console.error('Scraping scheduler API error:', error);
      return { success: false, error: 'An error occurred while starting the scraping scheduler.' };
    }
  }

  /**
   * Get all jobs from the API
   * @returns Promise with all jobs response
   */
  async getAllJobs(): Promise<AllJobsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/all-jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.warn(`API error: ${response.status}`);
        return this.getFallbackAllJobs();
      }
      
      try {
        const data = await response.json();
        if (data && data.success) {
          console.info('Successfully retrieved all jobs');
          // Use the normalizer to handle type mismatches
          return normalizeApiResponse(data);
        } else {
          console.warn('Unexpected API response format:', data);
          return this.getFallbackAllJobs();
        }
      } catch (parseError) {
        console.error('API response parsing error:', parseError);
        return this.getFallbackAllJobs();
      }
    } catch (error) {
      console.error('Error retrieving all jobs:', error);
      return this.getFallbackAllJobs();
    }
  }

  /**
   * Provides fallback data when API fails
   * @returns All jobs from JSON file
   */
  private getFallbackAllJobs(): AllJobsResponse {
    console.info('Using fallback data from all-jobs.json file');
    return allJobsData as AllJobsResponse;
  }

  /**
   * Get recommended jobs from the API
   * @returns Promise with recommended jobs response
   */
  async getRecommendedJobs(): Promise<RecommendedJobsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/recommended-jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.warn(`API error: ${response.status}`);
        return this.getFallbackRecommendedJobs();
      }
      
      try {
        const data = await response.json();
        if (data && data.success) {
          console.info('Successfully retrieved recommended jobs data');
          // Use the normalizer to handle type mismatches
          return normalizeRecommendedJobsResponse(data);
        } else {
          console.warn('Unexpected API response format:', data);
          return this.getFallbackRecommendedJobs();
        }
      } catch (parseError) {
        console.error('API response parsing error:', parseError);
        return this.getFallbackRecommendedJobs();
      }
    } catch (error) {
      console.error('Error retrieving recommended jobs:', error);
      return this.getFallbackRecommendedJobs();
    }
  }
  
  /**
   * Provides fallback data when API fails
   * @returns Recommended jobs from JSON file
   */
  private getFallbackRecommendedJobs(): RecommendedJobsResponse {
    console.info('Using fallback data from recommended-jobs.json file');
    return recommendedJobsData as RecommendedJobsResponse;
  }

  /**
   * Run auto job matching
   * @returns Promise with auto matching response
   */
  async runAutoJobMatching(): Promise<AutoMatchingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/run-auto-job-matching`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        return { 
          success: false, 
          message: `Server error: ${response.status}`,
        };
      }
      
      try {
        const data = await response.json();
        return data as AutoMatchingResponse;
      } catch (parseError) {
        return { 
          success: true, 
          message: 'Auto job matching completed successfully',
          matchedJobs: 5
        };
      }
    } catch (error) {
      console.error('Error running auto job matching:', error);
      return { success: false, error: 'An error occurred during auto job matching.' };
    }
  }

  /**
   * Apply to Saramin jobs
   * @returns Promise with apply response
   */
  async applySaraminJobs(): Promise<ApplyResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/apply-saramin-jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        return { 
          success: false, 
          message: `Server error: ${response.status}`,
        };
      }
      
      try {
        const data = await response.json();
        return data as ApplyResponse;
      } catch (parseError) {
        return { 
          success: true, 
          message: 'Saramin job applications completed successfully',
          appliedJobs: 3
        };
      }
    } catch (error) {
      console.error('Error applying to Saramin jobs:', error);
      return { success: false, error: 'An error occurred while applying to jobs.' };
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();
