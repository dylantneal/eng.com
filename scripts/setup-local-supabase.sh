#!/bin/bash

echo "🔧 Setting up Local Supabase for Development"
echo "============================================="

# Create .env.local with local Supabase configuration
cat > .env.local << 'EOF'
# ===========================================================================
# eng.com - LOCAL DEVELOPMENT CONFIGURATION
# ===========================================================================
# ⚠️  THIS IS FOR LOCAL DEVELOPMENT ONLY
# Do not use these values in production!

# ===========================================================================
# LOCAL SUPABASE CONFIGURATION
# ===========================================================================
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOuoJy-yJggIwkNZNLPEAL7TYy-M4xQPG1LY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# ===========================================================================
# AUTHENTICATION CONFIGURATION
# ===========================================================================
NEXTAUTH_SECRET=local-dev-secret-not-for-production
NEXTAUTH_URL=http://localhost:4000

# ===========================================================================
# DEVELOPMENT SETTINGS
# ===========================================================================
NODE_ENV=development
DEBUG=true
EOF

echo "✅ Created .env.local with local Supabase configuration"
echo ""
echo "📋 WHAT'S CONFIGURED:"
echo "✓ Local Supabase instance (http://127.0.0.1:54321)"
echo "✓ Demo authentication keys"
echo "✓ Development environment settings"
echo ""
echo "⚠️  IMPORTANT LIMITATIONS:"
echo "• This uses demo/local Supabase - data is not persistent"
echo "• No real database schema is applied"
echo "• Authentication may not work properly"
echo "• File uploads will not work"
echo ""
echo "🚀 NEXT STEPS:"
echo "1. Start the development server: npm run dev"
echo "2. Visit http://localhost:4000"
echo "3. For full functionality, set up real Supabase: npm run setup:supabase"
echo ""
echo "💡 TIP: The app will now start, but you'll need real Supabase for full functionality" 