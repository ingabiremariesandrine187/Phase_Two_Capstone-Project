import Link from 'next/link';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';
import HeroIllustration from '../components/heroIllustration';


export default function HomePage() {
  return (
 

 <div className="min-h-screen bg-[#faf9f6]">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Main Headline */}
            <h1 className="text-5xl lg:text-6xl font-serif font-bold text-gray-800 leading-tight">
              Where great stories
              <br />
              come to life.
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-700 font-serif leading-relaxed max-w-lg">
              Discover insightful articles, share your knowledge, and connect
              with a community of passionate writers and readers.
            </p>

            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/new"
                className="px-8 py-4 bg-[#1a5f3f] text-white rounded-lg font-serif text-lg hover:bg-[#155035] transition-colors text-center"
              >
                Start Writing
              </Link>
              <Link
                href="/explore"
                className="px-8 py-4 bg-gray-200 text-gray-800 rounded-lg font-serif text-lg hover:bg-gray-300 transition-colors text-center"
              >
                Explore Stories
              </Link>
            </div>
          </div>
               
          {/* Right Illustration */}
          <div className="hidden lg:block">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-serif font-bold text-gray-800 mb-8">
          Trending Stories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Placeholder for featured posts - will be populated with real data */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <h3 className="text-xl font-serif font-semibold text-gray-800 mb-2">
                Sample Post Title {i}
              </h3>
              <p className="text-gray-600 mb-4">
                This is a sample excerpt from a featured post...
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Author Name</span>
                <span>5 min read</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>




  )
}