'use client';

import LikeButton from '@/components/social/LikeButton';
import FollowButton from '@/components/social/FollowButton';
import CommentsSection from '@/components/comments/CommentsSection';

interface PostSocialProps {
  postId: string;
  slug?: string;
  authorId: string;
}

export default function PostSocial({ postId, slug, authorId }: PostSocialProps) {
  return (
    <div className="space-y-8">
      {/* Social Actions */}
      <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
        <LikeButton postId={postId} slug={slug} />
        <FollowButton targetUserId={authorId} />
      </div>

      {/* Comments Section */}
      <div id="comments">
        <CommentsSection postId={postId} slug={slug} />
      </div>
    </div>
  );
}