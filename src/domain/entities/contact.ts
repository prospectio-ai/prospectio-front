export interface Contact {
  id?: string;
  company_id?: string;
  company_name?: string;
  job_id?: string;
  job_title?: string;
  name?: string;
  email?: string[];
  title?: string;
  phone?: string;
  profile_url?: string;
  /** Short description of the contact - AI-generated summary for list views */
  short_description?: string | null;
  /** Full biography of the contact - AI-generated detailed bio for detail views */
  full_bio?: string | null;
}

/**
 * Contact entity response with pagination info
 */
export interface ContactEntity {
  contacts: Contact[];
  pages: number;
}