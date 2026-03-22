/**
 * Progress information for a task
 */
export interface TaskProgress {
  current: number;
  total: number;
  percentage: number;
}

/**
 * Task entity representing an asynchronous job in the system
 */
export interface Task {
  task_id: string;
  message: string;
  status: 'pending' | 'processing' | 'in_progress' | 'completed' | 'failed' | 'unknown';
  task_type?: 'insert_leads' | 'generate_campaign' | (string & Record<never, never>);
  progress?: TaskProgress;
  error_details?: string;
  result?: unknown;
  created_at?: string;
  updated_at?: string;
  started_at?: string;
  completed_at?: string;
}

/**
 * Request payload for inserting leads based on profile criteria
 */
export interface InsertLeadsRequest {
  source: string;
  location: string;
  job_params: string[];
}
