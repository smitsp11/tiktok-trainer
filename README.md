# TikTok Trainer

A behavior-shaping AI agent designed to help creators build consistency and comfort in recording content. Instead of generating video ideas, it focuses on conditioning creativity through habit formation.

## 🎯 Core Philosophy

Most creators aren't camera shy, people have the motivation, they just don't know what to say. This agent acts like a creative personal trainer, guiding users to "just hit record." By eliminating the friction between inspiration and execution, it helps users build the habit of showing up on camera naturally and regularly.

## ✨ Key Features

### Smart Camera Activation
- Detects contextual triggers (after class, gym sessions, idle time, procrastinating with clash)
- Automatically opens the camera app when it predicts a good filming moment
- Pairs with brief vibration or auditory cues ("Ready to roll?") to create conditioned response

### Context-Aware Reminders
- Pulls from location, time, and previous user patterns to identify "creative zones"
- Offers subtle, non-intrusive prompts like:
  - "You're at your usual gym spot — want to share today's progress?"
  - "You've been quiet for 3 days — let's do a 30-second thought drop."

### Micro-Prompt Cards
- Instead of full scripts, surfaces 2–3 short "buzzwords" the user previously jotted down
- Examples: "discipline," "building consistency," "post-midterm burnout"
- Goal is to spark recall, not generate ideas

### Progress Conditioning
- Tracks camera activations, successful recordings, and uploads to visualize streaks
- Uses behavioral reinforcement: small wins and streak reminders to keep momentum
- Achievement system with badges and milestones

### Autonomous Scheduling
- Learns user rhythm and selects optimal time windows for nudges
- Integrates optional calendar or routine data to sync with the user's lifestyle

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (for development)
- Physical device (for testing camera features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tiktok-trainer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
# The app works offline by default, but you can configure optional services
```

4. Start the development server:
```bash
npm start
```

## 🔧 Environment Configuration

The app is designed to work offline by default, but you can configure optional services through environment variables.

### Required Configuration
- No environment variables are required for basic functionality
- The app works entirely offline with local storage

### Optional Configuration

#### Backend Services (Optional)
If you want to use the analytics backend:

```bash
# Backend URL (default: http://localhost:8000)
BACKEND_URL=http://localhost:8000

# API timeout in milliseconds (default: 30000)
API_TIMEOUT=30000

# API key for backend authentication (optional)
API_KEY=your-api-key-here
```

#### External Services (Optional)
If you plan to add external services later:

```bash
# OpenAI API key (for AI features)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Google Maps API key (for location features)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here

# Analytics API key (for tracking)
ANALYTICS_API_KEY=your-analytics-api-key-here
```

#### Notification Settings
```bash
# Enable/disable notifications (default: true)
NOTIFICATION_ENABLED=true

# Schedule notification hours (default: 9,18)
NOTIFICATION_SCHEDULE_HOURS=9,18
```

### Backend Setup (Optional)

If you want to use the analytics backend:

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up backend environment variables:
```bash
# Copy the example environment file
cp env.example .env

# Edit the .env file with your backend configuration
```

5. Run the backend server:
```bash
uvicorn main:app --reload
```

## 🔒 Security Notes

- **Never commit `.env` files to version control**
- The `.gitignore` file is configured to exclude environment files
- Use strong, unique API keys for production
- Rotate API keys regularly
- The app works offline by default - external services are optional

## 🚀 Running the App

4. Run on your preferred platform:
```bash
npm run ios     # For iOS
npm run android # For Android
npm run web     # For Web
```

## 📱 Features Overview

### Home Screen
- **Streak Counter**: Shows current recording streak and total videos
- **Quick Record Button**: One-tap camera activation
- **Micro-Prompt Cards**: Personalized buzzwords for inspiration
- **Achievement Display**: Recent unlocked achievements
- **Contextual Insights**: Location and time-based suggestions

### Camera Screen
- **Smart Recording**: Automatic camera activation with haptic feedback
- **Recording Controls**: Start/stop with visual and haptic feedback
- **Progress Indicator**: Shows recording duration and progress bar
- **Quick Access**: Easy access to prompt cards and settings

### Progress Screen
- **Visual Analytics**: Charts showing weekly recording activity
- **Streak Tracking**: Current and longest streaks
- **Achievement Gallery**: All unlocked achievements
- **Goal Setting**: Customizable daily recording goals
- **Insights**: AI-generated insights about recording patterns

### Settings Screen
- **Camera Preferences**: Auto-activation, haptic feedback, sound effects
- **Notification Settings**: Contextual nudges and creative zone alerts
- **Location Management**: Add/remove creative zones
- **Buzzword Management**: Add/edit personal inspiration words
- **Data Management**: Clear data and export options

## 🧠 AI & Context Detection

### Behavior Modeling
The app uses lightweight reinforcement learning to understand user patterns:
- **Time Patterns**: Identifies optimal recording times
- **Location Patterns**: Learns successful recording locations
- **Frequency Analysis**: Tracks consistency and suggests improvements
- **Success Factors**: Analyzes what makes recordings successful

### Context Triggers
- **Location-Based**: Detects when user enters creative zones
- **Time-Based**: Suggests recording during optimal hours
- **Activity-Based**: Prompts during idle periods
- **Pattern-Based**: Uses historical data to predict good moments

## 🔧 Technical Stack

### Frontend
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and toolchain
- **React Navigation**: Screen navigation and routing
- **Expo Camera**: Camera integration and recording
- **Expo Location**: Location services and geofencing
- **Expo Notifications**: Push notifications and alerts
- **Expo Haptics**: Tactile feedback
- **React Native Charts**: Data visualization
- **React Native Calendars**: Calendar integration

### Backend Services
- **AsyncStorage**: Local data persistence
- **Context Detection Service**: Real-time behavior monitoring
- **AI Service**: Pattern analysis and recommendations
- **Progress Tracking**: Streak and achievement management

### Integrations
- **iOS/Android Camera API**: Native camera functionality
- **Location Services**: GPS and geofencing
- **Notification System**: Push notifications
- **Haptic Feedback**: Device vibration patterns

## 📊 Data & Privacy

### Local Storage
All user data is stored locally on the device:
- Recording sessions and metadata
- User patterns and preferences
- Creative zones and locations
- Achievement progress
- AI behavior models

### Privacy Features
- No data is sent to external servers
- Location data is processed locally
- User can clear all data at any time
- Optional location tracking with user consent

## 🎨 Design Philosophy

### User Experience
- **Minimal Friction**: Reduce barriers between inspiration and action
- **Positive Reinforcement**: Focus on achievements and progress
- **Contextual Awareness**: Smart suggestions based on user behavior
- **Habit Formation**: Build consistency through gentle nudges

### Visual Design
- **TikTok-Inspired**: Familiar color scheme and interactions
- **Modern UI**: Clean, intuitive interface
- **Progress Visualization**: Clear feedback on achievements
- **Accessibility**: Support for different user needs

## 🔮 Future Enhancements

### Phase 2 Features
- **Lightweight Editing**: Basic video editing tools
- **Auto-Posting**: Direct integration with social platforms
- **Social Accountability**: Record with friends features
- **Advanced Analytics**: Detailed insights and recommendations

### AI Improvements
- **Enhanced Context Detection**: More sophisticated trigger detection
- **Personalized Coaching**: Adaptive guidance based on user progress
- **Burnout Detection**: Identify and prevent creator burnout
- **Content Optimization**: Suggestions for better engagement

### Platform Integration
- **Calendar Sync**: Integration with Google Calendar, Apple Calendar
- **Health Data**: Integration with HealthKit, Google Fit
- **Social Platforms**: Direct posting to TikTok, Instagram, YouTube
- **Wearable Support**: Apple Watch, Android Wear integration

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on:
- Code style and standards
- Pull request process
- Issue reporting
- Feature requests

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by behavioral psychology and habit formation research
- Built with the amazing React Native and Expo communities
- Special thanks to content creators who provided feedback and insights

---

**Ready to build your recording habit? Let's get started! 🎬**
