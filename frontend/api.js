// Production-Grade API Client with offline support, retry logic, and caching
class APIClient {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    this.token = localStorage.getItem('authToken');
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    this.cacheExpiryTime = 5 * 60 * 1000; // 5 minutes
    this.requestCache = new Map();
    this.isOnline = navigator.onLine;

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineRequests();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = `${options.method || 'GET'}:${url}`;

    // Return cached response if available and valid
    const cached = this.getCachedResponse(cacheKey);
    if (cached && options.method === 'GET' && this.isOnline === false) {
      return cached;
    }

    // Build request headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Retry logic
    let lastError;
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers
        });

        if (!response.ok) {
          // Token expired
          if (response.status === 401) {
            localStorage.removeItem('authToken');
            this.token = null;
            throw new Error('Session expired - please login again');
          }

          const errorData = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(errorData.error || `API Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Cache successful GET requests
        if (options.method === 'GET' || !options.method) {
          this.setCachedResponse(cacheKey, data);
        }

        return data;
      } catch (error) {
        lastError = error;

        // Don't retry if it's an auth error
        if (error.message.includes('Session expired')) {
          throw error;
        }

        // Don't retry if it's offline on first attempt
        if (!this.isOnline && attempt === 0) {
          throw new Error('No internet connection');
        }

        // Wait before retrying
        if (attempt < this.retryAttempts - 1) {
          await this.sleep(this.retryDelay * (attempt + 1));
        }
      }
    }

    throw lastError || new Error('Request failed');
  }

  // Caching methods
  getCachedResponse(key) {
    const cached = this.requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiryTime) {
      return cached.data;
    }
    if (cached) {
      this.requestCache.delete(key);
    }
    return null;
  }

  setCachedResponse(key, data) {
    this.requestCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.requestCache.clear();
  }

  // Helper methods
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async syncOfflineRequests() {
    // Sync pending offline requests
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-messages');
        await registration.sync.register('sync-rentals');
      } catch (err) {
        console.error('Sync registration failed:', err);
      }
    }
  }

  // Auth endpoints
  async register(username, email, password, fullName) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, fullName })
    });

    if (response.token) {
      localStorage.setItem('authToken', response.token);
      this.token = response.token;
    }

    return response;
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (response.token) {
      localStorage.setItem('authToken', response.token);
      this.token = response.token;
    }

    return response;
  }

  logout() {
    localStorage.removeItem('authToken');
    this.token = null;
    this.clearCache();
  }

  // Items endpoints
  async getItems(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/items?${params.toString()}`);
  }

  async getItem(id) {
    return this.request(`/items/${id}`);
  }

  async createItem(itemData) {
    return this.request('/items', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
  }

  // Rentals endpoints
  async createRental(rentalData) {
    return this.request('/rentals', {
      method: 'POST',
      body: JSON.stringify(rentalData)
    });
  }

  async getUserRentals(userId) {
    return this.request(`/rentals/user/${userId}`);
  }

  async updateRental(rentalId, status) {
    return this.request(`/rentals/${rentalId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // Messages endpoints
  async sendMessage(recipientId, content) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify({ recipientId, content })
    });
  }

  async getMessages(userId) {
    return this.request(`/messages/${userId}`);
  }

  // Reviews endpoints
  async submitReview(rentalId, rating, comment) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify({ rentalId, rating, comment })
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Create singleton instance
export const api = new APIClient();
export default api;
