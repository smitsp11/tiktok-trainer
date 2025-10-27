// AI Service for contextual reasoning and behavior modeling
import AsyncStorage from '@react-native-async-storage/async-storage';

class AIService {
  constructor() {
    this.userBehaviorModel = {
      recordingPatterns: [],
      contextualTriggers: [],
      confidenceLevels: {},
      optimalTimes: [],
      preferredLocations: [],
    };
  }

  // Analyze user behavior patterns
  async analyzeUserBehavior(userData) {
    try {
      const patterns = await this.extractPatterns(userData);
      const insights = await this.generateInsights(patterns);
      const recommendations = await this.generateRecommendations(insights);
      
      return {
        patterns,
        insights,
        recommendations,
      };
    } catch (error) {
      console.error('AI analysis failed:', error);
      return null;
    }
  }

  // Extract patterns from user data
  async extractPatterns(userData) {
    const patterns = {
      timePatterns: this.analyzeTimePatterns(userData.recordingSessions),
      locationPatterns: this.analyzeLocationPatterns(userData.recordingSessions),
      frequencyPatterns: this.analyzeFrequencyPatterns(userData.recordingSessions),
      successPatterns: this.analyzeSuccessPatterns(userData.recordingSessions),
    };

    return patterns;
  }

  // Analyze when user records most successfully
  analyzeTimePatterns(sessions) {
    const timeSlots = {};
    
    sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      const timeSlot = this.getTimeSlot(hour);
      
      if (!timeSlots[timeSlot]) {
        timeSlots[timeSlot] = { count: 0, successRate: 0, totalDuration: 0 };
      }
      
      timeSlots[timeSlot].count++;
      timeSlots[timeSlot].totalDuration += session.duration || 0;
      
      if (session.completed) {
        timeSlots[timeSlot].successRate++;
      }
    });

    // Calculate success rates
    Object.keys(timeSlots).forEach(slot => {
      timeSlots[slot].successRate = 
        (timeSlots[slot].successRate / timeSlots[slot].count) * 100;
    });

    return timeSlots;
  }

  // Analyze location-based patterns
  analyzeLocationPatterns(sessions) {
    const locations = {};
    
    sessions.forEach(session => {
      if (session.location) {
        const locationKey = `${session.location.latitude.toFixed(2)},${session.location.longitude.toFixed(2)}`;
        
        if (!locations[locationKey]) {
          locations[locationKey] = { count: 0, successRate: 0 };
        }
        
        locations[locationKey].count++;
        if (session.completed) {
          locations[locationKey].successRate++;
        }
      }
    });

    return locations;
  }

  // Analyze recording frequency patterns
  analyzeFrequencyPatterns(sessions) {
    const dailyCounts = {};
    
    sessions.forEach(session => {
      const date = new Date(session.startTime).toDateString();
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const frequencies = Object.values(dailyCounts);
    const avgFrequency = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
    const maxFrequency = Math.max(...frequencies);
    const consistency = this.calculateConsistency(frequencies);

    return {
      average: avgFrequency,
      maximum: maxFrequency,
      consistency,
      dailyCounts,
    };
  }

  // Analyze what makes recordings successful
  analyzeSuccessPatterns(sessions) {
    const successfulSessions = sessions.filter(s => s.completed);
    const failedSessions = sessions.filter(s => !s.completed);

    return {
      successRate: (successfulSessions.length / sessions.length) * 100,
      avgDuration: this.calculateAverageDuration(successfulSessions),
      commonFactors: this.identifyCommonFactors(successfulSessions),
    };
  }

  // Generate insights from patterns
  async generateInsights(patterns) {
    const insights = [];

    // Time-based insights
    const bestTimeSlot = this.findBestTimeSlot(patterns.timePatterns);
    if (bestTimeSlot) {
      insights.push({
        type: 'time',
        message: `You're most productive recording during ${bestTimeSlot} hours`,
        confidence: patterns.timePatterns[bestTimeSlot].successRate,
        recommendation: `Try scheduling recording sessions during ${bestTimeSlot}`,
      });
    }

    // Frequency insights
    if (patterns.frequencyPatterns.consistency < 0.5) {
      insights.push({
        type: 'consistency',
        message: 'Your recording frequency varies significantly',
        confidence: 0.8,
        recommendation: 'Consider setting a daily recording goal to build consistency',
      });
    }

    // Success insights
    if (patterns.successPatterns.successRate < 70) {
      insights.push({
        type: 'success',
        message: 'Some recordings are incomplete',
        confidence: 0.9,
        recommendation: 'Try shorter recording sessions or break content into smaller pieces',
      });
    }

    return insights;
  }

  // Generate personalized recommendations
  async generateRecommendations(insights) {
    const recommendations = [];

    insights.forEach(insight => {
      switch (insight.type) {
        case 'time':
          recommendations.push({
            type: 'schedule',
            title: 'Optimal Recording Time',
            description: insight.recommendation,
            priority: 'high',
            action: 'schedule_reminder',
          });
          break;
        
        case 'consistency':
          recommendations.push({
            type: 'habit',
            title: 'Build Consistency',
            description: insight.recommendation,
            priority: 'medium',
            action: 'set_daily_goal',
          });
          break;
        
        case 'success':
          recommendations.push({
            type: 'technique',
            title: 'Improve Completion Rate',
            description: insight.recommendation,
            priority: 'medium',
            action: 'adjust_recording_length',
          });
          break;
      }
    });

    return recommendations;
  }

  // Predict optimal recording moments
  async predictOptimalMoments(userContext) {
    const predictions = [];

    // Time-based prediction
    const currentHour = new Date().getHours();
    const timeSlot = this.getTimeSlot(currentHour);
    
    if (this.isOptimalTimeSlot(timeSlot, userContext.behaviorModel)) {
      predictions.push({
        type: 'time',
        confidence: 0.8,
        message: 'This is typically a good time for you to record',
        trigger: 'time_based',
      });
    }

    // Location-based prediction
    if (userContext.location && this.isOptimalLocation(userContext.location, userContext.behaviorModel)) {
      predictions.push({
        type: 'location',
        confidence: 0.7,
        message: 'You\'re in a location where you\'ve recorded successfully before',
        trigger: 'location_based',
      });
    }

    // Activity-based prediction
    if (userContext.appState === 'idle' && this.isIdleTooLong(userContext.lastActivity)) {
      predictions.push({
        type: 'activity',
        confidence: 0.6,
        message: 'You\'ve been idle for a while - perfect time for a quick recording',
        trigger: 'activity_based',
      });
    }

    return predictions;
  }

  // Helper methods
  getTimeSlot(hour) {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  findBestTimeSlot(timePatterns) {
    let bestSlot = null;
    let bestScore = 0;

    Object.keys(timePatterns).forEach(slot => {
      const score = timePatterns[slot].successRate * timePatterns[slot].count;
      if (score > bestScore) {
        bestScore = score;
        bestSlot = slot;
      }
    });

    return bestSlot;
  }

  calculateConsistency(frequencies) {
    if (frequencies.length === 0) return 0;
    
    const mean = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
    const variance = frequencies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / frequencies.length;
    const standardDeviation = Math.sqrt(variance);
    
    return Math.max(0, 1 - (standardDeviation / mean));
  }

  calculateAverageDuration(sessions) {
    if (sessions.length === 0) return 0;
    
    const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    return totalDuration / sessions.length;
  }

  identifyCommonFactors(sessions) {
    // This would analyze common patterns in successful sessions
    // For now, return a simple analysis
    return {
      avgDuration: this.calculateAverageDuration(sessions),
      completionRate: sessions.length > 0 ? 100 : 0,
    };
  }

  isOptimalTimeSlot(timeSlot, behaviorModel) {
    // Check if current time slot has high success rate
    return behaviorModel.timePatterns && 
           behaviorModel.timePatterns[timeSlot] && 
           behaviorModel.timePatterns[timeSlot].successRate > 70;
  }

  isOptimalLocation(location, behaviorModel) {
    // Check if current location has been successful before
    const locationKey = `${location.latitude.toFixed(2)},${location.longitude.toFixed(2)}`;
    return behaviorModel.locationPatterns && 
           behaviorModel.locationPatterns[locationKey] && 
           behaviorModel.locationPatterns[locationKey].successRate > 60;
  }

  isIdleTooLong(lastActivity) {
    if (!lastActivity) return true;
    
    const idleTime = Date.now() - new Date(lastActivity).getTime();
    return idleTime > 30 * 60 * 1000; // 30 minutes
  }

  // Save behavior model
  async saveBehaviorModel(model) {
    try {
      await AsyncStorage.setItem('aiBehaviorModel', JSON.stringify(model));
    } catch (error) {
      console.error('Failed to save behavior model:', error);
    }
  }

  // Load behavior model
  async loadBehaviorModel() {
    try {
      const model = await AsyncStorage.getItem('aiBehaviorModel');
      return model ? JSON.parse(model) : this.userBehaviorModel;
    } catch (error) {
      console.error('Failed to load behavior model:', error);
      return this.userBehaviorModel;
    }
  }
}

export default new AIService();
