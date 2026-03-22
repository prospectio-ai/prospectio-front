/**
 * Campaign status enum representing the possible states of a campaign
 */
export type CampaignStatus = 'draft' | 'in_progress' | 'completed' | 'failed';

/**
 * Campaign entity representing a prospect outreach campaign
 */
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  total_contacts: number;
  successful: number;
  failed: number;
}

/**
 * Campaign entity response with pagination info
 */
export interface CampaignEntity {
  campaigns: Campaign[];
  pages: number;
}

/**
 * Campaign message entity representing a generated prospect message
 */
export interface CampaignMessage {
  id?: string;
  campaign_id?: string;
  contact_id: string;
  contact_name?: string;
  contact_email?: string[];
  company_name?: string;
  subject: string;
  message: string;
  status: 'success' | 'skipped' | 'failed';
  error?: string;
  created_at?: string;
}

/**
 * Campaign result entity representing the outcome of a campaign generation
 */
export interface CampaignResult {
  total_contacts: number;
  successful: number;
  failed: number;
  messages: CampaignMessage[];
}
