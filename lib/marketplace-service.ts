import { 
  MarketplaceItem, 
  Purchase, 
  EscrowTransaction, 
  Review, 
  SellerProfile, 
  SellerAnalytics,
  LicenseType,
  LicenseGrant,
  MarketplaceOperations,
  MarketplaceSearchQuery,
  MarketplaceSearchResult,
  DRMSettings,
  DownloadAccess,
  TaxReport,
  StripeConnectAccount
} from '@/types/marketplace';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export class MarketplaceService implements MarketplaceOperations {
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateLicenseKey(): string {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
  }

  // ================== STRIPE CONNECT INTEGRATION ==================

  async createSellerAccount(sellerId: string, accountData: any): Promise<StripeConnectAccount> {
    try {
      // Create Stripe Connect Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country: accountData.country || 'US',
        email: accountData.email,
        business_type: accountData.business_type || 'individual',
        individual: accountData.business_type === 'individual' ? {
          first_name: accountData.first_name,
          last_name: accountData.last_name,
          email: accountData.email,
        } : undefined,
        company: accountData.business_type !== 'individual' ? {
          name: accountData.company_name,
        } : undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      const connectAccount: StripeConnectAccount = {
        seller_id: sellerId,
        stripe_account_id: account.id,
        details_submitted: account.details_submitted || false,
        charges_enabled: account.charges_enabled || false,
        payouts_enabled: account.payouts_enabled || false,
        verification_status: this.getVerificationStatus(account),
        requirements: account.requirements?.currently_due?.map(field => ({
          field,
          type: 'currently_due' as const,
          description: `${field} is required`
        })) || [],
        capabilities: Object.entries(account.capabilities || {}).map(([name, capability]) => ({
          name,
          status: capability.status || 'inactive'
        })),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // TODO: Save to database
      await this.saveStripeAccount(connectAccount);

      return connectAccount;
    } catch (error) {
      console.error('Error creating seller account:', error);
      throw new Error('Failed to create seller account');
    }
  }

  async createAccountOnboardingLink(sellerId: string): Promise<string> {
    const account = await this.getStripeAccount(sellerId);
    if (!account) {
      throw new Error('Seller account not found');
    }

    const accountLink = await stripe.accountLinks.create({
      account: account.stripe_account_id,
      refresh_url: `${process.env.DOMAIN_URL}/seller/onboarding?refresh=true`,
      return_url: `${process.env.DOMAIN_URL}/seller/dashboard?setup=complete`,
      type: 'account_onboarding',
    });

    return accountLink.url;
  }

  async createLoginLink(sellerId: string): Promise<string> {
    const account = await this.getStripeAccount(sellerId);
    if (!account) {
      throw new Error('Seller account not found');
    }

    const loginLink = await stripe.accounts.createLoginLink(account.stripe_account_id);
    return loginLink.url;
  }

  private getVerificationStatus(account: Stripe.Account): 'pending' | 'verified' | 'restricted' {
    if (account.requirements?.currently_due?.length || account.requirements?.past_due?.length) {
      return 'pending';
    }
    if (account.charges_enabled && account.payouts_enabled) {
      return 'verified';
    }
    return 'restricted';
  }

  // ================== PAYMENT & ESCROW SYSTEM ==================

  async createPurchase(itemId: string, buyerId: string, licenseType: string): Promise<Purchase> {
    const item = await this.getItem(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    const license = await this.getLicenseType(licenseType);
    if (!license) {
      throw new Error('Invalid license type');
    }

    const amount_cents = Math.round(item.price_cents * license.price_multiplier);
    const platform_fee_cents = Math.round(amount_cents * 0.05); // 5% platform fee
    const tax_cents = await this.calculateTax(itemId, 'US'); // TODO: Get buyer location
    const total_cents = amount_cents + tax_cents;

    const purchase: Purchase = {
      id: this.generateId(),
      item_id: itemId,
      buyer_id: buyerId,
      seller_id: item.seller_id,
      amount_cents,
      platform_fee_cents,
      tax_cents,
      total_cents,
      payment_method: { type: 'card' }, // Will be updated after payment
      status: 'pending_payment',
      license_key: this.generateLicenseKey(),
      download_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      created_at: new Date().toISOString(),
      stripe_payment_intent_id: ''
    };

    // TODO: Save to database
    await this.savePurchase(purchase);

    return purchase;
  }

  async processPurchase(purchaseId: string): Promise<Purchase> {
    const purchase = await this.getPurchase(purchaseId);
    if (!purchase) {
      throw new Error('Purchase not found');
    }

    const seller = await this.getSellerProfile(purchase.seller_id);
    if (!seller?.stripe_connect_id) {
      throw new Error('Seller not properly onboarded');
    }

    try {
      // Create payment intent with Stripe Connect
      const paymentIntent = await stripe.paymentIntents.create({
        amount: purchase.total_cents,
        currency: 'usd',
        application_fee_amount: purchase.platform_fee_cents,
        transfer_data: {
          destination: seller.stripe_connect_id,
        },
        metadata: {
          purchase_id: purchaseId,
          item_id: purchase.item_id,
          buyer_id: purchase.buyer_id,
          seller_id: purchase.seller_id
        }
      });

      // Update purchase with payment intent
      purchase.stripe_payment_intent_id = paymentIntent.id;
      purchase.status = 'payment_processing';
      
      await this.savePurchase(purchase);

      return purchase;
    } catch (error) {
      console.error('Error processing purchase:', error);
      purchase.status = 'cancelled';
      await this.savePurchase(purchase);
      throw new Error('Payment processing failed');
    }
  }

  async fulfillPurchase(purchaseId: string): Promise<void> {
    const purchase = await this.getPurchase(purchaseId);
    if (!purchase) {
      throw new Error('Purchase not found');
    }

    const item = await this.getItem(purchase.item_id);
    if (!item) {
      throw new Error('Item not found');
    }

    // Check if high-value item requires escrow
    const requiresEscrow = purchase.amount_cents > 50000; // $500+ goes to escrow

    if (requiresEscrow) {
      const escrow = await this.createEscrow(purchaseId);
      purchase.escrow_id = escrow.id;
      purchase.status = 'in_escrow';
    } else {
      purchase.status = 'completed';
      purchase.completed_at = new Date().toISOString();
    }

    // Generate license grant
    await this.createLicenseGrant({
      purchase_id: purchaseId,
      license_type_id: item.license_type.id,
      licensee_id: purchase.buyer_id,
      licensor_id: purchase.seller_id,
      item_id: purchase.item_id,
      granted_at: new Date().toISOString(),
      terms_accepted_at: new Date().toISOString(),
      revoked: false
    });

    // Set up DRM-protected downloads
    await this.setupDownloadAccess(purchase, item);

    await this.savePurchase(purchase);

    // Send notifications
    await this.sendPurchaseNotifications(purchase);
  }

  // ================== ESCROW SYSTEM ==================

  async createEscrow(purchaseId: string): Promise<EscrowTransaction> {
    const purchase = await this.getPurchase(purchaseId);
    if (!purchase) {
      throw new Error('Purchase not found');
    }

    const escrow: EscrowTransaction = {
      id: this.generateId(),
      purchase_id: purchaseId,
      amount_cents: purchase.amount_cents,
      status: 'holding',
      release_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days auto-release
      buyer_approved: false,
      seller_delivered: false,
      created_at: new Date().toISOString()
    };

    // TODO: Save to database
    await this.saveEscrow(escrow);

    return escrow;
  }

  async releaseEscrow(escrowId: string): Promise<void> {
    const escrow = await this.getEscrow(escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    if (escrow.status !== 'holding') {
      throw new Error('Escrow cannot be released');
    }

    const purchase = await this.getPurchase(escrow.purchase_id);
    if (!purchase) {
      throw new Error('Purchase not found');
    }

    try {
      // Release funds to seller via Stripe
      // Funds were already captured, so no additional transfer needed
      // This would trigger the transfer to the connected account

      escrow.status = 'released';
      escrow.released_at = new Date().toISOString();
      
      purchase.status = 'completed';
      purchase.completed_at = new Date().toISOString();

      await this.saveEscrow(escrow);
      await this.savePurchase(purchase);

      // Send release notifications
      await this.sendEscrowReleaseNotifications(escrow, purchase);
    } catch (error) {
      console.error('Error releasing escrow:', error);
      throw new Error('Failed to release escrow');
    }
  }

  async disputeEscrow(escrowId: string, reason: string): Promise<void> {
    const escrow = await this.getEscrow(escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    escrow.status = 'disputed';
    escrow.dispute_id = this.generateId();

    await this.saveEscrow(escrow);

    // TODO: Create dispute record and notify admin
    await this.createDispute(escrow.dispute_id, escrowId, reason);
  }

  // ================== LICENSING SYSTEM ==================

  async getLicenseTypes(): Promise<LicenseType[]> {
    // Pre-defined license types
    return [
      {
        id: 'personal',
        name: 'personal',
        display_name: 'Personal Use',
        description: 'For personal, non-commercial projects only',
        commercial_use: false,
        attribution_required: true,
        modifications_allowed: true,
        redistribution_allowed: false,
        resale_allowed: false,
        price_multiplier: 1.0,
        terms_url: '/terms/personal-license'
      },
      {
        id: 'commercial',
        name: 'commercial',
        display_name: 'Commercial Use',
        description: 'For commercial projects and products',
        commercial_use: true,
        attribution_required: false,
        modifications_allowed: true,
        redistribution_allowed: false,
        resale_allowed: false,
        price_multiplier: 2.5,
        terms_url: '/terms/commercial-license'
      },
      {
        id: 'extended',
        name: 'extended',
        display_name: 'Extended Commercial',
        description: 'Commercial use with resale rights',
        commercial_use: true,
        attribution_required: false,
        modifications_allowed: true,
        redistribution_allowed: true,
        resale_allowed: true,
        price_multiplier: 5.0,
        terms_url: '/terms/extended-license'
      },
      {
        id: 'open_source',
        name: 'open_source',
        display_name: 'Open Source',
        description: 'MIT-style open source license',
        commercial_use: true,
        attribution_required: true,
        modifications_allowed: true,
        redistribution_allowed: true,
        resale_allowed: false,
        price_multiplier: 0.0, // Free
        terms_url: '/terms/open-source-license'
      }
    ];
  }

  async createLicenseGrant(grantData: Partial<LicenseGrant>): Promise<LicenseGrant> {
    const grant: LicenseGrant = {
      id: this.generateId(),
      purchase_id: grantData.purchase_id!,
      license_type_id: grantData.license_type_id!,
      licensee_id: grantData.licensee_id!,
      licensor_id: grantData.licensor_id!,
      item_id: grantData.item_id!,
      granted_at: grantData.granted_at || new Date().toISOString(),
      terms_accepted_at: grantData.terms_accepted_at || new Date().toISOString(),
      revoked: false,
      ...grantData
    };

    // TODO: Save to database
    await this.saveLicenseGrant(grant);

    return grant;
  }

  // ================== REVIEW SYSTEM ==================

  async createReview(reviewData: Partial<Review>): Promise<Review> {
    // Verify purchase before allowing review
    const purchase = await this.getPurchase(reviewData.purchase_id!);
    if (!purchase || purchase.buyer_id !== reviewData.reviewer_id) {
      throw new Error('Invalid purchase for review');
    }

    const review: Review = {
      id: this.generateId(),
      item_id: reviewData.item_id!,
      purchase_id: reviewData.purchase_id!,
      reviewer_id: reviewData.reviewer_id!,
      reviewer: {
        handle: 'user', // TODO: Get from user profile
        verified_purchaser: true
      },
      rating: reviewData.rating!,
      title: reviewData.title!,
      content: reviewData.content!,
      helpful_votes: 0,
      verified_purchase: true,
      images: reviewData.images || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      flagged: false,
      moderated: false
    };

    // TODO: Save to database
    await this.saveReview(review);

    // Update item rating
    await this.updateItemRating(review.item_id);

    return review;
  }

  async respondToReview(reviewId: string, response: string): Promise<void> {
    const review = await this.getReview(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    review.seller_response = {
      content: response,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.saveReview(review);
  }

  // ================== DIGITAL RIGHTS MANAGEMENT ==================

  async setupDownloadAccess(purchase: Purchase, item: MarketplaceItem): Promise<void> {
    for (const file of item.files) {
      if (file.drm_protected) {
        const access: DownloadAccess = {
          id: this.generateId(),
          purchase_id: purchase.id,
          file_id: file.id,
          user_id: purchase.buyer_id,
          download_count: 0,
          max_downloads: 5, // Default limit
          expires_at: purchase.download_expires_at!,
          ip_address: '', // Will be set on first download
          created_at: new Date().toISOString(),
          revoked: false
        };

        await this.saveDownloadAccess(access);
      }
    }
  }

  async authorizeDownload(fileId: string, userId: string, ipAddress: string): Promise<string | null> {
    const access = await this.getDownloadAccess(fileId, userId);
    if (!access) {
      return null;
    }

    if (access.revoked || new Date(access.expires_at) < new Date()) {
      return null;
    }

    if (access.download_count >= access.max_downloads) {
      return null;
    }

    // Update download count and access info
    access.download_count++;
    access.ip_address = ipAddress;
    access.last_accessed_at = new Date().toISOString();

    await this.saveDownloadAccess(access);

    // Generate secure download URL (would be pre-signed URL in production)
    return this.generateSecureDownloadUrl(fileId, access.id);
  }

  private generateSecureDownloadUrl(fileId: string, accessId: string): string {
    // In production, this would generate a time-limited pre-signed URL
    const token = Buffer.from(`${fileId}:${accessId}:${Date.now()}`).toString('base64');
    return `/api/marketplace/download/${fileId}?token=${token}`;
  }

  // ================== ANALYTICS & REPORTING ==================

  async getSellerAnalytics(sellerId: string, period: string): Promise<SellerAnalytics> {
    // TODO: Implement real analytics from database
    const mockAnalytics: SellerAnalytics = {
      seller_id: sellerId,
      period: period as any,
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date().toISOString(),
      metrics: {
        revenue_cents: 125000, // $1,250
        sales_count: 25,
        views: 1500,
        conversion_rate: 1.67,
        average_rating: 4.8,
        new_reviews: 8,
        refund_rate: 0.02,
        items_sold: [
          { item_id: '1', title: 'Robot Chassis', sales_count: 15, revenue_cents: 75000 },
          { item_id: '2', title: 'PCB Design', sales_count: 10, revenue_cents: 50000 }
        ],
        traffic_sources: [
          { source: 'organic', views: 800, conversions: 15 },
          { source: 'social', views: 400, conversions: 7 },
          { source: 'direct', views: 300, conversions: 3 }
        ],
        geographic_sales: [
          { country: 'US', sales_count: 15, revenue_cents: 75000 },
          { country: 'CA', sales_count: 6, revenue_cents: 30000 },
          { country: 'UK', sales_count: 4, revenue_cents: 20000 }
        ]
      }
    };

    return mockAnalytics;
  }

  async calculateTax(itemId: string, buyerLocation: string): Promise<number> {
    // Simplified tax calculation - in production would use tax service
    const taxRates: Record<string, number> = {
      'US': 0.08, // 8% average US sales tax
      'CA': 0.13, // 13% HST
      'GB': 0.20, // 20% VAT
      'DE': 0.19, // 19% VAT
      'FR': 0.20, // 20% VAT
    };

    const item = await this.getItem(itemId);
    if (!item) return 0;

    const rate = taxRates[buyerLocation] || 0;
    return Math.round(item.price_cents * rate);
  }

  async generateTaxReport(sellerId: string, period: string): Promise<TaxReport> {
    // TODO: Implement real tax report generation
    return {
      seller_id: sellerId,
      period,
      total_sales_cents: 125000,
      tax_collected_cents: 10000,
      transactions: [
        {
          purchase_id: '1',
          amount_cents: 2500,
          tax_cents: 200,
          tax_rate: 0.08,
          buyer_location: 'US',
          date: new Date().toISOString()
        }
      ]
    };
  }

  // ================== ITEM MANAGEMENT ==================

  async createItem(itemData: Partial<MarketplaceItem>): Promise<MarketplaceItem> {
    const item: MarketplaceItem = {
      id: this.generateId(),
      title: itemData.title!,
      description: itemData.description!,
      price_cents: itemData.price_cents!,
      category: itemData.category!,
      seller_id: itemData.seller_id!,
      seller: itemData.seller!,
      thumbnail_url: itemData.thumbnail_url,
      gallery_urls: itemData.gallery_urls || [],
      files: itemData.files || [],
      rating: 0,
      review_count: 0,
      purchase_count: 0,
      tags: itemData.tags || [],
      license_type: itemData.license_type!,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      featured: false,
      status: 'draft',
      metadata: itemData.metadata || {}
    };

    // TODO: Save to database
    await this.saveItem(item);

    return item;
  }

  async updateItem(id: string, updates: Partial<MarketplaceItem>): Promise<MarketplaceItem> {
    const item = await this.getItem(id);
    if (!item) {
      throw new Error('Item not found');
    }

    const updatedItem = { ...item, ...updates, updated_at: new Date().toISOString() };
    await this.saveItem(updatedItem);

    return updatedItem;
  }

  async deleteItem(id: string): Promise<void> {
    // TODO: Implement soft delete
    console.log(`Deleting item ${id}`);
  }

  async getItem(id: string): Promise<MarketplaceItem | null> {
    // TODO: Fetch from database
    return null;
  }

  async searchItems(query: MarketplaceSearchQuery): Promise<MarketplaceSearchResult> {
    // TODO: Implement real search
    return {
      items: [],
      total: 0,
      page: query.page || 1,
      pages: 0,
      filters: {
        categories: [],
        priceRanges: [],
        licenses: []
      }
    };
  }

  // ================== PRIVATE HELPER METHODS ==================

  private async saveItem(item: MarketplaceItem): Promise<void> {
    // TODO: Save to database
  }

  private async savePurchase(purchase: Purchase): Promise<void> {
    // TODO: Save to database
  }

  private async saveEscrow(escrow: EscrowTransaction): Promise<void> {
    // TODO: Save to database
  }

  private async saveReview(review: Review): Promise<void> {
    // TODO: Save to database
  }

  private async saveLicenseGrant(grant: LicenseGrant): Promise<void> {
    // TODO: Save to database
  }

  private async saveDownloadAccess(access: DownloadAccess): Promise<void> {
    // TODO: Save to database
  }

  private async saveStripeAccount(account: StripeConnectAccount): Promise<void> {
    // TODO: Save to database
  }

  private async getPurchase(id: string): Promise<Purchase | null> {
    // TODO: Fetch from database
    return null;
  }

  private async getEscrow(id: string): Promise<EscrowTransaction | null> {
    // TODO: Fetch from database
    return null;
  }

  private async getReview(id: string): Promise<Review | null> {
    // TODO: Fetch from database
    return null;
  }

  private async getLicenseType(id: string): Promise<LicenseType | null> {
    const types = await this.getLicenseTypes();
    return types.find(t => t.id === id) || null;
  }

  private async getSellerProfile(id: string): Promise<SellerProfile | null> {
    // TODO: Fetch from database
    return null;
  }

  private async getStripeAccount(sellerId: string): Promise<StripeConnectAccount | null> {
    // TODO: Fetch from database
    return null;
  }

  private async getDownloadAccess(fileId: string, userId: string): Promise<DownloadAccess | null> {
    // TODO: Fetch from database
    return null;
  }

  private async updateItemRating(itemId: string): Promise<void> {
    // TODO: Recalculate average rating from reviews
  }

  private async sendPurchaseNotifications(purchase: Purchase): Promise<void> {
    // TODO: Send email notifications
  }

  private async sendEscrowReleaseNotifications(escrow: EscrowTransaction, purchase: Purchase): Promise<void> {
    // TODO: Send email notifications
  }

  private async createDispute(disputeId: string, escrowId: string, reason: string): Promise<void> {
    // TODO: Create dispute record
  }
}

export const marketplaceService = new MarketplaceService(); 