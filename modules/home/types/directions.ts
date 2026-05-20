export type LatLng = {
    latitude: number;
    longitude: number;
};

export type MapViewDirectionsMode = 'DRIVING' | 'BICYCLING' | 'WALKING' | 'TRANSIT';

export type MapViewDirectionsResult = {
    distance: number;
    duration: number;
    coordinates: Array<LatLng>;
};
