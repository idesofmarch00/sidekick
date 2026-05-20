// dependencies
import React, {useRef, useState} from 'react';
import {Dimensions, View, Text, StyleSheet, Pressable} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import {useNavigation} from '@react-navigation/native';

// store
import {useThemeStore} from '@/globalStore';

// components
import {H1, P1, Divider, ButtonText} from '@/components';
import SideKickSplash1 from '../assets/sidekick_splash_1.svg';
import SideKickSplash2 from '../assets/sidekick_splash_2.svg';
import SideKickSplash3 from '../assets/sidekick_splash_3.svg';

const {width: screenWidth} = Dimensions.get('window');

type CarouselItem = {
  heading: string;
  subHeading: string;
  image: React.ReactNode;
};

const SplashScreenCarousel: React.FC = () => {
  const {theme} = useThemeStore();
  const navigation = useNavigation();
  const carouselRef = useRef<Carousel<CarouselItem>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const data: CarouselItem[] = [
    {
      heading: 'How to Start',
      subHeading:
        'Hop on your vehicle, push off with your preferred foot, and pull the throttle to get moving.',
      image: <SideKickSplash1 width={screenWidth} height={screenWidth} />,
    },
    {
      heading: 'How to Stop',
      subHeading:
        'Gently squeeze the brake(s) with your hand(s) to reduce speed.',
      image: <SideKickSplash2 width={screenWidth} height={screenWidth} />,
    },
    {
      heading: 'No Double Riding',
      subHeading:
        'Avoid double riding. It’s dangerous and risks the safety of both you and others.',
      image: <SideKickSplash3 width={screenWidth} height={screenWidth} />,
    },
  ];

  const renderItem = ({item}: {item: CarouselItem}) => {
    return (
      <View style={styles.slide}>
        {item.image}
        <Divider height={32} />
        <H1>{item.heading}</H1>
        <Divider height={9.6} />
        <P1 weight={'600'} customStyles={{textAlign: 'center'}}>
          {item.subHeading}
        </P1>
      </View>
    );
  };

  // const handleCompleteOnboarding = () => {
  //   const timer = setTimeout(() => {
  //     // @ts-ignore
  //     navigation.replace('screen3');
  //   }, 300);

  //   return () => clearTimeout(timer);
  // };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.primary}]}>
      <Carousel
        ref={carouselRef}
        data={data}
        renderItem={renderItem}
        sliderWidth={screenWidth}
        itemWidth={screenWidth}
        onSnapToItem={setActiveIndex}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {data.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === activeIndex
                    ? theme.colors.highlight
                    : theme.colors.secondary,
              },
            ]}
          />
        ))}
      </View>

      {/* Navigation Controls */}
      <View style={styles.buttonContainer}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 0,
            marginTop: 10,
          }}>
          <Pressable
            onPress={() => {
              // @ts-ignore
              navigation.replace('splash3');
            }}>
            <Text style={{fontWeight: '600', fontSize: 16, marginLeft: 40}}>
              Skip
            </Text>
          </Pressable>
          <View style={{width: 160}}>
            <ButtonText
              onPress={() => {
                if (activeIndex === data.length - 1) {
                  // @ts-ignore
                  navigation.replace('splash3');
                } else {
                  carouselRef.current?.snapToNext();
                }
              }}
              variant="secondary">
              Got it
            </ButtonText>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 40,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    columnGap: 20,
    justifyContent: 'center',
    position: 'absolute',
    bottom: 110,
    width: '100%',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 100,
    marginHorizontal: 4,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 35,
    width: '100%',
    paddingHorizontal: 20,
  },
  fullWidthButton: {
    width: '100%',
  },
});

export default SplashScreenCarousel;
