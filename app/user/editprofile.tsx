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
  const [originalEmail, setOriginalEmail] = useState('');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUserData = await AsyncStorage.getItem('userData');
      const storedPelangganData = await AsyncStorage.getItem('pelangganData');

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
      } else {
        Alert.alert('Error', 'Token tidak ditemukan. Silakan login kembali.');
        return;
      }

      const currentFormData = {
        nama_lengkap: pelanggan?.nama_pelanggan || user?.name || '',
        email: user?.email || pelanggan?.email || '',
        no_telepon: pelanggan?.no_telp || '',
        perusahaan: pelanggan?.company_name || '',
        alamat: pelanggan?.alamat || '',
      };

      setFormData(currentFormData);
      setOriginalData(currentFormData);
      setOriginalEmail(user?.email || pelanggan?.email || '');
      
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.nama_lengkap.trim()) {
      Alert.alert('Error', 'Nama lengkap harus diisi');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email harus diisi');
      return;
    }

    if (!userToken) {
      Alert.alert('Error', 'Token tidak ditemukan');
      return;
    }

    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
    if (!hasChanges) {
      Alert.alert('Info', 'Tidak ada perubahan yang disimpan');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/user/profile/update`, {
        method: 'POST',
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
          original_email: originalEmail,
        }),
      });

      const responseText = await response.text();
      
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
        throw new Error('Endpoint tidak ditemukan atau server error');
      }

      const data = JSON.parse(responseText);

      if (response.ok && data.success) {
        await updateLocalStorage(data.data);
        
        Alert.alert(
          'Berhasil',
          'Profile berhasil diperbarui',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        throw new Error(data.message || 'Gagal memperbarui profile');
      }

    } catch (error) {
      if (error.message.includes('token') || error.message.includes('auth')) {
        Alert.alert(
          'Session Expired',
          'Silakan login kembali',
          [{ text: 'OK', onPress: () => router.replace('/user/login') }]
        );
      } else {
        Alert.alert('Error', error.message || 'Gagal memperbarui profile');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const updateLocalStorage = async (serverData) => {
    try {
      if (serverData.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(serverData.user));
      }
      
      if (serverData.pelanggan) {
        await AsyncStorage.setItem('pelangganData', JSON.stringify(serverData.pelanggan));
      }
    } catch (error) {
      throw error;
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
    if (hasChanges) {
      Alert.alert(
        'Batal Edit',
        'Perubahan yang belum disimpan akan hilang. Yakin ingin keluar?',
        [
          { text: 'Tidak', style: 'cancel' },
          { text: 'Ya', onPress: () => router.back() },
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
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.headerRight} />
          </View>

          <View style={styles.contentContainer}>
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

            <TouchableOpacity 
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
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