'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  Award,
  Shield,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Lock,
  FileText,
  Settings,
  ArrowUpRight
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
    seller_rating: number;
    total_sales: number;
  };
  thumbnail_url?: string;
  rating: number;
  review_count: number;
  download_count: number;
  tags: string[];
  created_at: string;
  featured: boolean;
  license_types: string[];
  drm_protected: boolean;
  escrow_eligible: boolean;
};

interface MarketplaceProps {
  category?: string;
  searchQuery?: string;
  showFeatured?: boolean;
}

interface PurchaseModalProps {
  item: MarketplaceItem;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (itemId: string, licenseType: string) => void;
}

const licenseTypes = [
  {
    id: 'personal',
    name: 'Personal License',
    description: 'For personal, non-commercial use',
    multiplier: 1.0,
    features: ['Personal use only', 'No attribution required', 'Full access to files']
  },
  {
    id: 'commercial',
    name: 'Commercial License',
    description: 'For commercial projects and products',
    multiplier: 2.5,
    features: ['Commercial use allowed', 'Unlimited projects', 'Resale permitted', 'Priority support']
  },
  {
    id: 'extended',
    name: 'Extended License',
    description: 'Full rights including redistribution',
    multiplier: 5.0,
    features: ['All commercial rights', 'Redistribution allowed', 'White-label permitted', 'Source files included']
  },
  {
    id: 'open_source',
    name: 'Open Source',
    description: 'Free for open source projects',
    multiplier: 0,
    features: ['Open source projects only', 'Attribution required', 'Share-alike license']
  }
];

function PurchaseModal({ item, isOpen, onClose, onPurchase }: PurchaseModalProps) {
  const [selectedLicense, setSelectedLicense] = useState('personal');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const selectedLicenseType = licenseTypes.find(l => l.id === selectedLicense);
  const finalPrice = Math.round(item.price_cents * (selectedLicenseType?.multiplier || 1));

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      await onPurchase(item.id, selectedLicense);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
              <p className="text-gray-600 mt-1">Choose your license type</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          {/* License Selection */}
          <div className="space-y-4 mb-6">
            {licenseTypes.map((license) => (
              <div
                key={license.id}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  selectedLicense === license.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedLicense(license.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedLicense === license.id ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                    }`}>
                      {selectedLicense === license.id && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{license.name}</h3>
                      <p className="text-sm text-gray-600">{license.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      {license.multiplier === 0 ? 'FREE' : `$${(item.price_cents * license.multiplier / 100).toFixed(2)}`}
                    </div>
                    {license.multiplier > 1 && (
                      <div className="text-sm text-gray-500">{license.multiplier}x base price</div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {license.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Purchase Protection */}
          {finalPrice >= 50000 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Escrow Protection</span>
              </div>
              <p className="text-sm text-green-700">
                This purchase qualifies for escrow protection. Your payment will be held securely 
                until you confirm receipt of the files.
              </p>
            </div>
          )}

          {/* DRM Info */}
          {item.drm_protected && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800">DRM Protected</span>
              </div>
              <p className="text-sm text-blue-700">
                Files are protected with digital rights management. Limited to 5 downloads within 30 days.
              </p>
            </div>
          )}

          {/* Purchase Button */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Purchase for {finalPrice === 0 ? 'FREE' : `$${(finalPrice / 100).toFixed(2)}`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Marketplace({ category, searchQuery, showFeatured = true }: MarketplaceProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'price_low' | 'price_high' | 'rating'>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

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
      // Enhanced marketplace data showcasing our advanced features
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
            verified: true,
            seller_rating: 4.8,
            total_sales: 156
          },
          thumbnail_url: 'https://picsum.photos/seed/robot-chassis/300/200',
          rating: 4.8,
          review_count: 24,
          download_count: 156,
          tags: ['arduino', 'robotics', 'chassis', 'modular'],
          created_at: '2024-01-15T10:00:00Z',
          featured: true,
          license_types: ['personal', 'commercial', 'extended'],
          drm_protected: true,
          escrow_eligible: false
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
            verified: true,
            seller_rating: 4.9,
            total_sales: 234
          },
          thumbnail_url: 'https://picsum.photos/seed/pcb-course/300/200',
          rating: 4.9,
          review_count: 87,
          download_count: 234,
          tags: ['pcb', 'kicad', 'electronics', 'course'],
          created_at: '2024-01-10T14:30:00Z',
          featured: true,
          license_types: ['personal', 'commercial'],
          drm_protected: true,
          escrow_eligible: false
        },
        {
          id: '3',
          title: 'Custom Enclosure Design Service',
          description: 'Professional 3D printed enclosure design for your electronics projects. Includes 3 revisions and manufacturing files.',
          price_cents: 75000,
          category: 'service',
          seller: {
            handle: 'designpro',
            avatar_url: 'https://picsum.photos/seed/designpro/40/40',
            verified: true,
            seller_rating: 4.7,
            total_sales: 45
          },
          thumbnail_url: 'https://picsum.photos/seed/enclosure/300/200',
          rating: 4.7,
          review_count: 12,
          download_count: 45,
          tags: ['3d-printing', 'enclosure', 'custom', 'service'],
          created_at: '2024-01-08T09:15:00Z',
          featured: false,
          license_types: ['commercial', 'extended'],
          drm_protected: false,
          escrow_eligible: true
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
            verified: true,
            seller_rating: 4.6,
            total_sales: 189
          },
          thumbnail_url: 'https://picsum.photos/seed/iot-kit/300/200',
          rating: 4.6,
          review_count: 56,
          download_count: 189,
          tags: ['iot', 'sensors', 'arduino', 'kit'],
          created_at: '2024-01-05T16:45:00Z',
          featured: false,
          license_types: ['personal', 'commercial', 'open_source'],
          drm_protected: false,
          escrow_eligible: false
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

  const handlePurchase = (item: MarketplaceItem) => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    setSelectedItem(item);
    setShowPurchaseModal(true);
  };

  const processPurchase = async (itemId: string, licenseType: string) => {
    try {
      const response = await fetch('/api/marketplace/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, license_type: licenseType })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Purchase created successfully! Purchase ID: ${result.data.id}`);
      } else {
        const error = await response.json();
        alert(`Purchase failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-80"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Clean Header */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Marketplace</h2>
            <div className="flex items-center gap-3">
              {user && (
                <Link
                  href="/test-marketplace"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Test Suite
                </Link>
              )}
              <Link
                href="/seller/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                Seller Dashboard
              </Link>
            </div>
          </div>

          {/* Clean Feature Highlights */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-blue-600">
              <Shield className="w-4 h-4" />
              <span>Escrow Protection</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <FileText className="w-4 h-4" />
              <span>Multiple Licenses</span>
            </div>
            <div className="flex items-center gap-2 text-purple-600">
              <Lock className="w-4 h-4" />
              <span>DRM Security</span>
            </div>
            <div className="flex items-center gap-2 text-orange-600">
              <Star className="w-4 h-4" />
              <span>Verified Reviews</span>
            </div>
          </div>
        </div>

        {/* Clean Sort Controls */}
        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="rating">Highest Rated</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Clean Category Navigation */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Clean Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
            <div className="relative">
              <Image
                src={item.thumbnail_url || '/placeholder.jpg'}
                alt={item.title}
                width={300}
                height={200}
                className="w-full h-48 object-cover"
              />
              {item.featured && (
                <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                  Featured
                </div>
              )}
              <div className="absolute top-3 right-3 flex gap-1">
                {item.drm_protected && (
                  <div className="bg-purple-600 text-white p-1.5 rounded-md">
                    <Lock className="w-3 h-3" />
                  </div>
                )}
                {item.escrow_eligible && (
                  <div className="bg-green-600 text-white p-1.5 rounded-md">
                    <Shield className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg leading-tight flex-1 pr-2">{item.title}</h3>
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-600">{formatPrice(item.price_cents)}</div>
                  <div className="text-xs text-gray-500">starting at</div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

              {/* Seller Info */}
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src={item.seller.avatar_url || '/default-avatar.jpg'}
                  alt={item.seller.handle}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <span className="text-sm text-gray-700 font-medium">{item.seller.handle}</span>
                {item.seller.verified && (
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                )}
                <div className="ml-auto flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{item.rating}</span>
                  <span className="text-xs text-gray-500">({item.review_count})</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{item.download_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>1.2k</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {item.license_types.length} license{item.license_types.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handlePurchase(item)}
                className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Purchase
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Purchase Modal */}
      {selectedItem && (
        <PurchaseModal
          item={selectedItem}
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setSelectedItem(null);
          }}
          onPurchase={processPurchase}
        />
      )}

      {/* No Results */}
      {items.length === 0 && !loading && (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
} 