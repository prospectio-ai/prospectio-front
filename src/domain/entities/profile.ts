export interface Profile {
  job_title?: string;
  location?: string;
  bio?: string;
  work_experience?: WorkExperience[];
  technos?: string[];
}

export interface WorkExperience {
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  description?: string;
}