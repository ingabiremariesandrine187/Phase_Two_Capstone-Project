const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('[API] Request:', options.method || 'GET', url);
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Add this for session cookies
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    console.log('[API] Response:', response.status, response.statusText);
    
    if (!response.ok) {
      let errorData;
      let errorText = '';
      
      try {
        errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch {
        try {
          errorText = await response.text();
          errorData = { error: errorText || `HTTP error! status: ${response.status}` };
        } catch {
          errorData = { error: `HTTP error! status: ${response.status}` };
        }
      }
      
      // Simplified error logging - log each property separately
      console.error('[API] Error Status:', response.status);
      console.error('[API] Error Status Text:', response.statusText);
      console.error('[API] Error URL:', url);
      console.error('[API] Error Data:', errorData);
      
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    console.error('[API] Network Error URL:', url);
    console.error('[API] Network Error Message:', error.message);
    console.error('[API] Network Error Type:', error.name);
    
    throw new Error(`Network error: ${error.message}`);
  }
}

// Auth API functions
export const authAPI = {
  async signup(name: string, email: string, password: string) {
    return apiRequest('/api/auth/signup', { // Changed from /auth/signup to /api/auth/signup
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async login(email: string, password: string) {
    return apiRequest('/api/auth/login', { // Changed from /auth/login to /api/auth/login
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getProfile(token?: string) {
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return apiRequest('/api/auth/profile', { // Changed from /auth/profile to /api/auth/profile
      method: 'GET',
      headers,
    });
  },

  async updateProfile(data: { name?: string; bio?: string; avatar?: string }, token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return apiRequest('/api/auth/profile', { // Changed from /auth/profile to /api/auth/profile
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
  },
};

// Posts API functions
export const postsAPI = {
  // Create new post
  async createPost(postData: {
    title: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    tags: string[];
    published: boolean;
  }, userId?: string) {
    // If userId is not provided, try to get it from session
    let finalUserId = userId;
    if (!finalUserId) {
      try {
        const { useSession } = await import('next-auth/react');
        // Note: This won't work from within a server-side context
        // The userId must be passed from the client component
        console.warn('[Posts API] userId not provided to createPost');
      } catch (e) {
        // Silently fail - userId should be provided
      }
    }

    return apiRequest('/api/posts', { 
      method: 'POST',
      body: JSON.stringify({ ...postData, userId: finalUserId }),
    });
  },

  // Get posts with pagination and filters
  async getPosts(options?: {
    page?: number;
    limit?: number;
    tag?: string;
    author?: string;
    published?: boolean;
  }) {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.tag) params.append('tag', options.tag);
    if (options?.author) params.append('author', options.author);
    if (options?.published !== undefined) params.append('published', options.published.toString());

    return apiRequest(`/api/posts?${params.toString()}`); // This is correct
  },

  // Get single post by slug
  async getPost(slug: string) {
    return apiRequest(`/api/posts/${slug}`); // This is correct
  },

  // Get current user's posts
  async getUserPosts(published?: boolean) {
    const params = new URLSearchParams();
    if (published !== undefined) params.append('published', published.toString());
    
    return apiRequest(`/api/posts/user?${params.toString()}`); // This is correct
  },
};

export const uploadAPI = {
  // Upload image
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const url = '/api/upload'; // This is correct
    console.log('[Upload] API Request: POST', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include', // Add this for session cookies
      });

      console.log('[Upload] API Response:', response.status, response.statusText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          try {
            const errorText = await response.text();
            errorData = { error: errorText || `Upload failed! status: ${response.status}` };
          } catch {
            errorData = { error: `Upload failed! status: ${response.status}` };
          }
        }
        
        console.error('[Upload] Error Status:', response.status);
        console.error('[Upload] Error Status Text:', response.statusText);
        console.error('[Upload] Error Data:', errorData);
        
        throw new Error(errorData.error || `Upload failed! status: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      console.error('[Upload] Network Error:', error.message);
      
      throw new Error(`Upload network error: ${error.message}`);
    }
  },
};