import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Post } from '@/models/Post';
import { User } from '../../../models/users';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/posts - public, with optional filters
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

    const query: any = {};
    if (published) query.published = true;
    if (tag) query.tags = tag;
    if (authorId) query.author = authorId;

    const posts = await Post.find(query)
      .populate('author', 'name email avatar bio')
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
    return NextResponse.json({ success: false, error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST /api/posts - Create new post (requires auth)
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 ========== POST /api/posts DEBUG START ==========');
    
    // ✅ Get session for authentication
    const session = await getServerSession(authOptions);
    
    console.log('🔍 Session object:', session);
    console.log('🔍 Session user:', session?.user);
    console.log('🔍 Session user id:', session?.user?.id);
    console.log('🔍 Session exists:', !!session);
    console.log('🔍 User exists in session:', !!session?.user);
    
    if (!session?.user?.id) {
      console.log('❌ DEBUG: No session or user id found - returning 401');
      console.log('❌ Available session keys:', session ? Object.keys(session) : 'No session');
      console.log('❌ Session user type:', typeof session?.user);
      console.log('❌ Session user keys:', session?.user ? Object.keys(session.user) : 'No user');
      
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Please login to create posts' 
      }, { status: 401 });
    }

    console.log('✅ DEBUG: User is authenticated with ID:', session.user.id);

    const body = await request.json();
    console.log('🔍 Request body received:', body);
    
    // Extract userId from request body (sent by frontend)
    const { title, content, excerpt, coverImage, tags, published, userId } = body;
    
    console.log('🔍 User ID from request:', userId);
    console.log('🔍 User ID from session:', session.user.id);
    
    // Use userId from request body OR fallback to session userId
    const finalUserId = userId || session.user.id;

    console.log('🔍 Final user ID to use:', finalUserId);

    await connectDB();

    // Validate that the user exists
    const user = await User.findById(finalUserId);
    console.log('🔍 User found in database:', user ? `Yes (${user.email})` : 'No');
    
    if (!user) {
      console.log('❌ User not found in database');
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Security check - ensure request userId matches session userId
    if (userId && userId !== session.user.id) {
      console.log('❌ User ID mismatch - request vs session');
      return NextResponse.json({ 
        success: false, 
        error: 'User ID mismatch - unauthorized' 
      }, { status: 403 });
    }

    if (!title?.trim() || !content?.trim()) {
      console.log('❌ Title or content missing');
      return NextResponse.json({ success: false, error: 'Title and content are required' }, { status: 400 });
    }

    // Generate slug from title
    const baseSlug = generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    // Check if slug already exists and make it unique
    while (await Post.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    console.log('🔍 Generated slug:', slug);

    // Create post with all required fields including slug
    const postData = {
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt?.trim() || '',
      coverImage: coverImage || '',
      tags: tags || [],
      author: user._id,
      published: published || false,
      slug: slug,
    };

    console.log('🔍 Creating post with data:', postData);

    const post = await Post.create(postData);
    await post.populate('author', 'name email avatar bio');

    console.log('✅ Post created successfully:', post._id);
    console.log('🔍 ========== POST /api/posts DEBUG END ==========');

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
    console.error('❌ Create post error:', error);

    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        error: 'A post with this title already exists. Please choose a different title.' 
      }, { status: 400 });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ success: false, error: errors.join(', ') }, { status: 400 });
    }

    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to create post' 
    }, { status: 500 });
  }
}

// PUT /api/posts - Update post (requires auth)
export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 PUT /api/posts - Checking session');
    const session = await getServerSession(authOptions);
    
    console.log('🔍 PUT Session user id:', session?.user?.id);
    
    if (!session?.user?.id) {
      console.log('❌ PUT: No session found');
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Please login' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { postId, title, content, excerpt, coverImage, tags, published, userId } = body;
    
    const finalUserId = userId || session.user.id;

    if (!postId) {
      return NextResponse.json({ success: false, error: 'Post ID is required' }, { status: 400 });
    }

    if (userId && userId !== session.user.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID mismatch - unauthorized' 
      }, { status: 403 });
    }

    await connectDB();

    const post = await Post.findOne({ _id: postId, author: finalUserId });
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found or unauthorized' }, { status: 404 });
    }

    // Update fields
    if (title !== undefined) post.title = title.trim();
    if (content !== undefined) post.content = content;
    if (excerpt !== undefined) post.excerpt = excerpt?.trim();
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (tags !== undefined) post.tags = tags;
    if (published !== undefined) {
      post.published = published;
    }

    await post.save();
    await post.populate('author', 'name email avatar bio');

    return NextResponse.json({
      success: true,
      message: published ? 'Post published successfully!' : 'Post updated successfully!',
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
    });
  } catch (error: any) {
    console.error('Update post error:', error);

    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'A post with this title already exists' }, { status: 400 });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ success: false, error: errors.join(', ') }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE /api/posts - Delete post (requires auth)
export async function DELETE(request: NextRequest) {
  try {
    console.log('🔍 DELETE /api/posts - Checking session');
    const session = await getServerSession(authOptions);
    
    console.log('🔍 DELETE Session user id:', session?.user?.id);
    
    if (!session?.user?.id) {
      console.log('❌ DELETE: No session found');
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Please login' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const requestUserId = searchParams.get('userId');
    
    const finalUserId = requestUserId || session.user.id;

    if (!postId) {
      return NextResponse.json({ success: false, error: 'Post ID is required' }, { status: 400 });
    }

    if (requestUserId && requestUserId !== session.user.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID mismatch - unauthorized' 
      }, { status: 403 });
    }

    await connectDB();

    const post = await Post.findOne({ _id: postId, author: finalUserId });
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found or unauthorized' }, { status: 404 });
    }

    await Post.deleteOne({ _id: postId, author: finalUserId });

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete post error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete post' }, { status: 500 });
  }
}