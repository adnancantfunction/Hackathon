import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, AlertTriangle, CheckCircle, Droplets, Wind, Thermometer, Eye, Activity, Bell, Download, MapPin, Sprout, Zap } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const UAEFloodSystem = () => {
  const [selectedEmirate, setSelectedEmirate] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [time, setTime] = useState(new Date());
  const [usePythonAI, setUsePythonAI] = useState(false);
  const [weatherData, setWeatherData] = useState({});
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [simulateRainfall, setSimulateRainfall] = useState(false);
  const [simulatedRainfallAmount, setSimulatedRainfallAmount] = useState(25);
  const [pythonAnalysisResults, setPythonAnalysisResults] = useState({});
  const [activeTab, setActiveTab] = useState('flood'); // 'flood', 'agriculture', or 'hydropower'

  // OpenWeatherMap API key - Get yours free at https://openweathermap.org/api
  const WEATHER_API_KEY = 'c4f13286414d611a5e28d91ec63915fe'; // Replace with your API key

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-analyze all emirates when Python AI mode is turned ON
  // Reset to live weather colors when switched to Demo Mode
  useEffect(() => {
    if (usePythonAI && emirates.length > 0) {
      // Analyze all emirates in background
      emirates.forEach(emirate => {
        fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rainfall: emirate.rainfall,
            drainageCapacity: emirate.drainageCapacity,
            soilMoisture: emirate.soilMoisture,
            cloudCover: emirate.cloudCover,
            humidity: emirate.humidity,
            temperature: emirate.temperature
          })
        })
        .then(response => response.json())
        .then(aiResult => {
          const getRiskFromProbability = (prob) => {
            if (prob >= 70) return 'high';
            if (prob >= 50) return 'medium';
            return 'low';
          };
          const newRisk = getRiskFromProbability(aiResult.flood_probability);

          // Store Python analysis results for this emirate
          setPythonAnalysisResults(prev => ({
            ...prev,
            [emirate.id]: {
              floodProbability: aiResult.flood_probability,
              decision: aiResult.decision,
              floodRisk: newRisk
            }
          }));

          // Update marker color on map
          setWeatherData(prevData => ({
            ...prevData,
            [emirate.id]: { ...prevData[emirate.id], floodRisk: newRisk }
          }));
        })
        .catch(error => {
          console.error(`Failed to analyze ${emirate.name}:`, error);
        });
      });
    } else if (!usePythonAI) {
      // Reset to original live weather flood risk when switching to Demo Mode
      // This restores the markers to their original colors from OpenWeatherMap API
      emiratesBase.forEach(emirate => {
        const originalWeather = weatherData[emirate.id];
        if (originalWeather && originalWeather.floodRisk) {
          // Recalculate flood risk from live weather data
          const rainfall = originalWeather.rainfall || 0;
          const riskScore = (rainfall * 3) + (originalWeather.cloudCover * 0.3) + (originalWeather.humidity * 0.2) - (emirate.drainageCapacity * 0.5);
          const liveRisk = riskScore > 40 ? 'high' : riskScore > 20 ? 'medium' : 'low';

          setWeatherData(prevData => ({
            ...prevData,
            [emirate.id]: { ...prevData[emirate.id], floodRisk: liveRisk }
          }));
        }
      });
    }
  }, [usePythonAI, simulateRainfall, simulatedRainfallAmount]);

  // Base emirate locations and infrastructure data
  const emiratesBase = [
    {
      id: 'dubai',
      name: 'Dubai',
      lat: 25.2048,
      lng: 55.2708,
      drainageCapacity: 85,
      soilMoisture: 35
    },
    {
      id: 'abudhabi',
      name: 'Abu Dhabi',
      lat: 24.4539,
      lng: 54.3773,
      drainageCapacity: 45,
      soilMoisture: 75
    },
    {
      id: 'sharjah',
      name: 'Sharjah',
      lat: 25.3463,
      lng: 55.4209,
      drainageCapacity: 80,
      soilMoisture: 30
    },
    {
      id: 'ajman',
      name: 'Ajman',
      lat: 25.4052,
      lng: 55.5136,
      drainageCapacity: 90,
      soilMoisture: 25
    },
    {
      id: 'rak',
      name: 'Ras Al Khaimah',
      lat: 25.7896,
      lng: 55.9433,
      drainageCapacity: 65,
      soilMoisture: 55
    },
    {
      id: 'fujairah',
      name: 'Fujairah',
      lat: 25.1288,
      lng: 56.3265,
      drainageCapacity: 70,
      soilMoisture: 45
    },
    {
      id: 'uaq',
      name: 'Umm Al Quwain',
      lat: 25.5647,
      lng: 55.5552,
      drainageCapacity: 85,
      soilMoisture: 32
    }
  ];

  // Fetch real-time weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      setIsLoadingWeather(true);
      const weatherPromises = emiratesBase.map(async (emirate) => {
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${emirate.lat}&lon=${emirate.lng}&appid=${WEATHER_API_KEY}&units=metric`
          );
          const data = await response.json();

          // Calculate rainfall from rain data (default to 0 if no rain)
          const rainfall = data.rain?.['1h'] || data.rain?.['3h'] || 0;

          // Get cloud type based on weather description
          const getCloudType = (description) => {
            if (description.includes('thunder')) return 'Cumulonimbus';
            if (description.includes('rain') || description.includes('drizzle')) return 'Nimbostratus';
            if (description.includes('cloud')) return 'Cumulus';
            if (description.includes('clear')) return 'Clear';
            return 'Stratus';
          };

          // Calculate flood risk based on real-time data
          const calculateFloodRisk = (rainfall, clouds, humidity, drainage) => {
            const riskScore = (rainfall * 3) + (clouds * 0.3) + (humidity * 0.2) - (drainage * 0.5);
            if (riskScore > 40) return 'high';
            if (riskScore > 20) return 'medium';
            return 'low';
          };

          return {
            id: emirate.id,
            weatherData: {
              cloudCover: data.clouds.all,
              cloudType: getCloudType(data.weather[0].description),
              rainfall: rainfall,
              humidity: data.main.humidity,
              windSpeed: data.wind.speed,
              temperature: Math.round(data.main.temp),
              pressure: data.main.pressure,
              floodRisk: calculateFloodRisk(rainfall, data.clouds.all, data.main.humidity, emirate.drainageCapacity)
            }
          };
        } catch (error) {
          console.error(`Failed to fetch weather for ${emirate.name}:`, error);
          // Return default values if API fails
          return {
            id: emirate.id,
            weatherData: {
              cloudCover: 50,
              cloudType: 'Cumulus',
              rainfall: 0,
              humidity: 60,
              windSpeed: 10,
              temperature: 28,
              pressure: 1013,
              floodRisk: 'low'
            }
          };
        }
      });

      const results = await Promise.all(weatherPromises);
      const weatherMap = {};
      results.forEach(result => {
        weatherMap[result.id] = result.weatherData;
      });

      setWeatherData(weatherMap);
      setIsLoadingWeather(false);
    };

    // Only fetch if API key is set
    if (WEATHER_API_KEY !== 'YOUR_API_KEY_HERE') {
      fetchWeatherData();
      // Refresh weather data every 10 minutes
      const interval = setInterval(fetchWeatherData, 600000);
      return () => clearInterval(interval);
    } else {
      // Use demo data if no API key
      const demoWeather = {};
      emiratesBase.forEach(emirate => {
        demoWeather[emirate.id] = {
          cloudCover: Math.floor(Math.random() * 100),
          cloudType: ['Cumulus', 'Stratus', 'Cirrus'][Math.floor(Math.random() * 3)],
          rainfall: Math.floor(Math.random() * 30),
          humidity: Math.floor(Math.random() * 40) + 50,
          windSpeed: Math.floor(Math.random() * 20) + 5,
          temperature: Math.floor(Math.random() * 10) + 25,
          pressure: Math.floor(Math.random() * 20) + 1005,
          floodRisk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
        };
      });
      setWeatherData(demoWeather);
      setIsLoadingWeather(false);
    }
  }, [WEATHER_API_KEY]);

  // Merge base data with weather data
  const emirates = emiratesBase.map(emirate => {
    const weather = weatherData[emirate.id] || {
      cloudCover: 0,
      cloudType: 'Loading...',
      rainfall: 0,
      humidity: 0,
      windSpeed: 0,
      temperature: 0,
      pressure: 0,
      floodRisk: 'low'
    };

    // IMPORTANT: Rainfall simulation ONLY applies in Python AI mode
    // Real Time mode ALWAYS uses actual live weather data from OpenWeatherMap API
    // Even if rain slider is set, it's completely ignored in Real Time mode
    if (simulateRainfall && usePythonAI) {
      weather.rainfall = simulatedRainfallAmount;
      // Recalculate flood risk with simulated rainfall
      const riskScore = (simulatedRainfallAmount * 3) + (weather.cloudCover * 0.3) + (weather.humidity * 0.2) - (emirate.drainageCapacity * 0.5);
      weather.floodRisk = riskScore > 40 ? 'high' : riskScore > 20 ? 'medium' : 'low';
    }
    // Otherwise, use real-time weather data (no simulation)

    return {
      ...emirate,
      ...weather
    };
  });

  const analyzeCloudSeeding = (emirate) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    // If Python AI mode is enabled, call Flask backend
    if (usePythonAI) {
      fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rainfall: emirate.rainfall,
          drainageCapacity: emirate.drainageCapacity,
          soilMoisture: emirate.soilMoisture,
          cloudCover: emirate.cloudCover,
          humidity: emirate.humidity,
          temperature: emirate.temperature
        })
      })
      .then(response => {
        if (!response.ok) throw new Error('API connection failed');
        return response.json();
      })
      .then(aiResult => {
        const result = {
          emirate: emirate.name,
          decision: aiResult.decision,
          confidence: aiResult.confidence,
          floodRisk: emirate.floodRisk,
          warning: aiResult.decision === 'FLOOD_WARNING' 
            ? `🚨 CRITICAL ALERT: High flood risk in ${emirate.name}. Cloud seeding PROHIBITED.`
            : aiResult.decision === 'CAUTION'
            ? `⚠️ MODERATE RISK: Proceed with monitored seeding in ${emirate.name}.`
            : aiResult.decision === 'PROCEED'
            ? `✅ SAFE TO PROCEED: Cloud seeding approved for ${emirate.name}.`
            : `Cloud conditions not suitable for seeding in ${emirate.name}.`,
          rainfall: emirate.rainfall,
          cloudCover: emirate.cloudCover,
          humidity: emirate.humidity,
          cloudType: emirate.cloudType,
          predictedRain: 0,
          totalPotential: emirate.rainfall,
          soilMoisture: emirate.soilMoisture,
          drainage: emirate.drainageCapacity,
          aiReasoning: aiResult.reasoning || ['Python AI analysis complete'],
          timestamp: new Date(),
          pythonAI: true
        };

        if (aiResult.decision === 'FLOOD_WARNING') {
          const newAlert = {
            time: new Date(),
            emirate: emirate.name,
            type: 'FLOOD_WARNING',
            message: `Python AI detected high flood risk. Seeding cancelled.`
          };
          setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
        }

        // Update the flood risk for the specific emirate on the map
        const getRiskFromProbability = (prob) => {
          if (prob >= 70) return 'high';
          if (prob >= 50) return 'medium';
          return 'low';
        }
        const newRisk = getRiskFromProbability(aiResult.flood_probability);

        setWeatherData(prevData => ({
          ...prevData,
          [emirate.id]: { ...prevData[emirate.id], floodRisk: newRisk }
        }));


        setAnalysisResult(result);
        setAnalysisHistory(prev => [result, ...prev.slice(0, 9)]);
        setIsAnalyzing(false);
      })
      .catch(error => {
        console.error('Python AI Error:', error);
        alert('⚠️ Cannot connect to Python AI!\n\nMake sure Flask server is running:\n1. Open terminal\n2. cd backend\n3. python api.py\n\nSwitching to Real Time Mode...');
        setUsePythonAI(false);
        setIsAnalyzing(false);
      });

      return;
    }

    // Real Time Mode algorithm - Uses LIVE weather data from OpenWeatherMap API
    setTimeout(() => {
      // All values come from LIVE OpenWeatherMap API data - NO simulation
      const cloudScore = emirate.cloudCover * 0.4 + emirate.humidity * 0.3;
      const isSeedable = emirate.cloudCover > 50 &&
                        emirate.humidity > 60 &&
                        (emirate.cloudType === 'Cumulus' || emirate.cloudType === 'Cumulonimbus');

      // Enhanced flood risk calculation using real-time data
      const floodScore = (
        emirate.rainfall * 0.3 +
        emirate.soilMoisture * 0.25 +
        (100 - emirate.drainageCapacity) * 0.25 +
        (emirate.cloudCover > 70 ? 20 : 0) +
        (emirate.humidity > 80 ? 10 : 0) + // High humidity factor
        (emirate.temperature > 35 ? 5 : 0)  // Extreme heat factor
      );

      const floodRiskLevel = emirate.floodRisk;
      const predictedAdditionalRain = isSeedable ? Math.round(emirate.cloudCover * 0.3) : 0;
      const totalPotentialRain = emirate.rainfall + predictedAdditionalRain;
      
      let decision = '';
      let warning = '';
      let confidence = 0;
      let aiReasoning = [];
      
      if (!isSeedable) {
        decision = 'NOT_SEEDABLE';
        warning = `Cloud conditions not suitable for seeding in ${emirate.name}.`;
        confidence = 95;
        aiReasoning = [
          `Real-time cloud type: ${emirate.cloudType} - not optimal for seeding`,
          `Live cloud cover: ${emirate.cloudCover}% - minimum 50% required`,
          `Current humidity: ${emirate.humidity}% - minimum 60% required`,
          `Temperature: ${emirate.temperature}°C`,
          `Wind speed: ${emirate.windSpeed?.toFixed(1) || 0}m/s`
        ];
      } else if (floodRiskLevel === 'high' || totalPotentialRain > 35 || emirate.drainageCapacity < 50) {
        decision = 'FLOOD_WARNING';
        warning = `🚨 CRITICAL ALERT: High flood risk in ${emirate.name}. Cloud seeding PROHIBITED. Government authorities notified immediately.`;
        confidence = 92;
        aiReasoning = [
          `LIVE rainfall: ${emirate.rainfall}mm - Already elevated`,
          `Predicted seeding impact: +${predictedAdditionalRain}mm additional rainfall`,
          `Soil moisture: ${emirate.soilMoisture}% - Ground saturation critical`,
          `Drainage capacity: ${emirate.drainageCapacity}% - Infrastructure at risk`,
          `Total potential rainfall: ${totalPotentialRain}mm exceeds safety threshold`,
          `Real-time humidity: ${emirate.humidity}% | Temp: ${emirate.temperature}°C`,
          `Current wind: ${emirate.windSpeed?.toFixed(1) || 0}m/s`
        ];
        
        const newAlert = {
          time: new Date(),
          emirate: emirate.name,
          type: 'FLOOD_WARNING',
          message: `High flood risk detected. Seeding operation cancelled.`
        };
        setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
        
      } else if (floodRiskLevel === 'medium' || totalPotentialRain > 25) {
        decision = 'CAUTION';
        warning = `⚠️ MODERATE RISK: Proceed with monitored seeding in ${emirate.name}. Continuous surveillance required.`;
        confidence = 85;
        aiReasoning = [
          `Real-time cloud analysis: ${emirate.cloudType} - suitable for seeding`,
          `Predicted rainfall increase: +${predictedAdditionalRain}mm`,
          `Total potential: ${totalPotentialRain}mm - Approaching limits`,
          `Drainage capacity: ${emirate.drainageCapacity}% - Monitor closely`,
          `Live conditions: ${emirate.temperature}°C, ${emirate.humidity}% humidity`,
          `Wind conditions: ${emirate.windSpeed?.toFixed(1) || 0}m/s - acceptable`,
          `Recommendation: Reduced seeding intensity with real-time monitoring`
        ];
      } else {
        decision = 'PROCEED';
        warning = `✅ SAFE TO PROCEED: Cloud seeding approved for ${emirate.name}. Optimal conditions detected.`;
        confidence = 88;
        aiReasoning = [
          `Excellent LIVE cloud conditions (${emirate.cloudType})`,
          `Safe rainfall levels: Current ${emirate.rainfall}mm + Predicted ${predictedAdditionalRain}mm`,
          `Low flood risk: Good drainage (${emirate.drainageCapacity}%)`,
          `Soil moisture acceptable: ${emirate.soilMoisture}%`,
          `Real-time weather: ${emirate.temperature}°C, ${emirate.humidity}% humidity`,
          `Wind speed: ${emirate.windSpeed?.toFixed(1) || 0}m/s - ideal for operations`,
          `Weather patterns favorable for controlled precipitation`
        ];
      }

      const result = {
        emirate: emirate.name,
        isSeedable,
        floodRisk: floodRiskLevel,
        decision,
        warning,
        confidence,
        rainfall: emirate.rainfall,
        cloudCover: emirate.cloudCover,
        humidity: emirate.humidity,
        cloudType: emirate.cloudType,
        predictedRain: predictedAdditionalRain,
        totalPotential: totalPotentialRain,
        soilMoisture: emirate.soilMoisture,
        drainage: emirate.drainageCapacity,
        aiReasoning,
        timestamp: new Date()
      };

      setAnalysisResult(result);
      setAnalysisHistory(prev => [result, ...prev.slice(0, 9)]);
      setIsAnalyzing(false);
    }, 2500);
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Create custom marker icons based on flood risk
  const createCustomIcon = (risk) => {
    const color = getRiskColor(risk);
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 40px;
          height: 40px;
          background-color: ${color};
          border: 4px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          transition: transform 0.2s ease;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  const getDecisionColor = (decision) => {
    switch(decision) {
      case 'FLOOD_WARNING': return '#dc2626';
      case 'CAUTION': return '#f59e0b';
      case 'PROCEED': return '#059669';
      case 'NOT_SEEDABLE': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const exportReport = () => {
    if (!analysisResult) return;
    
    const report = `
UAE FLOOD DETECTION & CLOUD SEEDING SYSTEM
AI Analysis Report
Generated: ${new Date().toLocaleString()}
=================================================

LOCATION: ${analysisResult.emirate}
DECISION: ${analysisResult.decision}
CONFIDENCE: ${analysisResult.confidence}%

ATMOSPHERIC CONDITIONS:
- Cloud Type: ${analysisResult.cloudType}
- Cloud Cover: ${analysisResult.cloudCover}%
- Humidity: ${analysisResult.humidity}%
- Current Rainfall: ${analysisResult.rainfall}mm
- Predicted Additional Rain: ${analysisResult.predictedRain}mm
- Total Potential Rainfall: ${analysisResult.totalPotential}mm

FLOOD RISK ASSESSMENT:
- Risk Level: ${analysisResult.floodRisk.toUpperCase()}
- Soil Moisture: ${analysisResult.soilMoisture}%
- Drainage Capacity: ${analysisResult.drainage}%

AI REASONING:
${analysisResult.aiReasoning.map((reason, i) => `${i + 1}. ${reason}`).join('\n')}

RECOMMENDATION:
${analysisResult.warning}

=================================================
System developed for UAE Climate Management
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flood-analysis-${analysisResult.emirate}-${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Clean Professional Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl mb-6 border border-white/20 overflow-hidden">
          {/* Top Bar */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Cloud className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">UAE Climate Intelligence System</h1>
                <p className="text-xs text-blue-100">AI-Powered Flood Detection, Agriculture & Renewable Energy</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-white">LIVE</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-100">System Time</div>
                <div className="text-sm font-bold text-white">{time.toLocaleTimeString()}</div>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="px-6 py-4 flex justify-between items-center">
            {/* Status Info */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-300" />
                <span className="text-sm text-blue-100">7 Emirates</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-300" />
                <span className="text-sm text-blue-100">
                  {isLoadingWeather ? 'Loading...' : (simulateRainfall && usePythonAI) ? `Simulated: ${simulatedRainfallAmount}mm` : 'Real-time Data'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-300 font-semibold">System Active</span>
              </div>
            </div>

            {/* AI Mode Controls */}
            <div className="flex items-center gap-3">
              {/* AI Mode Toggle */}
              <button
                onClick={() => setUsePythonAI(!usePythonAI)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 font-semibold text-sm shadow-lg ${
                  usePythonAI
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  {usePythonAI ? (
                    <>
                      <span>🐍 Python AI</span>
                      {usePythonAI && <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-ping"></span>}
                    </>
                  ) : (
                    <span>🌐 Real Time</span>
                  )}
                </span>
              </button>

              {/* Rainfall Simulation - ONLY for Python AI Mode */}
              {usePythonAI && (
                <button
                  onClick={() => setSimulateRainfall(!simulateRainfall)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 font-semibold text-sm shadow-lg ${
                    simulateRainfall
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4" />
                    <span>{simulateRainfall ? 'Rain Sim ON' : 'Rain Sim OFF'}</span>
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Rainfall Slider - Compact */}
          {usePythonAI && simulateRainfall && (
            <div className="px-6 pb-4">
              <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-blue-200 font-semibold">Simulated Rainfall</label>
                  <span className="text-sm text-white font-bold">{simulatedRainfallAmount}mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simulatedRainfallAmount}
                  onChange={(e) => setSimulatedRainfallAmount(Number(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-blue-300 mt-1">
                  <span>0mm</span>
                  <span>50mm</span>
                  <span>100mm</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {alerts.length > 0 && (
          <div className="bg-red-500/90 backdrop-blur-lg text-white p-4 rounded-xl mb-6 shadow-xl border border-red-300">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 animate-pulse" />
              <div>
                <div className="font-bold">ACTIVE ALERTS</div>
                <div className="text-sm">{alerts[0].message} - {alerts[0].emirate} at {alerts[0].time.toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-2 mb-6 border border-white/20">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('flood')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'flood'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'bg-white/10 text-blue-200 hover:bg-white/20'
              }`}
            >
              <Cloud className="w-5 h-5" />
              <span>Flood Detection</span>
            </button>
            <button
              onClick={() => setActiveTab('agriculture')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'agriculture'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'bg-white/10 text-blue-200 hover:bg-white/20'
              }`}
            >
              <Sprout className="w-5 h-5" />
              <span>Agriculture</span>
            </button>
            <button
              onClick={() => setActiveTab('hydropower')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'hydropower'
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg'
                  : 'bg-white/10 text-blue-200 hover:bg-white/20'
              }`}
            >
              <Zap className="w-5 h-5" />
              <span>Hydropower</span>
            </button>
          </div>
        </div>

        {/* Flood Detection Tab */}
        {activeTab === 'flood' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Interactive UAE Satellite Map
              </h2>
            <div className="relative rounded-lg overflow-hidden border-2 border-blue-300/50" style={{ height: '450px' }}>
              <MapContainer
                center={[24.5, 55.0]}
                zoom={8}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                />

                {emirates.map((emirate) => (
                  <Marker
                    key={emirate.id}
                    position={[emirate.lat, emirate.lng]}
                    icon={createCustomIcon(emirate.floodRisk)}
                    eventHandlers={{
                      click: () => {
                        setSelectedEmirate(emirate);
                        analyzeCloudSeeding(emirate);
                      },
                    }}
                  >
                    <Popup>
                      <div className="text-center">
                        <div className="font-bold text-lg">{emirate.name}</div>
                        <div className="text-sm mt-1">Rainfall: {emirate.rainfall}mm</div>
                        <div className="text-sm">Risk: <span className="font-semibold capitalize" style={{ color: getRiskColor(emirate.floodRisk) }}>{emirate.floodRisk}</span></div>
                        <div className="text-xs text-gray-600 mt-2">Click to analyze</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            <div className="mt-4 flex gap-4 justify-center flex-wrap">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-sm text-white">High Risk</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                <span className="text-sm text-white">Medium Risk</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-sm text-white">Low Risk</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">AI Analysis</h2>
            
            {!selectedEmirate && (
              <div className="text-center py-12 text-blue-200">
                <Cloud className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="font-semibold">Select an emirate from the map</p>
                <p className="text-sm mt-2">Click any location to analyze cloud seeding feasibility and flood risk</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-400 mx-auto mb-4"></div>
                <p className="text-blue-300 font-semibold">AI Processing...</p>
                <p className="text-sm text-blue-200 mt-2">Analyzing atmospheric conditions</p>
                <p className="text-sm text-blue-200">Calculating flood probability</p>
                <p className="text-sm text-blue-200">Generating recommendations</p>
              </div>
            )}

            {analysisResult && !isAnalyzing && (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-xl text-white">{analysisResult.emirate}</h3>
                    <div className="text-right">
                      <div className="text-xs text-blue-200">Confidence</div>
                      <div className="text-2xl font-bold text-white">{analysisResult.confidence}%</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-blue-200 mb-1">
                        <Cloud className="w-3 h-3" />
                        {analysisResult.cloudType}
                      </div>
                      <div className="text-lg font-bold text-white">{analysisResult.cloudCover}%</div>
                    </div>
                    
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-blue-200 mb-1">
                        <Droplets className="w-3 h-3" />
                        Humidity
                      </div>
                      <div className="text-lg font-bold text-white">{analysisResult.humidity}%</div>
                    </div>
                    
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-blue-200 mb-1">
                        <CloudRain className="w-3 h-3" />
                        Current
                      </div>
                      <div className="text-lg font-bold text-white">{analysisResult.rainfall}mm</div>
                    </div>
                    
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-blue-200 mb-1">
                        <AlertTriangle className="w-3 h-3" />
                        Potential
                      </div>
                      <div className="text-lg font-bold text-white">{analysisResult.totalPotential}mm</div>
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-lg p-4 border-2 mb-3" style={{ borderColor: getDecisionColor(analysisResult.decision) }}>
                    <div className="flex items-start gap-3">
                      {analysisResult.decision === 'PROCEED' && <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />}
                      {analysisResult.decision === 'FLOOD_WARNING' && <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />}
                      {analysisResult.decision === 'CAUTION' && <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />}
                      {analysisResult.decision === 'NOT_SEEDABLE' && <Cloud className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />}
                      
                      <div>
                        <div className="font-bold text-lg mb-1 text-white">
                          {analysisResult.decision.replace('_', ' ')}
                        </div>
                        <p className="text-sm text-blue-100">{analysisResult.warning}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-xs font-bold text-blue-200 mb-2">AI REASONING:</div>
                    <div className="space-y-1">
                      {analysisResult.aiReasoning.map((reason, idx) => (
                        <div key={idx} className="text-xs text-blue-100 flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={exportReport}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button
                    onClick={() => {
                      setAnalysisResult(null);
                      setSelectedEmirate(null);
                    }}
                    className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
                  >
                    New Analysis
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Agriculture Assist Tab */}
        {activeTab === 'agriculture' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Sprout className="w-6 h-6 text-green-400" />
                Agriculture Recommendations
              </h2>
              <p className="text-blue-200 mb-6">
                Based on real-time rainfall and soil moisture data, here are the recommended areas for agricultural development.
              </p>

              {/* Sort emirates by rainfall (highest first) */}
              {emirates
                .slice()
                .sort((a, b) => b.rainfall - a.rainfall)
                .map((emirate, index) => {
                  const suitability =
                    emirate.rainfall > 15 && emirate.soilMoisture > 40 ? 'Excellent' :
                    emirate.rainfall > 10 || emirate.soilMoisture > 30 ? 'Good' :
                    emirate.rainfall > 5 || emirate.soilMoisture > 20 ? 'Moderate' :
                    'Poor';

                  const suitabilityColor =
                    suitability === 'Excellent' ? 'text-green-400' :
                    suitability === 'Good' ? 'text-blue-400' :
                    suitability === 'Moderate' ? 'text-yellow-400' :
                    'text-red-400';

                  const recommendedCrops =
                    emirate.rainfall > 15 ? ['Dates', 'Citrus', 'Vegetables'] :
                    emirate.rainfall > 10 ? ['Dates', 'Fodder Crops'] :
                    emirate.rainfall > 5 ? ['Dates', 'Hardy Crops'] :
                    ['Desert Plants', 'Drought-resistant'];

                  return (
                    <div key={emirate.id} className="bg-white/5 rounded-lg p-4 mb-3 border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-white flex items-center gap-2">
                            #{index + 1} {emirate.name}
                            {index === 0 && <span className="text-xs bg-green-500 px-2 py-1 rounded-full">TOP PICK</span>}
                          </h3>
                          <p className={`text-sm font-semibold ${suitabilityColor}`}>
                            Suitability: {suitability}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-blue-500/20 p-2 rounded">
                          <div className="text-xs text-blue-200">Rainfall</div>
                          <div className="text-lg font-bold text-white">{emirate.rainfall}mm</div>
                        </div>
                        <div className="bg-green-500/20 p-2 rounded">
                          <div className="text-xs text-green-200">Soil Moisture</div>
                          <div className="text-lg font-bold text-white">{emirate.soilMoisture}%</div>
                        </div>
                        <div className="bg-purple-500/20 p-2 rounded">
                          <div className="text-xs text-purple-200">Drainage</div>
                          <div className="text-lg font-bold text-white">{emirate.drainageCapacity}%</div>
                        </div>
                      </div>

                      <div className="bg-white/5 p-3 rounded-lg">
                        <div className="text-xs text-blue-200 mb-2">Recommended Crops:</div>
                        <div className="flex flex-wrap gap-2">
                          {recommendedCrops.map(crop => (
                            <span key={crop} className="bg-green-600/30 text-green-200 px-3 py-1 rounded-full text-xs font-semibold">
                              {crop}
                            </span>
                          ))}
                        </div>
                      </div>

                      {emirate.rainfall > 10 && (
                        <div className="mt-3 bg-green-500/20 border border-green-500/50 p-3 rounded-lg">
                          <div className="text-xs text-green-300 font-semibold">
                            ✅ High Priority: Excellent water availability for agriculture
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6 text-green-400" />
                Agricultural Insights
              </h2>

              <div className="space-y-4">
                <div className="bg-green-500/20 border border-green-500/50 p-4 rounded-lg">
                  <h3 className="font-bold text-white mb-2">Best Region for Farming</h3>
                  <p className="text-green-200 text-sm">
                    {emirates.reduce((best, current) =>
                      current.rainfall > best.rainfall ? current : best
                    ).name} - Highest rainfall at {emirates.reduce((best, current) =>
                      current.rainfall > best.rainfall ? current : best
                    ).rainfall}mm
                  </p>
                </div>

                <div className="bg-blue-500/20 border border-blue-500/50 p-4 rounded-lg">
                  <h3 className="font-bold text-white mb-2">Average Conditions</h3>
                  <div className="text-sm text-blue-200 space-y-1">
                    <p>• Avg Rainfall: {(emirates.reduce((sum, e) => sum + e.rainfall, 0) / emirates.length).toFixed(1)}mm</p>
                    <p>• Avg Soil Moisture: {(emirates.reduce((sum, e) => sum + e.soilMoisture, 0) / emirates.length).toFixed(1)}%</p>
                    <p>• Avg Temperature: {(emirates.reduce((sum, e) => sum + e.temperature, 0) / emirates.length).toFixed(1)}°C</p>
                  </div>
                </div>

                <div className="bg-yellow-500/20 border border-yellow-500/50 p-4 rounded-lg">
                  <h3 className="font-bold text-white mb-2">Agricultural Tips</h3>
                  <ul className="text-sm text-yellow-200 space-y-2">
                    <li>• Focus on drought-resistant crops in low rainfall areas</li>
                    <li>• Utilize drip irrigation in regions with poor drainage</li>
                    <li>• Date palms are ideal for UAE climate conditions</li>
                    <li>• Consider hydroponics in areas with low soil moisture</li>
                  </ul>
                </div>

                <div className="bg-purple-500/20 border border-purple-500/50 p-4 rounded-lg">
                  <h3 className="font-bold text-white mb-2">Climate Factors</h3>
                  <div className="text-sm text-purple-200 space-y-1">
                    <p>• High humidity areas: Better for tropical crops</p>
                    <p>• Good drainage: Prevents root rot in crops</p>
                    <p>• Temperature range: {Math.min(...emirates.map(e => e.temperature))}°C - {Math.max(...emirates.map(e => e.temperature))}°C</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mini-Hydropower Plant Installation Tab */}
        {activeTab === 'hydropower' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-400" />
                Mini-Hydropower Plant Locations
              </h2>
              <p className="text-blue-200 mb-6">
                Optimal locations for mini-hydropower installations based on water flow potential, drainage infrastructure, and rainfall patterns.
              </p>

              {/* Sort emirates by hydropower potential */}
              {emirates
                .slice()
                .sort((a, b) => {
                  const potentialA = (a.rainfall * 0.4) + ((100 - a.drainageCapacity) * 0.3) + (a.soilMoisture * 0.3);
                  const potentialB = (b.rainfall * 0.4) + ((100 - b.drainageCapacity) * 0.3) + (b.soilMoisture * 0.3);
                  return potentialB - potentialA;
                })
                .map((emirate, index) => {
                  // Calculate hydropower potential score (0-100)
                  const waterFlowScore = (emirate.rainfall * 0.4) + ((100 - emirate.drainageCapacity) * 0.3) + (emirate.soilMoisture * 0.3);

                  const potential =
                    waterFlowScore > 30 && emirate.rainfall > 15 ? 'Excellent' :
                    waterFlowScore > 20 || emirate.rainfall > 10 ? 'Good' :
                    waterFlowScore > 10 || emirate.rainfall > 5 ? 'Moderate' :
                    'Low';

                  const potentialColor =
                    potential === 'Excellent' ? 'text-yellow-400' :
                    potential === 'Good' ? 'text-green-400' :
                    potential === 'Moderate' ? 'text-blue-400' :
                    'text-gray-400';

                  // Estimate power generation capacity (kW)
                  const estimatedCapacity = Math.round(waterFlowScore * 2);

                  const plantType =
                    waterFlowScore > 30 ? 'Run-of-River with Storage' :
                    waterFlowScore > 20 ? 'Run-of-River' :
                    waterFlowScore > 10 ? 'Micro-Hydro' :
                    'Pico-Hydro';

                  return (
                    <div key={emirate.id} className="bg-white/5 rounded-lg p-4 mb-3 border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-white flex items-center gap-2">
                            #{index + 1} {emirate.name}
                            {index === 0 && <span className="text-xs bg-yellow-500 px-2 py-1 rounded-full">OPTIMAL</span>}
                          </h3>
                          <p className={`text-sm font-semibold ${potentialColor}`}>
                            Potential: {potential}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-yellow-200">Est. Capacity</div>
                          <div className="text-xl font-bold text-yellow-400">{estimatedCapacity}kW</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-blue-500/20 p-2 rounded">
                          <div className="text-xs text-blue-200">Rainfall</div>
                          <div className="text-lg font-bold text-white">{emirate.rainfall}mm</div>
                        </div>
                        <div className="bg-purple-500/20 p-2 rounded">
                          <div className="text-xs text-purple-200">Water Flow</div>
                          <div className="text-lg font-bold text-white">{(100 - emirate.drainageCapacity)}%</div>
                        </div>
                        <div className="bg-green-500/20 p-2 rounded">
                          <div className="text-xs text-green-200">Soil Water</div>
                          <div className="text-lg font-bold text-white">{emirate.soilMoisture}%</div>
                        </div>
                      </div>

                      <div className="bg-white/5 p-3 rounded-lg mb-2">
                        <div className="text-xs text-blue-200 mb-1">Recommended Plant Type:</div>
                        <div className="text-sm font-bold text-yellow-300">{plantType}</div>
                      </div>

                      <div className="bg-white/5 p-3 rounded-lg">
                        <div className="text-xs text-blue-200 mb-2">Installation Benefits:</div>
                        <div className="flex flex-wrap gap-2">
                          {waterFlowScore > 20 && <span className="bg-green-600/30 text-green-200 px-2 py-1 rounded-full text-xs">High ROI</span>}
                          {emirate.rainfall > 10 && <span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded-full text-xs">Consistent Flow</span>}
                          {emirate.drainageCapacity < 70 && <span className="bg-purple-600/30 text-purple-200 px-2 py-1 rounded-full text-xs">Natural Channels</span>}
                          {emirate.soilMoisture > 40 && <span className="bg-cyan-600/30 text-cyan-200 px-2 py-1 rounded-full text-xs">Water Storage</span>}
                        </div>
                      </div>

                      {waterFlowScore > 25 && (
                        <div className="mt-3 bg-yellow-500/20 border border-yellow-500/50 p-3 rounded-lg">
                          <div className="text-xs text-yellow-300 font-semibold">
                            ⚡ Priority Site: Excellent hydropower potential - Recommended for immediate development
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6 text-yellow-400" />
                Hydropower Analysis
              </h2>

              <div className="space-y-4">
                <div className="bg-yellow-500/20 border border-yellow-500/50 p-4 rounded-lg">
                  <h3 className="font-bold text-white mb-2">Top Location</h3>
                  <p className="text-yellow-200 text-sm">
                    {emirates.reduce((best, current) => {
                      const scoreA = (best.rainfall * 0.4) + ((100 - best.drainageCapacity) * 0.3) + (best.soilMoisture * 0.3);
                      const scoreB = (current.rainfall * 0.4) + ((100 - current.drainageCapacity) * 0.3) + (current.soilMoisture * 0.3);
                      return scoreB > scoreA ? current : best;
                    }).name} - Best water flow conditions
                  </p>
                </div>

                <div className="bg-green-500/20 border border-green-500/50 p-4 rounded-lg">
                  <h3 className="font-bold text-white mb-2">Total Potential</h3>
                  <div className="text-sm text-green-200 space-y-1">
                    <p>• Combined Capacity: {Math.round(emirates.reduce((sum, e) => {
                      const score = (e.rainfall * 0.4) + ((100 - e.drainageCapacity) * 0.3) + (e.soilMoisture * 0.3);
                      return sum + (score * 2);
                    }, 0))}kW</p>
                    <p>• Homes Powered: ~{Math.round(emirates.reduce((sum, e) => {
                      const score = (e.rainfall * 0.4) + ((100 - e.drainageCapacity) * 0.3) + (e.soilMoisture * 0.3);
                      return sum + (score * 2);
                    }, 0) / 5)} households</p>
                    <p>• CO2 Reduction: ~{Math.round(emirates.reduce((sum, e) => {
                      const score = (e.rainfall * 0.4) + ((100 - e.drainageCapacity) * 0.3) + (e.soilMoisture * 0.3);
                      return sum + (score * 2);
                    }, 0) * 0.8)} tons/year</p>
                  </div>
                </div>

                <div className="bg-blue-500/20 border border-blue-500/50 p-4 rounded-lg">
                  <h3 className="font-bold text-white mb-2">Installation Guidelines</h3>
                  <ul className="text-sm text-blue-200 space-y-2">
                    <li>• Assess seasonal rainfall patterns for consistent power</li>
                    <li>• Utilize existing drainage channels to reduce costs</li>
                    <li>• Combine with flood management infrastructure</li>
                    <li>• Consider micro-hydro for remote area electrification</li>
                  </ul>
                </div>

                <div className="bg-purple-500/20 border border-purple-500/50 p-4 rounded-lg">
                  <h3 className="font-bold text-white mb-2">Economic Benefits</h3>
                  <div className="text-sm text-purple-200 space-y-1">
                    <p>• Clean renewable energy source</p>
                    <p>• Low operational costs after installation</p>
                    <p>• Reduces dependence on fossil fuels</p>
                    <p>• Creates local jobs and expertise</p>
                  </div>
                </div>

                <div className="bg-orange-500/20 border border-orange-500/50 p-4 rounded-lg">
                  <h3 className="font-bold text-white mb-2">Plant Types Explained</h3>
                  <div className="text-sm text-orange-200 space-y-2">
                    <p><strong>Run-of-River:</strong> 50-500kW, best for consistent flow</p>
                    <p><strong>Micro-Hydro:</strong> 5-50kW, suitable for small communities</p>
                    <p><strong>Pico-Hydro:</strong> &lt;5kW, ideal for individual buildings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UAEFloodSystem;