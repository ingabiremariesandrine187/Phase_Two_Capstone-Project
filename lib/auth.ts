// lib/auth.ts - FIXED VERSION (JWT-only, no adapter needed)
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from './mongodb';
import { User } from '../models/users';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          await connectDB();
          
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required');
          }

          const normalizedEmail = credentials.email.toLowerCase().trim();
          const user = await User.findOne({ email: normalizedEmail });

          if (!user) {
            throw new Error('No user found with this email');
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          // Return user object (without password)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            avatar: user.avatar || undefined,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // ✅ FIX: Include all user data in JWT token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      // ✅ FIX: Properly populate session with user data
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          avatar: token.avatar as string,
        };
      }
      return session;
    },
  },
  // ✅ CRITICAL: Add secret for JWT encryption
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};