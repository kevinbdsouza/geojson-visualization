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
        colorScale: null,
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