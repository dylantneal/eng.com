// Core Marketplace Types
export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price_cents: number;
  category: 'design' | 'kit' | 'service' | 'tutorial';
  seller_id: string;
  seller: SellerProfile;
  thumbnail_url?: string;
  gallery_urls: string[];
  files: MarketplaceFile[];
  rating: number;
  review_count: number;
  purchase_count: number;
  tags: string[];
  license_type: LicenseType;
  created_at: string;
  updated_at: string;
  featured: boolean;
  status: 'draft' | 'active' | 'suspended' | 'sold_out';
  metadata: ItemMetadata;
}

export interface MarketplaceFile {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  download_url?: string; // Only available after purchase
  preview_url?: string;
  format: string; // CAD format like STEP, STL, etc.
  drm_protected: boolean;
}

export interface ItemMetadata {
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'mm' | 'cm' | 'in';
  };
  materials?: string[];
  manufacturing_methods?: string[];
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  estimated_time?: number; // in hours
  tools_required?: string[];
  assembly_required?: boolean;
}

// Seller Management
export interface SellerProfile {
  id: string;
  user_id: string;
  handle: string;
  display_name: string;
  avatar_url?: string;
  bio: string;
  verified: boolean;
  verification_level: 'none' | 'email' | 'identity' | 'business';
  seller_rating: number;
  total_sales: number;
  total_revenue_cents: number;
  total_reviews: number;
  response_time_hours: number;
  created_at: string;
  status: 'active' | 'suspended' | 'pending_verification';
  stripe_connect_id?: string;
  tax_settings: TaxSettings;
  analytics_enabled: boolean;
}

export interface TaxSettings {
  country: string;
  state_province?: string;
  tax_id?: string;
  vat_number?: string;
  business_type: 'individual' | 'business' | 'corporation';
  collect_tax: boolean;
  tax_rates: TaxRate[];
}

export interface TaxRate {
  country: string;
  state?: string;
  rate_percent: number;
  type: 'vat' | 'sales_tax' | 'gst';
}

// Payment & Escrow System
export interface Purchase {
  id: string;
  item_id: string;
  buyer_id: string;
  seller_id: string;
  amount_cents: number;
  platform_fee_cents: number;
  tax_cents: number;
  total_cents: number;
  payment_method: PaymentMethod;
  status: PurchaseStatus;
  escrow_id?: string;
  license_key: string;
  download_expires_at?: string;
  created_at: string;
  completed_at?: string;
  stripe_payment_intent_id: string;
}

export type PurchaseStatus = 
  | 'pending_payment'
  | 'payment_processing'
  | 'payment_confirmed'
  | 'in_escrow'
  | 'escrow_released'
  | 'completed'
  | 'disputed'
  | 'refunded'
  | 'cancelled';

export interface PaymentMethod {
  type: 'card' | 'bank_transfer' | 'digital_wallet';
  last_four?: string;
  brand?: string;
  country?: string;
}

export interface EscrowTransaction {
  id: string;
  purchase_id: string;
  amount_cents: number;
  status: EscrowStatus;
  release_date: string; // Auto-release date
  buyer_approved: boolean;
  seller_delivered: boolean;
  dispute_id?: string;
  created_at: string;
  released_at?: string;
}

export type EscrowStatus = 
  | 'holding'
  | 'pending_release'
  | 'released'
  | 'disputed'
  | 'refunded';

// Licensing System
export interface LicenseType {
  id: string;
  name: string;
  display_name: string;
  description: string;
  commercial_use: boolean;
  attribution_required: boolean;
  modifications_allowed: boolean;
  redistribution_allowed: boolean;
  resale_allowed: boolean;
  price_multiplier: number; // 1.0 for personal, 2.0 for commercial, etc.
  terms_url?: string;
}

export interface LicenseGrant {
  id: string;
  purchase_id: string;
  license_type_id: string;
  licensee_id: string;
  licensor_id: string;
  item_id: string;
  granted_at: string;
  expires_at?: string;
  terms_accepted_at: string;
  revoked: boolean;
  revoked_at?: string;
  revocation_reason?: string;
}

// Review & Rating System
export interface Review {
  id: string;
  item_id: string;
  purchase_id: string; // Ensures verified purchases only
  reviewer_id: string;
  reviewer: {
    handle: string;
    avatar_url?: string;
    verified_purchaser: boolean;
  };
  rating: number; // 1-5
  title: string;
  content: string;
  helpful_votes: number;
  verified_purchase: boolean;
  images: string[];
  seller_response?: SellerResponse;
  created_at: string;
  updated_at: string;
  flagged: boolean;
  moderated: boolean;
}

export interface SellerResponse {
  content: string;
  created_at: string;
  updated_at: string;
}

// Analytics & Dashboard
export interface SellerAnalytics {
  seller_id: string;
  period: 'day' | 'week' | 'month' | 'year';
  start_date: string;
  end_date: string;
  metrics: {
    revenue_cents: number;
    sales_count: number;
    views: number;
    conversion_rate: number;
    average_rating: number;
    new_reviews: number;
    refund_rate: number;
    items_sold: ItemSales[];
    traffic_sources: TrafficSource[];
    geographic_sales: GeographicSale[];
  };
}

export interface ItemSales {
  item_id: string;
  title: string;
  sales_count: number;
  revenue_cents: number;
}

export interface TrafficSource {
  source: string;
  views: number;
  conversions: number;
}

export interface GeographicSale {
  country: string;
  sales_count: number;
  revenue_cents: number;
}

// Digital Rights Management
export interface DRMSettings {
  enabled: boolean;
  max_downloads: number;
  download_expiry_hours: number;
  ip_restrictions: string[];
  device_fingerprinting: boolean;
  watermarking: boolean;
  access_logging: boolean;
}

export interface DownloadAccess {
  id: string;
  purchase_id: string;
  file_id: string;
  user_id: string;
  download_count: number;
  max_downloads: number;
  expires_at: string;
  ip_address: string;
  device_fingerprint?: string;
  created_at: string;
  last_accessed_at?: string;
  revoked: boolean;
}

// Stripe Connect Integration
export interface StripeConnectAccount {
  seller_id: string;
  stripe_account_id: string;
  details_submitted: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  verification_status: 'pending' | 'verified' | 'restricted';
  requirements: StripeRequirement[];
  capabilities: StripeCapability[];
  created_at: string;
  updated_at: string;
}

export interface StripeRequirement {
  field: string;
  type: 'currently_due' | 'eventually_due' | 'past_due';
  description: string;
}

export interface StripeCapability {
  name: string;
  status: 'active' | 'inactive' | 'pending';
}

// Marketplace Operations Interface
export interface MarketplaceOperations {
  // Item management
  createItem(item: Partial<MarketplaceItem>): Promise<MarketplaceItem>;
  updateItem(id: string, updates: Partial<MarketplaceItem>): Promise<MarketplaceItem>;
  deleteItem(id: string): Promise<void>;
  getItem(id: string): Promise<MarketplaceItem | null>;
  searchItems(query: MarketplaceSearchQuery): Promise<MarketplaceSearchResult>;

  // Purchase flow
  createPurchase(itemId: string, buyerId: string, licenseType: string): Promise<Purchase>;
  processPurchase(purchaseId: string): Promise<Purchase>;
  fulfillPurchase(purchaseId: string): Promise<void>;

  // Escrow management
  createEscrow(purchaseId: string): Promise<EscrowTransaction>;
  releaseEscrow(escrowId: string): Promise<void>;
  disputeEscrow(escrowId: string, reason: string): Promise<void>;

  // Reviews
  createReview(review: Partial<Review>): Promise<Review>;
  respondToReview(reviewId: string, response: string): Promise<void>;

  // Analytics
  getSellerAnalytics(sellerId: string, period: string): Promise<SellerAnalytics>;
  
  // Tax handling
  calculateTax(itemId: string, buyerLocation: string): Promise<number>;
  generateTaxReport(sellerId: string, period: string): Promise<TaxReport>;
}

export interface MarketplaceSearchQuery {
  query?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  license?: string;
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

export interface MarketplaceSearchResult {
  items: MarketplaceItem[];
  total: number;
  page: number;
  pages: number;
  filters: SearchFilters;
}

export interface SearchFilters {
  categories: Array<{ id: string; label: string; count: number }>;
  priceRanges: Array<{ min: number; max: number; count: number }>;
  licenses: Array<{ id: string; label: string; count: number }>;
}

export interface TaxReport {
  seller_id: string;
  period: string;
  total_sales_cents: number;
  tax_collected_cents: number;
  transactions: TaxTransaction[];
}

export interface TaxTransaction {
  purchase_id: string;
  amount_cents: number;
  tax_cents: number;
  tax_rate: number;
  buyer_location: string;
  date: string;
} 