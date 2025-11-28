'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { commentsAPI } from '@/lib/api';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  _id: string;
  content: string;
  author?: {
    _id: string;
    name: string;
    image?: string;
  };
  user?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface CommentSectionProps {
  postId: string;
  slug?: string;
  compact?: boolean; // Show only latest 2-3 comments
}

export default function CommentSection({ postId, slug, compact = true }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // NextAuth exposes the user id as `session.user.id`.
  // Fall back to `_id` if an older shape exists.
  const userId = (session?.user as any)?.id || (session?.user as any)?._id;
  const displayComments = compact ? comments.slice(-2) : comments;
  
  // Use slug if provided, otherwise use postId
  const identifier = slug || postId;

  useEffect(() => {
    fetchComments();
  }, [identifier]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${identifier}/comments`);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    if (!userId) {
      toast.error('User ID not found');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${identifier}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment, userId }),
      });
      
      if (!response.ok) throw new Error('Failed to add comment');
      
      setNewComment('');
      toast.success('Comment added successfully!');
      await fetchComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!userId) {
      toast.error('User ID not found');
      return;
    }

    if (!confirm('Delete this comment?')) return;

    try {
      await commentsAPI.deleteComment(commentId, userId);
      setComments(comments.filter(c => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (error: any) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      {/* Comments Header */}
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </span>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : displayComments.length > 0 ? (
        <div className="space-y-3 mb-4">
          {displayComments.map(comment => {
            // Handle both old (user) and new (author) shapes
            const commentAuthor = comment.author || comment.user;
            if (!commentAuthor) return null; // Skip if no author data
            
            return (
            <div key={comment._id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {((commentAuthor as any).image || (commentAuthor as any).avatar) ? (
                      <img
                        src={(commentAuthor as any).image || (commentAuthor as any).avatar}
                        alt={commentAuthor.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#1a5f3f] flex items-center justify-center text-white text-xs font-semibold">
                        {commentAuthor.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{commentAuthor.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 break-words">{comment.content}</p>
                </div>
                
                {/* Delete button - only for comment owner */}
                {userId && commentAuthor._id && String(commentAuthor._id) === String(userId) && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                    title="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            );
          })}
        </div>
      ) : !loading && (
        <p className="text-sm text-gray-500 mb-4">No comments yet. Be the first to comment!</p>
      )}

      {/* Comment Form */}
      {session?.user ? (
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            maxLength={500}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f] outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="px-3 py-2 bg-[#1a5f3f] text-white rounded-lg hover:bg-[#155035] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            <Send className="w-4 h-4" />
            <span className="text-sm font-medium">Send</span>
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg text-center">
          <a href="/login" className="text-[#1a5f3f] hover:underline font-medium">
            Sign in
          </a>
          {' '}to comment
        </p>
      )}
    </div>
  );
}
