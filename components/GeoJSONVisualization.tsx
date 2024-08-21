'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LegendControl from './LegendControl';
import { GeoJSONData } from '../types/geojson';

interface GeoJSONVisualizationProps {
  geojsonData: GeoJSONData;
}

const GeoJSONVisualization: React.FC<GeoJSONVisualizationProps> = ({ geojsonData }) => {
  const [property, setProperty] = useState<string>('WHAF_2015_CLASS_EN');
  const center: LatLngTuple = [56.130366, -106.346771];

  const properties = useMemo(() => {
    const allProperties = new Set<string>();
    geojsonData.features.forEach((feature) => {
      Object.keys(feature.properties).forEach(prop => allProperties.add(prop));
    });
    return Array.from(allProperties);
  }, [geojsonData]);

  const { legendItems, colorScale, isContinuous } = useMemo(() => {
    console.log("Calculating legend items for property:", property);
    const values = geojsonData.features.map(f => f.properties[property]);
    const uniqueValues = Array.from(new Set(values));
    
    const isNumeric = uniqueValues.every(v => !isNaN(parseFloat(v as string)) && isFinite(v as number));
    const isInteger = isNumeric && uniqueValues.every(v => Number.isInteger(parseFloat(v as string)));
    const isContinuous = isNumeric && !isInteger;

    if (isContinuous) {
      const numericValues = values.map(v => parseFloat(v as string));
      const min = Math.min(...numericValues);
      const max = Math.max(...numericValues);
      const colorScale = (value: number): string => {
        const normalized = (value - min) / (max - min);
        const hue = (1 - normalized) * 240; // Blue to Red
        return `hsl(${hue}, 100%, 50%)`;
      };
      return {
        legendItems: [{ min, max }],
        colorScale,
        isContinuous: true as const
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
        colorScale: undefined,
        isContinuous: false as const
      };
    }
  }, [geojsonData, property]);

  const style = (feature: any) => {
    const value = feature.properties[property];
    if (isContinuous && colorScale) {
      return {
        fillColor: colorScale(parseFloat(value)),
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
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="mb-4 p-4 bg-gray-800">
        <select
          value={property}
          onChange={(e) => setProperty(e.target.value)}
          className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem'
          }}
        >
          {properties.map((prop) => (
            <option key={prop} value={prop} className="bg-gray-700">
              {prop}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-grow relative">
        <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
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