'use client';
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface LegendControlProps {
  property: string;
  legendItems: any[];
  isContinuous: boolean;
  colorScale: ((value: number) => string) | undefined;
}

const LegendControl: React.FC<LegendControlProps> = ({ property, legendItems, isContinuous, colorScale }) => {
  const map = useMap();

  useEffect(() => {
    const LegendControl = L.Control.extend({
      onAdd: function() {
        const div = L.DomUtil.create('div', 'info legend');
        let legendContent = '';

        const formatNumber = (num: number) => {
          if (num < 1000) {
            return Number(num.toFixed(2)).toString();
          } else if (num >= 1000000) {
            return (Number((num / 1000000).toFixed(2))).toString() + 'M';
          } else if (num >= 1000) {
            return (Number((num / 1000).toFixed(2))).toString() + 'K';
          }
        };

        if (isContinuous && colorScale) {
          const { min, max } = legendItems[0];
          const steps = 5;
          const middleValue = (min + max) / 2;
          const gradientStops = Array.from({ length: steps }, (_, i) => {
            const value = min + (i / (steps - 1)) * (max - min);
            return colorScale(value);
          });

          legendContent = `
            <div class="continuous-legend">
              <div class="gradient-bar" style="height: 20px; width: 100%; background: linear-gradient(to right, ${gradientStops.join(',')});"></div>
              <div class="scale-labels" style="display: flex; justify-content: space-between; margin-top: 5px;">
                <span>${formatNumber(min)}</span>
                <span>${formatNumber(middleValue)}</span>
                <span>${formatNumber(max)}</span>
              </div>
            </div>
          `;
        } else {
          legendContent = legendItems.map((item) => `
            <div class="flex items-center mb-2">
              <div class="w-6 h-6 mr-2 flex-shrink-0 border border-gray-300" style="background-color: ${item.color};"></div>
              <span class="text-sm break-all" style="color: black;">${item.label || 'Undefined'}</span>
            </div>
          `).join('');
        }

        div.innerHTML = `
          <div class="p-4 bg-white rounded shadow-lg" style="min-width: 280px; max-width: 320px; max-height: 80vh; overflow-y: auto;">
            <h3 class="font-bold mb-2 text-lg" style="color: black;">${property}</h3>
            ${legendContent}
          </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
          .continuous-legend .gradient-bar {
            border: 1px solid #ccc;
            border-radius: 4px;
          }
          .continuous-legend .scale-labels {
            font-size: 12px;
            color: black;
            display: flex;
            justify-content: space-between;
            margin-top: 5px;
          }
          .continuous-legend .scale-labels span {
            white-space: nowrap;
          }
        `;
        div.appendChild(style);

        return div;
      }
    });

    const legendControl = new LegendControl({ position: 'topright' });
    legendControl.addTo(map);

    return () => {
      map.removeControl(legendControl);
    };
  }, [map, property, legendItems, isContinuous, colorScale]);

  return null;
};

export default LegendControl;