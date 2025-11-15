import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Calendar, Download, Upload, FileText, CheckCircle, MapPin, X } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import WebView from 'react-native-webview';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Location {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface FormData {
  startDate: Date;
  endDate: Date;
  projectName: string;
  projectLocation: string;
  projectDescription: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  documentsUploaded: boolean;
}

interface DateInputProps {
  label: string;
  value: string;
  onPress: () => void;
}

interface LocationInputProps {
  label: string;
  value: string;
  onPress: () => void;
  latitude?: number;
  longitude?: number;
  address?: string;
}

interface ProjectInputProps {
  label: string;
  defaultValue?: string;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  value?: string;
  onChangeText?: (text: string) => void;
}

interface ItemCardProps {
  imageUrl: string;
  name: string;
  price: string;
}

interface SummaryCardProps {
  startDate: string;
  endDate: string;
  duration: number;
  projectName: string;
  projectLocation: string;
  latitude: number | null;
  longitude: number | null;
  totalCost: number;
}

interface ProjectDetailsCardProps {
  projectName: string;
  projectLocation: string;
  projectDescription: string;
  latitude: number | null;
  longitude: number | null;
}

interface MapModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
}

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
  background: '#F4F4F4',
  white: '#FFFFFF',
  black: '#000000',
  textGray: '#978D8D',
  primary: '#29F3C0',
  inactiveGray: '#D9D9D9',
  orange: '#F39F29',
  yellow: '#FDCB41',
  lightGray: '#E5E5E5',
  disabledYellow: '#FDEBB8',
  disabledText: '#B8B8B8',
};

const DUMMY_LOCATIONS: Location[] = [
  {
    id: 1,
    name: "Proyek Tol Jakarta-Cikampek",
    address: "Jl. Tol Jakarta-Cikampek KM 12, Bekasi",
    latitude: -6.2615,
    longitude: 106.9846
  },
  {
    id: 2,
    name: "Pembangunan Apartemen Sudirman",
    address: "Jl. Jenderal Sudirman Kav. 52-53, Jakarta Selatan",
    latitude: -6.2297,
    longitude: 106.8227
  },
  {
    id: 3,
    name: "Proyek MRT Jakarta Fase 2",
    address: "Jl. Gatot Subroto, Jakarta Pusat",
    latitude: -6.1944,
    longitude: 106.8229
  },
  {
    id: 4,
    name: "Rekonstruksi Jembatan Bambu Kuning",
    address: "Jl. Bambu Kuning, Jakarta Timur",
    latitude: -6.2250,
    longitude: 106.9000
  }
];

const DAILY_RATE = 800000;
const MIN_ADVANCE_DAYS = 2;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return date.toLocaleDateString('id-ID', options);
};

const calculateDuration = (startDate: Date, endDate: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / oneDay));
  return diffDays;
};

const getMinStartDate = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() + MIN_ADVANCE_DAYS);
  return date;
};

// ============================================================================
// LEAFLET MAP HTML (Memoized outside component)
// ============================================================================

const createLeafletHTML = (locations: Location[]): string => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Pilih Lokasi</title>
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
        
        .google-marker {
            position: relative;
            width: 40px;
            height: 40px;
        }
        
        .marker-pin {
            width: 40px;
            height: 40px;
            position: absolute;
            top: 0;
            left: 0;
        }
        
        .marker-pin::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 40px;
            height: 40px;
            background: #4285F4;
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
        
        .marker-pin::after {
            content: '';
            position: absolute;
            top: 8px;
            left: 8px;
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            transform: rotate(45deg);
        }
        
        .pulse-effect {
            position: absolute;
            top: -10px;
            left: -10px;
            width: 60px;
            height: 60px;
            border: 8px solid #4285F4;
            border-radius: 50%;
            animation: pulse 2s infinite;
            opacity: 0;
        }
        
        @keyframes pulse {
            0% {
                transform: scale(0.1);
                opacity: 0;
            }
            50% {
                opacity: 0.4;
            }
            100% {
                transform: scale(2);
                opacity: 0;
            }
        }
        
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
            background: #34A853;
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
        }
        
        .selected-pulse {
            position: absolute;
            top: -15px;
            left: -15px;
            width: 80px;
            height: 80px;
            border: 10px solid #34A853;
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
        
        .construction-marker {
            position: relative;
            width: 40px;
            height: 40px;
        }
        
        .construction-pin::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 40px;
            height: 40px;
            background: #FBBC05;
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
        
        .construction-pin::after {
            content: '🏗️';
            position: absolute;
            top: 6px;
            left: 6px;
            transform: rotate(45deg) scale(0.8);
            font-size: 16px;
        }
        
        .project-marker {
            position: relative;
            width: 40px;
            height: 40px;
        }
        
        .project-pin::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 40px;
            height: 40px;
            background: #EA4335;
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
        
        .project-pin::after {
            content: '📌';
            position: absolute;
            top: 6px;
            left: 6px;
            transform: rotate(45deg) scale(0.8);
            font-size: 16px;
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
        
        .leaflet-popup-content-wrapper {
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }
        
        .leaflet-popup-content {
            margin: 12px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .popup-title {
            font-weight: 600;
            font-size: 14px;
            color: #2c3e50;
            margin-bottom: 6px;
        }
        
        .popup-address {
            font-size: 12px;
            color: #7f8c8d;
            margin-bottom: 8px;
            line-height: 1.3;
        }
        
        .popup-coords {
            font-size: 11px;
            color: #95a5a6;
            font-family: 'SF Mono', Monaco, monospace;
            background: #f8f9fa;
            padding: 4px 6px;
            border-radius: 3px;
            margin-bottom: 8px;
        }
        
        .popup-select-btn {
            background: #f39c12;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            width: 100%;
            transition: background 0.2s ease;
        }
        
        .popup-select-btn:active {
            background: #e67e22;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    
    <div class="map-instruction">
        <div class="instruction-text">Tap pada peta untuk memilih lokasi proyek</div>
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
        let currentLocation = null;

        function initMap() {
            map = L.map('map', {
                zoomControl: true,
                doubleClickZoom: true,
                closePopupOnClick: true,
                tap: true
            }).setView([-6.2088, 106.8456], 12);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(map);

            L.control.zoom({
                position: 'topright'
            }).addTo(map);

            const locations = ${JSON.stringify(locations)};
            
            locations.forEach((location, index) => {
                let markerClass, pinClass;
                if (index === 0) {
                    markerClass = 'google-marker';
                    pinClass = 'marker-pin';
                } else if (index === 1) {
                    markerClass = 'construction-marker';
                    pinClass = 'construction-pin';
                } else {
                    markerClass = 'project-marker';
                    pinClass = 'project-pin';
                }
                
                const marker = L.marker([location.latitude, location.longitude], {
                    icon: L.divIcon({
                        className: markerClass,
                        html: \`
                            <div class="\${markerClass}">
                                <div class="pulse-effect"></div>
                                <div class="\${pinClass}"></div>
                            </div>
                        \`,
                        iconSize: [40, 40],
                        iconAnchor: [20, 40]
                    })
                })
                .addTo(map)
                .bindPopup(\`
                    <div style="min-width: 220px;">
                        <div class="popup-title">\${location.name}</div>
                        <div class="popup-address">\${location.address}</div>
                        <div class="popup-coords">\${location.latitude.toFixed(4)}, \${location.longitude.toFixed(4)}</div>
                        <button class="popup-select-btn" onclick="selectPredefinedLocation('\${location.id}')">Pilih Lokasi</button>
                    </div>
                \`)
                .on('click', function(e) {
                    L.DomEvent.stopPropagation(e);
                    selectLocation(location);
                });
            });

            map.on('click', function(e) {
                const clickedLocation = {
                    id: 0,
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng,
                    name: 'Lokasi Proyek Baru',
                    address: 'Alamat akan ditentukan'
                };
                
                const nearest = findNearestLocation(clickedLocation, locations);
                clickedLocation.name = nearest.name + ' (Area Sekitar)';
                clickedLocation.address = nearest.address;
                
                selectLocation(clickedLocation);
            });

            document.getElementById('confirmBtn').addEventListener('click', function() {
                confirmLocation();
            });

            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }

        function selectPredefinedLocation(locationId) {
            const locations = ${JSON.stringify(locations)};
            const location = locations.find(loc => loc.id == locationId);
            if (location) {
                selectLocation(location);
                map.closePopup();
            }
        }

        function findNearestLocation(clickedLoc, locations) {
            let nearest = locations[0];
            let shortestDistance = Number.MAX_VALUE;

            locations.forEach(location => {
                const distance = calculateDistance(
                    clickedLoc.latitude, clickedLoc.longitude,
                    location.latitude, location.longitude
                );
                
                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    nearest = location;
                }
            });

            return nearest;
        }

        function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        }

        function selectLocation(location) {
            currentLocation = location;
            
            if (selectedMarker) {
                map.removeLayer(selectedMarker);
            }
            
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
            
            document.getElementById('locName').textContent = location.name;
            document.getElementById('locAddress').textContent = location.address;
            document.getElementById('locCoords').textContent = 
                location.latitude.toFixed(6) + ', ' + location.longitude.toFixed(6);
            
            const locationInfo = document.getElementById('locationInfo');
            locationInfo.style.display = 'block';
            
            map.flyTo([location.latitude, location.longitude], 15, {
                duration: 1
            });
        }

        function confirmLocation() {
            if (currentLocation) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'LOCATION_SELECTED',
                    location: currentLocation
                }));
            }
        }

        document.addEventListener('DOMContentLoaded', initMap);
    </script>
</body>
</html>
`;

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => (
  <View style={styles.progressBarContainer}>
    {Array.from({ length: totalSteps }).map((_, index) => (
      <View
        key={index}
        style={[
          styles.progressBarStep,
          { backgroundColor: index < currentStep ? COLORS.primary : COLORS.inactiveGray },
        ]}
      />
    ))}
  </View>
);

const DateInput: React.FC<DateInputProps> = ({ label, value, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`${label}: ${value}`}
    accessibilityHint="Tap untuk memilih tanggal"
  >
    <View style={styles.dateInputContainer}>
      <Text style={styles.dateInputLabel}>{label}</Text>
      <View style={styles.dateInputField}>
        <Calendar color={COLORS.black} size={20} style={{ marginRight: 10 }} />
        <Text style={styles.dateInputText}>{value}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const LocationInput: React.FC<LocationInputProps> = ({
  label,
  value,
  onPress,
  latitude,
  longitude,
  address
}) => (
  <TouchableOpacity
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`${label}: ${address || value || 'Belum dipilih'}`}
    accessibilityHint="Tap untuk memilih lokasi di peta"
  >
    <View style={styles.locationInputContainer}>
      <Text style={styles.locationInputLabel}>{label}</Text>
      <View style={styles.locationInputField}>
        <MapPin color={COLORS.black} size={20} style={{ marginRight: 10 }} />
        <View style={styles.locationTextContainer}>
          <Text style={styles.locationInputText}>
            {address || value || 'Pilih lokasi di peta'}
          </Text>
          {latitude && longitude && (
            <Text style={styles.coordinatesText}>
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </Text>
          )}
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const ProjectInput: React.FC<ProjectInputProps> = ({
  label,
  defaultValue = '',
  placeholder = '',
  multiline = false,
  numberOfLines = 1,
  value,
  onChangeText
}) => (
  <View style={styles.projectInputContainer}>
    <Text style={styles.projectInputLabel}>{label}</Text>
    <TextInput
      style={[
        styles.projectInputField,
        multiline && styles.multilineInput,
      ]}
      defaultValue={defaultValue}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textGray}
      multiline={multiline}
      numberOfLines={numberOfLines}
      value={value}
      onChangeText={onChangeText}
      accessibilityLabel={label}
    />
  </View>
);

const ItemCard: React.FC<ItemCardProps> = ({ imageUrl, name, price }) => (
  <View style={styles.itemCard}>
    <Image source={{ uri: imageUrl }} style={styles.itemImage} />
    <View style={styles.itemDetails}>
      <Text style={styles.itemName}>{name}</Text>
      <Text style={styles.itemPrice}>{price}</Text>
    </View>
  </View>
);

const SummaryCard: React.FC<SummaryCardProps> = ({
  startDate,
  endDate,
  duration,
  projectName,
  projectLocation,
  latitude,
  longitude,
  totalCost
}) => (
  <View style={styles.summaryCard}>
    <Text style={styles.summaryCardTitle}>Ringkasan Sewa</Text>

    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Tanggal Mulai</Text>
      <Text style={styles.summaryValue}>{startDate}</Text>
    </View>

    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Tanggal Selesai</Text>
      <Text style={styles.summaryValue}>{endDate}</Text>
    </View>

    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Durasi</Text>
      <Text style={styles.summaryValue}>{duration} hari</Text>
    </View>

    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Nama Proyek</Text>
      <Text style={styles.summaryValue}>{projectName}</Text>
    </View>

    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Lokasi</Text>
      <View style={styles.locationSummary}>
        <Text style={styles.summaryValue}>{projectLocation}</Text>
        {latitude && longitude && (
          <Text style={styles.coordinatesSummary}>
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </Text>
        )}
      </View>
    </View>

    <View style={[styles.summaryRow, { marginTop: 8 }]}>
      <Text style={styles.totalLabel}>Total Biaya</Text>
      <Text style={styles.totalValue}>Rp {totalCost.toLocaleString('id-ID')}</Text>
    </View>
  </View>
);

const ProjectDetailsCard: React.FC<ProjectDetailsCardProps> = ({
  projectName,
  projectLocation,
  projectDescription,
  latitude,
  longitude
}) => (
  <View style={styles.detailsCard}>
    <Text style={styles.detailsCardTitle}>Detail Proyek</Text>

    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>Nama Proyek</Text>
      <Text style={styles.detailValue}>{projectName}</Text>
    </View>

    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>Lokasi Proyek</Text>
      <View style={styles.locationDetail}>
        <Text style={styles.detailValue}>{projectLocation}</Text>
        {latitude && longitude && (
          <Text style={styles.coordinatesDetail}>
            Koordinat: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </Text>
        )}
      </View>
    </View>

    {projectDescription ? (
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Deskripsi Proyek</Text>
        <Text style={styles.detailValue}>{projectDescription}</Text>
      </View>
    ) : null}
  </View>
);

const DocumentDownloadCard: React.FC = () => (
  <View style={styles.documentCard}>
    <Text style={styles.documentCardTitle}>Dokumen untuk Diunduh</Text>
    <Text style={styles.documentCardSubtitle}>Unduh dan isi dokumen di bawah ini</Text>

    <TouchableOpacity
      style={styles.downloadButton}
      accessibilityRole="button"
      accessibilityLabel="Unduh Surat Pernyataan"
    >
      <FileText color={COLORS.black} size={20} />
      <View style={styles.downloadTextContainer}>
        <Text style={styles.downloadTitle}>Surat Pernyataan</Text>
        <Text style={styles.downloadSubtitle}>PDF - 245 KB</Text>
      </View>
      <Download color={COLORS.black} size={20} />
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.downloadButton}
      accessibilityRole="button"
      accessibilityLabel="Unduh Surat Kontrak Sewa"
    >
      <FileText color={COLORS.black} size={20} />
      <View style={styles.downloadTextContainer}>
        <Text style={styles.downloadTitle}>Surat Kontrak Sewa</Text>
        <Text style={styles.downloadSubtitle}>PDF - 345 KB</Text>
      </View>
      <Download color={COLORS.black} size={20} />
    </TouchableOpacity>
  </View>
);

const DocumentUploadCard: React.FC<{ onUpload?: () => void }> = ({ onUpload }) => (
  <View style={styles.documentCard}>
    <Text style={styles.documentCardTitle}>Unggah Dokumen</Text>
    <Text style={styles.documentCardSubtitle}>Unggah dokumen yang telah diisi</Text>

    <TouchableOpacity
      style={styles.uploadButton}
      onPress={onUpload}
      accessibilityRole="button"
      accessibilityLabel="Unggah dokumen"
      accessibilityHint="Tap untuk memilih dokumen yang akan diunggah"
    >
      <Upload color={COLORS.black} size={24} />
      <Text style={styles.uploadText}>Unggah Dokumen</Text>
      <Text style={styles.uploadSubtext}>PDF, JPG, PNG (Max. 5MB)</Text>
    </TouchableOpacity>
  </View>
);

const MapModal: React.FC<MapModalProps> = ({ visible, onClose, onLocationSelect }) => {
  const webViewRef = useRef<WebView>(null);

  const leafletHTML = useMemo(() => createLeafletHTML(DUMMY_LOCATIONS), []);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'LOCATION_SELECTED' && data.location) {
        onLocationSelect(data.location);
        onClose();
      }
    } catch (error) {
      console.error('Error parsing message:', error);
      Alert.alert('Error', 'Gagal memproses lokasi yang dipilih');
    }
  }, [onLocationSelect, onClose]);

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
              <Text style={styles.mapModalSubtitle}>Tap pada peta untuk memilih lokasi</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Tutup peta"
            >
              <X color={COLORS.black} size={24} />
            </TouchableOpacity>
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SewaFormScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  // State untuk step 1 (Periode Sewa)
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + MIN_ADVANCE_DAYS);
    return date;
  });

  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + MIN_ADVANCE_DAYS + 3);
    return date;
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // State untuk step 2 (Detail Proyek)
  const [projectName, setProjectName] = useState('Penggalian Gorong Gorong');
  const [projectLocation, setProjectLocation] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState<string>('');

  // State untuk step 3 (Dokumen)
  const [documentsUploaded, setDocumentsUploaded] = useState(false);

  // Memoized calculations
  const duration = useMemo(() => calculateDuration(startDate, endDate), [startDate, endDate]);
  const totalCost = useMemo(() => DAILY_RATE * duration, [duration]);

  // Validation
  const canProceedToNextStep = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return startDate && endDate && duration > 0;
      case 2:
        return projectName.trim().length > 0 &&
          projectLocation.trim().length > 0 &&
          latitude !== null &&
          longitude !== null;
      case 3:
        return documentsUploaded;
      default:
        return false;
    }
  }, [currentStep, startDate, endDate, duration, projectName, projectLocation, latitude, longitude, documentsUploaded]);

  const handleStartDateChange = useCallback((event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const minDate = getMinStartDate();

      if (selectedDate >= minDate) {
        setStartDate(selectedDate);

        if (endDate <= selectedDate) {
          const newEndDate = new Date(selectedDate);
          newEndDate.setDate(newEndDate.getDate() + 1);
          setEndDate(newEndDate);
        }
      } else {
        Alert.alert(
          'Tanggal Tidak Valid',
          `Anda hanya dapat memesan alat berat minimal ${MIN_ADVANCE_DAYS} hari dari sekarang`
        );
      }
    }
  }, [endDate]);

  const handleEndDateChange = useCallback((event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      if (selectedDate > startDate) {
        setEndDate(selectedDate);
      } else {
        Alert.alert(
          'Tanggal Tidak Valid',
          'Tanggal selesai harus setelah tanggal mulai'
        );
      }
    }
  }, [startDate]);

  const handleLocationSelect = useCallback((location: Location) => {
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    setAddress(location.address);
    setProjectLocation(location.name);
  }, []);

  const handleNextStep = useCallback(() => {
    if (!canProceedToNextStep()) {
      let errorMessage = '';

      switch (currentStep) {
        case 1:
          errorMessage = 'Silakan pilih tanggal sewa yang valid';
          break;
        case 2:
          if (!projectName.trim()) {
            errorMessage = 'Silakan isi nama proyek';
          } else if (!projectLocation.trim()) {
            errorMessage = 'Silakan pilih lokasi proyek di peta';
          }
          break;
        case 3:
          errorMessage = 'Silakan unggah dokumen terlebih dahulu';
          break;
      }

      if (errorMessage) {
        Alert.alert('Validasi Gagal', errorMessage);
      }
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowSuccessModal(true);
    }
  }, [currentStep, canProceedToNextStep, projectName, projectLocation]);

  const handleBackStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  }, [currentStep, router]);

  const handleDocumentUpload = useCallback(() => {
    // Simulate document upload
    setDocumentsUploaded(true);
    Alert.alert('Sukses', 'Dokumen berhasil diunggah');
  }, []);

  const handleSuccessConfirm = useCallback(() => {
    setShowSuccessModal(false);
    router.push('/user/(tabs)/katalog');
  }, [router]);

  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <View style={styles.periodeSewaContainer}>
              <Text style={styles.periodeSewaTitle}>Periode Sewa</Text>
              <Text style={styles.periodeSewaInfo}>
                Anda hanya dapat memesan alat berat {MIN_ADVANCE_DAYS} hari sesudah hari ini
              </Text>
            </View>

            <DateInput
              label="Tanggal Mulai"
              value={formatDate(startDate)}
              onPress={() => setShowStartPicker(true)}
            />

            <DateInput
              label="Tanggal Selesai"
              value={formatDate(endDate)}
              onPress={() => setShowEndPicker(true)}
            />

            <View style={styles.durationContainer}>
              <Text style={styles.durationText}>Durasi Sewa {duration} hari</Text>
            </View>

            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleStartDateChange}
                minimumDate={getMinStartDate()}
              />
            )}

            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleEndDateChange}
                minimumDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)}
              />
            )}
          </>
        );

      case 2:
        return (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Detail Proyek</Text>
            <ProjectInput
              label="Nama Proyek"
              value={projectName}
              onChangeText={setProjectName}
            />

            <LocationInput
              label="Lokasi Proyek"
              value={projectLocation}
              onPress={() => setShowMapModal(true)}
              latitude={latitude || undefined}
              longitude={longitude || undefined}
              address={address}
            />

            <ProjectInput
              label="Deskripsi Proyek"
              placeholder="jelaskan kebutuhan dan penggunaan alat berat"
              multiline
              numberOfLines={4}
              value={projectDescription}
              onChangeText={setProjectDescription}
            />
          </View>
        );

      case 3:
        return (
          <>
            <View style={styles.section}>
              <SummaryCard
                startDate={formatDate(startDate)}
                endDate={formatDate(endDate)}
                duration={duration}
                projectName={projectName}
                projectLocation={projectLocation}
                latitude={latitude}
                longitude={longitude}
                totalCost={totalCost}
              />
            </View>

            <View style={styles.section}>
              <ProjectDetailsCard
                projectName={projectName}
                projectLocation={projectLocation}
                projectDescription={projectDescription}
                latitude={latitude}
                longitude={longitude}
              />
            </View>

            <View style={styles.section}>
              <DocumentDownloadCard />
            </View>

            <View style={styles.section}>
              <DocumentUploadCard onUpload={handleDocumentUpload} />
            </View>
          </>
        );

      default:
        return null;
    }
  }, [currentStep, startDate, endDate, duration, showStartPicker, showEndPicker,
    handleStartDateChange, handleEndDateChange, projectName, projectLocation,
    latitude, longitude, address, projectDescription, totalCost, handleDocumentUpload]);

  const isNextButtonDisabled = !canProceedToNextStep();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBackStep}
              style={styles.backButtonHeader}
              accessibilityRole="button"
              accessibilityLabel="Kembali"
            >
              <ChevronLeft color={COLORS.black} size={28} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Pengajuan Sewa</Text>
              <Text style={styles.headerSubtitle}>Langkah {currentStep} dari 3</Text>
            </View>
          </View>

          <ProgressBar currentStep={currentStep} totalSteps={3} />

          <ItemCard
            imageUrl="https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/bfea/564f/04fbd48ded688b16d060f50826d834a8?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qoWqP35~z1Moit1wyhoaXC9dMb7wCHPojQy~l3uuG3Vv32CrSn-ckTaSlAQZIHz6DFi9a8L~L~I0EqqP~OcmUSPgLgqanCQEXIcMoGXW8~cWZpQ1VmtsoPUqHBcgKHLoqTbwYqvbvPyn0WWnMamIvkikbcsXixjIJaUfGIMb8V5-sBDCXMNnyT3eDgLODT5ESYcqcQ1JRIzQRklBtjZxA9oGjcmSshLfiEUkgCjJuZEBWWFPk3FK4jW~eZIub475KF2dM6zSCZ-gv7g~JDJRSmRHf2IPv8KoVZNPFtj18Ox1O30zITQnyGP2jlbdRP1d1NGWV9-25Udfr~miS6D9mQ__"
            name="Excavator Caterpillar 3200D"
            price="Rp 800.000/hari"
          />

          {renderStepContent()}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackStep}
            accessibilityRole="button"
            accessibilityLabel={currentStep === 1 ? 'Kembali ke halaman sebelumnya' : 'Kembali ke langkah sebelumnya'}
          >
            <Text style={styles.buttonText}>Kembali</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.nextButton,
              isNextButtonDisabled && styles.nextButtonDisabled
            ]}
            onPress={handleNextStep}
            disabled={isNextButtonDisabled}
            accessibilityRole="button"
            accessibilityLabel={currentStep === 3 ? 'Ajukan sewa' : 'Lanjut ke langkah berikutnya'}
            accessibilityState={{ disabled: isNextButtonDisabled }}
          >
            <Text style={[
              styles.buttonText,
              isNextButtonDisabled && styles.nextButtonTextDisabled
            ]}>
              {currentStep === 3 ? 'Ajukan Sewa' : 'Selanjutnya'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <MapModal
        visible={showMapModal}
        onClose={() => setShowMapModal(false)}
        onLocationSelect={handleLocationSelect}
      />

      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconContainer}>
              <CheckCircle size={64} color={COLORS.orange} />
            </View>

            <Text style={styles.successTitle}>
              Terima Kasih!
            </Text>

            <Text style={styles.successMessage}>
              Terima kasih sudah memesan. Dokumen anda sudah diajukan, silahkan menunggu admin untuk menerima ajukan anda.
            </Text>

            <TouchableOpacity
              style={styles.successButton}
              onPress={handleSuccessConfirm}
              accessibilityRole="button"
              accessibilityLabel="OK"
            >
              <Text style={styles.successButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButtonHeader: {
    padding: 4,
  },
  headerTitleContainer: {
    marginLeft: 18,
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.black,
  },
  headerSubtitle: {
    fontFamily: 'Poppins_300Light',
    fontSize: 12,
    color: COLORS.textGray,
  },
  progressBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 34,
  },
  progressBarStep: {
    flex: 1,
    height: 4,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginHorizontal: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  itemDetails: {
    marginLeft: 12,
    flex: 1,
  },
  itemName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.black,
  },
  itemPrice: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.orange,
    marginTop: 4,
  },
  periodeSewaContainer: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 10,
  },
  periodeSewaTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.black,
  },
  periodeSewaInfo: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.black,
    marginTop: 4,
    lineHeight: 18,
  },
  dateInputContainer: {
    marginHorizontal: 31,
    marginVertical: 12,
  },
  dateInputLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.black,
    marginBottom: 4,
  },
  dateInputField: {
    backgroundColor: COLORS.yellow,
    borderRadius: 5,
    paddingHorizontal: 11,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  dateInputText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.black,
  },
  locationInputContainer: {
    marginHorizontal: 31,
    marginVertical: 12,
  },
  locationInputLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.black,
    marginBottom: 4,
  },
  locationInputField: {
    backgroundColor: COLORS.yellow,
    borderRadius: 5,
    paddingHorizontal: 11,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationInputText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.black,
  },
  coordinatesText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.textGray,
    marginTop: 2,
  },
  durationContainer: {
    marginHorizontal: 50,
    marginTop: 38,
    padding: 8,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: COLORS.yellow,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  durationText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: COLORS.orange,
  },
  detailsContainer: {
    marginTop: 38,
  },
  detailsTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.black,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  projectInputContainer: {
    marginHorizontal: 20,
    marginVertical: 8,
  },
  projectInputLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.black,
    marginBottom: 4,
  },
  projectInputField: {
    backgroundColor: COLORS.white,
    borderRadius: 5,
    paddingHorizontal: 11,
    paddingVertical: 10,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  section: {
    marginTop: 34,
    marginHorizontal: 31,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  summaryCardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textGray,
    flex: 1,
  },
  summaryValue: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.black,
    flex: 1,
    textAlign: 'right',
  },
  locationSummary: {
    flex: 1,
    alignItems: 'flex-end',
  },
  coordinatesSummary: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.textGray,
    marginTop: 2,
  },
  totalLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.black,
  },
  totalValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.orange,
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  detailsCardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 12,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textGray,
    marginBottom: 4,
  },
  detailValue: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.black,
  },
  locationDetail: {
    marginTop: 4,
  },
  coordinatesDetail: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.textGray,
    marginTop: 2,
  },
  documentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  documentCardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 4,
  },
  documentCardSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textGray,
    marginBottom: 16,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
    padding: 12,
    marginBottom: 8,
  },
  downloadTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  downloadTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.black,
  },
  downloadSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.textGray,
    marginTop: 2,
  },
  uploadButton: {
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    borderRadius: 5,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.orange,
    borderStyle: 'dashed',
  },
  uploadText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.black,
    marginTop: 8,
  },
  uploadSubtext: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.textGray,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingTop: 10,
    backgroundColor: COLORS.background,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  backButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  nextButton: {
    backgroundColor: COLORS.yellow,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: COLORS.disabledYellow,
  },
  buttonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.black,
  },
  nextButtonTextDisabled: {
    color: COLORS.disabledText,
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModal: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: COLORS.orange,
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  successButton: {
    backgroundColor: COLORS.yellow,
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 12,
    minWidth: 120,
  },
  successButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'center',
  },
});