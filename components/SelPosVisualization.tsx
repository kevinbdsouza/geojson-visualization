import React, { useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoJSONData } from '@/types/geojson';
import LegendControl from './LegendControl';
import chroma from 'chroma-js';

interface SelPosVisualizationProps {
  geojsonData: GeoJSONData;
}

const SelPosVisualization: React.FC<SelPosVisualizationProps> = ({ geojsonData }) => {
  const center: LatLngTuple = [56.130366, -106.346771];
  const property = 'Wildlife Habitat Capacity'; // Fixed property

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
      const colorScale = chroma.scale(['blue', 'red']).domain([min, max]);
      return {
        legendItems: [{ min, max }],
        colorScale: (value: number) => colorScale(value).hex(),
        isContinuous: true as const
      };
    } else {
      const sortedValues = uniqueValues.sort((a, b) => a.toString().localeCompare(b.toString()));
      const colors = chroma.scale('Set3').colors(sortedValues.length);
      const legendItems = sortedValues.map((value, index) => ({
        color: colors[index],
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
    <div className="h-screen w-full">
      <MapContainer
        center={center} zoom={5} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <GeoJSON data={geojsonData} style={style} />
        <LegendControl
          property={property}
          legendItems={legendItems}
          isContinuous={isContinuous}
          colorScale={colorScale}
        />
      </MapContainer>
    </div>
  );
};

export default SelPosVisualization;