import React from 'react';
import { Marker } from 'react-native-maps';
import UserPointerIcon from '../assets/userPointer.svg';

type Props = {
  latitude: number;
  longitude: number;
  heading: number;
};

const UserLocationMarker: React.FC<Props> = React.memo(({ latitude, longitude, heading }) => {
  return (
    <Marker 
      coordinate={{ latitude, longitude }} 
      anchor={{ x: 0.5, y: 0.5 }}
      rotation={heading}
    >
      <UserPointerIcon width={32} height={32} />
    </Marker>
  );
});

export default UserLocationMarker;
