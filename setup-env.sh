#!/bin/bash

# TikTok Trainer Environment Setup Script
# This script creates a .env file with your actual API keys

echo "🔐 Setting up TikTok Trainer environment variables..."
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Create .env file
cat > .env << 'EOF'
# TikTok Trainer Environment Variables
# This file contains sensitive information and should NOT be committed to git

# App Configuration
APP_NAME=TikTok Trainer
APP_VERSION=1.0.0
ENVIRONMENT=development

# Backend Configuration
BACKEND_URL=http://localhost:8000
API_TIMEOUT=30000

# Security Configuration (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
API_KEY=your-api-key-here

# External Services (Optional - add your actual keys here)
OPENAI_API_KEY=
GOOGLE_MAPS_API_KEY=
ANALYTICS_API_KEY=

# Notification Configuration
NOTIFICATION_ENABLED=true
NOTIFICATION_SCHEDULE_HOURS=9,18

# Debug Configuration
DEBUG=true
LOG_LEVEL=debug

# Database Configuration (Optional)
DATABASE_URL=postgresql://username:password@localhost:5432/tiktok_trainer
REDIS_URL=redis://localhost:6379

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:19006
EOF

echo "✅ Created .env file"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env file and add your actual API keys"
echo "2. Run: npm start"
echo ""
echo "🔒 Security reminder:"
echo "- Never commit .env to git"
echo "- Change JWT_SECRET and API_KEY in production"
echo "- Keep your API keys secure"
