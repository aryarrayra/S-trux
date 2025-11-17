import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save } from 'lucide-react-native';
import { COLORS } from '../../constants/Colors';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants/ApiConfig';

export default function EditProfileScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    no_telepon: '',
    perusahaan: '',
    alamat: '',
  });
  const [originalData, setOriginalData] = useState({});
  const [userToken, setUserToken] = useState('');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔵 Loading profile data for editing...');
      
      // Ambil data dari AsyncStorage
      const storedUserData = await AsyncStorage.getItem('userData');
      const storedPelangganData = await AsyncStorage.getItem('pelangganData');
      const storedToken = await AsyncStorage.getItem('userToken');
      
      console.log('🟡 Token:', storedToken);
      console.log('🟡 User data:', storedUserData);
      console.log('🟡 Pelanggan data:', storedPelangganData);

      let user = null;
      let pelanggan = null;

      if (storedUserData) {
        user = JSON.parse(storedUserData);
      }

      if (storedPelangganData) {
        pelanggan = JSON.parse(storedPelangganData);
      }

      if (storedToken) {
        setUserToken(storedToken);
      }

      // Set form data dengan data real
      const currentFormData = {
        nama_lengkap: pelanggan?.nama_pelanggan || user?.name || '',
        email: user?.email || pelanggan?.email || '',
        no_telepon: pelanggan?.no_telp || '',
        perusahaan: pelanggan?.company_name || '',
        alamat: pelanggan?.alamat || '',
      };

      setFormData(currentFormData);
      setOriginalData(currentFormData); // Simpan data original untuk compare
      
      console.log('✅ Form data loaded:', currentFormData);
      
    } catch (error) {
      console.log('🔴 Error loading profile data:', error);
      Alert.alert('Error', 'Gagal memuat data profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Validasi
    if (!formData.nama_lengkap.trim()) {
      Alert.alert('Error', 'Nama lengkap harus diisi');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email harus diisi');
      return;
    }

    // Cek jika ada perubahan
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
    if (!hasChanges) {
      Alert.alert('Info', 'Tidak ada perubahan yang disimpan');
      return;
    }

    setIsSaving(true);

    try {
      console.log('🔵 Saving profile changes...');
      console.log('📦 Data to save:', formData);
      
      // Panggil API untuk update profile
      const response = await fetch(`${API_BASE_URL}/user/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          nama_pelanggan: formData.nama_lengkap,
          email: formData.email,
          no_telp: formData.no_telepon,
          company_name: formData.perusahaan,
          alamat: formData.alamat,
        }),
      });

      console.log('🟡 Response status:', response.status);

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
        console.log('🟢 JSON parse successful:', data);
      } catch (parseError) {
        console.log('🔴 JSON parse error:', parseError);
        // Jika API belum ready, simpan ke local storage saja
        await handleLocalSave();
        return;
      }

      if (response.ok && data.success) {
        // Update data di AsyncStorage
        await updateLocalStorage();
        
        Alert.alert(
          'Berhasil',
          'Profile berhasil diperbarui',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        throw new Error(data.message || 'Gagal memperbarui profile');
      }

    } catch (error) {
      console.log('🔴 Error saving profile:', error);
      
      // Fallback: simpan ke local storage jika API error
      try {
        await handleLocalSave();
      } catch (localError) {
        Alert.alert('Error', error.message || 'Gagal memperbarui profile');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Fallback: simpan ke local storage jika API belum ready
  const handleLocalSave = async () => {
    console.log('🟡 Using local storage fallback...');
    
    // Update pelanggan data di AsyncStorage
    const storedPelangganData = await AsyncStorage.getItem('pelangganData');
    if (storedPelangganData) {
      const pelanggan = JSON.parse(storedPelangganData);
      const updatedPelanggan = {
        ...pelanggan,
        nama_pelanggan: formData.nama_lengkap,
        email: formData.email,
        no_telp: formData.no_telepon,
        company_name: formData.perusahaan,
        alamat: formData.alamat,
      };
      
      await AsyncStorage.setItem('pelangganData', JSON.stringify(updatedPelanggan));
      console.log('✅ Local storage updated');
    }
    
    Alert.alert(
      'Berhasil',
      'Profile berhasil diperbarui (offline)',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  // Update local storage setelah API success
  const updateLocalStorage = async () => {
    try {
      const storedPelangganData = await AsyncStorage.getItem('pelangganData');
      if (storedPelangganData) {
        const pelanggan = JSON.parse(storedPelangganData);
        const updatedPelanggan = {
          ...pelanggan,
          nama_pelanggan: formData.nama_lengkap,
          email: formData.email,
          no_telp: formData.no_telepon,
          company_name: formData.perusahaan,
          alamat: formData.alamat,
        };
        
        await AsyncStorage.setItem('pelangganData', JSON.stringify(updatedPelanggan));
        console.log('✅ Local storage synced');
      }
    } catch (error) {
      console.log('🔴 Error updating local storage:', error);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    // Cek jika ada perubahan
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
    if (hasChanges) {
      Alert.alert(
        'Batal Edit',
        'Perubahan yang belum disimpan akan hilang. Yakin ingin keluar?',
        [
          {
            text: 'Tidak',
            style: 'cancel',
          },
          {
            text: 'Ya',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleCancel}
            >
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.headerRight} />
          </View>

          <View style={styles.contentContainer}>
            {/* Form */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Informasi Pribadi</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nama Lengkap *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nama_lengkap}
                  onChangeText={(value) => updateFormData('nama_lengkap', value)}
                  placeholder="Masukkan nama lengkap"
                  placeholderTextColor={COLORS.lightGray}
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  placeholder="Masukkan email"
                  placeholderTextColor={COLORS.lightGray}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nomor Telepon</Text>
                <TextInput
                  style={styles.input}
                  value={formData.no_telepon}
                  onChangeText={(value) => updateFormData('no_telepon', value)}
                  placeholder="Masukkan nomor telepon"
                  placeholderTextColor={COLORS.lightGray}
                  keyboardType="phone-pad"
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Perusahaan</Text>
                <TextInput
                  style={styles.input}
                  value={formData.perusahaan}
                  onChangeText={(value) => updateFormData('perusahaan', value)}
                  placeholder="Masukkan nama perusahaan"
                  placeholderTextColor={COLORS.lightGray}
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Alamat</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.alamat}
                  onChangeText={(value) => updateFormData('alamat', value)}
                  placeholder="Masukkan alamat lengkap"
                  placeholderTextColor={COLORS.lightGray}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  editable={!isSaving}
                />
              </View>

              <Text style={styles.requiredNote}>* Wajib diisi</Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity 
              style={[
                styles.saveButton,
                isSaving && styles.saveButtonDisabled
              ]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Save size={16} color={COLORS.white} />
                  <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.black,
    marginTop: 10,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.black,
  },
  headerRight: {
    width: 34,
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.black,
  },
  textArea: {
    minHeight: 80,
  },
  requiredNote: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.lightGray,
    fontStyle: 'italic',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 10,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.white,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.lightGray,
  },
});