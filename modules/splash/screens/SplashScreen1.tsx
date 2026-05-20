// dependencies
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import 'react-native-url-polyfill/auto';

// components
import ButtonText from '@/components/ButtonText';

// assets
import SideKickLogo from '../assets/sidekick_logo.svg';

// styles
import {splashStyles} from '../splashStyles';
// import {createClient} from '@supabase/supabase-js';

const SplashScreen1: React.FC = () => {
  const navigation = useNavigation();

  // const SUPABASE_URL = 'https://gjbbbucnydedrqbydwou.supabase.co';
  // const SUPABASE_ANON_KEY =
  //   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqYmJidWNueWRlZHJxYnlkd291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1ODQ2MzQsImV4cCI6MjA1ODE2MDYzNH0.VIkbQTD_ZuO6YK_km3W7cCxqx2MZJhPAiUP27Cg48a8';

  // const bucketName = 'sidekick';
  // const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // const getTNC = () => {
  //   const tnc = 'T&C_sidekick.html';

  //   console.log('supabase', supabase);

  //   const {data} = supabase.storage.from(bucketName).getPublicUrl(tnc);
  //   console.log('tnc URL', data.publicUrl);
  //   return data.publicUrl;
  // };

  // useEffect(() => {
  //   getTNC();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <View style={splashStyles.layoutBackground}>
      <SideKickLogo />
      <View style={splashStyles.bottomButtonContainer}>
        <View style={{width: 220}}>
          <ButtonText
            onPress={() => {
              // @ts-ignore
              navigation.replace('splash2');
            }}
            variant="secondary">
            Get started
          </ButtonText>
        </View>
      </View>
    </View>
  );
};

export default SplashScreen1;
