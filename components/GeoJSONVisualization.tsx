'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface GeoJSONVisualizationProps {
  geojsonData: any;
}

interface LegendControlProps {
  property: string;
  legendItems: any[];
  isContinuous: boolean;
  colorScale?: (value: number) => string;
}

const LegendControl: React.FC<LegendControlProps> = ({ property, legendItems, isContinuous, colorScale }) => {
  const map = useMap();

  useEffect(() => {
    const legendControl = L.control({ position: 'topright' });

    legendControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      let legendContent = '';

      if (isContinuous && colorScale) {
        const { min, max } = legendItems[0];
        const steps = 5;
        const gradientStops = Array.from({ length: steps }, (_, i) => {
          const value = min + (i / (steps - 1)) * (max - min);
          return `${colorScale(value)} ${(i / (steps - 1)) * 100}%`;
        }).join(', ');

        const gradientStyle = `
          width: 200px;
          height: 20px;
          background: linear-gradient(to right, ${gradientStops});
        `;

        const scaleLabels = Array.from({ length: steps }, (_, i) => {
          const value = min + (i / (steps - 1)) * (max - min);
          return `<span style="left: ${(i / (steps - 1)) * 100}%">${value.toFixed(2)}</span>`;
        }).join('');

        legendContent = `
          <div class="continuous-legend">
            <div style="${gradientStyle}"></div>
            <div class="scale-labels" style="position: relative; margin-top: 5px; height: 20px;">
              ${scaleLabels}
            </div>
          </div>
        `;
      } else {
        legendContent = legendItems.map(item => `
          <div class="flex items-center mb-2">
            <div class="w-6 h-6 mr-2 flex-shrink-0 border border-gray-300" style="background-color: ${item.color};"></div>
            <span class="text-sm break-all" style="color: black;">${item.label || 'Undefined'}</span>
          </div>
        `).join('');
      }

      div.innerHTML = `
        <div class="p-4 bg-white rounded shadow-lg" style="min-width: 250px; max-height: 80vh; overflow-y: auto;">
          <h3 class="font-bold mb-2 text-lg" style="color: black;">${property}</h3>
          ${legendContent}
        </div>
      `;

      // Add CSS for scale labels
      const style = document.createElement('style');
      style.textContent = `
        .scale-labels span {
          position: absolute;
          transform: translateX(-50%);
          font-size: 12px;
          color: black;
        }
      `;
      div.appendChild(style);

      return div;
    };

    legendControl.addTo(map);

    return () => {
      legendControl.remove();
    };
  }, [map, property, legendItems, isContinuous, colorScale]);

  return null;
};


const GeoJSONVisualization: React.FC<GeoJSONVisualizationProps> = ({ geojsonData }) => {
  const [property, setProperty] = useState<string>('WHAF_2015_CLASS_EN');
  const center: LatLngTuple = [56.130366, -106.346771];

  const properties = useMemo(() => {
    const allProperties = new Set<string>();
    geojsonData.features.forEach((feature: any) => {
      Object.keys(feature.properties).forEach(prop => allProperties.add(prop));
    });
    return Array.from(allProperties);
  }, [geojsonData]);

  const { legendItems, colorScale, isContinuous } = useMemo(() => {
    console.log("Calculating legend items for property:", property);
    const values = geojsonData.features.map(f => f.properties[property]);
    const uniqueValues = [...new Set(values)];
    
    const isNumeric = uniqueValues.every(v => !isNaN(parseFloat(v)) && isFinite(v));
    const isInteger = isNumeric && uniqueValues.every(v => Number.isInteger(parseFloat(v)));
    const isContinuous = isNumeric && !isInteger;

    if (isContinuous) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const colorScale = (value) => {
        const normalized = (value - min) / (max - min);
        const hue = (1 - normalized) * 240; // Blue to Red
        return `hsl(${hue}, 100%, 50%)`;
      };
      return {
        legendItems: [{ min, max }],
        colorScale,
        isContinuous: true
      };
    } else {
      const sortedValues = uniqueValues.sort((a, b) => a.toString().localeCompare(b.toString()));
      const colors = ['#0000FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF0000', '#FF00FF'];
      const legendItems = sortedValues.map((value, index) => ({
        color: colors[index % colors.length],
        label: value ? value.toString() : 'Undefined'
      }));
      return {
        legendItems,
        colorScale: null,
        isContinuous: false
      };
    }
  }, [geojsonData, property]);

  const style = (feature: any) => {
    const value = feature.properties[property];
    if (isContinuous) {
      return {
        fillColor: colorScale(value),
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7,
      };
    } else {
      const item = legendItems.find(item => item.label === (value ? value.toString() : 'Undefined'));
      return {
        fillColor: item ? item.color : '#CCCCCC',
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7,
      };
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="mb-4">
        <select
          value={property}
          onChange={(e) => setProperty(e.target.value)}
          className="p-2 border rounded"
        >
          {properties.map((prop) => (
            <option key={prop} value={prop}>
              {prop}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-grow relative">
        <MapContainer center={center} zoom={3} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <GeoJSON data={geojsonData} style={style} />
          <LegendControl property={property} legendItems={legendItems} isContinuous={isContinuous} colorScale={colorScale} />
        </MapContainer>
      </div>
    </div>
  );
};

export default GeoJSONVisualization;