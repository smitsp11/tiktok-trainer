# FastAPI Backend for TikTok Trainer Analytics

This directory contains the FastAPI backend for advanced analytics and scheduling features.

## Features

### Analytics API
- User behavior analysis
- Recording pattern insights
- Streak and progress tracking
- Achievement calculations

### Scheduling API
- Optimal recording time suggestions
- Contextual trigger management
- Notification scheduling
- Calendar integration

### Data Processing
- Pattern recognition algorithms
- Machine learning models
- Statistical analysis
- Predictive analytics

## Setup

### Prerequisites
- Python 3.8+
- pip or pipenv
- PostgreSQL (optional, for production)

### Installation

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
uvicorn main:app --reload
```

## API Endpoints

### Analytics
- `GET /analytics/user/{user_id}` - Get user analytics
- `POST /analytics/recording` - Log recording session
- `GET /analytics/patterns/{user_id}` - Get behavior patterns

### Scheduling
- `GET /schedule/optimal-times/{user_id}` - Get optimal recording times
- `POST /schedule/trigger` - Create contextual trigger
- `GET /schedule/upcoming/{user_id}` - Get upcoming suggestions

### Insights
- `GET /insights/recommendations/{user_id}` - Get AI recommendations
- `POST /insights/feedback` - Submit user feedback
- `GET /insights/achievements/{user_id}` - Get achievement suggestions

## Configuration

### Environment Variables
- `DATABASE_URL` - Database connection string
- `REDIS_URL` - Redis connection for caching
- `JWT_SECRET` - JWT token secret
- `API_KEY` - API authentication key

### Settings
- `DEBUG` - Enable debug mode
- `LOG_LEVEL` - Logging level
- `CORS_ORIGINS` - Allowed CORS origins

## Development

### Code Structure
```
backend/
├── main.py              # FastAPI app entry point
├── models/              # Database models
├── routers/             # API route handlers
├── services/            # Business logic
├── utils/               # Utility functions
├── tests/               # Test files
└── requirements.txt     # Python dependencies
```

### Testing
```bash
pytest tests/
```

### Database Migrations
```bash
alembic upgrade head
```

## Deployment

### Docker
```bash
docker build -t tiktok-trainer-backend .
docker run -p 8000:8000 tiktok-trainer-backend
```

### Production
- Use production WSGI server (Gunicorn)
- Set up reverse proxy (Nginx)
- Configure SSL certificates
- Set up monitoring and logging

## Security

### Authentication
- JWT tokens for API access
- Rate limiting on endpoints
- Input validation and sanitization
- CORS configuration

### Data Protection
- Encrypt sensitive data
- Secure database connections
- Regular security updates
- Audit logging

## Monitoring

### Metrics
- API response times
- Error rates
- User engagement
- System performance

### Logging
- Request/response logging
- Error tracking
- Performance monitoring
- User activity logs

## Future Enhancements

### Machine Learning
- Advanced pattern recognition
- Predictive analytics
- Personalized recommendations
- Automated insights

### Integrations
- Social media APIs
- Calendar services
- Health tracking APIs
- Wearable device integration

### Scalability
- Microservices architecture
- Load balancing
- Caching strategies
- Database optimization

---

**Note**: This backend is optional for the basic app functionality. The mobile app can work entirely offline with local storage. The backend provides enhanced analytics and cross-device synchronization for advanced users.
