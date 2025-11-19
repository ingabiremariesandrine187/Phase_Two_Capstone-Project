'use client';

import Link from 'next/link';
import Image from 'next/image';
import {useState} from 'react'
import { useSession, signOut } from 'next-auth/react';
import { Search, PenTool, User } from 'lucide-react';
import { APP_NAME } from '../lib/constants';
import SearchBar from '../components/searchBar';

export default function Header() {
  const { data: session } = useSession();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-serif font-bold text-[#1a5f3f]">
                {APP_NAME}
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="text-gray-700 hover:text-[#1a5f3f] font-serif transition-colors"
              >
                Home
              </Link>
              <Link
                href="/explore"
                className="text-gray-700 hover:text-[#1a5f3f] font-serif transition-colors"
              >
                Explore
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Search Icon */}
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
                className="p-2 text-gray-600 hover:text-[#1a5f3f] transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Write Icon - Only show when logged in */}
              {session && (
                <Link
                  href="/new"
                  aria-label="Write"
                  className="p-2 text-gray-600 hover:text-[#1a5f3f] transition-colors"
                >
                  <PenTool className="w-5 h-5" />
                </Link>
              )}

              {/* Sign In / User Profile */}
              {session ? (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/profile" // Changed to simple /profile route
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-[#1a5f3f] transition-colors group"
                    aria-label="Profile"
                  >
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#1a5f3f] flex items-center justify-center text-white text-sm font-semibold group-hover:bg-[#155035] transition-colors">
                        {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="hidden md:block text-sm font-serif text-gray-700">
                      {session.user?.name}
                    </span>
                  </Link>
                  
                  <button
                    onClick={() => signOut()}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-serif text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="p-2 text-gray-600 hover:text-[#1a5f3f] transition-colors"
                    aria-label="Profile"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-serif text-sm"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Search Modal */}
      {isSearchOpen && (
        <SearchBar 
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      )}
    </>
  );
}