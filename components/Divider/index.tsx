// dependencies
import {View} from 'react-native';
import React from 'react';
import {verticalScale} from 'react-native-size-matters';

type Props = {
  height: number;
};

const Divider: React.FC<Props> = ({height = 4}) => {
  return <View style={{width: '100%', height: verticalScale(height)}} />;
};

export default Divider;
