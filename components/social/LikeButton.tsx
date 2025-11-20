'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLikes, useLikePost, useUnlikePost } from '../../lib/Hooks/useSocial';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  postId: string;
  slug?: string;
  initialLikes?: number;
}

export default function LikeButton({ postId, slug, initialLikes = 0 }: LikeButtonProps) {
  const { data: session } = useSession();
  const identifier = slug || postId;
  const currentUserId = session?.user?.id;
  const { data: likesData } = useLikes(identifier, currentUserId);
  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();
  
  const [isAnimating, setIsAnimating] = useState(false);

  const likes = likesData?.likes || initialLikes;
  const userHasLiked = likesData?.isLiked || false;

  const handleLike = async () => {
    if (!session?.user || !currentUserId) {
      // Redirect to login or show auth modal
      return;
    }

    setIsAnimating(true);
    
    try {
      if (userHasLiked) {
        await unlikeMutation.mutateAsync({ identifier, userId: currentUserId });
      } else {
        await likeMutation.mutateAsync({ identifier, userId: currentUserId });
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={!session?.user || likeMutation.isPending || unlikeMutation.isPending}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
        userHasLiked
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={userHasLiked ? 'Unlike this post' : 'Like this post'}
    >
      <Heart
        className={`w-5 h-5 transition-all ${
          userHasLiked ? 'fill-current' : ''
        } ${isAnimating ? 'scale-125' : ''}`}
      />
      <span className="font-medium">{likes}</span>
    </button>
  );
}