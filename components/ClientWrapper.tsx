'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { GeoJSONData } from '../types/geojson';

const GeoJSONVisualization = dynamic(() => import('@/components/GeoJSONVisualization'), {
  ssr: false
});

interface ClientWrapperProps {
  geojsonData: GeoJSONData;
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({ geojsonData }) => {
  return <GeoJSONVisualization geojsonData={geojsonData} />;
};

export default ClientWrapper;