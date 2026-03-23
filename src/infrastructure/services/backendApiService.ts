import { Profile, ResumeExtractionResponse } from '@/domain/entities/profile';
import { ProspectMessage } from '@/domain/entities/prospect_message';
import { Job } from '@/domain/entities/job';
import { Company } from '@/domain/entities/company';
import { Contact, ContactEntity } from '@/domain/entities/contact';
import { Task, InsertLeadsRequest } from '@/domain/entities/task';
import { Campaign, CampaignEntity, CampaignMessage, CampaignResult } from '@/domain/entities/campaign';
import { ConfigRepository } from '@/infrastructure/services/configRepository';

/**
 * Response type for reset all data operation
 */
export interface ResetDataResponse {
  result: string;
}

/**
 * Service class for handling backend API calls
 * Provides methods for profile and leads operations
 */
export class BackendApiService {

  private readonly config = new ConfigRepository().getConfig();

  /**
   * Get user profile from backend
   */
  async getProfile(): Promise<{ data: any }> {
    const response = await fetch(`${(await this.config).backendUrl}/prospectio/rest/v1/profile`);
    if (!response.ok) throw new Error('Failed to fetch profile');
    const data = await response.json();
    return { data };
  }

  /**
   * Upsert user profile to backend
   */
  async upsertProfile(profile: Profile): Promise<{ data: any }> {
    const response = await fetch(`${(await this.config).backendUrl}/prospectio/rest/v1/profile/upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    const data = await response.json();
    return { data };
  }

  /**
   * Get leads from backend by type with pagination
   */
  async getLeads(type: string, offset: number, limit: number): Promise<(Job | Company | Contact)[]> {
    const response = await fetch(`${(await this.config).backendUrl}/prospectio/rest/v1/leads/${type}/${offset}/${limit}`);
    if (!response.ok) throw new Error(`Failed to fetch ${type}`);
    const data = await response.json();
    
    switch (type) {
      case 'jobs':
        return data.jobs as Job[];
      case 'companies':
        return data.companies as Company[];
      case 'contacts':
        return data.contacts as Contact[];
      default:
        throw new Error('Invalid type');
    }
  }

  /**
   * Generate prospect message for a specific ID
   */
  async generateMessage(id: string): Promise<ProspectMessage> {
    const response = await fetch(`${(await this.config).backendUrl}/prospectio/rest/v1/generate/message/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/event-stream',
      },
    });
    if (!response.ok) throw new Error('Failed to generate message');
    const data = await response.json();
    return data as ProspectMessage;
  }

  /**
   * Upload resume PDF to extract profile information
   * @param file - The PDF file to upload
   * @returns Extracted profile data and raw text from the resume
   */
  async uploadResume(file: File): Promise<ResumeExtractionResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${(await this.config).backendUrl}/prospectio/rest/v1/profile/upload-resume`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to upload resume' }));
      throw new Error(errorData.detail || 'Failed to upload resume');
    }

    const data = await response.json();
    return data as ResumeExtractionResponse;
  }

  /**
   * Insert leads by triggering a background search task
   * @param request - The search parameters including source, location, and job params
   * @returns Task object with task_id to poll for status
   */
  async insertLeads(request: InsertLeadsRequest): Promise<Task> {
    const response = await fetch(`${(await this.config).backendUrl}/prospectio/rest/v1/insert/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to start lead search' }));
      throw new Error(errorData.detail || 'Failed to start lead search');
    }

    const data = await response.json();
    return data as Task;
  }

  /**
   * Get the status of a background task
   * @param taskId - The task ID to check
   * @returns Task object with current status
   */
  async getTaskStatus(taskId: string): Promise<Task> {
    const response = await fetch(`${(await this.config).backendUrl}/prospectio/rest/v1/task/${taskId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to get task status' }));
      throw new Error(errorData.detail || 'Failed to get task status');
    }

    const data = await response.json();
    return data as Task;
  }

  /**
   * Generate campaign messages for all contacts
   * @returns Task object with task_id to poll for status
   */
  async generateCampaign(): Promise<Task> {
    const response = await fetch(`${(await this.config).backendUrl}/prospectio/rest/v1/generate/campaign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to start campaign generation' }));
      throw new Error(errorData.detail || 'Failed to start campaign generation');
    }

    const data = await response.json();
    return data as Task;
  }

  /**
   * Get the campaign result after generation is complete
   * @param taskId - The task ID from campaign generation
   * @returns CampaignResult with all generated messages
   */
  async getCampaignResult(taskId: string): Promise<CampaignResult> {
    const response = await fetch(`${(await this.config).backendUrl}/prospectio/rest/v1/campaign/result/${taskId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to get campaign result' }));
      throw new Error(errorData.detail || 'Failed to get campaign result');
    }

    const data = await response.json();
    return data as CampaignResult;
  }

  /**
   * Reset all user data including profile, contacts, jobs, and companies
   * @returns Object containing counts of deleted items
   */
  async resetAllData(): Promise<ResetDataResponse> {
    const response = await fetch(`${(await this.config).backendUrl}/prospectio/rest/v1/profile/reset`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to reset data' }));
      throw new Error(errorData.detail || 'Failed to reset data');
    }

    const data = await response.json();
    return data as ResetDataResponse;
  }

  /**
   * Get all campaigns with pagination
   * @param offset - Starting index for pagination
   * @param limit - Number of campaigns to retrieve
   * @returns CampaignEntity with campaigns list and pages count
   */
  async getCampaigns(offset: number, limit: number): Promise<CampaignEntity> {
    const response = await fetch(`${(await this.config).backendUrl}/prospectio/rest/v1/campaigns/${offset}/${limit}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch campaigns' }));
      throw new Error(errorData.detail || 'Failed to fetch campaigns');
    }

    const data = await response.json();
    return data as CampaignEntity;
  }

  /**
   * Get a specific campaign by ID
   * @param campaignId - The campaign ID to retrieve
   * @returns Campaign details
   */
  async getCampaign(campaignId: string): Promise<Campaign> {
    const response = await fetch(`${(await this.config).backendUrl}/prospectio/rest/v1/campaigns/${campaignId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch campaign' }));
      throw new Error(errorData.detail || 'Failed to fetch campaign');
    }

    const data = await response.json();
    return data as Campaign;
  }

  /**
   * Get messages for a specific campaign with pagination
   * @param campaignId - The campaign ID
   * @param offset - Starting index for pagination
   * @param limit - Number of messages to retrieve
   * @returns Array of CampaignMessage
   */
  async getCampaignMessages(campaignId: string, offset: number, limit: number): Promise<CampaignMessage[]> {
    const response = await fetch(`${(await this.config).backendUrl}/prospectio/rest/v1/campaigns/${campaignId}/messages/${offset}/${limit}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch campaign messages' }));
      throw new Error(errorData.detail || 'Failed to fetch campaign messages');
    }

    const data = await response.json();
    return data as CampaignMessage[];
  }

  /**
   * Get contacts that don't have any messages (new contacts)
   * @param offset - Starting index for pagination
   * @param limit - Number of contacts to retrieve
   * @returns ContactEntity with contacts list and pages count
   */
  async getNewContacts(offset: number, limit: number): Promise<ContactEntity> {
    const response = await fetch(`${(await this.config).backendUrl}/prospectio/rest/v1/contacts/new/${offset}/${limit}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch new contacts' }));
      throw new Error(errorData.detail || 'Failed to fetch new contacts');
    }

    const data = await response.json();
    return data as ContactEntity;
  }

  /**
   * Get currently running tasks, optionally filtered by task type
   * @param taskType - Optional filter for task type ('insert_leads' or 'generate_campaign')
   * @returns Array of running Task objects
   */
  async getRunningTasks(taskType?: 'insert_leads' | 'generate_campaign'): Promise<Task[]> {
    const url = new URL(`${(await this.config).backendUrl}/prospectio/rest/v1/tasks/running`);
    if (taskType) {
      url.searchParams.append('task_type', taskType);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch running tasks' }));
      throw new Error(errorData.detail || 'Failed to fetch running tasks');
    }

    const data = await response.json();
    return data as Task[];
  }

  /**
   * Get the SSE stream URL for retrying failed campaign messages
   * @param campaignId - The campaign ID to retry
   * @returns Full URL for the retry stream endpoint
   */
  async getRetryCampaignStreamUrl(campaignId: string): Promise<string> {
    return `${(await this.config).backendUrl}/prospectio/rest/v1/campaigns/${campaignId}/retry/stream`;
  }

  /**
   * Generate campaign messages for all new contacts with a specific campaign name
   * @param name - The name for the new campaign
   * @returns Task object with task_id to poll for status
   */
  async generateCampaignWithName(name: string): Promise<Task> {
    const response = await fetch(`${(await this.config).backendUrl}/prospectio/rest/v1/generate/campaign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to start campaign generation' }));
      throw new Error(errorData.detail || 'Failed to start campaign generation');
    }

    const data = await response.json();
    return data as Task;
  }
}