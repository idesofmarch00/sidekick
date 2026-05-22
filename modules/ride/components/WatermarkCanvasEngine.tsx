import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { JourneyStats } from '../utils/journeyUtils';

interface WatermarkCanvasEngineProps {
  imageUri?: string; // local file path or base64
  gradientName?: 'sunset' | 'cyberpunk' | 'carbon' | 'forest' | null;
  stats: JourneyStats;
  coordinates: { latitude: number; longitude: number }[];
  onComplete: (base64Image: string) => void;
  onError: (error: string) => void;
}

export const WatermarkCanvasEngine: React.FC<WatermarkCanvasEngineProps> = ({
  imageUri,
  gradientName,
  stats,
  coordinates,
  onComplete,
  onError,
}) => {
  const webViewRef = useRef<WebView>(null);

  // HTML + JS Composting Script
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        body, html { margin: 0; padding: 0; overflow: hidden; background-color: #000; }
        canvas { display: block; width: 100vw; height: 100vh; object-fit: contain; }
      </style>
    </head>
    <body>
      <canvas id="compostCanvas"></canvas>
      <script>
        const canvas = document.getElementById('compostCanvas');
        const ctx = canvas.getContext('2d');

        // Configure high-res square dimension for Instagram / Strava sharing (1080x1080)
        const size = 1080;
        canvas.width = size;
        canvas.height = size;

        // Telemetry parameters received from React Native
        const stats = ${JSON.stringify(stats)};
        const coordinates = ${JSON.stringify(coordinates)};
        const gradientName = "${gradientName || ''}";
        const imageUri = "${imageUri || ''}";

        // Send results back to React Native
        function postResult(base64) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SUCCESS', base64: base64 }));
        }

        function postError(err) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', error: err }));
        }

        // Draw dynamic linear gradient presets
        function drawGradient(name) {
          let grad = ctx.createLinearGradient(0, 0, 0, size);
          if (name === 'sunset') {
            grad.addColorStop(0, '#FF416C');
            grad.addColorStop(1, '#FF4B2B'); // Sunset Flame
          } else if (name === 'cyberpunk') {
            grad.addColorStop(0, '#00F2FE');
            grad.addColorStop(1, '#4FACFE'); // Neon Blue
          } else if (name === 'carbon') {
            grad.addColorStop(0, '#232526');
            grad.addColorStop(1, '#414345'); // Carbon Sleek
          } else if (name === 'forest') {
            grad.addColorStop(0, '#11998e');
            grad.addColorStop(1, '#38ef7d'); // Forest Emerald
          } else {
            // Elegant brand default
            grad.addColorStop(0, '#2D3748');
            grad.addColorStop(1, '#1A202C');
          }
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, size, size);
        }

        // Map and draw simplified GPS coordinates as a glowing orange polyline
        function drawGpsPath() {
          if (!coordinates || coordinates.length < 2) return;

          // 1. Find bounding box coordinates
          let minLat = Infinity, maxLat = -Infinity;
          let minLng = Infinity, maxLng = -Infinity;

          coordinates.forEach(c => {
            if (c.latitude < minLat) minLat = c.latitude;
            if (c.latitude > maxLat) maxLat = c.latitude;
            if (c.longitude < minLng) minLng = c.longitude;
            if (c.longitude > maxLng) maxLng = c.longitude;
          });

          // Compute scales and bounds
          const latDiff = maxLat - minLat;
          const lngDiff = maxLng - minLng;

          // Set drawing box inside canvas (top-right area, with padding)
          const boxSize = 260;
          const xOffset = size - boxSize - 80;
          const yOffset = 80;

          // Prevent division by zero for single points or straight lines
          const maxDiff = Math.max(latDiff, lngDiff) || 0.0001;

          // Center path inside box
          const xPad = (boxSize - (lngDiff / maxDiff) * boxSize) / 2;
          const yPad = (boxSize - (latDiff / maxDiff) * boxSize) / 2;

          ctx.beginPath();
          coordinates.forEach((c, idx) => {
            // Translate GPS to Canvas drawing space (Flip latitude since Y goes down in canvas)
            const x = xOffset + xPad + ((c.longitude - minLng) / maxDiff) * boxSize;
            const y = yOffset + yPad + (boxSize - ((c.latitude - minLat) / maxDiff) * boxSize);

            if (idx === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });

          // Glowing orange polyline design matching Strava style
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = '#FF5722'; // Sleek orange route path
          ctx.shadowColor = 'rgba(255, 87, 34, 0.6)';
          ctx.shadowBlur = 12;
          ctx.stroke();

          // Reset shadows
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }

        // Draw stats texts, labels and logos
        function drawOverlay() {
          // 1. Draw elegant dark glassmorphic gradient overlay at the bottom half
          const overlayGrad = ctx.createLinearGradient(0, size * 0.5, 0, size);
          overlayGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
          overlayGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.45)');
          overlayGrad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
          ctx.fillStyle = overlayGrad;
          ctx.fillRect(0, size * 0.4, size, size * 0.6);

          // 2. Draw GPS route path line
          drawGpsPath();

          // 3. Draw Brand Logo text "SIDEKICK" in orange-white typography
          ctx.fillStyle = '#FF5722';
          ctx.font = '900 36px sans-serif';
          ctx.fillText('SIDE', 80, 100);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '900 36px sans-serif';
          ctx.fillText('KICK', 178, 100);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.font = '500 20px sans-serif';
          ctx.fillText('JOURNEY COMPLETED', 80, 136);

          // 4. Draw Primary stats Dashboard
          const statY = size - 140;

          // Column configurations
          const cols = [
            { label: 'DISTANCE', val: stats.distanceKm + ' km', x: 80 },
            { label: 'DURATION', val: stats.durationFormatted, x: 340 },
            { label: 'AVG SPEED', val: stats.avgSpeedKmH + ' km/h', x: 600 }
          ];

          cols.forEach(col => {
            // Label Header
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = 'bold 22px sans-serif';
            ctx.fillText(col.label, col.x, statY);

            // Bold Number Value
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '900 52px sans-serif';
            ctx.fillText(col.val, col.x, statY + 60);
          });

          // Draw Top Speed pill at the top-left area
          ctx.fillStyle = 'rgba(255, 87, 34, 0.2)';
          ctx.beginPath();
          ctx.roundRect(80, 180, 240, 48, 24);
          ctx.fill();

          ctx.fillStyle = '#FF7A45';
          ctx.font = 'bold 20px sans-serif';
          ctx.fillText('🔥 Top Speed: ' + stats.maxSpeedKmH + ' km/h', 100, 211);
        }

        // Start composting sequence
        try {
          if (gradientName) {
            // Option A: Render beautiful pure-vector gradient background
            drawGradient(gradientName);
            drawOverlay();
            postResult(canvas.toDataURL('image/jpeg', 0.95));
          } else if (imageUri) {
            // Option B: Load user photo and render it as background
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function() {
              // Calculate cover fit dimensions
              const scale = Math.max(size / img.width, size / img.height);
              const x = (size - img.width * scale) / 2;
              const y = (size - img.height * scale) / 2;
              ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

              drawOverlay();
              postResult(canvas.toDataURL('image/jpeg', 0.95));
            };
            img.onerror = function(err) {
              postError("Failed to render background image: " + JSON.stringify(err));
            };
            img.src = imageUri;
          } else {
            // Option C: Fallback to brand sunset gradient
            drawGradient('sunset');
            drawOverlay();
            postResult(canvas.toDataURL('image/jpeg', 0.95));
          }
        } catch (e) {
          postError(e.message);
        }
      </script>
    </body>
    </html>
  `;

  // Handle message updates posted from WebView
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SUCCESS') {
        onComplete(data.base64);
      } else if (data.type === 'ERROR') {
        onError(data.error);
      }
    } catch (e) {
      onError('Malformed response from WebView composting thread');
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        style={styles.webView}
        domStorageEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
  webView: {
    width: 1,
    height: 1,
  },
});
