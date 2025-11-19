import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { User } from '@/models/User';

export async function GET() {
  try {
    console.log(' Testing user insertion...');
    
    await mongoose.connect(process.env.MONGODB_URI!);
    
    // Create a test user
    const testUser = await User.create({
      name: 'Test User',
      email: `test-${Date.now()}@test.com`,
      password: 'testpassword123'
    });
    
    console.log(' Test user created:', testUser.email);
    
    // Count all users
    const userCount = await User.countDocuments();
    const allUsers = await User.find({});
    
    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      testUser: {
        id: testUser._id,
        name: testUser.name,
        email: testUser.email
      },
      totalUsers: userCount,
      allUsers: allUsers.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      })),
      database: mongoose.connection.db?.databaseName
    });
    
  } catch (error: any) {
    console.error('❌ Insert test failed:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
      errorDetails: error
    }, { status: 500 });
  }
}