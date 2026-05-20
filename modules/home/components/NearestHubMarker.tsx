import React, {useEffect, useState} from 'react';
import {Marker} from 'react-native-maps';
import HubMarkerIcon from '../assets/hubMarkerIcon.svg';
import NavigationPointerIcon from '../assets/navigationPointer.svg';

type Props = {
  latitude: number;
  longitude: number;
  name: string;
  isSelected: boolean;
  onPress: (e: any) => void;
};

const NearestHubMarker: React.FC<Props> = ({
  latitude,
  longitude,
  name,
  isSelected,
  onPress,
}) => {
  const [trackChanges, setTrackChanges] = useState(true);

  useEffect(() => {
    setTrackChanges(true);
    const timer = setTimeout(() => {
      setTrackChanges(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isSelected]);

  return (
    <Marker
      coordinate={{latitude, longitude}}
      title={name}
      onPress={onPress}
      anchor={{x: 0.5, y: 0.5}}
      tracksViewChanges={trackChanges}>
      {isSelected ? <NavigationPointerIcon /> : <HubMarkerIcon />}
    </Marker>
  );
};

export default NearestHubMarker;
