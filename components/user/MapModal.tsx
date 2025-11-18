import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import WebView from 'react-native-webview';
import { X, Navigation, MapPin } from 'lucide-react-native';
import { COLORS } from '@/components/user/commonComponents';
import * as Location from 'expo-location';

interface MapModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: any) => void;
}

export const MapModal: React.FC<MapModalProps> = ({
  visible,
  onClose,
  onLocationSelect
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Get user's current location
  const getUserCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);

      // Check location permission
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert(
            'Izin Lokasi Diperlukan',
            'Aplikasi membutuhkan akses lokasi untuk menampilkan posisi Anda di peta.'
          );
          setIsLoadingLocation(false);
          return;
        }
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });

      const { latitude, longitude } = location.coords;
      
      // Reverse geocoding to get address
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const addressInfo = addressResponse[0];
      const formattedAddress = formatAddress(addressInfo);

      // Send location to WebView
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'USER_LOCATION',
          location: {
            latitude,
            longitude,
            name: 'Lokasi Anda Saat Ini',
            address: formattedAddress,
          }
        }));
      }

    } catch (error: any) {
      console.error('Error getting user location:', error);
      Alert.alert('Error', 'Gagal mendapatkan lokasi Anda saat ini.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const formatAddress = (address: Location.LocationGeocodedAddress): string => {
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);
    if (address.country) parts.push(address.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Alamat tidak tersedia';
  };

  // HTML untuk Leaflet Map dengan fitur yang lebih real
  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Pilih Lokasi Proyek</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            * {
                -webkit-tap-highlight-color: transparent;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                user-select: none;
            }
            body { 
                margin: 0; 
                padding: 0; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: white;
                overflow: hidden;
            }
            #map { 
                height: 100vh; 
                width: 100vw;
                touch-action: pan-x pan-y;
            }
            
            /* User Location Button */
            .locate-user-btn {
                position: absolute;
                top: 80px;
                right: 10px;
                background: white;
                border: none;
                border-radius: 50%;
                width: 44px;
                height: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 1000;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .locate-user-btn:active {
                transform: scale(0.95);
                background: #f8f9fa;
            }
            
            /* User Location Marker */
            .user-marker {
                position: relative;
                width: 30px;
                height: 30px;
            }
            
            .user-marker-pin::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 30px;
                height: 30px;
                background: #34A853;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            }
            
            .user-marker-pin::after {
                content: '';
                position: absolute;
                top: 6px;
                left: 6px;
                width: 12px;
                height: 12px;
                background: white;
                border-radius: 50%;
            }
            
            .user-pulse {
                position: absolute;
                top: -10px;
                left: -10px;
                width: 50px;
                height: 50px;
                border: 3px solid #34A853;
                border-radius: 50%;
                animation: userPulse 2s infinite;
                opacity: 0;
            }
            
            @keyframes userPulse {
                0% {
                    transform: scale(0.1);
                    opacity: 0;
                }
                50% {
                    opacity: 0.4;
                }
                100% {
                    transform: scale(1.5);
                    opacity: 0;
                }
            }
            
            /* Selected Location Marker */
            .selected-marker {
                position: relative;
                width: 50px;
                height: 50px;
            }
            
            .selected-pin {
                width: 50px;
                height: 50px;
                position: absolute;
                top: 0;
                left: 0;
                z-index: 2;
            }
            
            .selected-pin::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 50px;
                height: 50px;
                background: #FBBC05;
                border: 4px solid white;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            }
            
            .selected-pin::after {
                position: absolute;
                top: 12px;
                left: 12px;
                width: 22px;
                height: 22px;
                background: white;
                border-radius: 50%;
                transform: rotate(45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                color: #FBBC05;
            }
            
            .selected-pulse {
                position: absolute;
                top: -15px;
                left: -15px;
                width: 80px;
                height: 80px;
                border: 10px solid #FBBC05;
                border-radius: 50%;
                animation: selectedPulse 1.5s infinite;
                opacity: 0;
                z-index: 1;
            }
            
            @keyframes selectedPulse {
                0% {
                    transform: scale(0.1);
                    opacity: 0.8;
                }
                70% {
                    opacity: 0.4;
                }
                100% {
                    transform: scale(1.5);
                    opacity: 0;
                }
            }
            
            .location-info {
                position: absolute;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background: white;
                padding: 16px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                z-index: 1000;
                border: 1px solid #e0e0e0;
            }
            
            .location-name {
                font-weight: 600;
                font-size: 16px;
                margin-bottom: 6px;
                color: #2c3e50;
            }
            
            .location-address {
                font-size: 14px;
                color: #7f8c8d;
                margin-bottom: 8px;
                line-height: 1.4;
            }
            
            .location-coords {
                font-size: 12px;
                color: #95a5a6;
                font-family: 'SF Mono', Monaco, monospace;
                background: #f8f9fa;
                padding: 6px 8px;
                border-radius: 4px;
                border: 1px solid #e9ecef;
            }
            
            .confirm-button {
                background: #f39c12;
                color: white;
                border: none;
                padding: 14px 20px;
                border-radius: 8px;
                font-weight: 600;
                width: 100%;
                margin-top: 12px;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.2s ease;
            }
            
            .confirm-button:active {
                background: #e67e22;
                transform: scale(0.98);
            }
            
            .map-instruction {
                position: absolute;
                top: 80px;
                left: 20px;
                right: 20px;
                background: rgba(255, 255, 255, 0.95);
                padding: 12px 16px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 1000;
                border: 1px solid #e0e0e0;
                backdrop-filter: blur(10px);
            }
            
            .instruction-text {
                font-size: 14px;
                color: #2c3e50;
                text-align: center;
                font-weight: 500;
            }
            
            .loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
                flex-direction: column;
                gap: 12px;
            }
            
            .loading-text {
                font-size: 14px;
                color: #2c3e50;
                font-weight: 500;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        
        <button class="locate-user-btn" id="locateUserBtn" title="Lokasi Saya">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4285F4" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
        </button>
        
        <div class="map-instruction">
            <div class="instruction-text">👆 Tap pada peta untuk memilih lokasi proyek</div>
        </div>
        
        <div id="locationInfo" class="location-info" style="display: none;">
            <div class="location-name" id="locName"></div>
            <div class="location-address" id="locAddress"></div>
            <div class="location-coords" id="locCoords"></div>
            <button class="confirm-button" id="confirmBtn">Pilih Lokasi Ini</button>
        </div>

        <script>
            let map;
            let selectedMarker = null;
            let userLocationMarker = null;
            let currentLocation = null;
            let isMapReady = false;

            // OpenStreetMap Nominatim untuk reverse geocoding
            async function reverseGeocode(lat, lng) {
                try {
                    const response = await fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lng}&zoom=18&addressdetails=1\`);
                    const data = await response.json();
                    
                    if (data && data.address) {
                        const address = data.address;
                        let formattedAddress = '';
                        
                        // Format alamat
                        if (address.road) formattedAddress += address.road + ', ';
                        if (address.village) formattedAddress += address.village + ', ';
                        if (address.suburb) formattedAddress += address.suburb + ', ';
                        if (address.city) formattedAddress += address.city + ', ';
                        if (address.state) formattedAddress += address.state;
                        
                        // Hapus koma di akhir
                        formattedAddress = formattedAddress.replace(/,\\s*$/, '');
                        
                        let locationName = 'Lokasi Proyek Baru';
                        if (address.road) {
                            locationName = address.road;
                            if (address.village) locationName += ', ' + address.village;
                        }
                        
                        return {
                            name: locationName,
                            address: formattedAddress || 'Alamat tidak tersedia'
                        };
                    }
                } catch (error) {
                    console.error('Reverse geocoding error:', error);
                }
                
                return {
                    name: 'Lokasi Proyek Baru',
                    address: 'Alamat akan ditentukan'
                };
            }

            function initMap() {
                // Initialize map centered on Indonesia
                map = L.map('map', {
                    zoomControl: true,
                    doubleClickZoom: true,
                    closePopupOnClick: false,
                    tap: true
                }).setView([-2.5489, 118.0149], 5); // Center on Indonesia

                // Add OpenStreetMap tiles - REAL MAP!
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19
                }).addTo(map);

                // Add zoom control
                L.control.zoom({
                    position: 'topright'
                }).addTo(map);

                // Add click event on map - REAL INTERACTION!
                map.on('click', async function(e) {
                    const coords = e.latlng;
                    
                    // Show loading
                    showLoading(true);
                    
                    // Reverse geocode the clicked location
                    const addressInfo = await reverseGeocode(coords.lat, coords.lng);
                    
                    const location = {
                        latitude: coords.lat,
                        longitude: coords.lng,
                        name: addressInfo.name,
                        address: addressInfo.address
                    };
                    
                    selectLocation(location);
                    showLoading(false);
                });

                // Handle locate user button
                document.getElementById('locateUserBtn').addEventListener('click', function() {
                    // Request user location from React Native
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'REQUEST_USER_LOCATION'
                    }));
                });

                // Handle confirm button click
                document.getElementById('confirmBtn').addEventListener('click', function() {
                    confirmLocation();
                });

                // Set map padding
                setTimeout(() => {
                    map.invalidateSize();
                    isMapReady = true;
                }, 100);
            }

            function showLoading(show) {
                let loadingEl = document.getElementById('loadingOverlay');
                if (!loadingEl && show) {
                    loadingEl = document.createElement('div');
                    loadingEl.id = 'loadingOverlay';
                    loadingEl.className = 'loading-overlay';
                    loadingEl.innerHTML = \`
                        <div style="text-align: center;">
                            <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #f39c12; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 12px;"></div>
                            <div class="loading-text">Mendapatkan info lokasi...</div>
                        </div>
                    \`;
                    document.body.appendChild(loadingEl);
                    
                    // Add spin animation
                    const style = document.createElement('style');
                    style.textContent = \`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    \`;
                    document.head.appendChild(style);
                } else if (loadingEl && !show) {
                    loadingEl.remove();
                }
            }

            // Handle messages from React Native
            window.addEventListener('message', function(event) {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'USER_LOCATION' && data.location) {
                        showUserLocation(data.location);
                    }
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });

            function showUserLocation(location) {
                // Remove previous user marker if exists
                if (userLocationMarker) {
                    map.removeLayer(userLocationMarker);
                }
                
                // Add user location marker
                userLocationMarker = L.marker([location.latitude, location.longitude], {
                    icon: L.divIcon({
                        className: 'user-marker',
                        html: \`
                            <div class="user-marker">
                                <div class="user-pulse"></div>
                                <div class="user-marker-pin"></div>
                            </div>
                        \`,
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    })
                }).addTo(map)
                .bindPopup(\`
                    <div style="min-width: 200px;">
                        <div style="font-weight: 600; margin-bottom: 4px;">\${location.name}</div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 8px;">\${location.address}</div>
                        <div style="font-size: 11px; color: #888; background: #f5f5f5; padding: 4px; border-radius: 4px;">
                            \${location.latitude.toFixed(6)}, \${location.longitude.toFixed(6)}
                        </div>
                    </div>
                \`);
                
                // Center map on user location dengan zoom yang lebih dekat
                map.flyTo([location.latitude, location.longitude], 16, {
                    duration: 1
                });
                
                // Auto-select user location
                selectLocation(location);
            }

            function selectLocation(location) {
                currentLocation = location;
                
                // Remove previous marker if exists
                if (selectedMarker) {
                    map.removeLayer(selectedMarker);
                }
                
                // Add new marker dengan selected-marker style
                selectedMarker = L.marker([location.latitude, location.longitude], {
                    icon: L.divIcon({
                        className: 'selected-marker',
                        html: \`
                            <div class="selected-marker">
                                <div class="selected-pulse"></div>
                                <div class="selected-pulse" style="animation-delay: 0.5s"></div>
                                <div class="selected-pin"></div>
                            </div>
                        \`,
                        iconSize: [50, 50],
                        iconAnchor: [25, 50]
                    })
                }).addTo(map);
                
                // Show location info
                document.getElementById('locName').textContent = location.name;
                document.getElementById('locAddress').textContent = location.address;
                document.getElementById('locCoords').textContent = 
                    location.latitude.toFixed(6) + ', ' + location.longitude.toFixed(6);
                
                const locationInfo = document.getElementById('locationInfo');
                locationInfo.style.display = 'block';
                
                // Pan to selected location
                if (!userLocationMarker) { // Only pan if not user location
                    map.flyTo([location.latitude, location.longitude], 16, {
                        duration: 1
                    });
                }
            }

            function confirmLocation() {
                if (currentLocation) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'LOCATION_SELECTED',
                        location: currentLocation
                    }));
                }
            }

            // Initialize map when page loads
            document.addEventListener('DOMContentLoaded', initMap);
        </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'LOCATION_SELECTED' && data.location) {
        onLocationSelect(data.location);
        onClose();
      } else if (data.type === 'REQUEST_USER_LOCATION') {
        // User clicked the locate button in the map
        getUserCurrentLocation();
      }
    } catch (error) {
      console.log('Error parsing message:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <View style={styles.mapModalContainer}>
        <View style={styles.mapModal}>
          <View style={styles.mapModalHeader}>
            <View style={styles.mapModalTitleContainer}>
              <Text style={styles.mapModalTitle}>Pilih Lokasi Proyek</Text>
              <Text style={styles.mapModalSubtitle}>
                {isLoadingLocation ? 'Mendapatkan lokasi...' : 'Tap pada peta untuk memilih lokasi'}
              </Text>
            </View>
            
            <View style={styles.headerActions}>
              {/* Locate User Button */}
              <TouchableOpacity 
                style={[
                  styles.locateButton,
                  isLoadingLocation && styles.locateButtonDisabled
                ]}
                onPress={getUserCurrentLocation}
                disabled={isLoadingLocation}
              >
                {isLoadingLocation ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Navigation color={COLORS.primary} size={20} />
                )}
              </TouchableOpacity>
              
              {/* Close Button */}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X color={COLORS.black} size={24} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.mapContainer}>
            <WebView
              ref={webViewRef}
              source={{ html: leafletHTML }}
              style={styles.webview}
              onMessage={handleWebViewMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scalesPageToFit={true}
              mixedContentMode="compatibility"
              overScrollMode="never"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  mapModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  mapModal: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginTop: Platform.OS === 'ios' ? 40 : 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  mapModalTitleContainer: {
    flex: 1,
  },
  mapModalTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: COLORS.black,
    marginBottom: 4,
  },
  mapModalSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textGray,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locateButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  locateButtonDisabled: {
    opacity: 0.5,
  },
  closeButton: {
    padding: 8,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
};