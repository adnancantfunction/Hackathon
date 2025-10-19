# UAE Climate Intelligence System 🌊

**AI-Powered Flood Detection, Agriculture & Renewable Energy Platform**

> A comprehensive climate management system for the UAE, combining real-time weather data, machine learning, and intelligent analysis for flood prevention, agricultural planning, and hydropower site selection.

## 🚀 Live Demo

**🌐 Try it live:** [Coming Soon - Deploy to Vercel]

**💻 GitHub:** https://github.com/adnancantfunction/Hackathon

---

## ✨ Features

### 🌊 Flood Detection & Cloud Seeding Analysis
- Real-time flood risk assessment across 7 UAE emirates
- XGBoost ML model with 20-feature analysis
- Python AI Mode with enhanced algorithms
- Cloud seeding feasibility recommendations
- Automated alerts for high-risk conditions

### 🌱 Agriculture Assistance
- Crop recommendations based on real-time conditions
- Soil moisture analysis and rainfall tracking
- Regional suitability rankings for farming
- Smart irrigation suggestions

### ⚡ Mini-Hydropower Plant Location Analysis
- Water flow potential calculations
- Power generation estimates (kW capacity)
- Plant type recommendations (Run-of-River, Micro-Hydro, Pico-Hydro)
- ROI and environmental impact metrics

---

## 🛠️ Tech Stack

**Frontend:** React • Vite • Tailwind CSS • Leaflet Maps  
**Backend:** Python Flask • XGBoost ML • Pandas • NumPy  
**APIs:** OpenWeatherMap (Real-time weather data)

---

## 📦 Quick Start

```bash
# Frontend
cd uae-flood-app
npm install
npm run dev

# Backend (separate terminal)
cd uae-flood-app/backend
pip install flask flask-cors pandas numpy xgboost scikit-learn joblib
python api.py
```

Visit: http://localhost:5173

---

## 🎮 Two Operating Modes

### 🌐 Real Time Mode
- Uses live OpenWeatherMap API data
- Displays actual current weather conditions
- Real-time flood risk calculations
- No simulation - pure live analysis

### 🐍 Python AI Mode
- Enhanced XGBoost ML predictions
- 20-feature analysis algorithm
- Optional rainfall simulation (0-100mm)
- Auto-analyzes all emirates on toggle
- Advanced non-linear feature scaling

---

## 🗺️ Three Integrated Tabs

### 1. Flood Detection
- Interactive satellite map
- Color-coded risk markers (Red/Yellow/Green)
- Detailed AI analysis panel
- Export analysis reports

### 2. Agriculture
- Emirates ranked by farming suitability
- Recommended crops for each region
- Climate factor insights
- Agricultural planning tips

### 3. Hydropower
- Water flow potential rankings
- Estimated power generation capacity
- Plant type recommendations
- Economic & environmental benefits

---

## 🌟 Key Highlights

✅ **Real-time weather integration** with OpenWeatherMap  
✅ **Enhanced XGBoost ML model** with 20 features  
✅ **3 integrated analysis systems** in one platform  
✅ **Auto-analysis** when switching AI modes  
✅ **Professional enterprise UI** design  
✅ **Export & reporting** capabilities  

---

## 🎯 Algorithms

### Flood Risk Calculation
```javascript
floodRisk = (rainfall × 3) + (cloudCover × 0.3) + (humidity × 0.2) - (drainage × 0.5)
```

### Hydropower Potential
```javascript
waterFlowScore = (rainfall × 0.4) + ((100 - drainage) × 0.3) + (soilMoisture × 0.3)
estimatedCapacity = waterFlowScore × 2 kW
```

### Python AI Enhancement
- Non-linear feature scaling with power transformations
- Composite risk indicators (saturation index, climate severity)
- UAE-specific climate adjustments (28°C baseline)
- Dynamic infrastructure stress modeling

---

## 🚀 Deployment

See [uae-flood-app/DEPLOYMENT.md](uae-flood-app/DEPLOYMENT.md) for detailed instructions.

**Quick Deploy to Vercel:**
1. Visit https://vercel.com/new
2. Import this repository
3. Set Root Directory: `uae-flood-app`
4. Framework: Vite
5. Deploy!

---

## 🎓 Use Cases

### Government Climate Management
- Monitor flood risks across UAE
- Plan cloud seeding operations
- Disaster prevention & response

### Agricultural Planning
- Identify optimal farming regions
- Crop selection recommendations
- Water resource management

### Renewable Energy
- Locate mini-hydropower sites
- Estimate generation capacity
- Plan sustainable infrastructure

---

## 📊 Project Structure

```
Hackathon/
├── uae-flood-app/
│   ├── src/              # React frontend
│   ├── backend/          # Python Flask API
│   │   ├── api.py        # Enhanced XGBoost API
│   │   └── final_xgboost_model.pkl
│   ├── public/
│   └── package.json
├── README.md
└── DEPLOYMENT.md
```

---

## 🔑 API Configuration

Get a free OpenWeatherMap API key at: https://openweathermap.org/api

Add to `src/App.jsx`:
```javascript
const WEATHER_API_KEY = 'your_api_key_here';
```

---

## 📄 License

MIT License

---

## 🙏 Acknowledgments

- OpenWeatherMap for real-time weather data
- UAE government for climate data insights
- XGBoost team for ML framework

---

**🌊 Making UAE safer, greener, and more sustainable**
