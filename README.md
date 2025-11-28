#  Medium Clone - Phase 2 Capstone Project

> A production-ready publishing platform inspired by Medium, built with **Next.js 16**, **React 19**, **TypeScript**, and modern web technologies. This project demonstrates advanced frontend engineering, authentication, rich content creation, social interactions, and deployment best practices.

##  Live Demo

**[View Live Application](https://phase-two-capstone-project-x6up.vercel.app/)**

##  Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
- [Testing](#testing)
- [Deployment](#deployment)
- [Learning Outcomes](#learning-outcomes)
- [Contributing](#contributing)

---

##  Overview

This project is a **Phase 2 Frontend Capstone** that demonstrates comprehensive full-stack development skills using modern React ecosystem. It simulates a complete publishing workflow similar to Medium, where users can create, publish, and interact with content in a social environment.

### Core Capabilities

 **Component-driven architecture** with reusable, type-safe React components  
 **Authentication & authorization** using NextAuth v4 with multiple providers  
 **Rich text editing** with Jodit Editor and image upload capabilities  
**Complete CRUD operations** with draft/publish workflow  
**Social features**: comments, likes, and author following  
 **Advanced data fetching** with React Query for optimal performance  
 **SEO optimization** with metadata and Open Graph tags  
 **TypeScript first** approach for complete type safety  
 **Responsive design** with Tailwind CSS  
 **Production-ready** with comprehensive error handling

---

##  Key Features

###  Authentication & User Management
- **Secure Authentication**: NextAuth v4 with JWT and database sessions
- **User Profiles**: Customizable profiles with avatars and bio
- **Protected Routes**: Client and server-side route protection
- **Social Login**: Support for multiple OAuth providers

###  Rich Content Creation
- **WYSIWYG Editor**: Jodit React editor with full formatting capabilities
- **Image Uploads**: Integrated image upload with optimization
- **Draft System**: Save drafts and preview before publishing
- **SEO-Friendly**: Automatic slug generation and metadata

###  Content Management
- **Full CRUD Operations**: Create, read, update, and delete posts
- **Content States**: Draft and published post management
- **Tag System**: Organize content with tags and categories
- **Search Functionality**: Debounced search with real-time results

###  Social Interactions
- **Engagement System**: Like/clap posts with optimistic updates
- **Comment System**: Nested comments with real-time updates
- **Follow Authors**: Build personalized feeds by following favorite writers
- **Activity Feed**: Personalized content recommendations

###  User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Loading States**: Skeleton loaders and optimistic UI updates
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance**: Optimized images, lazy loading, and caching strategies

---

## 🛠 Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS 4, Lucide React Icons |
| **Authentication** | NextAuth v4, JWT, bcryptjs |
| **Database** | MongoDB, Prisma ORM |
| **State Management** | React Query, Context API |
| **Forms** | React Hook Form, Zod validation |
| **Editor** | Jodit React |
| **Testing** | Jest, React Testing Library |
| **Deployment** | Vercel |
| **Development** | ESLint, TypeScript, Babel |

---

##  Project Structure

```
medium_clo/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── api/               # API routes
│   ├── posts/             # Post-related pages
│   ├── profile/           # User profile pages
│   └── ...
├── components/            # Reusable UI components
│   ├── posts/            # Post-related components
│   ├── social/           # Social interaction components
│   └── comments/         # Comment system components
├── contexts/             # React Context providers
├── lib/                  # Utility functions and configurations
│   ├── Hooks/           # Custom React hooks
│   └── ...
├── models/              # Database models
├── types/               # TypeScript type definitions
├── prisma/              # Database schema
└── public/              # Static assets
```

---

##  Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medium_clo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

##  Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="your_mongodb_connection_string"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# JWT
JWT_SECRET="your_jwt_secret"
```

---

##  API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/*` | Various | NextAuth authentication endpoints |
| `/api/posts` | GET, POST | Fetch posts, create new post |
| `/api/posts/[id]` | GET, PUT, DELETE | Get, update, delete specific post |
| `/api/posts/[id]/like` | POST | Like/unlike a post |
| `/api/posts/[id]/comments` | GET, POST | Fetch/create comments |
| `/api/users/[id]/follow` | POST | Follow/unfollow user |

---

##  Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Testing Strategy

- **Unit Tests**: Component logic and utility functions
- **Integration Tests**: API routes and database operations
- **E2E Tests**: Critical user workflows
- **Accessibility Tests**: WCAG compliance testing

---

##  Deployment

This project is deployed on **Vercel** for optimal Next.js performance.

### Deployment Steps

1. **Connect to Vercel**
   - Import project from GitHub
   - Configure environment variables
   - Deploy automatically on push

2. **Database Setup**
   - Configure MongoDB Atlas or your preferred database
   - Update connection strings in environment variables

3. **Domain Configuration**
   - Set up custom domain (optional)
   - Configure DNS settings

**Live Application**: [https://phase-two-capstone-project-x6up.vercel.app/](https://phase-two-capstone-project-x6up.vercel.app/)

---

## Learning Outcomes

This project demonstrates mastery of:

### Frontend Engineering
-  **Modern React Patterns**: Hooks, Context, Suspense, Error Boundaries
-  **Next.js App Router**: Server components, client components, layouts
-  **TypeScript Integration**: End-to-end type safety
-  **Performance Optimization**: Code splitting, lazy loading, caching

### Full-Stack Development
-  **API Design**: RESTful endpoints with proper HTTP methods
-  **Database Integration**: Prisma ORM with MongoDB
-  **Authentication**: Secure user management and session handling
-  **State Management**: Client-side state with React Query

### Production Readiness
-  **Error Handling**: Comprehensive error boundaries and user feedback
-  **Testing Strategy**: Unit, integration, and accessibility testing
-  **SEO Optimization**: Metadata, Open Graph, and semantic HTML
-  **Deployment**: CI/CD pipeline with Vercel

### User Experience
-  **Responsive Design**: Mobile-first approach with Tailwind CSS
-  **Accessibility**: WCAG compliance and keyboard navigation
-  **Performance**: Optimized loading and interaction patterns
-  **Social Features**: Real-time interactions and engagement

---

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. Follow the existing code style and conventions
2. Write tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

---

##  License

This project is part of a Phase 2 Capstone and is intended for educational purposes.

---

##  Acknowledgments

- **Next.js Team** for the amazing framework
- **Vercel** for seamless deployment
- **Tailwind CSS** for the utility-first CSS framework
- **Prisma** for the excellent ORM experience

---

**Built with using Next.js, React, and TypeScript**