'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  handle?: string;
  created_at: string;
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ placeholder = "Search projects...", className = "" }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/projects/${result.slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-96 overflow-auto">
          {results.length > 0 ? (
            <ul className="py-1">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{result.title}</div>
                      {result.handle && (
                        <div className="text-sm text-gray-500">by @{result.handle}</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(result.created_at).toLocaleDateString()}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim() && !isLoading ? (
            <div className="px-4 py-3 text-gray-500 text-center">
              No projects found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
} 