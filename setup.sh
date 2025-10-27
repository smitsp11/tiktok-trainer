#!/bin/bash

# TikTok Trainer Setup Script
echo "🎬 Setting up TikTok Trainer..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI..."
    npm install -g @expo/cli
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🚀 To start the development server:"
    echo "   npm start"
    echo ""
    echo "📱 To run on specific platforms:"
    echo "   npm run ios     # iOS Simulator"
    echo "   npm run android # Android Emulator"
    echo "   npm run web     # Web Browser"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Create placeholder assets in the assets/ folder"
    echo "   2. Test the app on your preferred platform"
    echo "   3. Customize settings and preferences"
    echo ""
    echo "🎉 TikTok Trainer is ready to help you build recording habits!"
else
    echo "❌ Failed to install dependencies. Please check your internet connection and try again."
    exit 1
fi
