import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import { Post } from '@/models/Post';

interface PageProps {
  params: {
    slug: string;
  };
}

// Server-side function to fetch post data
async function getPostData(slug: string) {
  try {
    await connectDB();
    
    const post = await Post.findOne({ slug, published: true })
      .populate('author', 'name email avatar bio')
      .lean();

    if (!post) {
      return null;
    }

    // Convert MongoDB ObjectId and Date to strings for serialization
    return {
      ...post,
      _id: post._id.toString(),
      author: {
        ...post.author,
        _id: post.author._id.toString()
      },
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = params;

  const post = await getPostData(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="min-h-screen bg-white">
      {/* Cover Image */}
      {post.coverImage && (
        <div className="relative h-64 md:h-96 w-full">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
            {post.title}
          </h1>
          
          {/* Author Info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              {post.author.avatar && (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={56}
                  height={56}
                  className="rounded-full"
                />
              )}
              <div className="ml-4">
                <p className="text-lg font-semibold text-gray-900">{post.author.name}</p>
                <p className="text-sm text-gray-600">
                  {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} · {post.readTime} min read
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/explore?tag=${tag}`}
                  className="px-3 py-1 bg-[#1a5f3f]/10 text-[#1a5f3f] text-sm rounded-full hover:bg-[#1a5f3f]/20 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xl text-gray-600 mb-8 italic border-l-4 border-[#1a5f3f] pl-4">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        {post.content && (
          <div 
            className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900 prose-blockquote:border-[#1a5f3f] prose-blockquote:italic prose-a:text-[#1a5f3f] hover:prose-a:text-[#155035] mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}

        {/* Author Bio */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-start space-x-6">
            {post.author.avatar && (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={80}
                height={80}
                className="rounded-full flex-shrink-0"
              />
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">About {post.author.name}</h3>
              {post.author.bio ? (
                <p className="text-gray-600 leading-relaxed">{post.author.bio}</p>
              ) : (
                <p className="text-gray-500 italic">No bio available.</p>
              )}
            </div>
          </div>
        </footer>

        {/* Back to Explore */}
        <div className="mt-8 text-center">
          <Link
            href="/explore"
            className="inline-flex items-center px-6 py-3 bg-[#1a5f3f] text-white rounded-lg hover:bg-[#155035] transition-colors"
          >
            ← Back to Explore
          </Link>
        </div>
      </div>
    </article>
  );
}

// Generate static params for popular posts
export async function generateStaticParams() {
  try {
    await connectDB();
    
    const posts = await Post.find({ published: true })
      .select('slug')
      .limit(20)
      .lean();

    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  try {
    const post = await getPostData(params.slug);
    
    if (post) {
      return {
        title: `${post.title} | ${process.env.APP_NAME || 'Blog'}`,
        description: post.excerpt || `Read ${post.title} by ${post.author.name}`,
        openGraph: {
          title: post.title,
          description: post.excerpt || `Read ${post.title} by ${post.author.name}`,
          type: 'article',
          publishedTime: post.publishedAt || post.createdAt,
          authors: [post.author.name],
          images: post.coverImage ? [post.coverImage] : [],
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return {
    title: 'Post Not Found',
    description: 'The post you are looking for does not exist.',
  };
}