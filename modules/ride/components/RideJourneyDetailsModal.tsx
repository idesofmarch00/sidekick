import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Image,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import Modal from 'react-native-modal';
import Svg, { Polyline } from 'react-native-svg';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { DateTime } from 'luxon';
import { ScaledSheet } from 'react-native-size-matters';

// stores
import { useThemeStore } from '@/globalStore';

// services
import sqliteService, { LocalCoordinate } from '../services/sqlite.service';

// utils
import {
  calculateJourneyStats,
  simplifyRoutePath,
  JourneyStats
} from '../utils/journeyUtils';
import { showCredits } from '@/utils/user';
import { WatermarkCanvasEngine } from './WatermarkCanvasEngine';

interface RideJourneyDetailsModalProps {
  isVisible: boolean;
  ride: any | null;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const RideJourneyDetailsModal: React.FC<RideJourneyDetailsModalProps> = ({
  isVisible,
  ride,
  onClose,
}) => {
  const { colors } = useThemeStore(state => state.theme);

  // States
  const [coordinates, setCoordinates] = useState<LocalCoordinate[]>([]);
  const [simplifiedPoints, setSimplifiedPoints] = useState<{ latitude: number; longitude: number }[]>([]);
  const [stats, setStats] = useState<JourneyStats | null>(null);
  const [loadingCoords, setLoadingCoords] = useState(false);

  // Sharing / Customizer Editor States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [selectedGradient, setSelectedGradient] = useState<'sunset' | 'cyberpunk' | 'carbon' | 'forest' | null>(null);

  // Composting States
  const [isComposting, setIsComposting] = useState(false);
  const [compostOutputBase64, setCompostOutputBase64] = useState<string | null>(null);
  const [engineTrigger, setEngineTrigger] = useState(false);

  // Fetch coordinates on ride load
  useEffect(() => {
    if (isVisible && ride?.id) {
      loadRideTelemetry();
    } else {
      resetState();
    }
  }, [isVisible, ride]);

  const resetState = () => {
    setCoordinates([]);
    setSimplifiedPoints([]);
    setStats(null);
    setIsEditorOpen(false);
    setCameraActive(false);
    setCapturedPhotoUri(null);
    setSelectedGradient(null);
    setIsComposting(false);
    setCompostOutputBase64(null);
    setEngineTrigger(false);
  };

  const loadRideTelemetry = async () => {
    if (!ride) return;
    setLoadingCoords(true);
    try {
      const coords = await sqliteService.getCoordinatesForRide(ride.id);
      setCoordinates(coords);

      // Simplify points for SVG drawing
      const pts = coords.map(c => ({ latitude: c.latitude, longitude: c.longitude }));
      setSimplifiedPoints(simplifyRoutePath(pts, 60));

      // Calculate journey stats
      const computed = calculateJourneyStats(ride, coords);
      setStats(computed);
    } catch (e) {
      console.warn('Failed to load ride coordinates:', e);
      // Fallback: calculate stats with straight line (empty coordinates)
      const computed = calculateJourneyStats(ride, []);
      setStats(computed);
    } finally {
      setLoadingCoords(false);
    }
  };

  // Check camera permissions
  const requestCameraPermission = async () => {
    const status = await Camera.requestCameraPermission();
    setCameraPermission(status === 'granted');
    if (status === 'granted') {
      setCameraActive(true);
    } else {
      Alert.alert(
        'Permission Denied',
        'Camera permission is required to capture ride photos. You can still use our beautiful visual gradient backdrops!',
        [{ text: 'OK' }]
      );
    }
  };

  // Capture photo from Camera
  const cameraRef = React.useRef<Camera>(null);
  const device = useCameraDevice('back');

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
      });
      const localUri = Platform.OS === 'android' ? `file://${photo.path}` : photo.path;
      setCapturedPhotoUri(localUri);
      setSelectedGradient(null);
      setCameraActive(false);
    } catch (e) {
      Alert.alert('Capture Error', 'Failed to capture photo from camera');
    }
  };

  // Compile Image & Overlay Telemetry
  const startComposting = () => {
    if (!selectedGradient && !capturedPhotoUri) {
      Alert.alert('Selection Required', 'Please snap a photo or choose a premium background gradient.');
      return;
    }
    setIsComposting(true);
    setEngineTrigger(true);
  };

  const handleCompostSuccess = (base64Data: string) => {
    setCompostOutputBase64(base64Data);
    setIsComposting(false);
    setEngineTrigger(false);
  };

  const handleCompostError = (err: string) => {
    setIsComposting(false);
    setEngineTrigger(false);
    Alert.alert('Composting Failed', 'Failed to generate statistics overlay. Falling back to simple share.');
  };

  // Share watermarked JPEG
  const shareGeneratedCard = async () => {
    if (!compostOutputBase64) return;
    try {
      await Share.share({
        url: compostOutputBase64,
        message: `Check out my Sidekick ride! ${stats?.journeyString || ''}`,
      });
    } catch (e) {
      Alert.alert('Sharing Failed', 'Could not open native OS sharing sheet.');
    }
  };

  // Render Mini Route Geometry
  const renderSvgPath = () => {
    if (simplifiedPoints.length < 2) {
      return (
        <View style={styles.emptyMapContainer}>
          <Text style={[styles.emptyMapText, { color: colors.textSecondary }]}>
            No route path logs logged for this ride.
          </Text>
        </View>
      );
    }

    // Coordinates bounding box math
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    simplifiedPoints.forEach(c => {
      if (c.latitude < minLat) minLat = c.latitude;
      if (c.latitude > maxLat) maxLat = c.latitude;
      if (c.longitude < minLng) minLng = c.longitude;
      if (c.longitude > maxLng) maxLng = c.longitude;
    });

    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff) || 0.0001;

    const svgW = screenWidth - 72;
    const svgH = 140;
    const xPad = (svgW - (lngDiff / maxDiff) * svgW) / 2;
    const yPad = (svgH - (latDiff / maxDiff) * svgH) / 2;

    const points = simplifiedPoints
      .map(c => {
        const x = xPad + ((c.longitude - minLng) / maxDiff) * svgW;
        // Flip latitude because Svg Y increases downwards
        const y = yPad + (svgH - ((c.latitude - minLat) / maxDiff) * svgH);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <View style={[styles.svgContainer, { backgroundColor: colors.background || '#1E293B' }]}>
        <Text style={styles.svgPathLabel}>GLOWING ROUTE GEOMETRY</Text>
        <Svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
          <Polyline
            points={points}
            fill="none"
            stroke="#FF5722"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    );
  };

  // Formatting Date
  const getFormattedDate = (isoStr: string) => {
    if (!isoStr) return '';
    return DateTime.fromISO(isoStr).toFormat('dd MMMM yyyy, hh:mm a');
  };
  return (
    <Modal
      isVisible={isVisible && !!ride}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modalContainer}
      swipeDirection={['down']}
      onSwipeComplete={onClose}
      propagateSwipe={true}
    >
      {ride ? (
        <>
          <View style={[styles.content, { backgroundColor: colors.white }]}>
            {/* Swipe drag line */}
            <View style={styles.dragBar} />

            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.hubName, { color: colors.textPrimary }]}>
                  {ride.hubByStartHubId?.name || 'Ride Details'}
                </Text>
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                  {getFormattedDate(ride.start_time)}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={{ fontSize: 20, color: colors.textSecondary, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {loadingCoords ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF5722" />
                <Text style={{ marginTop: 12, color: colors.textSecondary }}>Loading ride telemetry...</Text>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                {/* Stats Dashboard Grid */}
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>DISTANCE</Text>
                    <Text style={[styles.statValue, { color: '#FF5722' }]}>
                      {stats?.distanceKm || '0.0'} km
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>DURATION</Text>
                    <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                      {stats?.durationFormatted || '0s'}
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>AVG SPEED</Text>
                    <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                      {stats?.avgSpeedKmH || '0.0'} km/h
                    </Text>
                  </View>
                </View>

                {/* Sub-stats (Top Speed & Cost) */}
                <View style={[styles.subStatsRow, { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border }]}>
                  <View>
                    <Text style={[styles.subStatsLabel, { color: colors.textSecondary }]}>Top Speed</Text>
                    <Text style={[styles.subStatsValue, { color: colors.textPrimary }]}>
                      🔥 {stats?.maxSpeedKmH || '0.0'} km/h
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.subStatsLabel, { color: colors.textSecondary }]}>Total Cost</Text>
                    <Text style={[styles.subStatsValue, { color: '#FF5722', fontWeight: 'bold' }]}>
                      {showCredits() ? `${ride.total_cost || 0} Credits` : `₹ ${ride.total_cost || 0}`}
                    </Text>
                  </View>
                </View>

                {/* Svg route geometry map shape */}
                {renderSvgPath()}

                {/* Share / Overlay button */}
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={styles.shareAccentButton}
                    onPress={() => setIsEditorOpen(true)}
                  >
                    <Text style={styles.shareAccentText}>📸 SHARE JOURNEY GRAPHIC</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* SUB-MODAL: PREMIUM WATERMARK SHARE CARD DESIGNER */}
          <Modal
            isVisible={isEditorOpen}
            onBackdropPress={() => {
              if (!cameraActive) setIsEditorOpen(false);
            }}
            onBackButtonPress={() => setIsEditorOpen(false)}
            style={styles.subModal}
          >
            <View style={styles.editorContent}>
              {cameraActive && device ? (
                // Full camera viewfinder overlay
                <View style={StyleSheet.absoluteFillObject}>
                  <Camera
                    ref={cameraRef}
                    style={StyleSheet.absoluteFillObject}
                    device={device}
                    isActive={true}
                    photo={true}
                  />
                  {/* Camera snap controls overlay */}
                  <View style={styles.cameraControls}>
                    <TouchableOpacity
                      style={styles.closeCameraBtn}
                      onPress={() => setCameraActive(false)}
                    >
                      <Text style={styles.cameraBtnText}>✕ Close</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.snapCircle} onPress={takePhoto} />
                    <View style={{ width: 60 }} />
                  </View>
                </View>
              ) : (
                <View style={styles.designerInner}>
                  <Text style={styles.editorHeading}>STATS WATERMARK EDITOR</Text>

                  {/* Photo View / Backdrop Preview */}
                  <View style={styles.previewBox}>
                    {capturedPhotoUri ? (
                      <Image source={{ uri: capturedPhotoUri }} style={styles.previewImage} />
                    ) : selectedGradient ? (
                      // Gradient visual indicator preview
                      <View
                        style={[
                          styles.previewImage,
                          styles.gradientIndicator,
                          {
                            backgroundColor:
                              selectedGradient === 'sunset'
                                ? '#FF4B2B'
                                : selectedGradient === 'cyberpunk'
                                  ? '#00F2FE'
                                  : selectedGradient === 'carbon'
                                    ? '#3A3D40'
                                    : '#38ef7d',
                          },
                        ]}
                      >
                        <Text style={styles.indicatorText}>
                          Gradient Background: {selectedGradient.toUpperCase()}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.emptyPreviewBox}>
                        <Text style={styles.emptyPreviewText}>
                          Snap a ride photo or select a premium preset gradient template below
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Camera Trigger */}
                  <TouchableOpacity
                    style={styles.cameraTriggerBtn}
                    onPress={requestCameraPermission}
                  >
                    <Text style={styles.cameraTriggerText}>📸 SNAP ACTIVE PHOTO</Text>
                  </TouchableOpacity>

                  {/* Preset Gradients Template Selector */}
                  <Text style={styles.selectorLabel}>PREMIUM GRADIENT TEMPLATES</Text>
                  <View style={styles.gradientRow}>
                    {([
                      { key: 'sunset', label: 'Sunset Flame' },
                      { key: 'cyberpunk', label: 'Neon Cyber' },
                      { key: 'carbon', label: 'Carbon Sleek' },
                      { key: 'forest', label: 'Forest Green' },
                    ] as const).map(item => (
                      <TouchableOpacity
                        key={item.key}
                        style={[
                          styles.gradientBtn,
                          selectedGradient === item.key && styles.gradientBtnActive,
                        ]}
                        onPress={() => {
                          setSelectedGradient(item.key);
                          setCapturedPhotoUri(null);
                        }}
                      >
                        <Text
                          style={[
                            styles.gradientBtnText,
                            selectedGradient === item.key && styles.gradientBtnTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Compile Action buttons */}
                  <View style={styles.editorFooterRow}>
                    <TouchableOpacity
                      style={styles.editorCancelBtn}
                      onPress={() => setIsEditorOpen(false)}
                    >
                      <Text style={styles.editorCancelText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.editorSubmitBtn,
                        (!capturedPhotoUri && !selectedGradient) && styles.editorSubmitBtnDisabled,
                      ]}
                      disabled={!capturedPhotoUri && !selectedGradient}
                      onPress={startComposting}
                    >
                      <Text style={styles.editorSubmitText}>COMPOSE CARD</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Hidden Composting engine */}
              {engineTrigger && stats && (
                <WatermarkCanvasEngine
                  imageUri={capturedPhotoUri || undefined}
                  gradientName={selectedGradient}
                  stats={stats}
                  coordinates={simplifiedPoints}
                  onComplete={handleCompostSuccess}
                  onError={handleCompostError}
                />
              )}

              {/* Loading Glassmorphic Overlay */}
              {isComposting && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#FF5722" />
                  <Text style={styles.loadingOverlayText}>Composting premium stats card...</Text>
                </View>
              )}

              {/* Share Preview Overlay Sub-Modal */}
              {compostOutputBase64 && (
                <View style={styles.compostPreviewOverlay}>
                  <Text style={styles.previewHeading}>YOUR SHAREABLE STAT CARD</Text>
                  <Image source={{ uri: compostOutputBase64 }} style={styles.compostResultImage} />

                  <View style={styles.previewActionsRow}>
                    <TouchableOpacity
                      style={styles.previewBackBtn}
                      onPress={() => setCompostOutputBase64(null)}
                    >
                      <Text style={styles.previewBackText}>Re-Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.previewShareBtn}
                      onPress={shareGeneratedCard}
                    >
                      <Text style={styles.previewShareText}>🔗 DOWNLOAD & SHARE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </Modal>
        </>
      ) : (
        <View />
      )}
    </Modal>
  );
};

const styles = ScaledSheet.create({
  modalContainer: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: '20@ms',
    borderTopRightRadius: '20@ms',
    paddingHorizontal: '20@ms',
    paddingBottom: '32@vs',
    height: '92%',
    maxHeight: '94%',
  },
  dragBar: {
    width: '40@ms',
    height: '4@vs',
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: '10@vs',
    marginBottom: '14@vs',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20@vs',
  },
  hubName: {
    fontSize: '20@ms',
    fontWeight: '900',
  },
  dateText: {
    fontSize: '12@ms',
    marginTop: '2@vs',
  },
  closeButton: {
    padding: '8@ms',
  },
  loadingContainer: {
    height: '240@vs',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    columnGap: '12@ms',
    marginBottom: '20@vs',
  },
  statBox: {
    flex: 1,
    paddingVertical: '14@vs',
    paddingHorizontal: '8@ms',
    backgroundColor: '#F8FAFC',
    borderRadius: '10@ms',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: '10@ms',
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: '6@vs',
  },
  statValue: {
    fontSize: '18@ms',
    fontWeight: '900',
  },
  subStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: '12@vs',
    marginBottom: '18@vs',
  },
  subStatsLabel: {
    fontSize: '11@ms',
    marginBottom: '4@vs',
  },
  subStatsValue: {
    fontSize: '15@ms',
    fontWeight: 'bold',
  },
  svgContainer: {
    borderRadius: '12@ms',
    paddingVertical: '12@vs',
    paddingHorizontal: '16@ms',
    alignItems: 'center',
    marginBottom: '20@vs',
  },
  svgPathLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '10@ms',
    fontWeight: 'bold',
    marginBottom: '8@vs',
    letterSpacing: 1,
  },
  emptyMapContainer: {
    height: '100@vs',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: '12@ms',
    marginBottom: '20@vs',
  },
  emptyMapText: {
    fontSize: '12@ms',
  },
  footer: {
    width: '100%',
  },
  shareAccentButton: {
    backgroundColor: '#FF5722',
    borderRadius: '12@ms',
    paddingVertical: '15@vs',
    alignItems: 'center',
  },
  shareAccentText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: '14@ms',
  },

  // SUB-MODAL WATERMARK CUSTOMIZER STYLE
  subModal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  editorContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: '24@ms',
    borderTopRightRadius: '24@ms',
    height: '92%',
    padding: '20@ms',
  },
  designerInner: {
    flex: 1,
    justifyContent: 'space-between',
  },
  editorHeading: {
    fontSize: '18@ms',
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: '10@vs',
  },
  previewBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: '16@ms',
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '12@vs',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: '14@ms',
  },
  emptyPreviewBox: {
    padding: '24@ms',
    alignItems: 'center',
  },
  emptyPreviewText: {
    color: '#64748B',
    fontSize: '13@ms',
    textAlign: 'center',
    lineHeight: '20@vs',
  },
  cameraTriggerBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    paddingVertical: '12@vs',
    borderRadius: '12@ms',
    alignItems: 'center',
    marginBottom: '14@vs',
  },
  cameraTriggerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: '13@ms',
  },
  selectorLabel: {
    color: '#64748B',
    fontWeight: 'bold',
    fontSize: '11@ms',
    marginBottom: '8@vs',
    letterSpacing: 1,
  },
  gradientRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '8@ms',
    marginBottom: '20@vs',
  },
  gradientBtn: {
    paddingVertical: '8@vs',
    paddingHorizontal: '12@ms',
    backgroundColor: '#334155',
    borderRadius: '8@ms',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  gradientBtnActive: {
    borderColor: '#FF5722',
  },
  gradientBtnText: {
    color: '#94A3B8',
    fontSize: '12@ms',
    fontWeight: '600',
  },
  gradientBtnTextActive: {
    color: '#FFFFFF',
  },
  editorFooterRow: {
    flexDirection: 'row',
    columnGap: '12@ms',
  },
  editorCancelBtn: {
    flex: 1,
    paddingVertical: '14@vs',
    borderRadius: '12@ms',
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  editorCancelText: {
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  editorSubmitBtn: {
    flex: 2,
    paddingVertical: '14@vs',
    borderRadius: '12@ms',
    backgroundColor: '#FF5722',
    alignItems: 'center',
  },
  editorSubmitBtnDisabled: {
    backgroundColor: '#475569',
    opacity: 0.5,
  },
  editorSubmitText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // Active Camera layout
  cameraControls: {
    position: 'absolute',
    bottom: '40@vs',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '32@ms',
  },
  closeCameraBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: '10@vs',
    paddingHorizontal: '16@ms',
    borderRadius: '20@ms',
  },
  cameraBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  snapCircle: {
    width: '72@ms',
    height: '72@ms',
    borderRadius: '36@ms',
    backgroundColor: '#FFFFFF',
    borderWidth: 6,
    borderColor: '#CBD5E1',
  },

  // Glassmorphic loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingOverlayText: {
    color: '#FFFFFF',
    marginTop: '16@vs',
    fontWeight: 'bold',
  },

  // Final shared preview overlay
  compostPreviewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1E293B',
    padding: '20@ms',
    justifyContent: 'space-between',
    zIndex: 20,
    borderTopLeftRadius: '24@ms',
    borderTopRightRadius: '24@ms',
  },
  previewHeading: {
    color: '#FFFFFF',
    fontWeight: '900',
    textAlign: 'center',
    fontSize: '16@ms',
    letterSpacing: 1,
  },
  compostResultImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: '16@ms',
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#334155',
  },
  previewActionsRow: {
    flexDirection: 'row',
    columnGap: '12@ms',
  },
  previewBackBtn: {
    flex: 1,
    paddingVertical: '14@vs',
    borderRadius: '12@ms',
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  previewBackText: {
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  previewShareBtn: {
    flex: 2,
    paddingVertical: '14@vs',
    borderRadius: '12@ms',
    backgroundColor: '#FF5722',
    alignItems: 'center',
  },
  previewShareText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
