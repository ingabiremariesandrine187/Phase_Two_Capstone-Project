import Link from 'next/link';
import Image from 'next/image';

interface Post {
  id: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  tags: string[];
  slug: string;
  published: boolean;
  publishedAt?: string;
  readTime: number;
  author: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  showActions?: boolean;
  onDelete?: (postId: string) => void;
}

export default function PostCard({ post, showActions = false, onDelete }: PostCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
      {post.coverImage && (
        <Link href={`/posts/${post.slug}`}>
          <div className="relative h-48 w-full">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
      )}
      
      <div className="p-6">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-[#1a5f3f]/10 text-[#1a5f3f] text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <Link href={`/posts/${post.slug}`}>
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-3 hover:text-[#1a5f3f] transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            {post.author.avatar ? (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#1a5f3f] flex items-center justify-center text-white text-sm font-semibold">
                {post.author.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
              <p className="text-xs text-gray-500">
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString()} · {post.readTime} min read
              </p>
            </div>
          </div>
        </div>

        {/* Actions (only for authors) */}
        {showActions && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <Link
              href={`/editor/${post.id}`}
              className="flex-1 px-3 py-2 text-sm bg-[#1a5f3f] text-white rounded-lg hover:bg-[#155035] transition-colors text-center"
            >
              Edit
            </Link>
            <button
              onClick={() => onDelete?.(post.id)}
              className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}