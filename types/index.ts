// types/index.ts

import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Providers } from "@/components/Providers";
import { APP_NAME, APP_DESCRIPTION } from "../lib/constants";

// ... your existing User, Post, Tag interfaces ...

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  followersCount?: number;
  followingCount?: number;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: User;
  authorId: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  likesCount: number;
  commentsCount: number;
  readingTime?: number;
}

// ... your other existing interfaces ...

// ADD THESE NEXT-AUTH TYPE EXTENSIONS AT THE BOTTOM:
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      avatar?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    avatar?: string;
  }
}