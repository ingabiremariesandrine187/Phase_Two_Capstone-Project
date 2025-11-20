'use client';

import { useState, useEffect } from 'react';
import { postsAPI } from '@/lib/api';
import PostCard from '../../components/posts/postCard';

interface PostsListProps {
  filters?: {
    tag?: string;
    author?: string;
    published?: boolean;
  };
  showActions?: boolean;
}

export default function PostsList({ filters = {}, showActions = false }: PostsListProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    pages: 0,
  });

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await postsAPI.getPosts({
        page,
        limit: pagination.limit,
        ...filters,
      });

      if (response.success) {
        if (page === 1) {
          setPosts(response.posts);
        } else {
          setPosts(prev => [...prev, ...response.posts]);
        }
        setPagination(response.pagination);
      } else {
        setError(response.error || 'Failed to fetch posts');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, [filters.tag, filters.author]);

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      // In a real app, you'd get userId from session
      const userId = 'current-user-id'; // This should come from your auth context
      const response = await postsAPI.deletePost(postId, userId);

      if (response.success) {
        setPosts(posts.filter(post => post.id !== postId));
      } else {
        alert(response.error || 'Failed to delete post');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="flex items-center mt-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button
          onClick={() => fetchPosts(1)}
          className="px-6 py-2 bg-[#1a5f3f] text-white rounded-lg hover:bg-[#155035] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            showActions={showActions}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            No posts found
          </div>
          <p className="text-gray-400">
            {filters.published === false 
              ? 'You have no drafts yet. Start writing!'
              : 'No posts available yet. Be the first to write something amazing!'
            }
          </p>
        </div>
      )}

      {pagination.page < pagination.pages && (
        <div className="text-center mt-8">
          <button
            onClick={() => fetchPosts(pagination.page + 1)}
            disabled={loading}
            className="px-6 py-3 bg-[#1a5f3f] text-white rounded-lg hover:bg-[#155035] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading...' : 'Load More Posts'}
          </button>
        </div>
      )}
    </div>
  );
}