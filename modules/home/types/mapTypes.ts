export type HubLocation = {
  id: string;
  latitude: number;
  longitude: number;
  name?: string;
  organization_id?: string;
  created_at?: string;
} | null;

export type MapCenter = {
  latitude: number;
  longitude: number;
};

export type PolylineCoordinates = {
  latitude: number;
  longitude: number;
}[];
