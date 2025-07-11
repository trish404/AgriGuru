# AgriGuru - Smart Farming Assistant

## Overview

AgriGuru is a Flask-based web application that serves as an intelligent agricultural assistant. The platform combines AI-powered chatbot capabilities, disease detection, weather forecasting, and community features to provide comprehensive farming support. The application is designed to help farmers make informed decisions through data-driven insights and peer-to-peer knowledge sharing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Database**: SQLAlchemy ORM with SQLite as default (configurable to other databases)
- **Authentication**: Flask-Login for user session management
- **File Handling**: Werkzeug for secure file uploads
- **API Integration**: External weather service integration via OpenWeatherMap API

### Frontend Architecture
- **Template Engine**: Jinja2 (Flask's default templating)
- **CSS Framework**: Bootstrap 5.3.0 for responsive design
- **JavaScript Libraries**: 
  - Chart.js for data visualization
  - Custom JavaScript modules for chatbot, dashboard, and voice recognition
- **Icons**: Font Awesome 6.0.0
- **Responsive Design**: Mobile-first approach with Bootstrap grid system

### Database Design
The application uses a relational database structure with the following key entities:
- **User**: Core user management with farm-specific profile data
- **ChatSession/ChatMessage**: Conversation history and AI interaction tracking
- **FarmRecord**: Agricultural activity logging and record keeping
- **DiseaseDetection**: AI-powered crop disease analysis results
- **CommunityPost/PostComment**: Social features for farmer interaction

## Key Components

### Authentication System
- User registration with farm-specific information (location, size, primary crops)
- Secure password hashing using Werkzeug
- Session-based authentication with Flask-Login
- Role-based access control for protected routes

### AI Chatbot Module
- Multi-language support (English, Hindi, and others)
- Voice recognition capabilities using Web Speech API
- Real-time chat interface with typing indicators
- Session persistence for conversation continuity
- Backend API endpoints for AI response generation

### Disease Detection System
- Image upload functionality for crop photos
- AI-powered disease analysis (backend processing)
- Treatment recommendations and preventive measures
- Historical detection records for tracking

### Weather Integration
- Real-time weather data via OpenWeatherMap API
- Location-based forecasting
- Agricultural-specific weather insights
- Dashboard widgets for quick weather overview

### Community Platform
- User-generated content sharing
- Discussion threads and comments
- Farmer networking and knowledge exchange
- Community statistics and engagement metrics

### Dashboard Analytics
- Personal farm record visualization
- Market price trends and analysis
- Weather forecast integration
- Quick action shortcuts for common tasks

## Data Flow

1. **User Authentication**: Login/registration → Session creation → User profile loading
2. **Chat Interaction**: User input → Language detection → AI processing → Response generation → Display
3. **Disease Detection**: Image upload → File validation → AI analysis → Results storage → Recommendation display
4. **Weather Data**: Location detection → API request → Data processing → Dashboard display
5. **Community Posts**: Content creation → Validation → Storage → Real-time display

## External Dependencies

### APIs and Services
- **OpenWeatherMap API**: Weather data and forecasting
- **Web Speech API**: Browser-based voice recognition
- **AI/ML Services**: Disease detection and chatbot responses (backend integration required)

### Frontend Libraries
- **Bootstrap 5.3.0**: UI framework and responsive design
- **Font Awesome 6.0.0**: Icon library
- **Chart.js**: Data visualization for analytics
- **Custom JavaScript modules**: Application-specific functionality

### Python Packages
- **Flask**: Web framework and routing
- **Flask-SQLAlchemy**: Database ORM
- **Flask-Login**: Authentication management
- **Werkzeug**: Security utilities and file handling
- **Requests**: HTTP client for external API calls

## Deployment Strategy

### Environment Configuration
- Environment variables for sensitive data (API keys, database URLs)
- Configurable database backends (SQLite for development, PostgreSQL for production)
- Session secret management for security
- File upload directory configuration

### Production Considerations
- ProxyFix middleware for deployment behind reverse proxies
- Connection pooling and database optimization settings
- File size limits and upload security measures
- Logging configuration for monitoring and debugging

### Scalability Features
- Session-based architecture for horizontal scaling
- Database connection pooling for performance
- Modular component design for feature expansion
- API-first approach for potential mobile app integration

The application follows a traditional MVC pattern with clear separation of concerns, making it maintainable and extensible for future agricultural technology integrations.