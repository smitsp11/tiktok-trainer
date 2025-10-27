from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime, timedelta
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration from environment variables
DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'
LOG_LEVEL = os.getenv('LOG_LEVEL', 'info')
JWT_SECRET = os.getenv('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production')
API_KEY = os.getenv('API_KEY', '')
DATABASE_URL = os.getenv('DATABASE_URL', '')
REDIS_URL = os.getenv('REDIS_URL', '')
CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')

app = FastAPI(
    title="TikTok Trainer API",
    description="Backend API for TikTok Trainer analytics and scheduling",
    version="1.0.0",
    debug=DEBUG
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class RecordingSession(BaseModel):
    user_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    location: Optional[dict] = None
    completed: bool = False
    metadata: Optional[dict] = None

class UserPattern(BaseModel):
    user_id: str
    optimal_times: List[int]
    frequent_locations: List[dict]
    recording_frequency: int
    success_rate: float
    last_updated: datetime

class ContextualTrigger(BaseModel):
    user_id: str
    trigger_type: str
    message: str
    confidence: float
    conditions: dict
    active: bool = True

class Achievement(BaseModel):
    user_id: str
    achievement_id: str
    title: str
    description: str
    unlocked_at: datetime
    progress: Optional[dict] = None

# Authentication dependency
def verify_api_key(x_api_key: str = Depends(lambda: "")):
    """Verify API key for protected endpoints"""
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True

# Optional authentication dependency
def optional_auth(x_api_key: Optional[str] = None):
    """Optional API key verification"""
    if API_KEY and x_api_key and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True

# In-memory storage (replace with database in production)
recording_sessions = []
user_patterns = {}
contextual_triggers = []
achievements = []

@app.get("/")
async def root():
    return {"message": "TikTok Trainer API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

# Analytics endpoints
@app.post("/analytics/recording")
async def log_recording_session(session: RecordingSession, _: bool = Depends(optional_auth)):
    """Log a recording session for analytics"""
    recording_sessions.append(session.dict())
    
    # Update user patterns
    await update_user_patterns(session.user_id)
    
    return {"message": "Recording session logged", "session_id": len(recording_sessions)}

@app.get("/analytics/user/{user_id}")
async def get_user_analytics(user_id: str):
    """Get comprehensive analytics for a user"""
    user_sessions = [s for s in recording_sessions if s["user_id"] == user_id]
    
    if not user_sessions:
        raise HTTPException(status_code=404, detail="User not found")
    
    analytics = {
        "total_recordings": len(user_sessions),
        "completed_recordings": len([s for s in user_sessions if s["completed"]]),
        "average_duration": calculate_average_duration(user_sessions),
        "success_rate": calculate_success_rate(user_sessions),
        "recording_patterns": analyze_recording_patterns(user_sessions),
        "achievements": [a for a in achievements if a["user_id"] == user_id],
    }
    
    return analytics

@app.get("/analytics/patterns/{user_id}")
async def get_behavior_patterns(user_id: str):
    """Get user behavior patterns and insights"""
    if user_id not in user_patterns:
        raise HTTPException(status_code=404, detail="User patterns not found")
    
    patterns = user_patterns[user_id]
    insights = generate_insights(patterns)
    
    return {
        "patterns": patterns,
        "insights": insights,
        "recommendations": generate_recommendations(patterns)
    }

# Scheduling endpoints
@app.get("/schedule/optimal-times/{user_id}")
async def get_optimal_recording_times(user_id: str):
    """Get optimal recording times based on user patterns"""
    if user_id not in user_patterns:
        return {"optimal_times": [], "message": "Insufficient data"}
    
    patterns = user_patterns[user_id]
    optimal_times = patterns.get("optimal_times", [])
    
    return {
        "optimal_times": optimal_times,
        "confidence": calculate_time_confidence(optimal_times),
        "next_suggestion": get_next_recording_suggestion(optimal_times)
    }

@app.post("/schedule/trigger")
async def create_contextual_trigger(trigger: ContextualTrigger):
    """Create a new contextual trigger"""
    contextual_triggers.append(trigger.dict())
    return {"message": "Contextual trigger created", "trigger_id": len(contextual_triggers)}

@app.get("/schedule/upcoming/{user_id}")
async def get_upcoming_suggestions(user_id: str):
    """Get upcoming recording suggestions"""
    user_triggers = [t for t in contextual_triggers if t["user_id"] == user_id and t["active"]]
    
    suggestions = []
    for trigger in user_triggers:
        if should_trigger_now(trigger):
            suggestions.append({
                "message": trigger["message"],
                "confidence": trigger["confidence"],
                "type": trigger["trigger_type"]
            })
    
    return {"suggestions": suggestions, "count": len(suggestions)}

# Insights endpoints
@app.get("/insights/recommendations/{user_id}")
async def get_ai_recommendations(user_id: str):
    """Get AI-generated recommendations"""
    user_sessions = [s for s in recording_sessions if s["user_id"] == user_id]
    
    if len(user_sessions) < 5:
        return {"recommendations": [], "message": "Need more data for recommendations"}
    
    recommendations = []
    
    # Analyze patterns and generate recommendations
    patterns = analyze_recording_patterns(user_sessions)
    
    if patterns["consistency"] < 0.5:
        recommendations.append({
            "type": "consistency",
            "title": "Build Consistency",
            "description": "Try recording at the same time each day",
            "priority": "high"
        })
    
    if patterns["success_rate"] < 70:
        recommendations.append({
            "type": "technique",
            "title": "Improve Completion Rate",
            "description": "Consider shorter recording sessions",
            "priority": "medium"
        })
    
    return {"recommendations": recommendations}

@app.post("/insights/feedback")
async def submit_user_feedback(feedback: dict):
    """Submit user feedback for AI improvement"""
    # In production, this would be stored and used for model improvement
    return {"message": "Feedback received", "timestamp": datetime.now()}

@app.get("/insights/achievements/{user_id}")
async def get_achievement_suggestions(user_id: str):
    """Get suggested achievements based on user progress"""
    user_sessions = [s for s in recording_sessions if s["user_id"] == user_id]
    user_achievements = [a for a in achievements if a["user_id"] == user_id]
    
    suggestions = []
    
    # First recording
    if len(user_sessions) == 0:
        suggestions.append({
            "id": "first_recording",
            "title": "First Steps",
            "description": "Record your first video",
            "progress": {"current": 0, "target": 1}
        })
    
    # 7-day streak
    elif len(user_sessions) >= 7 and not any(a["achievement_id"] == "week_streak" for a in user_achievements):
        suggestions.append({
            "id": "week_streak",
            "title": "Week Warrior",
            "description": "Maintain a 7-day recording streak",
            "progress": {"current": min(len(user_sessions), 7), "target": 7}
        })
    
    return {"suggestions": suggestions}

# Helper functions
async def update_user_patterns(user_id: str):
    """Update user behavior patterns"""
    user_sessions = [s for s in recording_sessions if s["user_id"] == user_id]
    
    if not user_sessions:
        return
    
    # Analyze time patterns
    time_counts = {}
    for session in user_sessions:
        hour = session["start_time"].hour
        time_counts[hour] = time_counts.get(hour, 0) + 1
    
    optimal_times = sorted(time_counts.keys(), key=lambda x: time_counts[x], reverse=True)[:3]
    
    # Analyze location patterns
    locations = []
    for session in user_sessions:
        if session.get("location"):
            locations.append(session["location"])
    
    # Calculate success rate
    completed = len([s for s in user_sessions if s["completed"]])
    success_rate = (completed / len(user_sessions)) * 100 if user_sessions else 0
    
    user_patterns[user_id] = {
        "optimal_times": optimal_times,
        "frequent_locations": locations[:5],  # Top 5 locations
        "recording_frequency": len(user_sessions),
        "success_rate": success_rate,
        "last_updated": datetime.now()
    }

def calculate_average_duration(sessions):
    """Calculate average recording duration"""
    durations = [s.get("duration", 0) for s in sessions if s.get("duration")]
    return sum(durations) / len(durations) if durations else 0

def calculate_success_rate(sessions):
    """Calculate recording success rate"""
    completed = len([s for s in sessions if s["completed"]])
    return (completed / len(sessions)) * 100 if sessions else 0

def analyze_recording_patterns(sessions):
    """Analyze recording patterns"""
    if not sessions:
        return {"consistency": 0, "success_rate": 0}
    
    # Calculate consistency (simplified)
    dates = [s["start_time"].date() for s in sessions]
    unique_dates = len(set(dates))
    consistency = unique_dates / len(sessions) if sessions else 0
    
    success_rate = calculate_success_rate(sessions)
    
    return {
        "consistency": consistency,
        "success_rate": success_rate,
        "total_sessions": len(sessions)
    }

def generate_insights(patterns):
    """Generate insights from user patterns"""
    insights = []
    
    if patterns["success_rate"] > 80:
        insights.append("Great job! You have a high completion rate.")
    elif patterns["success_rate"] < 50:
        insights.append("Consider shorter recording sessions to improve completion.")
    
    if len(patterns["optimal_times"]) > 0:
        best_time = patterns["optimal_times"][0]
        insights.append(f"You're most active around {best_time}:00.")
    
    return insights

def generate_recommendations(patterns):
    """Generate recommendations based on patterns"""
    recommendations = []
    
    if patterns["success_rate"] < 70:
        recommendations.append("Try recording shorter videos to improve completion rate")
    
    if len(patterns["optimal_times"]) == 0:
        recommendations.append("Record at different times to find your optimal schedule")
    
    return recommendations

def calculate_time_confidence(optimal_times):
    """Calculate confidence in time recommendations"""
    return min(len(optimal_times) * 0.2, 1.0)

def get_next_recording_suggestion(optimal_times):
    """Get next recording time suggestion"""
    if not optimal_times:
        return None
    
    now = datetime.now()
    current_hour = now.hour
    
    # Find next optimal time
    for hour in optimal_times:
        if hour > current_hour:
            return f"Try recording around {hour}:00 today"
    
    # If no time today, suggest tomorrow
    return f"Try recording around {optimal_times[0]}:00 tomorrow"

def should_trigger_now(trigger):
    """Check if a trigger should fire now"""
    # Simplified logic - in production, this would be more sophisticated
    return trigger["confidence"] > 0.6

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
