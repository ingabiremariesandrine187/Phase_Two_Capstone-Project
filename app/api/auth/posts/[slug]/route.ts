// 



import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import { Post } from '../../../../../models/Post';

// GET /api/posts/[slug] - Get single post
export async function GET(
  request: NextRequest,
  { params }: any
) {
  try {
    await connectDB();

    const p = await Promise.resolve(params);
    const { slug } = p;
    const post = await Post.findOne({ slug: slug })
      .populate('author', 'name email avatar bio')
      .lean();

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment views
    await Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } });

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error: any) {
    console.error('Get post error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}
