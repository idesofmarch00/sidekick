import React, { useMemo } from 'react';
import { FetchAllHubsQuery } from '@/generated/graphql';
import NearestHubMarker from '../NearestHubMarker';

type HubMarkersProps = {
  hubs: FetchAllHubsQuery['hubs'];
  selectedHub?: FetchAllHubsQuery['hubs'][0];
  onHubSelect: (hub: FetchAllHubsQuery['hubs'][0] | undefined) => void;
};

const HubMarkers: React.FC<HubMarkersProps> = ({ hubs, selectedHub, onHubSelect }) => {
  const markers = useMemo(() => 
    hubs.map(hub => (
      <NearestHubMarker
        key={hub.id}
        latitude={hub.latitude}
        longitude={hub.longitude}
        name={hub.name as string}
        isSelected={selectedHub?.id === hub.id.toString()}
        onPress={e => {
          e.stopPropagation();
          onHubSelect(selectedHub?.id === hub.id.toString() ? undefined : hub);
        }}
      />
    )),
    [hubs, selectedHub, onHubSelect]
  );

  return <>{markers}</>;
};

export default HubMarkers;
