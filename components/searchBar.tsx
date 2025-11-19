'use client';
import {useState,useCallback,useEffect} from 'react';
import {useRouter} from 'next/navigation';
import { Search, X, Clock, User, Calendar } from 'lucide-react';
import Link from 'next/link';

interface SearchBarProps {
  onClose?: () => void;
  isOpen?: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar?: string;
  };
  tags: string[];
  publishedAt: string;
  readTime: number;
  slug: string;
}

export default function SearchBar({ onClose, isOpen = true }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Mock search function - replace with actual API
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call - replace with actual search endpoint
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data - replace with actual API response
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Getting Started with Next.js',
          excerpt: 'Learn how to build modern web applications with Next.js and React...',
          author: { name: 'John Doe' },
          tags: ['Next.js', 'React', 'Web Development'],
          publishedAt: '2025-11-18',
          readTime: 5,
          slug: 'getting-started-with-nextjs'
        },
        {
          id: '2',
          title: 'Advanced TypeScript Patterns',
          excerpt: 'Discover advanced TypeScript patterns for better type safety...',
          author: { name: 'Jane Smith' },
          tags: ['TypeScript', 'Programming'],
          publishedAt: '2025-11-15',
          readTime: 8,
          slug: 'advanced-typescript-patterns'
        }
      ].filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      setResults(mockResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      if (onClose) onClose();
    }
  };

  // ADD THIS MISSING FUNCTION
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    if (onClose) onClose();
  };

  const handleResultClick = () => {
    if (onClose) onClose();
  };

  if(!isOpen) return null;

  return(
    <div className="fixed inset-0 bg-white z-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Search</h2>
        <button
          onClick={clearSearch} 
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X size={24} />
        </button>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, authors, tags..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" // ← ONLY THIS LINE CHANGED
            autoFocus
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </form>

      {/* Search Results */}
      {query && (
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-600">
                Search Results ({results.length})
              </h3>
              {results.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  onClick={handleResultClick}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <User size={14} />
                    <span>{post.author.name}</span>
                    <Calendar size={14} />
                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                    <Clock size={14} />
                    <span>{post.readTime} min read</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {post.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No results found for query
            </div>
          )}
        </div>
      )}

      {/* Popular Tags */}
      {!query && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Popular Tags</h3>
          <div className="flex flex-wrap gap-2">
            {['Next.js', 'React', 'TypeScript', 'Web Development', 'Programming', 'JavaScript', 'CSS', 'Frontend'].map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}