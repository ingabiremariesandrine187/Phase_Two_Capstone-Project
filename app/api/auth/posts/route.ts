import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Post } from '@/models/Post';
import { User } from '../../../../models/users';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET /api/posts - Get posts (with filtering)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const tag = searchParams.get('tag');
    const authorId = searchParams.get('author');
    const published = searchParams.get('published') !== 'false';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (published) query.published = true;
    if (tag) query.tags = tag;
    if (authorId) query.author = authorId;

    const posts = await Post.find(query)
      .populate('author', 'name email avatar')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments(query);

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, content, excerpt, coverImage, tags, published } = body;

    // Validate required fields
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Create post
    const post = await Post.create({
      title: title.trim(),
      content,
      excerpt: excerpt?.trim(),
      coverImage,
      tags: tags || [],
      author: user._id,
      published: published || false,
    });

    // Populate author info for response
    await post.populate('author', 'name email avatar');

    return NextResponse.json(
      {
        success: true,
        message: published ? 'Post published successfully!' : 'Draft saved successfully!',
        post: {
          id: post._id,
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          coverImage: post.coverImage,
          tags: post.tags,
          slug: post.slug,
          published: post.published,
          publishedAt: post.publishedAt,
          readTime: post.readTime,
          wordCount: post.wordCount,
          author: post.author,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create post error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A post with this title already exists' },
        { status: 400 }
      );
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}