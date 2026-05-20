import React from 'react';
import {Dimensions} from 'react-native';
import MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as turf from '@turf/turf';
import {LatLng, MapViewDirectionsResult} from '../../../types/directions';
import {GOOGLE_MAPS_API_KEY} from '../../../config/mapConfig';
import {FetchAllHubsQuery} from '@/generated/graphql';

type DirectionsProps = {
  origin: LatLng | null;
  destination: FetchAllHubsQuery['hubs'][0];
  mapRef: React.RefObject<MapView>;
  onHeadingChange?: (heading: number) => void;
};

const DirectionsComponent: React.FC<DirectionsProps> = ({
  origin,
  destination,
  mapRef,
  onHeadingChange,
}) => {
  const {width, height} = Dimensions.get('window');

  const calculateHeading = (currentPos: LatLng, nextPos: LatLng) => {
    const start = turf.point([currentPos.longitude, currentPos.latitude]);
    const end = turf.point([nextPos.longitude, nextPos.latitude]);
    return turf.bearing(start, end);
  };

  return (
    <MapViewDirections
      origin={{
        latitude: Number(origin?.latitude ?? 0),
        longitude: Number(origin?.longitude ?? 0),
      }}
      destination={{
        latitude: Number(destination?.latitude ?? 0),
        longitude: Number(destination?.longitude ?? 0),
      }}
      apikey={GOOGLE_MAPS_API_KEY}
      strokeWidth={4}
      strokeColor="#296AEB"
      mode="DRIVING"
      region="IN"
      waypoints={[]}
      onReady={(result: MapViewDirectionsResult) => {
        const coordinates = result.coordinates;
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: {
            right: width / 20,
            bottom: height / 20,
            left: width / 20,
            top: height / 20,
          },
          animated: true,
        });
        const nextRoutePoint = coordinates[1];
        onHeadingChange?.(calculateHeading(origin as LatLng, nextRoutePoint));
      }}
      onError={errorMessage => {
        console.error('Direction routing error:', errorMessage);
      }}
    />
  );
};

export default DirectionsComponent;
