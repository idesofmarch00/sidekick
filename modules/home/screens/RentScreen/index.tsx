// dependencies
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

// store
import useLocationStore from '../../store/locationStore';
import {useAuthStore, useGlobalStore} from '@/globalStore';
import useRideStore from '@/modules/ride/store';

// services
import {RideService, UserService} from '@/globalService';
import {mapStyles} from '../../utilis/mapStyle';
import {authUtils} from '@/modules/authentication/utils';
import {findNearestHub} from '../../utilis/distanceUtils';

// components
import ScanQrCodeComponent from '../../components/ScanQrCodeComponent';
import UserLocationMarker from '../../components/UserLocationMarker';
import ActionButtons from './components';
import {useFocusEffect} from '@react-navigation/native';
import GlobalModal from '@/components/GlobalModal';
import DirectionsComponent from './components/DirectionsComponent';
import {requestPermissions} from '../../utilis/permissionUtils';
import HubMarkers from '../../components/HubMarkers';

const RentScreen: React.FC = () => {
  const {closeBottomSheet} = useGlobalStore();

  const {latitude, longitude, setLocation} = useLocationStore();
  const {stopLoading} = useAuthStore();
  const {openModal, setModalComponent} = useGlobalStore();
  const {selectedHub, setSelectedHub, hubs} = useRideStore();
  const mapRef = useRef<MapView>(null);
  const [heading, setHeading] = useState<number>(0);

  const handleOpenModal = () => {
    setModalComponent(ScanQrCodeComponent);
    openModal();
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation(lat, lng);
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      },
      error => console.log('Error getting current location:', error),
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  useEffect(() => {
    const initializePermissions = async () => {
      const {locationGranted} = await requestPermissions();
      if (locationGranted) {
        getCurrentLocation();
      }
    };

    initializePermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLocation]);

  useEffect(() => {
    authUtils.setBottomSheetView('welcome');
    RideService.fetchAllHubs();
    UserService.fetchUserDetails();
    stopLoading('otp-verification');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      closeBottomSheet();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const handleSelectNearestHub = useCallback(() => {
    if (!latitude || !longitude || hubs.length === 0) {
      return;
    }

    const nearest = findNearestHub(latitude, longitude, hubs);
    if (!nearest) {
      Alert.alert(
        'No Hubs Found',
        'There are no hubs available within 20km of your location.',
      );
      return;
    }

    setSelectedHub(nearest);
    mapRef.current?.animateToRegion({
      latitude: nearest.latitude,
      longitude: nearest.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude, hubs]);

  useEffect(() => {
    // fetchCameraDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        zoomEnabled={true}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        followsUserLocation={true}
        customMapStyle={mapStyles}
        initialRegion={{
          latitude: latitude || 28.7041,
          longitude: longitude || 77.1025,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}>
        {latitude && longitude && (
          <UserLocationMarker
            latitude={latitude}
            longitude={longitude}
            heading={heading}
          />
        )}
        <HubMarkers
          hubs={hubs}
          selectedHub={selectedHub}
          onHubSelect={setSelectedHub}
        />

        {selectedHub &&
          selectedHub.latitude &&
          selectedHub.longitude &&
          latitude &&
          longitude && (
            <DirectionsComponent
              origin={{latitude, longitude}}
              destination={selectedHub}
              mapRef={mapRef as React.RefObject<MapView>}
              onHeadingChange={setHeading}
            />
          )}
      </MapView>

      {/* rent action buttons */}
      <ActionButtons
        containerStyles={styles.bottomContainer}
        handleOpenModal={handleOpenModal}
        onSelectNearestHub={handleSelectNearestHub}
      />

      <GlobalModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
});

export default RentScreen;
