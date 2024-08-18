'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const GeoJSONVisualization = dynamic(() => import('@/components/GeoJSONVisualization'), {
  ssr: false
});

const ClientWrapper = ({ geojsonData }) => {
  return <GeoJSONVisualization geojsonData={geojsonData} />;
};

export default ClientWrapper;