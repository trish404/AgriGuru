import os
import json
import uuid
import requests
from datetime import datetime, timedelta
from flask import render_template, request, redirect, url_for, flash, jsonify, session
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.utils import secure_filename
from app import app, db
from models import User, ChatSession, ChatMessage, FarmRecord, DiseaseDetection, CommunityPost, PostComment

# Weather API configuration
WEATHER_API_KEY = os.environ.get("OPENWEATHER_API_KEY", "demo_key")
WEATHER_BASE_URL = "http://api.openweathermap.org/data/2.5"

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        farm_location = request.form.get('farm_location', '')
        farm_size = request.form.get('farm_size', '')
        primary_crops = request.form.get('primary_crops', '')
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            flash('Username already exists', 'error')
            return render_template('register.html')
        
        if User.query.filter_by(email=email).first():
            flash('Email already exists', 'error')
            return render_template('register.html')
        
        # Create new user
        user = User(
            username=username,
            email=email,
            farm_location=farm_location,
            farm_size=farm_size,
            primary_crops=primary_crops
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        flash('Registration successful', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            login_user(user)
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password', 'error')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    # Get user's recent records
    recent_records = FarmRecord.query.filter_by(user_id=current_user.id).order_by(FarmRecord.date_recorded.desc()).limit(5).all()
    
    # Get weather data for user's location
    weather_data = get_weather_data(current_user.farm_location)
    
    # Generate crop recommendations
    crop_recommendations = get_crop_recommendations(current_user.farm_location, current_user.primary_crops)
    
    # Get price analytics
    price_data = get_price_analytics(current_user.primary_crops)
    
    return render_template('dashboard.html', 
                         recent_records=recent_records,
                         weather_data=weather_data,
                         crop_recommendations=crop_recommendations,
                         price_data=price_data)

@app.route('/community')
def community():
    posts = CommunityPost.query.order_by(CommunityPost.created_at.desc()).all()
    return render_template('community.html', posts=posts)

@app.route('/disease_detection', methods=['GET', 'POST'])
def disease_detection():
    if request.method == 'POST':
        if 'file' not in request.files:
            flash('No file selected', 'error')
            return redirect(request.url)
        
        file = request.files['file']
        if file.filename == '':
            flash('No file selected', 'error')
            return redirect(request.url)
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filename = f"{uuid.uuid4()}_{filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Mock disease detection analysis
            detection_result = analyze_disease_image(filepath)
            
            # Save detection record
            detection = DiseaseDetection(
                user_id=current_user.id if current_user.is_authenticated else None,
                image_filename=filename,
                detected_disease=detection_result['disease'],
                confidence_score=detection_result['confidence'],
                recommendations=detection_result['recommendations']
            )
            db.session.add(detection)
            db.session.commit()
            
            return render_template('disease_detection.html', result=detection_result)
    
    return render_template('disease_detection.html')

@app.route('/api/chat', methods=['POST'])
def chat_api():
    data = request.get_json()
    message = data.get('message', '')
    language = data.get('language', 'en')
    is_voice = data.get('is_voice', False)
    
    # Get or create session
    session_id = session.get('chat_session_id')
    if not session_id:
        session_id = str(uuid.uuid4())
        session['chat_session_id'] = session_id
        
        chat_session = ChatSession(
            user_id=current_user.id if current_user.is_authenticated else None,
            session_id=session_id,
            language=language
        )
        db.session.add(chat_session)
        db.session.commit()
    
    # Save user message
    user_message = ChatMessage(
        session_id=ChatSession.query.filter_by(session_id=session_id).first().id,
        message_type='user',
        content=message,
        is_voice=is_voice
    )
    db.session.add(user_message)
    
    # Generate AI response
    bot_response = generate_ai_response(message, language, current_user if current_user.is_authenticated else None)
    
    # Save bot response
    bot_message = ChatMessage(
        session_id=ChatSession.query.filter_by(session_id=session_id).first().id,
        message_type='bot',
        content=bot_response
    )
    db.session.add(bot_message)
    db.session.commit()
    
    return jsonify({
        'response': bot_response,
        'language': language
    })

@app.route('/api/weather/<location>')
def weather_api(location):
    weather_data = get_weather_data(location)
    return jsonify(weather_data)

@app.route('/api/crop_recommendations')
@login_required
def crop_recommendations_api():
    location = request.args.get('location', current_user.farm_location)
    current_crops = request.args.get('crops', current_user.primary_crops)
    recommendations = get_crop_recommendations(location, current_crops)
    return jsonify(recommendations)

@app.route('/api/price_analytics/<crop>')
def price_analytics_api(crop):
    price_data = get_price_analytics(crop)
    return jsonify(price_data)

# Helper functions
def get_weather_data(location):
    """Get weather data for a location"""
    if not location or WEATHER_API_KEY == "demo_key":
        return {
            'current': {
                'temperature': 25,
                'humidity': 60,
                'description': 'Clear sky',
                'wind_speed': 5
            },
            'forecast': [
                {'date': 'Today', 'temp_high': 28, 'temp_low': 20, 'description': 'Sunny'},
                {'date': 'Tomorrow', 'temp_high': 26, 'temp_low': 18, 'description': 'Partly cloudy'},
                {'date': 'Day 3', 'temp_high': 24, 'temp_low': 16, 'description': 'Light rain'}
            ]
        }
    
    try:
        # Current weather
        current_url = f"{WEATHER_BASE_URL}/weather?q={location}&appid={WEATHER_API_KEY}&units=metric"
        current_response = requests.get(current_url, timeout=5)
        
        # Forecast
        forecast_url = f"{WEATHER_BASE_URL}/forecast?q={location}&appid={WEATHER_API_KEY}&units=metric"
        forecast_response = requests.get(forecast_url, timeout=5)
        
        if current_response.status_code == 200 and forecast_response.status_code == 200:
            current_data = current_response.json()
            forecast_data = forecast_response.json()
            
            return {
                'current': {
                    'temperature': current_data['main']['temp'],
                    'humidity': current_data['main']['humidity'],
                    'description': current_data['weather'][0]['description'],
                    'wind_speed': current_data['wind']['speed']
                },
                'forecast': [
                    {
                        'date': datetime.fromtimestamp(item['dt']).strftime('%A'),
                        'temp_high': item['main']['temp_max'],
                        'temp_low': item['main']['temp_min'],
                        'description': item['weather'][0]['description']
                    }
                    for item in forecast_data['list'][:3]
                ]
            }
    except Exception as e:
        app.logger.error(f"Weather API error: {e}")
    
    # Fallback data
    return {
        'current': {
            'temperature': 25,
            'humidity': 60,
            'description': 'Data unavailable',
            'wind_speed': 5
        },
        'forecast': []
    }

def get_crop_recommendations(location, current_crops):
    """Generate crop recommendations based on location and current crops"""
    recommendations = [
        {
            'crop': 'Rice',
            'suitability': 85,
            'season': 'Monsoon',
            'expected_yield': '4-5 tons/hectare',
            'reasons': ['High rainfall area', 'Good soil moisture', 'Market demand']
        },
        {
            'crop': 'Wheat',
            'suitability': 78,
            'season': 'Winter',
            'expected_yield': '3-4 tons/hectare',
            'reasons': ['Cool weather suitable', 'Good soil conditions', 'Government support']
        },
        {
            'crop': 'Sugarcane',
            'suitability': 72,
            'season': 'Year-round',
            'expected_yield': '80-100 tons/hectare',
            'reasons': ['High water availability', 'Processing units nearby', 'Long-term crop']
        }
    ]
    
    return recommendations

def get_price_analytics(crops):
    """Get price analytics for crops"""
    if not crops:
        crops = "rice,wheat,sugarcane"
    
    crop_list = [crop.strip() for crop in crops.split(',')]
    
    price_data = {}
    for crop in crop_list:
        price_data[crop] = {
            'current_price': 2500 + hash(crop) % 1000,
            'predicted_price': 2700 + hash(crop) % 1200,
            'trend': 'increasing' if hash(crop) % 2 else 'stable',
            'historical': [
                2300 + hash(crop + str(i)) % 800 for i in range(30)
            ]
        }
    
    return price_data

def analyze_disease_image(image_path):
    """Mock disease detection analysis"""
    diseases = [
        {
            'disease': 'Leaf Blight',
            'confidence': 87.5,
            'recommendations': 'Apply copper-based fungicide. Ensure proper drainage. Remove affected leaves.'
        },
        {
            'disease': 'Powdery Mildew',
            'confidence': 82.3,
            'recommendations': 'Increase air circulation. Apply sulfur-based treatment. Avoid overhead watering.'
        },
        {
            'disease': 'Bacterial Spot',
            'confidence': 75.8,
            'recommendations': 'Use copper bactericide. Improve field sanitation. Avoid working in wet conditions.'
        }
    ]
    
    # Return a random disease for demo
    import random
    return random.choice(diseases)

def generate_ai_response(message, language, user):
    """Generate AI chatbot response"""
    message_lower = message.lower()
    
    # Crop recommendation responses
    if any(word in message_lower for word in ['crop', 'plant', 'grow', 'recommend']):
        if user and user.farm_location:
            return f"Based on your location in {user.farm_location}, I recommend considering rice for monsoon season and wheat for winter. These crops are well-suited to your climate conditions."
        else:
            return "I'd be happy to recommend crops for you! Could you please tell me your location and current farming conditions?"
    
    # Weather-related responses
    elif any(word in message_lower for word in ['weather', 'rain', 'temperature', 'climate']):
        return "Current weather shows favorable conditions for farming. Expect moderate temperatures with adequate rainfall this week. Perfect time for sowing activities!"
    
    # Price-related responses
    elif any(word in message_lower for word in ['price', 'market', 'sell', 'cost']):
        return "Market prices are showing an upward trend for major crops. Rice prices are expected to increase by 8% in the next month. Consider planning your harvest timing accordingly."
    
    # Disease-related responses
    elif any(word in message_lower for word in ['disease', 'pest', 'problem', 'sick']):
        return "For disease identification, please use our image upload feature. Common preventive measures include crop rotation, proper drainage, and regular field monitoring."
    
    # Subsidy-related responses
    elif any(word in message_lower for word in ['subsidy', 'scheme', 'government', 'support']):
        return "Several government schemes are available: PM-KISAN, crop insurance, and fertilizer subsidies. I can help you check eligibility based on your farm details."
    
    # Greeting responses
    elif any(word in message_lower for word in ['hello', 'hi', 'good morning', 'good afternoon']):
        return "Hello! I'm AgriGuru, your intelligent farming assistant. I can help you with crop recommendations, weather updates, market prices, disease detection, and government schemes. How can I assist you today?"
    
    # Default response
    else:
        return "I'm here to help with all your farming needs! You can ask me about crop recommendations, weather forecasts, market prices, disease identification, or government schemes. What would you like to know?"
