import React from 'react';
import fs from 'fs/promises';
import path from 'path';
import ClientWrapper from '@/components/ClientWrapper';
import { GeoJSONData } from '../types/geojson';

// This is an async Server Component
async function Home() {
  // Read the data.geojson file
  const filePath = path.join(process.cwd(), 'public', 'compiled_gpd_no_nones2.geojson');
  const fileContents = await fs.readFile(filePath, 'utf8');

  // Parse the JSON content
  const geojsonData: GeoJSONData = JSON.parse(fileContents);

  return (
    <div>
      <h1>GeoJSON Visualization</h1>
      <ClientWrapper geojsonData={geojsonData} />
    </div>
  );
}

export default Home;