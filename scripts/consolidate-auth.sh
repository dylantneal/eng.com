#!/bin/bash

echo "🔧 Consolidating Authentication System to Pure Supabase"
echo "======================================================"

# Create backup
echo "📦 Creating backup of current auth files..."
mkdir -p backups/auth-consolidation/$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="backups/auth-consolidation/$(date +%Y%m%d-%H%M%S)"

# Backup files that will be modified
cp lib/authOptions.ts "$BACKUP_DIR/" 2>/dev/null || echo "authOptions.ts not found (OK)"
cp app/api/auth/\[...nextauth\]/route.ts "$BACKUP_DIR/" 2>/dev/null || echo "NextAuth route not found (OK)"
cp contexts/AuthContext.tsx "$BACKUP_DIR/" 2>/dev/null || echo "AuthContext not found (OK)"

echo "✅ Backup created in $BACKUP_DIR"

echo ""
echo "🔍 ANALYSIS COMPLETE"
echo "==================="
echo "NextAuth files found:"
find . -name "*nextauth*" -type f | grep -v node_modules | grep -v .git
echo ""
echo "Files using getServerSession:"
grep -r "getServerSession" app/ lib/ --include="*.ts" --include="*.tsx" | wc -l | xargs echo "Count:"
echo ""
echo "Files using useAuth from AuthContext:"
grep -r "useAuth.*AuthContext" app/ components/ --include="*.ts" --include="*.tsx" | wc -l | xargs echo "Count:"

echo ""
echo "📋 CONSOLIDATION PLAN:"
echo "1. ✅ Keep: Pure Supabase auth (lib/auth.ts + contexts/AuthContext.tsx)"
echo "2. ❌ Remove: NextAuth system (lib/authOptions.ts + api routes)"
echo "3. 🔄 Convert: API routes to use Supabase auth"
echo "4. 🔄 Convert: Server pages to use Supabase auth"
echo "5. 🧪 Test: Authentication flow end-to-end"

echo ""
echo "⚠️  This script analyzed the authentication system."
echo "   Run: npm run auth:consolidate-step1 to begin consolidation" 