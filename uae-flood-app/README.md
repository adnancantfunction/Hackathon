# UAE Climate Intelligence System 🌊

**AI-Powered Flood Detection, Agriculture & Renewable Energy Platform**

A comprehensive climate management system for the UAE, combining real-time weather data, machine learning, and intelligent analysis for flood prevention, agricultural planning, and hydropower site selection.

## 🚀 Features

### 1. Flood Detection & Cloud Seeding Analysis
- **Real-time flood risk assessment** across 7 UAE emirates
- **XGBoost ML model** with 20-feature analysis
- **Python AI Mode** with enhanced algorithms
- **Cloud seeding feasibility** recommendations
- **Automated alerts** for high-risk conditions

### 2. Agriculture Assistance
- **Crop recommendations** based on real-time conditions
- **Soil moisture analysis** and rainfall tracking
- **Regional suitability rankings** for farming
- **Smart irrigation** suggestions

### 3. Mini-Hydropower Plant Location Analysis
- **Water flow potential** calculations
- **Power generation estimates** (kW capacity)
- **Plant type recommendations** (Run-of-River, Micro-Hydro, Pico-Hydro)
- **ROI and environmental impact** metrics

## 🛠️ Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Leaflet Maps  
**Backend:** Python Flask, XGBoost ML, Pandas, NumPy  
**APIs:** OpenWeatherMap (Real-time weather data)

## 📦 Quick Start

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install flask flask-cors pandas numpy xgboost scikit-learn joblib
python api.py
```

## 🔑 Configuration

Add your OpenWeatherMap API key in `src/App.jsx`:
```javascript
const WEATHER_API_KEY = 'your_api_key_here';
```

## 🎮 Two Modes

**🌐 Real Time Mode** - Live OpenWeatherMap data, actual conditions  
**🐍 Python AI Mode** - XGBoost predictions, 20-feature analysis, rain simulator

## 🌟 Key Highlights

✅ Real-time weather integration  
✅ Enhanced XGBoost ML model  
✅ 3 integrated analysis systems  
✅ Professional enterprise UI  
✅ Export & reporting capabilities  

---

**🤖 Built with Claude Code**
