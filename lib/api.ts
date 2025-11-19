const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth API functions
export const authAPI = {
  async signup(name: string, email: string, password: string) {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async login(email: string, password: string) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getProfile(token?: string) {
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return apiRequest('/auth/profile', {
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
    
    return apiRequest('/auth/profile', {
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
  }) {
    return apiRequest('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
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

    return apiRequest(`/api/posts?${params.toString()}`);
  },

  // Get single post by slug
  async getPost(slug: string) {
    return apiRequest(`/api/posts/${slug}`);
  },

  // Get current user's posts
  async getUserPosts(published?: boolean) {
    const params = new URLSearchParams();
    if (published !== undefined) params.append('published', published.toString());
    
    return apiRequest(`/api/posts/user?${params.toString()}`);
  },
};

export const uploadAPI = {
  // Upload image
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || 'Upload failed');
    }

    return response.json();
  },
};