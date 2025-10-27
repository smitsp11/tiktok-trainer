# 🔐 Environment Variables Setup Guide

## Quick Setup

1. **Run the setup script:**
   ```bash
   ./setup-env.sh
   ```

2. **Edit your `.env` file** with actual API keys:
   ```bash
   nano .env
   ```

3. **Start the app:**
   ```bash
   npm start
   ```

## Required Environment Variables

### 🔑 **Sensitive Information (REQUIRED for production)**

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | JWT token secret for authentication | `your-super-secret-jwt-key-change-in-production` |
| `API_KEY` | API authentication key | `your-api-key-here` |

### 🌐 **External Services (OPTIONAL)**

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | `sk-your-openai-api-key-here` |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key for location | `your-google-maps-api-key-here` 
| `ANALYTICS_API_KEY` | Analytics service API key | `your-analytics-api-key-here` |

### ⚙️ **App Configuration (OPTIONAL)**

| Variable | Description | Default |
|----------|-------------|---------|
| `BACKEND_URL` | Backend server URL | `http://localhost:8000` |
| `API_TIMEOUT` | API request timeout (ms) | `30000` |
| `NOTIFICATION_ENABLED` | Enable push notifications | `true` |
| `NOTIFICATION_SCHEDULE_HOURS` | Notification hours (comma-separated) | `9,18` |
| `DEBUG` | Enable debug mode | `true` |
| `LOG_LEVEL` | Logging level | `debug` |

## 🔒 Security Best Practices

1. **Never commit `.env` to git** - it's already in `.gitignore`
2. **Use different keys for development/production**
3. **Rotate API keys regularly**
4. **Use environment-specific values**

## 🚀 Current Status

The app is now configured to work with:
- ✅ **Empty environment variables** (uses defaults)
- ✅ **Proper error handling** for missing configs
- ✅ **Security warnings** for unconfigured sensitive data
- ✅ **Git protection** for sensitive files

## 🛠️ Troubleshooting

If you see warnings like:
```
⚠️ JWT_SECRET not configured, using default value
```

This is normal for development. Add your actual API keys to `.env` to remove these warnings.
