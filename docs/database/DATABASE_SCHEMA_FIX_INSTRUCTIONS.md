# 🚨 DATABASE SCHEMA FIX INSTRUCTIONS

## **Critical Issues Identified:**

Your eng.com platform has **severe database schema fragmentation** causing:

1. **Column naming inconsistencies**: `owner` vs `owner_id`, `handle` vs `username`
2. **Missing profile creation triggers** - users can authenticate but profiles aren't created
3. **Multiple conflicting migration files** with different schemas
4. **Missing required columns** in profiles and projects tables
5. **Broken RLS policies** using wrong column names

## **🔧 Solutions Provided:**

### **Option 1: Automated Script (Recommended)**
Run the Node.js script to automatically fix all issues:

```bash
# Make sure you have your Supabase environment variables set
node scripts/apply-unified-schema-fix.js
```

### **Option 2: Manual SQL Execution**
Copy and paste the SQL from `database/SCHEMA_FIX.sql` into your Supabase Dashboard > SQL Editor.

## **🎯 What Gets Fixed:**

### **1. Profiles Table Issues**
- ✅ Adds missing columns: `email`, `username`, `display_name`, `handle`, `bio`, etc.
- ✅ Adds platform metrics: `post_karma`, `comment_karma`, `reputation`
- ✅ Adds account status: `is_verified`, `is_pro`, `plan`
- ✅ Adds preferences and JSON fields for flexibility

### **2. Column Naming Consistency**
- ✅ Fixes `projects.owner` → `projects.owner_id`
- ✅ Ensures both `handle` and `username` exist for compatibility
- ✅ Fixes `comments.content_md` → `comments.body` (copies data over)

### **3. Missing Profile Creation**
- ✅ Creates `handle_new_user()` trigger function
- ✅ Automatically creates profiles when users sign up
- ✅ Handles metadata from sign-up forms

### **4. Missing Tables**
- ✅ Creates `versions` table (app expects this)
- ✅ Creates `communities` table for community features
- ✅ Creates `posts` and `project_likes` tables
- ✅ Adds proper foreign key relationships

### **5. Performance & Security**
- ✅ Creates proper indexes for fast queries
- ✅ Enables Row Level Security (RLS) on all tables
- ✅ Updates RLS policies with correct column names
- ✅ Creates storage buckets for files and avatars

### **6. Data Consistency**
- ✅ Updates existing profiles with default values
- ✅ Ensures no NULL values in critical fields
- ✅ Populates default communities for platform

## **🚀 Immediate Benefits:**

After running this fix:

1. **User registration will work properly** - profiles created automatically
2. **No more 401 errors** on profile updates  
3. **Consistent database structure** - all parts of app use same schema
4. **Better performance** - proper indexes and optimized queries
5. **Ready for production** - robust, scalable database structure

## **⚠️ Before Running:**

1. **Backup your database** (recommended for production)
2. **Test in staging first** if you have a staging environment
3. **Ensure you have Supabase service role key** with admin permissions

## **🔍 Verification:**

After running the fix, you should see:

- Users can sign up and profiles are created automatically
- `/api/user/update-profile` endpoints work without 401 errors
- All tables have consistent column naming
- Community features work properly
- No more schema fragmentation issues

## **📝 Migration Notes:**

This fix is **idempotent** - you can run it multiple times safely. It uses:
- `ADD COLUMN IF NOT EXISTS` for safety
- `CREATE TABLE IF NOT EXISTS` to avoid conflicts
- `ON CONFLICT DO NOTHING` for data inserts
- Proper error handling for existing triggers/policies

Your database will be **production-ready** after applying this fix! 