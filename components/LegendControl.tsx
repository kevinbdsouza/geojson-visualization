'use client';

import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

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

export default LegendControl;