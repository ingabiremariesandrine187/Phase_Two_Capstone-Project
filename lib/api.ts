const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

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

  console.log('🔍 API Request to:', url); // ADDED DEBUG
  console.log('🔍 API Request config:', { // ADDED DEBUG
    method: config.method,
    headers: config.headers,
    hasBody: !!config.body
  });

  try {
    const response = await fetch(url, config);
    
    console.log('🔍 API Response status:', response.status, response.statusText); // ADDED DEBUG
    
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
      
      console.log(' API Error:', errorData); // ADDED DEBUG
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    console.error(' API Request failed:', error.message); // ADDED DEBUG
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
    return apiRequest('/api/auth/posts', { 
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

    return apiRequest(`/api/auth/posts?${params.toString()}`);
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
    return apiRequest('/api/auth/posts', {
      method: 'PUT',
      body: JSON.stringify({ ...postData, postId, userId }),
    });
  },

  // Delete post
  async deletePost(postId: string, userId: string) {
    return apiRequest(`/api/auth/posts?postId=${postId}&userId=${userId}`, {
      method: 'DELETE',
    });
  },

  // Get current user's posts
  async getUserPosts(userId?: string, published?: boolean) {
    const params = new URLSearchParams();
    if (published !== undefined) params.append('published', published.toString());
    if (userId) params.append('author', userId);
    
    return apiRequest(`/api/auth/posts/user?${params.toString()}`);
  },
};

// Comments API - ADDED SECTION
export const commentsAPI = {
  async getComments(identifier: string): Promise<{ comments: any[] }> {
    return apiRequest(`/api/posts/${identifier}/comments`);
  },

  async createComment(identifier: string, content: string, userId: string) {
    return apiRequest(`/api/posts/${identifier}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, userId }),
    });
  },

  async deleteComment(commentId: string, userId: string) {
    return apiRequest(`/api/comments/${commentId}`, {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    });
  },
};

// Social API - ADDED SECTION
export const socialAPI = {
  async getLikes(identifier: string, userId?: string): Promise<{ likes: number; isLiked: boolean }> {
    // identifier can be slug or postId
    const url = userId 
      ? `/api/posts/${identifier}/likes?userId=${userId}`
      : `/api/posts/${identifier}/likes`;
    return apiRequest(url);
  },

  async likePost(identifier: string, userId: string) {
    // identifier can be slug or postId
    return apiRequest(`/api/posts/${identifier}/likes`, {
      method: 'POST',
      body: JSON.stringify({ userId, action: 'like' }),
    });
  },

  async unlikePost(identifier: string, userId: string) {
    // identifier can be slug or postId
    return apiRequest(`/api/posts/${identifier}/likes`, {
      method: 'POST',
      body: JSON.stringify({ userId, action: 'unlike' }),
    });
  },

  async followUser(targetUserId: string, currentUserId: string) {
    return apiRequest(`/api/users/${targetUserId}/follow`, {
      method: 'POST',
      body: JSON.stringify({ currentUserId }),
    });
  },

  async unfollowUser(targetUserId: string, currentUserId: string) {
    return apiRequest(`/api/users/${targetUserId}/unfollow`, {
      method: 'POST',
      body: JSON.stringify({ currentUserId }),
    });
  },
};

export const uploadAPI = {
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const url = '/api/auth/upload';

    console.log('🔍 Upload API Request to:', url); // ADDED DEBUG

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      console.log('🔍 Upload API Response status:', response.status, response.statusText); // ADDED DEBUG

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
      console.error(' Upload API Request failed:', error.message); // ADDED DEBUG
      throw new Error(`Upload network error: ${error.message}`);
    }
  },
};