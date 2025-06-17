# Database Schema and Data Integrity Fix

This document outlines the complete database fix implementation for eng.com.

## Overview

The database fix addresses the following issues:
1. Missing critical tables (communities, posts, marketplace_items)
2. Inconsistent column naming (owner vs owner_id)
3. Missing foreign key relationships
4. No proper indexes for performance
5. Incomplete RLS (Row Level Security) policies
6. Mock data still in use in many APIs

## Migration Files

### 1. `20250121000000_complete_database_fix.sql`
- Creates all missing tables with proper schema
- Establishes consistent column naming (owner_id everywhere)
- Adds foreign key relationships
- Creates performance indexes
- Implements comprehensive RLS policies
- Adds default communities
- Creates useful views and monitoring functions

### 2. `20250121000001_data_consistency.sql`
- Migrates existing data to new schema
- Fixes column name inconsistencies
- Links orphaned records
- Updates vote and member counts
- Ensures data integrity

## How to Apply the Migrations

### Step 1: Backup Current Data
```bash
# Export current database
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Apply Migrations
```bash
# Apply the complete schema fix
supabase migration up

# Or apply manually
supabase db push
```

### Step 3: Verify Migration
```bash
# Check migration status
supabase migration list

# Test database connection
supabase db remote commit
```

## API Updates

The following APIs have been updated to use real database queries instead of mock data:

1. **Communities Posts API** (`app/api/communities/[community]/posts/route.ts`)
   - Removed fallback mock data
   - Added proper pagination
   - Fixed foreign key references

2. **Main Posts API** (`app/api/posts/route.ts`)
   - Removed all mock data and personalization logic
   - Uses real database queries with joins
   - Added user vote tracking

3. **Marketplace Reviews API** (`app/api/marketplace/reviews/route.ts`)
   - Removed mock reviews
   - Added purchase verification
   - Implemented rating calculations

4. **Voting API** (`app/api/posts/[postId]/vote/route.ts`)
   - Removed mock responses
   - Added karma updates
   - Proper vote tracking

## Database Monitoring

A new monitoring endpoint has been added at `/api/admin/database-monitor` with the following features:

- **Table Statistics**: Row counts and sizes
- **Health Checks**: Connection, auth, storage, indexes, RLS
- **Slow Query Detection**: Identifies queries taking >100ms
- **Data Integrity Checks**: Finds orphaned records and inconsistencies

### Usage:
```bash
# Get full dashboard
GET /api/admin/database-monitor

# Get specific reports
GET /api/admin/database-monitor?action=stats
GET /api/admin/database-monitor?action=health
GET /api/admin/database-monitor?action=slow-queries
GET /api/admin/database-monitor?action=integrity
```

## Post-Migration Checklist

- [ ] Verify all tables are created
- [ ] Check foreign key relationships
- [ ] Test API endpoints
- [ ] Verify RLS policies are working
- [ ] Check database performance
- [ ] Monitor for any errors

## Troubleshooting

### If migrations fail:
1. Check Supabase logs: `supabase db logs`
2. Verify database connection
3. Check for conflicting migrations
4. Restore from backup if needed

### If APIs return errors:
1. Check table permissions
2. Verify RLS policies
3. Check column names match queries
4. Review foreign key constraints

## Maintenance

### Regular Tasks:
1. Run integrity checks weekly
2. Monitor slow queries daily
3. Update statistics monthly
4. Review and optimize indexes quarterly

### Performance Optimization:
1. Add indexes based on query patterns
2. Consider materialized views for complex queries
3. Implement caching for frequently accessed data
4. Use database monitoring to identify bottlenecks 