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
     
    </div>




  )
}