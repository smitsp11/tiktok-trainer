// Local Environment Configuration Template
// 
// ⚠️ IMPORTANT: This is a template file!
// 
// Instructions:
// 1. Copy this file to 'localEnv.js' in the same directory
// 2. Replace placeholder values with your actual API keys
// 3. NEVER commit localEnv.js to git (it's in .gitignore)
//
// Example:
// cp src/config/localEnv.example.js src/config/localEnv.js
// Then edit localEnv.js with your actual keys

const LOCAL_ENV = {
  // Google Maps API Key
  // Get one at: https://console.cloud.google.com/google/maps-apis
  GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
  
  // OpenAI API Key (optional - for future AI features)
  // Get one at: https://platform.openai.com/api-keys
  // OPENAI_API_KEY: 'sk-YOUR_OPENAI_API_KEY_HERE',
  
  // Analytics API Key (optional)
  // ANALYTICS_API_KEY: 'YOUR_ANALYTICS_API_KEY_HERE',
  
  // Backend URL (optional - if using backend services)
  // BACKEND_URL: 'http://localhost:8000',
  
  // Other custom environment variables
  // Add any other API keys or configuration here
};

export default LOCAL_ENV;

