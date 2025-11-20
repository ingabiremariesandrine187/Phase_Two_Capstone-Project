'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { postsAPI } from '@/lib/api';
import PostCard from '@/components/posts/PostCard';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchPosts = async () => {
      if (!query) {
        setPosts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await postsAPI.getPosts({
          published: true,
          limit: 20,
        });

        if (response.success) {
          // Client-side filtering based on search query
          const filtered = response.posts.filter((post: any) =>
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.excerpt?.toLowerCase().includes(query.toLowerCase()) ||
            post.tags.some((tag: string) => 
              tag.toLowerCase().includes(query.toLowerCase())
            ) ||
            post.author.name.toLowerCase().includes(query.toLowerCase())
          );
          setPosts(filtered);
        } else {
          setError(response.error || 'Search failed');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    searchPosts();
  }, [query]);

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Search Posts
            </h1>
            <p className="text-gray-600">
              Use the search bar to find posts by title, content, tags, or authors
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results
          </h1>
          <p className="text-gray-600">
            {loading ? 'Searching...' : `Found ${posts.length} results for "${query}"`}
          </p>
        </div>

        {/* Results */}
        {loading && (
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
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">Error: {error}</div>
          </div>
        )}

        {!loading && !error && (
          <>
            {posts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} showActions={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">
                  No posts found for "{query}"
                </div>
                <p className="text-gray-400">
                  Try different keywords or browse all posts
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}