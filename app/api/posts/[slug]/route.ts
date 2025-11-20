import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Post } from '@/models/Post';

interface Params {
  params: {
    slug: string;
  };
}

// GET /api/posts/[slug] - Get single post by slug
export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { slug } = params;

    const post = await Post.findOne({ slug })
      .populate('author', 'name email avatar bio')
      .lean();

    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    if (!post.published) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error: any) {
    console.error('Get post error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch post' }, { status: 500 });
  }
}