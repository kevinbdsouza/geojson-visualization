'use client';

import dynamic from 'next/dynamic';

const SelPosVisualization = dynamic(() => import('./SelPosVisualization'), {
  ssr: false,
});

export default SelPosVisualization;