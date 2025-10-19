import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

const FloodHeatMap = ({ emirates, showHeatMap }) => {
  const map = useMap();

  useEffect(() => {
    if (!showHeatMap || !emirates || emirates.length === 0) {
      return;
    }

    // Generate heat map points with intensity based on flood risk
    const heatPoints = [];

    emirates.forEach((emirate) => {
      // Get flood risk intensity (0-1 scale)
      let intensity = 0.3; // default low risk
      if (emirate.floodRisk === 'high') intensity = 1.0;
      else if (emirate.floodRisk === 'medium') intensity = 0.6;

      // Create a grid of points around each emirate center
      // This simulates street-level detail
      const gridSize = 0.02; // approximately 2km grid
      const gridPoints = 20; // 20x20 grid = 400 points per emirate

      for (let i = -gridPoints/2; i < gridPoints/2; i++) {
        for (let j = -gridPoints/2; j < gridPoints/2; j++) {
          const lat = emirate.lat + (i * gridSize / gridPoints);
          const lng = emirate.lng + (j * gridSize / gridPoints);

          // Add some variation based on position
          // Low-lying areas (simulated) have higher risk
          const distanceFromCenter = Math.sqrt(i*i + j*j);
          const positionModifier = 1 - (distanceFromCenter / (gridPoints/2)) * 0.3;

          // Soil moisture affects flood risk
          const soilFactor = emirate.soilMoisture / 100;

          // Drainage affects flood risk inversely
          const drainageFactor = 1 - (emirate.drainageCapacity / 100);

          // Calculate final intensity for this point
          const pointIntensity = intensity * positionModifier * (0.5 + soilFactor * 0.3 + drainageFactor * 0.2);

          // Add some randomness to simulate real terrain
          const randomVariation = 0.8 + Math.random() * 0.4;

          heatPoints.push([
            lat,
            lng,
            Math.max(0.1, Math.min(1.0, pointIntensity * randomVariation))
          ]);
        }
      }
    });

    // Create heat layer
    const heat = L.heatLayer(heatPoints, {
      radius: 25,
      blur: 35,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: '#00ff00',  // Green - Low risk
        0.3: '#80ff00',  // Light green
        0.5: '#ffff00',  // Yellow - Medium risk
        0.7: '#ff8000',  // Orange
        0.85: '#ff4000', // Red-orange
        1.0: '#ff0000'   // Red - High risk
      }
    }).addTo(map);

    // Cleanup function
    return () => {
      map.removeLayer(heat);
    };
  }, [map, emirates, showHeatMap]);

  return null;
};

export default FloodHeatMap;
