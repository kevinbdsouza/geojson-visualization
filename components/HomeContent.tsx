'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { GeoJSONData } from '@/types/geojson';

const GeoJSONVisualization = dynamic(() => import('./GeoJSONVisualizationWrapper'), {
  ssr: false,
  loading: () => <p>Loading map...</p>
});

const SelPosVisualization = dynamic(() => import('./SelPosVisualization'), {
  ssr: false,
  loading: () => <p>Loading optimization...</p>
});

const HomeContent: React.FC = () => {
  const [geojsonData, setGeojsonData] = useState<GeoJSONData | null>(null);
  const [selPosData, setSelPosData] = useState<GeoJSONData | null>(null);
  const [activeTab, setActiveTab] = useState<'properties' | 'optimization'>('properties');

  useEffect(() => {
    const loadGeoJSONData = async () => {
      try {
        const [compiledGpd2Response, selPosResponse] = await Promise.all([
          fetch('/api/compiled-gpd'),
          fetch('/api/sel-pos')
        ]);

        if (!compiledGpd2Response.ok || !selPosResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const compiledGpd2Data = await compiledGpd2Response.json();
        const selPosData = await selPosResponse.json();

        setGeojsonData(compiledGpd2Data);
        setSelPosData(selPosData);
      } catch (error) {
        console.error('Error loading GeoJSON data:', error);
      }
    };

    loadGeoJSONData();
  }, []);

  const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full py-3 px-6 text-left rounded-lg mb-2 transition-all duration-200 ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 p-6 bg-gray-800 text-white">
        <h2 className="text-2xl font-bold mb-6">Visualizations</h2>
        <TabButton
          label="Properties"
          isActive={activeTab === 'properties'}
          onClick={() => setActiveTab('properties')}
        />
        <TabButton
          label="Optimization"
          isActive={activeTab === 'optimization'}
          onClick={() => setActiveTab('optimization')}
        />
      </div>
      <div className="flex-1">
        {activeTab === 'properties' && geojsonData && (
          <div className="w-full h-full">
            <GeoJSONVisualization geojsonData={geojsonData} />
          </div>
        )}
        {activeTab === 'optimization' && selPosData && (
          <div className="w-full h-full">
            <SelPosVisualization geojsonData={selPosData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeContent;