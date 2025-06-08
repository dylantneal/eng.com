'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  ShoppingCart, 
  Star, 
  Download, 
  Eye, 
  Heart,
  Filter,
  Search,
  DollarSign,
  Package,
  Zap,
  Award
} from 'lucide-react';
import Image from 'next/image';

type MarketplaceItem = {
  id: string;
  title: string;
  description: string;
  price_cents: number;
  category: 'design' | 'kit' | 'service' | 'tutorial';
  seller: {
    handle: string;
    avatar_url?: string;
    verified: boolean;
  };
  thumbnail_url?: string;
  rating: number;
  review_count: number;
  download_count: number;
  tags: string[];
  created_at: string;
  featured: boolean;
};

interface MarketplaceProps {
  category?: string;
  searchQuery?: string;
  showFeatured?: boolean;
}

export default function Marketplace({ category, searchQuery, showFeatured = true }: MarketplaceProps) {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'price_low' | 'price_high' | 'rating'>('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const categories = [
    { id: 'all', label: 'All Items', icon: Package },
    { id: 'design', label: 'CAD Files', icon: Download },
    { id: 'kit', label: 'Hardware Kits', icon: Package },
    { id: 'service', label: 'Services', icon: Zap },
    { id: 'tutorial', label: 'Tutorials', icon: Award }
  ];

  useEffect(() => {
    loadMarketplaceItems();
  }, [selectedCategory, sortBy, searchQuery]);

  const loadMarketplaceItems = async () => {
    setLoading(true);
    try {
      // Simulate marketplace data - in production this would be a real query
      const mockItems: MarketplaceItem[] = [
        {
          id: '1',
          title: 'Arduino Robot Chassis Design',
          description: 'Complete CAD files for a modular robot chassis compatible with Arduino Uno. Includes assembly instructions and bill of materials.',
          price_cents: 1999,
          category: 'design',
          seller: {
            handle: 'robotmaker',
            avatar_url: 'https://picsum.photos/seed/robotmaker/40/40',
            verified: true
          },
          thumbnail_url: 'https://picsum.photos/seed/robot-chassis/300/200',
          rating: 4.8,
          review_count: 24,
          download_count: 156,
          tags: ['arduino', 'robotics', 'chassis', 'modular'],
          created_at: '2024-01-15T10:00:00Z',
          featured: true
        },
        {
          id: '2',
          title: 'PCB Design Masterclass',
          description: 'Learn professional PCB design from scratch. 8-hour video course with hands-on projects and KiCad templates.',
          price_cents: 4999,
          category: 'tutorial',
          seller: {
            handle: 'pcbexpert',
            avatar_url: 'https://picsum.photos/seed/pcbexpert/40/40',
            verified: true
          },
          thumbnail_url: 'https://picsum.photos/seed/pcb-course/300/200',
          rating: 4.9,
          review_count: 87,
          download_count: 234,
          tags: ['pcb', 'kicad', 'electronics', 'course'],
          created_at: '2024-01-10T14:30:00Z',
          featured: true
        },
        {
          id: '3',
          title: 'Custom Enclosure Design Service',
          description: 'Professional 3D printed enclosure design for your electronics projects. Includes 3 revisions and manufacturing files.',
          price_cents: 15000,
          category: 'service',
          seller: {
            handle: 'designpro',
            avatar_url: 'https://picsum.photos/seed/designpro/40/40',
            verified: false
          },
          thumbnail_url: 'https://picsum.photos/seed/enclosure/300/200',
          rating: 4.7,
          review_count: 12,
          download_count: 45,
          tags: ['3d-printing', 'enclosure', 'custom', 'service'],
          created_at: '2024-01-08T09:15:00Z',
          featured: false
        },
        {
          id: '4',
          title: 'IoT Sensor Kit',
          description: 'Complete kit with temperature, humidity, and motion sensors. Includes Arduino-compatible board and example code.',
          price_cents: 3499,
          category: 'kit',
          seller: {
            handle: 'iotstore',
            avatar_url: 'https://picsum.photos/seed/iotstore/40/40',
            verified: true
          },
          thumbnail_url: 'https://picsum.photos/seed/iot-kit/300/200',
          rating: 4.6,
          review_count: 56,
          download_count: 189,
          tags: ['iot', 'sensors', 'arduino', 'kit'],
          created_at: '2024-01-05T16:45:00Z',
          featured: false
        }
      ];

      // Filter by category
      let filteredItems = selectedCategory === 'all' 
        ? mockItems 
        : mockItems.filter(item => item.category === selectedCategory);

      // Filter by search query
      if (searchQuery) {
        filteredItems = filteredItems.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      // Sort items
      filteredItems.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'popular':
            return b.download_count - a.download_count;
          case 'price_low':
            return a.price_cents - b.price_cents;
          case 'price_high':
            return b.price_cents - a.price_cents;
          case 'rating':
            return b.rating - a.rating;
          default:
            return 0;
        }
      });

      setItems(filteredItems);
    } catch (error) {
      console.error('Error loading marketplace items:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || Package;
  };

  const handlePurchase = (item: MarketplaceItem) => {
    // In production, this would integrate with Stripe
    console.log('Purchase item:', item.id);
    alert(`Purchasing ${item.title} for ${formatPrice(item.price_cents)}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-600 mt-1">Discover and purchase engineering designs, kits, and services</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="$0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="$1000"
              />
            </div>
          </div>
        </div>
      )}

      {/* Featured Items */}
      {showFeatured && items.some(item => item.featured) && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Featured Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {items.filter(item => item.featured).slice(0, 2).map(item => (
              <div key={item.id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                                         {item.thumbnail_url && (
                       <img
                         src={item.thumbnail_url}
                         alt={item.title}
                         width={120}
                         height={80}
                         className="rounded-lg object-cover"
                       />
                     )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{item.description}</p>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">{formatPrice(item.price_cents)}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {item.rating} ({item.review_count})
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {item.download_count}
                      </span>
                    </div>
                    <button
                      onClick={() => handlePurchase(item)}
                      className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Purchase Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedCategory === 'all' ? 'All Items' : categories.find(c => c.id === selectedCategory)?.label}
          </h2>
          <span className="text-gray-500">{items.length} items</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => {
            const CategoryIcon = getCategoryIcon(item.category);
            return (
              <div key={item.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                {/* Thumbnail */}
                <div className="relative">
                                     {item.thumbnail_url ? (
                     <img
                       src={item.thumbnail_url}
                       alt={item.title}
                       width={300}
                       height={200}
                       className="w-full h-48 object-cover rounded-t-lg"
                     />
                   ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                      <CategoryIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  {item.featured && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Featured
                    </div>
                  )}
                  <button className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                    <Heart className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                    <span className="text-lg font-bold text-blue-600">{formatPrice(item.price_cents)}</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

                  {/* Seller */}
                  <div className="flex items-center gap-2 mb-3">
                    {item.seller.avatar_url && (
                      <Image
                        src={item.seller.avatar_url}
                        alt={item.seller.handle}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-sm text-gray-700">@{item.seller.handle}</span>
                    {item.seller.verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {item.rating} ({item.review_count})
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {item.download_count}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePurchase(item)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Buy
                    </button>
                    <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
} 