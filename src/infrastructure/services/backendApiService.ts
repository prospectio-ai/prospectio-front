import { Profile } from '@/domain/entities/profile';
import { ProspectMessage } from '@/domain/entities/prospect_message';
import { Job } from '@/domain/entities/job';
import { Company } from '@/domain/entities/company';
import { Contact } from '@/domain/entities/contact';
import { ConfigRepository } from '@/infrastructure/services/configRepository';

/**
 * Service class for handling backend API calls
 * Provides methods for profile and leads operations
 */
export class BackendApiService {

  private readonly config = new ConfigRepository().getConfig();

  constructor() {}

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
}