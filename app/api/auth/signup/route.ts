import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '../../../../models/users'; // ✅ Fixed import

export async function POST(request: NextRequest) {
  try {
    console.log('🔸 Starting signup process...');
    
    await connectDB();
    console.log('✅ Database connected successfully');

    const body = await request.json();
    console.log('🔸 Request body:', body);

    const { name, email, password } = body;

    // Check if user already exists
    console.log('🔸 Checking for existing user...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Create new user
    console.log('🔸 Creating new user...');
    const user = await User.create({
      name,
      email,
      password,
    });

    console.log('✅ User created successfully:', user.email);

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ SIGNUP ERROR:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}