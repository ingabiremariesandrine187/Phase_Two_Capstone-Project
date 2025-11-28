import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Post } from '@/models/Post';

export async function GET(
  request: NextRequest,
  { params }: any
) {
  try {
    await connectDB();
    
    const p = await Promise.resolve(params);
    const { slug } = p;
    const userId = request.nextUrl.searchParams.get('userId');

    const post = await Post.findOne({ slug });
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found', likes: 0, isLiked: false },
        { status: 200 }
      );
    }

    const likes = post.likes || [];
    const isLiked = userId ? likes.some((id: Types.ObjectId) => id.toString() === userId) : false;

    return NextResponse.json({
      success: true,
      likes: likes.length,
      isLiked,
    });
  } catch (error) {
    console.error('Get likes error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch likes', likes: 0, isLiked: false },
      { status: 200 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: any
) {
  try {
    await connectDB();
    
    const p = await Promise.resolve(params);
    const { slug } = p;
    const { userId, action } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const post = await Post.findOne({ slug });
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    if (!post.likes) post.likes = [];

    const userObjectId = new Types.ObjectId(userId);

    if (action === 'like') {
      // Add like if not already liked
      if (!post.likes.some((id: Types.ObjectId) => id.toString() === userObjectId.toString())) {
        post.likes.push(userObjectId);
      }
    } else if (action === 'unlike') {
      // Remove like
      post.likes = post.likes.filter((id: Types.ObjectId) => id.toString() !== userObjectId.toString());
    }

    await post.save();

    return NextResponse.json(
      {
        success: true,
        likes: post.likes.length,
        isLiked: action === 'like',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update likes error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update likes' },
      { status: 500 }
    );
  }
}
