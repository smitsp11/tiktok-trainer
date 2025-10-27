// Configuration service for managing environment variables and app settings
import Constants from 'expo-constants';
import LOCAL_ENV from '../config/localEnv';

class ConfigService {
  constructor() {
    // Load local environment variables (from localEnv.js)
    this.localEnv = LOCAL_ENV;
    
    this.config = {
      // App Configuration
      appName: 'TikTok Trainer',
      appVersion: '1.0.0',
      environment: __DEV__ ? 'development' : 'production',
      
      // Backend Configuration (Optional)
      backendUrl: this.getEnvVar('BACKEND_URL', 'http://localhost:8000'),
      apiTimeout: parseInt(this.getEnvVar('API_TIMEOUT', '30000')),
      
      // Security Configuration (Optional - for backend)
      jwtSecret: this.getEnvVar('JWT_SECRET', ''),
      apiKey: this.getEnvVar('API_KEY', ''),
      
      // External Services (Optional - if you add them later)
      openaiApiKey: this.getEnvVar('OPENAI_API_KEY', ''),
      googleMapsApiKey: this.getEnvVar('GOOGLE_MAPS_API_KEY', ''),
      analyticsApiKey: this.getEnvVar('ANALYTICS_API_KEY', ''),
      
      // Notification Configuration
      notificationEnabled: this.getEnvVar('NOTIFICATION_ENABLED', 'true') === 'true',
      notificationScheduleHours: this.getEnvVar('NOTIFICATION_SCHEDULE_HOURS', '9,18').split(',').map(h => parseInt(h)),
      
      // Debug Configuration
      debug: this.getEnvVar('DEBUG', __DEV__ ? 'true' : 'false') === 'true',
      logLevel: this.getEnvVar('LOG_LEVEL', __DEV__ ? 'debug' : 'info'),
    };
    
    // Log configuration on startup (without sensitive data)
    this.logConfig();
  }

  // Load local environment variables from .env.local
  loadLocalEnv() {
    try {
      // Return the local environment variables
      return this.localEnv;
    } catch (error) {
      console.warn('Could not load local environment variables:', error);
      return {};
    }
  }

  // Get environment variable with fallback
  getEnvVar(key, defaultValue = '') {
    // First check local environment variables (from .env.local)
    if (this.localEnv[key]) {
      return this.localEnv[key];
    }
    
    // Then check Expo Constants
    const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};
    const value = extra[key] || defaultValue;
    
    // Log when we're using defaults for important configs
    if (value === defaultValue && ['JWT_SECRET', 'API_KEY', 'OPENAI_API_KEY', 'GOOGLE_MAPS_API_KEY'].includes(key)) {
      console.warn(`⚠️  ${key} not configured, using default value`);
    }
    
    return value;
  }

  // Get configuration value
  get(key) {
    return this.config[key];
  }

  // Check if backend is enabled
  isBackendEnabled() {
    return !!this.config.backendUrl && this.config.backendUrl !== 'http://localhost:8000';
  }

  // Check if external services are configured
  hasOpenAI() {
    return !!this.config.openaiApiKey;
  }

  hasGoogleMaps() {
    return !!this.config.googleMapsApiKey;
  }

  hasAnalytics() {
    return !!this.config.analyticsApiKey;
  }

  // Get API headers for backend requests
  getApiHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }

    return headers;
  }

  // Validate configuration
  validate() {
    const errors = [];

    if (this.isBackendEnabled()) {
      if (!this.config.apiKey) {
        errors.push('API_KEY is required when backend is enabled');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Log configuration (without sensitive data)
  logConfig() {
    const safeConfig = { ...this.config };
    
    // Remove sensitive data from logs
    if (safeConfig.jwtSecret) safeConfig.jwtSecret = '[REDACTED]';
    if (safeConfig.apiKey) safeConfig.apiKey = '[REDACTED]';
    if (safeConfig.openaiApiKey) safeConfig.openaiApiKey = '[REDACTED]';
    if (safeConfig.googleMapsApiKey) safeConfig.googleMapsApiKey = '[REDACTED]';
    if (safeConfig.analyticsApiKey) safeConfig.analyticsApiKey = '[REDACTED]';

    console.log('App Configuration:', safeConfig);
  }
}

export default new ConfigService();
