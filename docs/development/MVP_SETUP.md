# CAD Collaboration Platform MVP Setup

This document outlines the setup process for your profitable CAD collaboration MVP, following the 6-month timeline and technical specifications.

## 🎯 MVP Status

### ✅ Completed Features
- **Authentication & Profiles** - NextAuth with Supabase
- **Project Repository** - File upload to S3, linear version history
- **CAD Viewer** - Three.js-based viewer with real STL loading and OrbitControls
- **Comments System** - Real-time commenting on projects
- **Presence Service** - Shows who's currently viewing projects
- **Search** - Basic project search functionality with navbar integration
- **Pricing Page** - Freemium model (Free vs Pro at $12/month)
- **Billing System** - Complete Stripe integration with plan enforcement
- **Plan Limits** - Free tier restrictions and Pro upgrade prompts
- **Admin Console** - Basic platform management and DMCA workflow
- **Webhook Handler** - Automatic plan updates on subscription changes

### 🚧 Next Steps (Month 3-6)
- Add OpenCASCADE WASM for advanced STEP file parsing
- Implement email notifications for plan changes and DMCA
- Set up observability stack (Prometheus → Grafana)
- Add file virus scanning and content moderation
- Implement rate limiting and API quotas
- Create mobile-responsive design improvements

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Database & Storage (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Authentication (NextAuth)
NEXTAUTH_URL=http://localhost:4000
NEXTAUTH_SECRET=your_nextauth_secret

# Stripe (Billing)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=your_pro_plan_price_id
STRIPE_WEBHOOK_SECRET=your_webhook_endpoint_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:4000
```

## 📊 Database Schema

Your Supabase database should have these tables:

### Core Tables
- `profiles` - User profiles with handle, avatar, plan info
- `projects` - Project metadata (title, slug, owner, visibility)
- `versions` - Linear version history (no branches in MVP)
- `comments` - Project comments and discussions
- `bookmarks` - User project bookmarks
- `payments` - Stripe payment tracking

### Views
- `project_feed` - Optimized view for project listings

## 🚀 Deployment Architecture

Following your lean technical shape:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │────│   Supabase DB    │────│   S3 Storage    │
│  (Monolith)     │    │   (Postgres)     │    │  (CAD Files)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌──────────────────┐
│   Stripe API    │    │  Presence Store  │
│   (Billing)     │    │  (In-Memory)     │
└─────────────────┘    └──────────────────┘
```

## 💰 Revenue Model Implementation

### Free Tier Limits
- Up to 5 projects
- 100 MB storage per project
- Public projects only
- Basic 3D viewer

### Pro Tier ($12/month)
- Unlimited projects
- 1 GB storage per project
- Private projects
- Priority support
- Advanced search filters

## 🎯 Success Metrics (KPIs)

Track these metrics for your 6-month launch:

1. **Technical Health**
   - <3% crash-free sessions drop
   - P99 login < 500ms
   - Model load < 3s for ≤5k-part assemblies

2. **Product-Market Fit**
   - 30% D1 retention for new projects
   - 4% conversion rate (MAU to Pro)
   - First 200 paid seats within 60 days

3. **Financial Health**
   - AWS costs ≤ $5k/month
   - Gross margin > 80%
   - Operational profitability at 800 Pro subscribers

## 🔄 Development Workflow

### Month 2 Priorities
1. **Real CAD Viewer**
   ```bash
   npm install three-stdlib
   # Implement STLLoader and basic STEP support
   ```

2. **Billing Enforcement**
   ```typescript
   // Add middleware to check plan limits
   // Implement storage quota tracking
   ```

3. **Search Enhancement**
   ```bash
   # Consider upgrading to OpenSearch for production
   # Add advanced filters for Pro users
   ```

### Month 3-4 Priorities
1. **Admin Console** - DMCA takedown flow
2. **Observability** - Prometheus + Grafana setup
3. **Load Testing** - Ensure 20k MAU capacity

## 🚦 Launch Checklist

### Pre-Launch (Month 5)
- [ ] Security audit (HTTPS, MFA for admins)
- [ ] Backup strategy (nightly encrypted RDS snapshots)
- [ ] DMCA agent registration
- [ ] Terms of Service and Privacy Policy
- [ ] Beta user feedback integration

### Launch (Month 6)
- [ ] Private beta → public "Early Access"
- [ ] Landing page optimization
- [ ] Social media presence
- [ ] Community building (Discord/Slack)
- [ ] First 100 beta sign-ups collected

## 🎨 UI/UX Enhancements

The current implementation provides a solid foundation. Consider these improvements:

1. **File Upload UX**
   - Drag-and-drop visual feedback
   - Upload progress indicators
   - File type validation

2. **CAD Viewer**
   - Measurement tools
   - Section views
   - Material/texture support

3. **Collaboration**
   - @mentions in comments
   - Email notifications
   - Activity feeds

## 📈 Scaling Considerations

When you hit 1000+ users:

1. **Database** - Consider read replicas
2. **Storage** - Implement CDN for file delivery
3. **Presence** - Move from in-memory to Redis
4. **Search** - Upgrade to dedicated OpenSearch cluster

## 🔐 Security Checklist

- [x] HTTPS everywhere
- [x] Input sanitization (DOMPurify)
- [x] SQL injection protection (Supabase RLS)
- [ ] Rate limiting on API endpoints
- [ ] File upload virus scanning
- [ ] ITAR compliance for sensitive files

---

## 🚀 Quick Start

1. Clone and install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (see above)

3. Run database migrations:
   ```bash
   npm run db:types
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Visit `http://localhost:4000` and start building!

---

**Remember**: This MVP is designed to be profitable from day one. Focus on the core value proposition (cloud-native CAD version control) and resist feature creep until you hit your initial revenue targets.

Good luck building the future of engineering collaboration! 🛠️ 