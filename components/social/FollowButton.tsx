'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useFollowUser, useUnfollowUser } from '../../lib/Hooks/useSocial';

interface FollowButtonProps {
  targetUserId: string;
  isInitiallyFollowing?: boolean;
}

export default function FollowButton({ 
  targetUserId, 
  isInitiallyFollowing = false 
}: FollowButtonProps) {
  const { data: session } = useSession();
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);

  const currentUserId = (session?.user as any)?._id;

  const handleFollow = async () => {
    if (!session?.user || !currentUserId || targetUserId === currentUserId) {
      return;
    }

    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync({ 
          targetUserId, 
          currentUserId 
        });
        setIsFollowing(false);
      } else {
        await followMutation.mutateAsync({ 
          targetUserId, 
          currentUserId 
        });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  if (!session?.user || targetUserId === currentUserId) {
    return null;
  }

  return (
    <button
      onClick={handleFollow}
      disabled={followMutation.isPending || unfollowMutation.isPending}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isFollowing
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          : 'bg-[#1a5f3f] text-white hover:bg-[#155035]'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {followMutation.isPending || unfollowMutation.isPending ? (
        '...'
      ) : isFollowing ? (
        'Following'
      ) : (
        'Follow'
      )}
    </button>
  );
}