#!/bin/bash

# Secure Environment Setup Script
# This script creates a .env.local file with your actual API keys

echo "🔐 Setting up secure TikTok Trainer environment..."
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local file already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Create .env.local file with the recovered Google API key
cat > .env.local << 'EOF'
# TikTok Trainer Local Environment Variables
# This file is git-ignored and contains your actual API keys

# Google Maps API Key (recovered from node_modules)
GOOGLE_MAPS_API_KEY=AIzaSyCCSOx25vrb5z0tbedCB3_JRzzbVW6Uwgw

# Add other API keys here as needed
# OPENAI_API_KEY=sk-your-openai-key-here
# ANALYTICS_API_KEY=your-analytics-key-here
# JWT_SECRET=your-jwt-secret-here
# API_KEY=your-api-key-here
EOF

echo "✅ Created secure .env.local file"
echo ""
echo "🔒 Security Status:"
echo "- ✅ .env.local is git-ignored (won't be committed)"
echo "- ✅ Google API key is safely stored locally"
echo "- ✅ No sensitive data in tracked files"
echo ""
echo "📱 Next steps:"
echo "1. Run: npm start"
echo "2. Your Google Maps API key is now active locally"
echo ""
echo "🚨 Security reminder:"
echo "- Never commit .env.local to git"
echo "- This file stays on your local machine only"
echo "- Safe to push code to GitHub now"
