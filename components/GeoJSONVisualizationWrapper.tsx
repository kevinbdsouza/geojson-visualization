'use client';

import dynamic from 'next/dynamic';

const GeoJSONVisualization = dynamic(() => import('./GeoJSONVisualization'), {
  ssr: false,
});

export default GeoJSONVisualization;