'use client';

import { useState, useEffect } from 'react';
import { postsAPI } from '../../lib/api';
import PostCard from '../../components/posts/PostCard';
import LikeButton from '@/components/social/LikeButton';
import FollowButton from '@/components/social/FollowButton';
import CommentSection from '@/components/social/CommentSection';
import Link from 'next/link';
import { Eye } from 'lucide-react';

interface Post {
  id: string;
  _id: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  tags: string[];
  slug: string;
  published: boolean;
  publishedAt?: string;
  readTime: number;
  author: {
    _id: string;
    name: string;
    avatar?: string;
    bio?: string;
  };
  createdAt: string;
}

export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);

  const fetchPosts = async (tag?: string | null) => {
    try {
      setLoading(true);
      const response = await postsAPI.getPosts({
        published: true,
        tag: tag || undefined,
        limit: 12,
      });

      if (response.success) {
        setPosts(response.posts);
        
        // Extract unique tags from all posts
        const tags = Array.from(
          new Set(
            response.posts.flatMap((post: Post) => post.tags)
          )
        ) as string[];
        setAllTags(tags);
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
    fetchPosts(selectedTag);
  }, [selectedTag]);

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  const clearFilter = () => {
    setSelectedTag(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-[#1a5f3f] mb-4">
            Explore Stories
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing stories, insights, and perspectives from our community of writers
          </p>
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Filter by Tags</h2>
              {selectedTag && (
                <button
                  onClick={clearFilter}
                  className="text-sm text-[#1a5f3f] hover:text-[#155035] font-medium"
                >
                  Clear filter
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-[#1a5f3f] text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-[#1a5f3f] hover:text-[#1a5f3f]'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Filter Indicator */}
        {selectedTag && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              Showing posts tagged with: <span className="font-semibold">#{selectedTag}</span>
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">Error: {error}</p>
            <button
              onClick={() => fetchPosts(selectedTag)}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Posts Grid */}
        {loading && posts.length === 0 ? (
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
        ) : posts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div key={post._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* Use your existing PostCard OR use this enhanced version */}
                <PostCard
                  post={post}
                  showActions={false}
                />
                
                {/* Social Actions - ADDED TO EACH POST CARD */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <LikeButton postId={post._id || post.id} slug={post.slug} />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FollowButton 
                      targetUserId={post.author._id}
                    />
                    {/* ADDED: View Button */}
                    <Link
                      href={`/posts/${post.slug}`}
                      className="flex items-center gap-2 bg-[#1a5f3f] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#155035] transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </div>
                </div>

                {/* Comment Section - ADDED */}
                <CommentSection postId={post._id || post.id} slug={post.slug} compact={true} />
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                {selectedTag 
                  ? `No posts found with tag #${selectedTag}`
                  : 'No posts available yet'
                }
              </div>
              <p className="text-gray-400">
                {selectedTag 
                  ? 'Try exploring other tags or check back later for new content.'
                  : 'Be the first to write something amazing!'
                }
              </p>
            </div>
          )
        )}

        {/* Load More Button */}
        {!selectedTag && posts.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => fetchPosts(selectedTag)}
              className="px-8 py-3 bg-[#1a5f3f] text-white rounded-lg hover:bg-[#155035] transition-colors font-medium"
            >
              Load More Stories
            </button>
          </div>
        )}
      </div>
    </div>
  );
}