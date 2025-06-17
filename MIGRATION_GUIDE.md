# 🚀 Migration Guide: Supabase to Google Cloud SQL + Prisma

This guide will help you migrate your eng.com platform from Supabase to Google Cloud SQL with Prisma ORM for better scalability, AI debugging capabilities, and production robustness.

## ✅ **Benefits of This Migration**

- **AI-Accessible Database**: Cursor can directly read Prisma schema and debug issues
- **Type Safety**: Full TypeScript integration with compile-time error checking
- **Scalability**: Google Cloud SQL with automatic scaling and read replicas
- **Production-Ready**: Enterprise-grade database with 99.95% SLA
- **Cost Optimization**: Pay-per-use pricing with better resource management
- **Zero Vendor Lock-in**: Standard PostgreSQL with migration flexibility

---

## 📋 **Pre-Migration Checklist**

### 1. **Install Required Dependencies**

```bash
npm install prisma @prisma/client @prisma/extension-accelerate
npm install -D prisma

# Additional packages for migration
npm install @supabase/supabase-js dotenv
```

### 2. **Set Up Google Cloud**

```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
gcloud init

# Enable required APIs
gcloud services enable sqladmin.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### 3. **Create Environment Variables**

Create a `.env.local` file:

```env
# Google Cloud SQL
DATABASE_URL="postgresql://app-user:your-password@/eng_com?host=/cloudsql/your-project:us-central1:eng-com-db"

# Supabase (temporary during migration)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Other required variables
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://eng.com"
STRIPE_SECRET_KEY="sk_..."
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
```

---

## 🗄️ **Step 1: Set Up Google Cloud SQL**

### Create the Database Instance

```bash
# Create production-ready Cloud SQL instance
gcloud sql instances create eng-com-db \
    --database-version=POSTGRES_15 \
    --tier=db-custom-4-15360 \
    --region=us-central1 \
    --storage-type=SSD \
    --storage-size=200GB \
    --storage-auto-increase \
    --backup-start-time=03:00 \
    --enable-point-in-time-recovery \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=04 \
    --deletion-protection

# Create database
gcloud sql databases create eng_com --instance=eng-com-db

# Create application user
gcloud sql users create app-user \
    --instance=eng-com-db \
    --password=$(openssl rand -base64 32)

# Get connection info
gcloud sql instances describe eng-com-db
```

### Set Up Connection Security

```bash
# Create Cloud SQL Proxy for local development
curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64
chmod +x cloud_sql_proxy

# Connect locally (run in separate terminal)
./cloud_sql_proxy -instances=your-project:us-central1:eng-com-db=tcp:5432
```

---

## 🔄 **Step 2: Initialize Prisma**

### Generate Initial Migration from Supabase

```bash
# Initialize Prisma
npx prisma init

# Generate Prisma schema from existing Supabase database
npx prisma db pull --url="postgresql://postgres:your-supabase-password@db.your-project.supabase.co:5432/postgres"

# Create initial migration
npx prisma migrate dev --name init
```

### Apply Schema to Google Cloud SQL

```bash
# Deploy migrations to production database
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed initial data (optional)
npx prisma db seed
```

---

## 📊 **Step 3: Run Data Migration**

### Backup Your Supabase Data

```bash
# Export data from Supabase
pg_dump "postgresql://postgres:password@db.project.supabase.co:5432/postgres" \
    --data-only \
    --inserts \
    --no-owner \
    --no-privileges > supabase_backup.sql
```

### Execute Migration Script

```bash
# Run the comprehensive migration script
node scripts/migrate-to-gcloud.js

# Monitor migration progress
tail -f migration-report.json
```

### Verify Migration

```bash
# Test database connection
npx prisma studio

# Run data integrity checks
npm run test:migration

# Compare record counts
node -e "
const { DatabaseOperations } = require('./lib/database');
DatabaseOperations.healthCheck().then(console.log);
"
```

---

## 🚀 **Step 4: Update Application Code**

### Replace Supabase Client Imports

**Before:**
```typescript
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
```

**After:**
```typescript
import { db, DatabaseOperations } from '@/lib/database';
// Use db directly or DatabaseOperations helper methods
```

### Update API Routes

**Example: Profile API Route**

```typescript
// app/api/profile/[handle]/route.ts
import { DatabaseOperations } from '@/lib/database';

export async function GET(request: Request, { params }: { params: { handle: string } }) {
  try {
    const profile = await DatabaseOperations.getProfileByHandle(params.handle);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Update Components

**Example: Profile Component**

```typescript
// components/ProfileComponent.tsx
import { DatabaseOperations, type Profile } from '@/lib/database';

export async function ProfileComponent({ handle }: { handle: string }) {
  const profile = await DatabaseOperations.getProfileByHandle(handle);
  // Component logic...
}
```

---

## 🔧 **Step 5: Set Up CI/CD Pipeline**

### GitHub Secrets Configuration

Add these secrets to your GitHub repository:

```
GCP_PROJECT_ID=your-project-id
GCP_SA_KEY={"type": "service_account", ...}
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://eng.com
STRIPE_SECRET_KEY=sk_...
GCS_BUCKET=eng-com-files
```

### Deploy to Google Cloud Run

```bash
# Manual deployment (first time)
gcloud run deploy eng-com \
    --source . \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --min-instances 1 \
    --max-instances 100 \
    --set-env-vars="DATABASE_URL=$DATABASE_URL"

# Automated deployment via GitHub Actions is configured in .github/workflows/deploy.yml
```

---

## 🧪 **Step 6: Testing & Validation**

### Run Comprehensive Tests

```bash
# Unit tests
npm test

# Integration tests with real database
npm run test:integration

# End-to-end tests
npm run test:e2e

# Performance tests
npm run test:performance
```

### Monitor Application Health

```bash
# Check health endpoint
curl https://eng.com/api/health

# Monitor database performance
gcloud sql operations list --instance=eng-com-db

# View application logs
gcloud run logs read --service=eng-com --region=us-central1
```

---

## 🔍 **Step 7: Cursor AI Integration**

### Enable Database Introspection

Cursor can now directly access your database schema through:

1. **Prisma Schema**: `prisma/schema.prisma` - Complete type definitions
2. **Database Client**: `lib/database.ts` - Helper functions and operations
3. **Health Monitoring**: `app/api/health/route.ts` - Real-time database status

### AI Debugging Capabilities

Cursor can now:
- ✅ Read your complete database schema
- ✅ Understand relationships and constraints
- ✅ Suggest optimizations and fixes
- ✅ Generate type-safe queries
- ✅ Debug performance issues
- ✅ Recommend indexes and optimizations

---

## 🔄 **Step 8: Go-Live Checklist**

### Pre-Launch

- [ ] All tests passing
- [ ] Database migration completed successfully
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Backup systems configured
- [ ] Monitoring and alerting set up

### Go-Live

1. **Update DNS**: Point your domain to Cloud Run service
2. **Enable SSL**: Google-managed certificates auto-configured
3. **Monitor**: Watch dashboards for any issues
4. **Verify**: Test all critical user flows

### Post-Launch

- [ ] Monitor application performance
- [ ] Review error logs
- [ ] Optimize database queries
- [ ] Scale resources as needed
- [ ] Document any issues and solutions

---

## 🛠️ **Troubleshooting**

### Common Issues

**Connection Errors:**
```bash
# Check Cloud SQL status
gcloud sql instances describe eng-com-db

# Test local connection
npx prisma studio
```

**Migration Failures:**
```bash
# Check migration status
npx prisma migrate status

# Reset and retry
npx prisma migrate reset
```

**Performance Issues:**
```bash
# Enable query logging
export DEBUG="prisma:query"

# Analyze slow queries
gcloud sql operations list --filter="operationType=UPDATE" --instance=eng-com-db
```

### Getting Help

- **Prisma Docs**: https://www.prisma.io/docs
- **Google Cloud SQL**: https://cloud.google.com/sql/docs
- **GitHub Issues**: Create an issue in your repository for team support

---

## 🎯 **Next Steps**

After successful migration:

1. **Optimize Performance**: Add database indexes, enable connection pooling
2. **Implement Monitoring**: Set up alerts for key metrics
3. **Scale Resources**: Configure auto-scaling based on usage
4. **Security Review**: Implement additional security measures
5. **Backup Strategy**: Set up automated backups and disaster recovery

---

**🚀 Ready to migrate? Start with Step 1 and work through each section carefully. The migration script and infrastructure are designed to be robust and handle edge cases, but always test thoroughly in a staging environment first.**

For any issues during migration, Cursor can now directly analyze your database structure and help debug problems in real-time! 🎉 