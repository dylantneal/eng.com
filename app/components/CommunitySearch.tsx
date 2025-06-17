import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: string;
  title: string;
  type: 'post' | 'project' | 'user';
  community?: string;
  author?: string;
  score?: number;
  created_at: string;
}

interface CommunitySearchProps {
  className?: string;
  placeholder?: string;
  initialQuery?: string;
}

export default function CommunitySearch({
  className = '',
  placeholder = 'Search communities, posts, and projects...',
  initialQuery = '',
}: CommunitySearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'posts' | 'projects' | 'users'>('all');
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery)}&type=${selectedFilter}`
        );
        const data = await response.json();
        setResults(data.results);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, selectedFilter]);

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    switch (result.type) {
      case 'post':
        router.push(`/community/${result.community}/posts/${result.id}`);
        break;
      case 'project':
        router.push(`/projects/${result.id}`);
        break;
      case 'user':
        router.push(`/users/${result.author}`);
        break;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {showResults && (query || isLoading) && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-2 border-b border-gray-200">
            <div className="flex space-x-2">
              {(['all', 'posts', 'projects', 'users'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    selectedFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Searching...</div>
            ) : results.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </p>
                        <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                          <span className="capitalize">{result.type}</span>
                          {result.community && (
                            <>
                              <span>•</span>
                              <span>r/{result.community}</span>
                            </>
                          )}
                          {result.author && (
                            <>
                              <span>•</span>
                              <span>by u/{result.author}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{formatTimeAgo(result.created_at)}</span>
                          {result.score !== undefined && (
                            <>
                              <span>•</span>
                              <span>{result.score} points</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No results found for "{query}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 