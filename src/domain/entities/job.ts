export interface Job {
  id?: string;
  company_id?: string;
  company_name?: string;
  date_creation?: string;
  description?: string;
  job_title?: string;
  location?: string;
  salary?: string;
  job_seniority?: string;
  job_type?: string;
  sectors?: string;
  apply_url?: string[];
  compatibility_score?: number;
}