const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        try {
          const errorText = await response.text();
          errorData = { error: errorText || `HTTP error! status: ${response.status}` };
        } catch {
          errorData = { error: `HTTP error! status: ${response.status}` };
        }
      }
      
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    throw new Error(`Network error: ${error.message}`);
  }
}

// Auth API functions
export const authAPI = {
  async signup(name: string, email: string, password: string) {
    return apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async login(email: string, password: string) {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getProfile(token?: string) {
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return apiRequest('/api/auth/profile', {
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
    
    return apiRequest('/api/auth/profile', {
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
  }, userId: string) {
    return apiRequest('/api/posts', { 
      method: 'POST',
      body: JSON.stringify({ ...postData, userId }),
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

  // Update post
  async updatePost(
    postId: string,
    userId: string,
    postData: {
      title?: string;
      content?: string;
      excerpt?: string;
      coverImage?: string;
      tags?: string[];
      published?: boolean;
    }
  ) {
    return apiRequest('/api/posts', {
      method: 'PUT',
      body: JSON.stringify({ ...postData, postId, userId }),
    });
  },

  // Delete post
  async deletePost(postId: string, userId: string) {
    return apiRequest(`/api/posts?postId=${postId}&userId=${userId}`, {
      method: 'DELETE',
    });
  },

  // Get current user's posts
  async getUserPosts(userId?: string, published?: boolean) {
    const params = new URLSearchParams();
    if (published !== undefined) params.append('published', published.toString());
    if (userId) params.append('author', userId);
    
    return apiRequest(`/api/posts?${params.toString()}`);
  },
};

export const uploadAPI = {
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const url = '/api/upload';

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `Upload failed! status: ${response.status}` };
        }
        throw new Error(errorData.error || `Upload failed! status: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      throw new Error(`Upload network error: ${error.message}`);
    }
  },
};