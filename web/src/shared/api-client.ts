// API Client for BrewedAt - Shared between Admin and Public sites

const API_BASE_URL = '/brewedat/api';

// ============================================================================
// TYPES
// ============================================================================

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  brewery?: string;
  breweryLogo?: string;
  eventType?: string;
  imageUrl?: string;
  externalUrl?: string;
  featured: number;
  createdAt: string;
  updatedAt: string;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  description?: string;
  publishDate: string;
  duration?: string;
  audioUrl?: string;
  imageUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  youtubeUrl?: string;
  featured: number;
  createdAt: string;
  updatedAt: string;
}

export interface Raffle {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  prizeDetails?: string;
  rules?: string;
  active: number;
  winnerAnnounced: number;
  createdAt: string;
  updatedAt: string;
}

export interface RaffleEntry {
  id: string;
  raffleId: string;
  email: string;
  name?: string;
  phone?: string;
  submittedAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  audienceType?: string;
  submittedAt: string;
}

export interface SiteConfig {
  [key: string]: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async verifyToken(): Promise<ApiResponse<any>> {
    return this.request('/auth/verify');
  }

  logout() {
    this.setToken(null);
  }

  // ============================================================================
  // EVENTS
  // ============================================================================

  async getEvents(params?: { featured?: boolean; limit?: number; offset?: number }): Promise<ApiResponse<Event[]>> {
    const queryParams = new URLSearchParams();
    if (params?.featured !== undefined) queryParams.set('featured', params.featured.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());

    const query = queryParams.toString();
    return this.request<Event[]>(`/events${query ? `?${query}` : ''}`);
  }

  async getEvent(id: string): Promise<ApiResponse<Event>> {
    return this.request<Event>(`/events/${id}`);
  }

  async createEvent(event: Partial<Event>): Promise<ApiResponse<Event>> {
    return this.request<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<ApiResponse<Event>> {
    return this.request<Event>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  }

  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadEventImage(id: string, file: File): Promise<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append('image', file);

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/events/${id}/image`, {
        method: 'POST',
        headers,
        body: formData,
      });

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  }

  // ============================================================================
  // PODCAST EPISODES
  // ============================================================================

  async getPodcastEpisodes(params?: { featured?: boolean; limit?: number; offset?: number }): Promise<ApiResponse<PodcastEpisode[]>> {
    const queryParams = new URLSearchParams();
    if (params?.featured !== undefined) queryParams.set('featured', params.featured.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());

    const query = queryParams.toString();
    return this.request<PodcastEpisode[]>(`/podcast${query ? `?${query}` : ''}`);
  }

  async getPodcastEpisode(id: string): Promise<ApiResponse<PodcastEpisode>> {
    return this.request<PodcastEpisode>(`/podcast/${id}`);
  }

  async createPodcastEpisode(episode: Partial<PodcastEpisode>): Promise<ApiResponse<PodcastEpisode>> {
    return this.request<PodcastEpisode>('/podcast', {
      method: 'POST',
      body: JSON.stringify(episode),
    });
  }

  async updatePodcastEpisode(id: string, episode: Partial<PodcastEpisode>): Promise<ApiResponse<PodcastEpisode>> {
    return this.request<PodcastEpisode>(`/podcast/${id}`, {
      method: 'PUT',
      body: JSON.stringify(episode),
    });
  }

  async deletePodcastEpisode(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/podcast/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadPodcastImage(id: string, file: File): Promise<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append('image', file);

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/podcast/${id}/image`, {
        method: 'POST',
        headers,
        body: formData,
      });

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  }

  // ============================================================================
  // RAFFLES
  // ============================================================================

  async getRaffles(params?: { active?: boolean; limit?: number; offset?: number }): Promise<ApiResponse<Raffle[]>> {
    const queryParams = new URLSearchParams();
    if (params?.active !== undefined) queryParams.set('active', params.active.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());

    const query = queryParams.toString();
    return this.request<Raffle[]>(`/raffles${query ? `?${query}` : ''}`);
  }

  async getRaffle(id: string): Promise<ApiResponse<Raffle>> {
    return this.request<Raffle>(`/raffles/${id}`);
  }

  async createRaffle(raffle: Partial<Raffle>): Promise<ApiResponse<Raffle>> {
    return this.request<Raffle>('/raffles', {
      method: 'POST',
      body: JSON.stringify(raffle),
    });
  }

  async updateRaffle(id: string, raffle: Partial<Raffle>): Promise<ApiResponse<Raffle>> {
    return this.request<Raffle>(`/raffles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(raffle),
    });
  }

  async deleteRaffle(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/raffles/${id}`, {
      method: 'DELETE',
    });
  }

  async enterRaffle(raffleId: string, entry: { email: string; name?: string; phone?: string }): Promise<ApiResponse<RaffleEntry>> {
    return this.request<RaffleEntry>(`/raffles/${raffleId}/enter`, {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async getRaffleEntries(raffleId: string): Promise<ApiResponse<RaffleEntry[]>> {
    return this.request<RaffleEntry[]>(`/raffles/${raffleId}/entries`);
  }

  // ============================================================================
  // CONTACT
  // ============================================================================

  async submitContact(contact: { name: string; email: string; message: string; audienceType?: string }): Promise<ApiResponse<ContactSubmission>> {
    return this.request<ContactSubmission>('/contact', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
  }

  async getContactSubmissions(params?: { limit?: number; offset?: number }): Promise<ApiResponse<ContactSubmission[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());

    const query = queryParams.toString();
    return this.request<ContactSubmission[]>(`/contact${query ? `?${query}` : ''}`);
  }

  async deleteContactSubmission(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/contact/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // SITE CONFIG
  // ============================================================================

  async getSiteConfig(): Promise<ApiResponse<SiteConfig>> {
    return this.request<SiteConfig>('/config');
  }

  async getConfigValue(key: string): Promise<ApiResponse<{ key: string; value: string; updatedAt: string }>> {
    return this.request<{ key: string; value: string; updatedAt: string }>(`/config/${key}`);
  }

  async setConfigValue(key: string, value: string): Promise<ApiResponse<{ key: string; value: string; updatedAt: string }>> {
    return this.request<{ key: string; value: string; updatedAt: string }>(`/config/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
