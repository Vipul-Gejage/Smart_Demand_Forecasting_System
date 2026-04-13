# Smart Demand Forecasting System

## Williams-Sonoma AI-Thon 2026 Submission

A comprehensive AI-powered demand forecasting and inventory management system designed to optimize retail operations through predictive analytics, real-time insights, and intelligent recommendations.

## 🎯 Problem Solved

Retail businesses face significant challenges with inventory management, stockouts, and overstocking. This system addresses these issues by:

- **Predictive Demand Forecasting**: Using machine learning to forecast product demand 7 days ahead
- **Intelligent Inventory Optimization**: Calculating optimal inventory levels with safety stock recommendations
- **Risk Assessment**: Providing stockout and overstock risk probabilities
- **Real-time Insights**: Integrating weather, promotions, and events data for accurate predictions
- **Explainable AI**: Providing human-readable explanations for all forecasts

## ✨ Features

### Core Functionality
- 🔐 **User Authentication**: Secure JWT-based authentication system
- 📊 **Demand Forecasting**: 7-day ahead predictions using XGBoost machine learning
- 📦 **Inventory Management**: CRUD operations for inventory tracking
- 🏪 **Multi-Store Support**: Handle forecasting for multiple store locations
- 📈 **Sales Analytics**: Historical sales data analysis and trends
- 🎯 **Promotional Impact**: Factor in promotions and events in forecasting
- 🌤️ **Weather Integration**: Weather data affects demand predictions
- 🤖 **AI Explainability**: SHAP-based explanations for model decisions

### Technical Features
- 🏗️ **Microservices Architecture**: Separate frontend, backend, and ML services
- 🔄 **Real-time Data Processing**: Handle streaming data inputs
- 📱 **Responsive UI**: Modern React-based dashboard
- 🔒 **Secure API**: RESTful APIs with proper authentication
- 📊 **Data Visualization**: Interactive charts and graphs
- 🚀 **Scalable ML Pipeline**: FastAPI-based ML service with model versioning

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

### ML Service
- **Python 3.10+** - Programming language
- **FastAPI** - Modern Python web framework
- **XGBoost** - Gradient boosting machine learning
- **scikit-learn** - Machine learning library
- **pandas/numpy** - Data manipulation
- **SHAP** - Model explainability
- **Google Generative AI** - AI-powered explanations

### Data & Tools
- **CSV Data Sources**: Sales history, products, stores, weather, promotions
- **Docker** - Containerization (planned)
- **GitHub Actions** - CI/CD (planned)

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- MongoDB (local or cloud instance)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Vipul-Gejage/Smart_Demand_Forecasting_System.git
cd Smart_Demand_Forecasting_System
```

### 2. Install Dependencies

**Backend Setup:**
```bash
cd server
npm install
```

**Frontend Setup:**
```bash
cd ../client
npm install
```

**ML Service Setup:**
```bash
cd ../ml_service
pip install -r ../requirements.txt
```

### 3. Environment Configuration

Copy `.env.example` files and create your actual `.env` files:

**Backend Configuration:**
```bash
cd server
cp .env.example .env
# Edit .env with your actual values
```

**ML Service Configuration:**
```bash
cd ../ml_service
cp .env.example .env
# Edit .env with your actual values
```

⚠️ **CRITICAL SECURITY NOTES**:
- ✅ `.gitignore` is configured to prevent `.env` files from being committed
- ✅ `.env.example` files are included in the repo (without real credentials)
- ⚠️ **NEVER** commit `.env` files - they contain sensitive data
- ⚠️ **NEVER** share API keys or JWT_SECRET in chat, email, or public forums
- ✅ Use strong, random JWT_SECRET (minimum 32 characters, use a generator)
- ✅ For MongoDB: Use MongoDB Atlas (cloud) for production
- ✅ Regenerate credentials periodically for security

## 📖 Usage

### Quick Start (3 Terminal Windows)

Open three terminal windows/tabs and run the following commands in sequence:

**Terminal 1 - ML Service (FastAPI):**
```bash
cd ml_service
python -c "import uvicorn; from main import app; uvicorn.run(app, host='0.0.0.0', port=8001)"
```
✅ ML Service runs on `http://localhost:8001`

**Terminal 2 - Frontend (React):**
```bash
cd client
npm run dev
```
✅ Frontend runs on `http://localhost:5173` (Vite default)

**Terminal 3 - Backend (Express):**
```bash
cd server
npm run dev
```
✅ Backend API runs on `http://localhost:5000`

### Accessing the Application

Once all three services are running:

1. **Open Frontend**: Visit `http://localhost:5173` in your browser
2. **API Documentation**: Access `http://localhost:8001/docs` for ML service Swagger docs
3. **Backend API**: Available at `http://localhost:5000/api/`
4. **Test Forecast**: Use the UI to register, login, and generate forecasts

### MongoDB Setup

Ensure MongoDB is running before starting the backend:

**Local MongoDB:**
```bash
# Windows with MongoDB installed
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Cloud MongoDB (Atlas):**
Update `MONGO_URI` in `server/.env` with your MongoDB Atlas connection string.

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

#### Forecasting
- `POST /api/forecast` - Generate demand forecast
- `GET /api/forecast/:id` - Get forecast by ID

#### Inventory
- `GET /api/inventory` - Get all inventory
- `POST /api/inventory` - Add inventory item
- `PUT /api/inventory/:id` - Update inventory
- `DELETE /api/inventory/:id` - Delete inventory

#### Other
- `GET /api/promotions` - Get promotions data
- `POST /api/promotions` - Add promotion

### Sample API Usage

**1. Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure_password_123"
  }'
```

**2. Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure_password_123"
  }'
# Returns: { token: "jwt_token_here" }
```

**3. Generate Forecast:**
```bash
curl -X POST http://localhost:5000/api/forecast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jwt_token_here" \
  -d '{
    "storeId": "1",
    "productId": "99",
    "salesHistory": [100, 120, 115, ...],
    "promotions": [{"type": "discount", "percentage": 10}],
    "weather": [{"temp": 72, "rainfall": 0.5}],
    "events": [{"type": "holiday", "impact": 1.2}]
  }'
```

**Response:**
```json
{
  "_id": "forecast_id_123",
  "storeId": "1",
  "productId": "99",
  "forecast": [100, 105, 110, 108, 115, 120, 118],
  "confidence": 0.85,
  "stockoutRisk": 0.12,
  "overstockRisk": 0.08,
  "recommendedInventory": 850,
  "explanation": "High confidence forecast based on recent trends and promotional impact",
  "createdAt": "2026-04-13T10:30:00Z"
}
```

## 🤖 AI Tools Used

This project was built using various AI tools and services, following the Williams-Sonoma AI-Thon guidelines:

### AI Chat and Ideation
- **ChatGPT (OpenAI)** - Code debugging, logic refinement, documentation writing
- **Claude (Anthropic)** - Long-form documentation, prompt design, architectural planning
- **Gemini (Google)** - Multimodal assistance, API integration help

### LLM APIs
- **Google AI Studio** - Gemini 1.5 Flash/Pro for AI explainability features
- **Groq** - Fast Llama 3 responses for development testing
- **OpenRouter** - Model routing for experimentation

### AI Coding Assistants
- **GitHub Copilot** - Code completion and suggestions in VS Code
- **Cursor** - AI-first IDE for multi-file edits and codebase understanding

### Full-Stack Builders
- **Bolt.new** - Initial React component scaffolding
-**Trae** - basic frontend and backend feature integration. 

### Other Tools
- **Perplexity AI** - Research on retail forecasting best practices
- **Hugging Face** - Model hub exploration for ML approaches

All tools were used within free tier limits. No paid upgrades were necessary.

## 📁 Project Structure

```
Smart_Demand_Forecasting_System/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   └── utils/         # Helper functions
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── controllers/       # Route handlers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── server.js
├── ml_service/            # Python ML service
│   ├── main.py          # FastAPI application
│   ├── forecasting.py   # ML prediction logic
│   ├── preprocessing.py # Data preprocessing
│   ├── features.py      # Feature engineering
│   └── schemas.py       # Pydantic models
├── data/                 # CSV data files
│   ├── sales_history.csv
│   ├── products.csv
│   ├── stores.csv
│   └── weather.csv
├── scripts/              # Utility scripts
│   ├── train_model.py
│   └── test_forecast_json_output.py
├── outputs/              # Forecast results
└── requirements.txt      # Python dependencies
```

## 🔧 Development

### Available NPM Scripts

**Frontend:**
```bash
cd client
npm run dev      # Start development server (port 5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

**Backend:**
```bash
cd server
npm run dev      # Start with nodemon (auto-reload)
npm run start    # Start production server
npm test         # Run tests
```

### ML Service Development

```bash
cd ml_service
# Run with auto-reload
python -c "import uvicorn; from main import app; uvicorn.run(app, host='0.0.0.0', port=8001, reload=True)"

# Access API docs at http://localhost:8001/docs
```

### Building for Production

**Frontend Build:**
```bash
cd client
npm run build  # Creates dist/ folder
# Deploy contents of dist/ to static hosting
```

**Backend Deployment:**
```bash
cd server
# Use PM2, Docker, or cloud platform (Railway, Heroku, etc.)
npm install -g pm2
pm2 start npm --name "smart-demand-server" -- start
```

**ML Service Deployment:**
```bash
# Use Gunicorn for production
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8001 main:app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is created for the Williams-Sonoma AI-Thon 2026. All rights reserved.

## 🙏 Acknowledgments

- Williams-Sonoma for organizing the AI-Thon 2026
- Open source community for the amazing tools and libraries
- AI tool providers for their generous free tiers

## 📞 Support

For questions or support, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for Williams-Sonoma AI-Thon 2026**