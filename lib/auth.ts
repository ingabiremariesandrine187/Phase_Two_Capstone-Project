// lib/auth.ts

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log(' Auth attempt for email:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log(' Missing credentials');
          return null;
        }

        // Normalize email
        const normalizedEmail = credentials.email.toLowerCase().trim();
        console.log(' Normalized email:', normalizedEmail);

        const user = await prisma.user.findUnique({
          where: {
            email: normalizedEmail,
          },
        });

        console.log('👤 User found:', user ? 'Yes' : 'No');
        
        if (!user) {
          console.log(' User not found with email:', normalizedEmail);
          return null;
        }

        console.log(' Stored hashed password:', user.password);
        console.log(' Provided password length:', credentials.password.length);

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        console.log('✅ Password valid:', isPasswordValid);
        
        if (!isPasswordValid) {
          console.log(' Invalid password for user:', normalizedEmail);
          return null;
        }

        console.log(' Authentication successful for:', normalizedEmail);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar || undefined,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.avatar = token.avatar as string;
      }
      return session;
    },
  },
};