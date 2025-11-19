import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { ProjectInput, LocationInput, COLORS } from '@/components/user/commonComponents';

interface Step2Props {
  projectName: string;
  projectLocation: string;
  projectDescription: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  useCurrentLocation: boolean;
  onProjectNameChange: (text: string) => void;
  onProjectDescriptionChange: (text: string) => void;
  onGetCurrentLocation: () => void;
  onShowMapModal: () => void;
  onLocationSelect: (location: any) => void;
}

export const Step2DetailProyek: React.FC<Step2Props> = ({
  projectName,
  projectLocation,
  projectDescription,
  latitude,
  longitude,
  address,
  useCurrentLocation,
  onProjectNameChange,
  onProjectDescriptionChange,
  onGetCurrentLocation,
  onShowMapModal,
  onLocationSelect,
}) => {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  // Check permission saat component mount
  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setLocationPermission(granted);
      
      if (!granted) {
        Alert.alert(
          'Izin Lokasi Diperlukan',
          'Aplikasi membutuhkan akses lokasi untuk mendapatkan posisi Anda saat ini. Silakan izinkan akses lokasi di pengaturan perangkat.',
          [
            { text: 'OK', style: 'default' },
            { text: 'Buka Pengaturan', onPress: () => Location.getForegroundPermissionsAsync() }
          ]
        );
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);

      // Check permission first
      const hasPermission = locationPermission || await requestLocationPermission();
      
      if (!hasPermission) {
        setIsLoadingLocation(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000, // 15 seconds timeout
      });

      const { latitude, longitude } = location.coords;
      
      // Reverse geocoding to get address
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const addressInfo = addressResponse[0];
      const formattedAddress = formatAddress(addressInfo);

      // Update parent component dengan real location data
      onLocationSelect({
        latitude,
        longitude,
        name: 'Lokasi Saat Ini',
        address: formattedAddress,
      });

      onGetCurrentLocation(); // Trigger the parent handler

      console.log('📍 Real location obtained:', { latitude, longitude, address: formattedAddress });

    } catch (error: any) {
      console.error('Error getting location:', error);
      
      let errorMessage = 'Gagal mendapatkan lokasi saat ini';
      
      if (error.code === 'CANCELLED') {
        errorMessage = 'Permintaan lokasi dibatalkan';
      } else if (error.code === 'UNAVAILABLE') {
        errorMessage = 'Layanan lokasi tidak tersedia';
      } else if (error.code === 'TIMEOUT') {
        errorMessage = 'Timeout: Gagal mendapatkan lokasi dalam waktu yang ditentukan';
      } else if (error.message?.includes('permission')) {
        errorMessage = 'Izin lokasi tidak diberikan';
      }
      
      Alert.alert('Error', errorMessage);
      
      // Fallback ke simulated location jika gagal
      useSimulatedLocation();
      
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const useSimulatedLocation = () => {
    // Fallback: Use Jakarta coordinates jika real location gagal
    const simulatedLatitude = -6.2088 + (Math.random() - 0.5) * 0.01;
    const simulatedLongitude = 106.8456 + (Math.random() - 0.5) * 0.01;
    
    onLocationSelect({
      latitude: simulatedLatitude,
      longitude: simulatedLongitude,
      name: 'Lokasi Perkiraan (Jakarta)',
      address: 'Lokasi berdasarkan area Jakarta',
    });
    
    onGetCurrentLocation();
  };

  const formatAddress = (address: Location.LocationGeocodedAddress): string => {
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);
    if (address.country) parts.push(address.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Alamat tidak tersedia';
  };

  const handleLocationOptionPress = async () => {
    if (isLoadingLocation) return;
    
    await getCurrentLocation();
  };

  return (
    <View style={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>Detail Proyek</Text>
      
      <ProjectInput
        label="Nama Proyek"
        value={projectName}
        onChangeText={onProjectNameChange}
      />

      <View style={styles.locationOptions}>
        <TouchableOpacity 
          style={[
            styles.locationOption, 
            useCurrentLocation && styles.locationOptionActive,
            isLoadingLocation && styles.locationOptionDisabled
          ]}
          onPress={handleLocationOptionPress}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={[styles.locationOptionText, styles.loadingText]}>
                Mendapatkan lokasi...
              </Text>
            </View>
          ) : (
            <Text style={[
              styles.locationOptionText,
              useCurrentLocation && styles.locationOptionTextActive
            ]}>
              📍 {locationPermission === false ? 'Izinkan Lokasi' : 'Gunakan Lokasi Saat Ini'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.locationOption,
            !useCurrentLocation && styles.locationOptionActive
          ]}
          onPress={onShowMapModal}
        >
          <Text style={[
            styles.locationOptionText,
            !useCurrentLocation && styles.locationOptionTextActive
          ]}>
            🗺️ Pilih di Peta
          </Text>
        </TouchableOpacity>
      </View>

      <LocationInput
        label="Lokasi Proyek"
        value={projectLocation}
        onPress={onShowMapModal}
        latitude={latitude || undefined}
        longitude={longitude || undefined}
        address={address}
      />

      {/* Location Accuracy Info */}
      {(latitude && longitude) && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationInfoText}>
            📍 Koordinat: {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
          </Text>
          <Text style={styles.locationInfoSubtext}>
            {useCurrentLocation ? 'Lokasi real-time dari GPS' : 'Lokasi dari peta'}
          </Text>
        </View>
      )}

      <ProjectInput
        label="Deskripsi Proyek"
        placeholder="Jelaskan kebutuhan dan penggunaan alat berat untuk proyek ini"
        multiline
        numberOfLines={4}
        value={projectDescription}
        onChangeText={onProjectDescriptionChange}
      />

      {/* Permission Warning */}
      {locationPermission === false && (
        <View style={styles.permissionWarning}>
          <Text style={styles.permissionWarningText}>
            ⚠️ Izin lokasi diperlukan untuk mendapatkan posisi akurat
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = {
  detailsContainer: {
    marginTop: 38,
  },
  detailsTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#000000',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  locationOptions: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 10,
  },
  locationOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  locationOptionActive: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.orange,
    borderWidth: 1,
  },
  locationOptionDisabled: {
    opacity: 0.6,
  },
  locationOptionText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textGray,
    textAlign: 'center',
  },
  locationOptionTextActive: {
    color: COLORS.black,
    fontFamily: 'Poppins_500Medium',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 11,
  },
  locationInfo: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  locationInfoText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: COLORS.text,
    marginBottom: 4,
  },
  locationInfoSubtext: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.textGray,
  },
  permissionWarning: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#FFF3CD',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  permissionWarningText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#856404',
    textAlign: 'center',
  },
};