'use client';

import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const LegendControl = ({ property, legendItems }) => {
  const map = useMap();

  useEffect(() => {
    const legendControl = L.control({ position: 'topright' });

    legendControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = `
        <div class="p-4 bg-white rounded shadow-lg" style="min-width: 250px; max-height: 80vh; overflow-y: auto;">
          <h3 class="font-bold mb-2 text-lg" style="color: black;">${property}</h3>
          ${legendItems.map(item => `
            <div class="flex items-center mb-2">
              <div class="w-6 h-6 mr-2 flex-shrink-0 border border-gray-300" style="background-color: ${item.color};"></div>
              <span class="text-sm break-all" style="color: black;">${item.label || 'Undefined'}</span>
            </div>
          `).join('')}
        </div>
      `;
      return div;
    };

    legendControl.addTo(map);

    return () => {
      legendControl.remove();
    };
  }, [map, property, legendItems]);

  return null;
};

export default LegendControl;