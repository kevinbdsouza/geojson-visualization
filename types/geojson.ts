export interface Feature {
  type: "Feature";
  properties: { [key: string]: any };
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
}

export interface FeatureCollection {
  type: "FeatureCollection";
  features: Feature[];
}

export type GeoJSONData = FeatureCollection;