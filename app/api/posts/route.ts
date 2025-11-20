// 


import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Post } from '@/models/Post';
import { User } from '../../../models/users';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
    const body = await request.json();
    const { userId, title, content, excerpt, coverImage, tags, published } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized - userId required' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ success: false, error: 'Title and content are required' }, { status: 400 });
    }

    const post = await Post.create({
      title: title.trim(),
      content,
      excerpt: excerpt?.trim(),
      coverImage,
      tags: tags || [],
      author: user._id,
      published: published || false,
    });

    await post.populate('author', 'name email avatar bio');

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
      return NextResponse.json({ success: false, error: 'A post with this title already exists' }, { status: 400 });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ success: false, error: errors.join(', ') }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: 'Failed to create post' }, { status: 500 });
  }
}

// PUT /api/posts - Update post (requires auth)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, userId, title, content, excerpt, coverImage, tags, published } = body;

    if (!userId || !postId) {
      return NextResponse.json({ success: false, error: 'Unauthorized - userId and postId required' }, { status: 401 });
    }

    await connectDB();

    const post = await Post.findOne({ _id: postId, author: userId });
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found or unauthorized' }, { status: 404 });
    }

    if (title !== undefined) post.title = title.trim();
    if (content !== undefined) post.content = content;
    if (excerpt !== undefined) post.excerpt = excerpt?.trim();
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (tags !== undefined) post.tags = tags;
    if (published !== undefined) {
      post.published = published;
      if (published && !post.publishedAt) {
        post.publishedAt = new Date();
      }
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
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const userId = searchParams.get('userId');

    if (!userId || !postId) {
      return NextResponse.json({ success: false, error: 'Unauthorized - userId and postId required' }, { status: 401 });
    }

    await connectDB();

    const post = await Post.findOne({ _id: postId, author: userId });
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found or unauthorized' }, { status: 404 });
    }

    await Post.deleteOne({ _id: postId, author: userId });

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete post error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete post' }, { status: 500 });
  }
}