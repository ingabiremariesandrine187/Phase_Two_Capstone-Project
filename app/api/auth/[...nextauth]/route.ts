import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authAPI } from '../../../../lib/api';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await authAPI.login(credentials.email, credentials.password);
          
          if (response.user) {
            return {
              id: response.user.id,
              email: response.user.email,
              name: response.user.name,
              image: response.user.avatar,
            };
          }
        } catch (error) {
          console.error('Auth error:', error);
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signUp: '/login/signup',
  },
});

export { handler as GET, handler as POST };