import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Post } from '@/models/Post';
import { User } from '@/models/users';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    
    const { slug } = await params;

    // Populate nested comment user references so the client receives author details
    const post = await Post.findOne({ slug }).populate('comments.user', 'name avatar email');

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found', comments: [] },
        { status: 200 }
      );
    }

    // Normalize comments to the shape expected by the client: comment.author.image/name/_id
    const comments = (post.comments || []).map((c: any) => {
      const user = c.user as any;
      return {
        _id: c._id,
        content: c.content,
        createdAt: c.createdAt,
        author: user
          ? {
              _id: String(user._id),
              name: user.name,
              image: user.avatar || null,
            }
          : {
              _id: null,
              name: 'Unknown',
              image: null,
            },
      };
    });

    return NextResponse.json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments', comments: [] },
      { status: 200 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    
    const { slug } = await params;
    const body = await request.json();
    const { content, userId } = body;

    // Debug logging: print the entire incoming body for visibility
    console.log('📝 Comment POST - Raw body:', JSON.stringify(body));
    console.log('📝 Comment POST - Content present:', !!(content && String(content).trim()));
    console.log('👤 Comment POST - UserId (raw):', userId);
    console.log('👤 Comment POST - userId type:', typeof userId);
    // Validate ObjectId format
    const isValidObjectId = Types.ObjectId.isValid(userId);
    console.log('👤 Comment POST - isValidObjectId:', isValidObjectId);

    if (!content?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate user exists
    let userExists = null;
    try {
      if (isValidObjectId) {
        userExists = await User.findById(userId);
      } else {
        // Try fallback: maybe session supplied id as a stringified ObjectId-like value
        console.warn('👤 Comment POST - Invalid ObjectId format for userId:', userId);
      }

      console.log('👤 Comment POST - User lookup result:', userExists ? { id: String(userExists._id), email: (userExists as any).email } : null);

      if (!userExists) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 400 }
        );
      }
    } catch (lookupErr) {
      console.error('👤 Comment POST - Error during user lookup:', lookupErr);
      return NextResponse.json(
        { success: false, error: 'Error validating user' },
        { status: 500 }
      );
    }

    const post = await Post.findOne({ slug });
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Add comment
    if (!post.comments) post.comments = [];
    
    const newComment = {
      _id: new Date().getTime().toString(),
      content: content.trim(),
      user: new Types.ObjectId(userId),
      createdAt: new Date(),
    };

    (post.comments as unknown as Array<{ _id: string; content: string; user: Types.ObjectId; createdAt: Date }>).push(newComment);
    await post.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Comment added successfully',
        comments: post.comments || [],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

