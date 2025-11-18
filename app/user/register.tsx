// screens/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { API_BASE_URL } from '../../constants/ApiConfig';

const COLORS = {
  primary: '#F39F29',
  white: '#FFFFFF',
  black: '#000000',
  darkGray: '#0F0E0E',
  lightGray: '#978D8D',
  background: '#0F0E0E',
  transparentPrimary: 'rgba(243, 159, 41, 0.25)',
  error: '#FF4757',
  yellow: '#FDCB41',
};

type FormState = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  company_name: string;
  company_address: string;
  phone: string;
  id_card_number: string;
};

type IdCardFile = {
  uri: string;
  name: string;
  type: string;
  size?: number;
};

export default function RegisterScreen() {
  const [formState, setFormState] = useState<FormState>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    company_name: '',
    company_address: '',
    phone: '',
    id_card_number: '',
  });
  const [idCardFile, setIdCardFile] = useState<IdCardFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string>('');

  const handleInputChange = (name: keyof FormState, value: string): void => {
    setFormState((prevState) => ({ ...prevState, [name]: value }));
    
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const handlePickDocument = async (): Promise<void> => {
    try {
      // Request permission menggunakan API yang benar
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Izin Diperlukan', 
          'Maaf, kami membutuhkan izin akses galeri untuk mengupload foto KTP.'
        );
        return;
      }

      // Launch image picker dengan API yang diperbarui
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 2],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Gunakan API FileSystem yang baru
        try {
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);
          
          if (!fileInfo.exists) {
            Alert.alert('Error', 'File tidak ditemukan');
            return;
          }

          // Check file size (max 5MB) - menggunakan properti size langsung
          if (fileInfo.size && fileInfo.size > 5 * 1024 * 1024) {
            Alert.alert('Error', 'Ukuran file terlalu besar. Maksimal 5MB');
            return;
          }

          // Create file object
          const fileName = `ktp_${Date.now()}.jpg`;
          const fileType = 'image/jpeg';

          const file: IdCardFile = {
            uri: asset.uri,
            name: fileName,
            type: fileType,
            size: fileInfo.size,
          };

          setIdCardFile(file);
        } catch (fileError) {
          console.error('Error getting file info:', fileError);
          // Fallback: tetap set file meski tidak bisa dapat info
          const fileName = `ktp_${Date.now()}.jpg`;
          const file: IdCardFile = {
            uri: asset.uri,
            name: fileName,
            type: 'image/jpeg',
          };
          setIdCardFile(file);
        }
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat memilih gambar');
    }
  };

  const takePhoto = async (): Promise<void> => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Izin Diperlukan', 
          'Maaf, kami membutuhkan izin kamera untuk mengambil foto KTP.'
        );
        return;
      }

      // Launch camera dengan API yang diperbarui
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 2],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Gunakan approach yang lebih sederhana tanpa getInfoAsync
        const fileName = `ktp_${Date.now()}.jpg`;
        const fileType = 'image/jpeg';

        const file: IdCardFile = {
          uri: asset.uri,
          name: fileName,
          type: fileType,
        };

        setIdCardFile(file);
      }
    } catch (error: any) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat mengambil foto');
    }
  };

  // Alternatif: Gunakan approach tanpa getInfoAsync untuk menghindari deprecation
  const handleImagePickSimple = async (useCamera: boolean = false): Promise<void> => {
    try {
      // Request permissions
      let permissionResult;
      if (useCamera) {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (permissionResult.status !== 'granted') {
        Alert.alert(
          'Izin Diperlukan', 
          `Maaf, kami membutuhkan izin ${useCamera ? 'kamera' : 'galeri'} untuk ${useCamera ? 'mengambil foto' : 'memilih gambar'} KTP.`
        );
        return;
      }

      // Launch picker atau camera
      const result = useCamera 
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [3, 2],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 2],
            quality: 0.8,
          });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Simple approach tanpa getInfoAsync
        const fileName = `ktp_${Date.now()}.${asset.uri.split('.').pop() || 'jpg'}`;
        
        const file: IdCardFile = {
          uri: asset.uri,
          name: fileName,
          type: `image/${asset.uri.split('.').pop() || 'jpeg'}`,
        };

        setIdCardFile(file);
        
        // Beri feedback sukses
        Alert.alert('Sukses', 'Foto KTP berhasil dipilih');
      }
    } catch (error: any) {
      console.error(`Error ${useCamera ? 'taking photo' : 'picking image'}:`, error);
      Alert.alert('Error', `Terjadi kesalahan saat ${useCamera ? 'mengambil foto' : 'memilih gambar'}`);
    }
  };

  const showImagePickerOptions = (): void => {
    Alert.alert(
      'Pilih Foto KTP',
      'Pilih metode untuk mendapatkan foto KTP',
      [
        {
          text: 'Ambil Foto',
          onPress: () => handleImagePickSimple(true),
        },
        {
          text: 'Pilih dari Galeri',
          onPress: () => handleImagePickSimple(false),
        },
        {
          text: 'Batal',
          style: 'cancel',
        },
      ]
    );
  };

  const removeSelectedFile = (): void => {
    setIdCardFile(null);
  };

  const validateForm = (): boolean => {
    if (!formState.email.trim() || 
        !formState.username.trim() || 
        !formState.password.trim() || 
        !formState.confirmPassword.trim() || 
        !formState.full_name.trim()) {
      Alert.alert('Error', 'Semua field yang wajib diisi harus dilengkapi');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.email)) {
      Alert.alert('Error', 'Format email tidak valid');
      return false;
    }

    if (formState.password.length < 6) {
      Alert.alert('Error', 'Password harus minimal 6 karakter');
      return false;
    }

    if (formState.password !== formState.confirmPassword) {
      setPasswordError('Password dan Confirm Password tidak sama');
      return false;
    }

    if (!idCardFile) {
      Alert.alert('Error', 'Foto KTP wajib diupload');
      return false;
    }

    return true;
  };

  const handleRegister = async (): Promise<void> => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Add text fields
      Object.keys(formState).forEach(key => {
        if (key !== 'confirmPassword') {
          formData.append(key, formState[key as keyof FormState]);
        }
      });

      // Add file - menggunakan approach yang lebih kompatibel
      if (idCardFile) {
        // Convert URI ke blob untuk kompatibilitas yang lebih baik
        const file = {
          uri: idCardFile.uri,
          type: idCardFile.type,
          name: idCardFile.name,
        } as any;

        formData.append('id_card_photo', file);
      }

      console.log('📤 Sending registration request...');

      const response = await fetch(`${API_BASE_URL}/user/register`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          // Biarkan browser/formdata set Content-Type secara otomatis untuk multipart
        },
        body: formData,
      });

      const data = await response.json();
      console.log('📥 Response received:', data);

      if (response.ok && data.success) {
        Alert.alert('Sukses', 'Registrasi berhasil!');
        router.replace('/user/dashboarduser');
      } else {
        const errorMessage = data.message || data.errors?.id_card_photo?.[0] || 'Registrasi gagal';
        Alert.alert('Error', errorMessage);
      }

    } catch (error: any) {
      console.error('❌ Error:', error);
      Alert.alert(
        'Koneksi Gagal', 
        'Tidak bisa terhubung ke server. Pastikan server berjalan dan koneksi internet stabil.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (): void => {
    router.back();
  };

  const renderInput = (
    label: string, 
    name: keyof FormState, 
    props?: any,
    isRequired: boolean = false
  ) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>
        {label} {isRequired && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          name === 'company_address' && styles.textArea,
          passwordError && (name === 'password' || name === 'confirmPassword') && styles.inputError
        ]}
        value={formState[name]}
        onChangeText={(val: string) => handleInputChange(name, val)}
        placeholderTextColor="#978D8D"
        editable={!isLoading}
        {...props}
      />
      {passwordError && (name === 'confirmPassword') && (
        <Text style={styles.errorText}>{passwordError}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.subtitle}>
              Create your account, complete the information below!
            </Text>
          </View>

          <View style={styles.formContainer}>
            {renderInput('Email', 'email', { 
              keyboardType: 'email-address',
              autoCapitalize: 'none',
              returnKeyType: 'next',
              placeholder: 'contoh@email.com'
            }, true)}

            {renderInput('Username', 'username', { 
              autoCapitalize: 'none',
              returnKeyType: 'next',
              placeholder: 'Masukkan username'
            }, true)}

            {renderInput('Password', 'password', { 
              secureTextEntry: true,
              returnKeyType: 'next',
              placeholder: 'Minimal 6 karakter'
            }, true)}

            {renderInput('Confirm Password', 'confirmPassword', { 
              secureTextEntry: true,
              returnKeyType: 'next',
              placeholder: 'Ketik ulang password'
            }, true)}

            {renderInput('Full Name', 'full_name', {
              returnKeyType: 'next',
              placeholder: 'Nama lengkap'
            }, true)}

            {renderInput('Company Name', 'company_name', {
              returnKeyType: 'next',
              placeholder: 'Nama perusahaan (opsional)'
            })}

            {renderInput('Company Address', 'company_address', {
              multiline: true,
              numberOfLines: 4,
              returnKeyType: 'next',
              placeholder: 'Alamat perusahaan (opsional)',
            })}

            {renderInput('Phone Number', 'phone', { 
              keyboardType: 'phone-pad',
              returnKeyType: 'next',
              placeholder: 'Nomor telepon (opsional)'
            })}

            {renderInput('ID Card Number', 'id_card_number', {
              keyboardType: 'number-pad',
              returnKeyType: 'done',
              placeholder: 'Nomor KTP (opsional)'
            })}

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>
                ID Card Photo <Text style={styles.required}>*</Text>
              </Text>
              
              {idCardFile ? (
                <View style={styles.filePreviewContainer}>
                  <View style={styles.filePreview}>
                    <Image 
                      source={{ uri: idCardFile.uri }} 
                      style={styles.filePreviewImage}
                      resizeMode="cover"
                    />
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {idCardFile.name}
                      </Text>
                      <TouchableOpacity 
                        onPress={removeSelectedFile}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeButtonText}>Hapus</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.fileInput}
                  onPress={showImagePickerOptions}
                  disabled={isLoading}
                >
                  <Text style={styles.fileInputText}>
                    Pilih Foto KTP...
                  </Text>
                  <Text style={styles.fileInputSubtext}>
                    Tekan untuk memilih dari galeri atau ambil foto
                  </Text>
                </TouchableOpacity>
              )}
              
              <View style={styles.fileInputButtons}>
                <TouchableOpacity 
                  style={[styles.secondaryButton, styles.cameraButton]}
                  onPress={() => handleImagePickSimple(true)}
                  disabled={isLoading}
                >
                  <Text style={styles.secondaryButtonText}>Ambil Foto</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.secondaryButton, styles.galleryButton]}
                  onPress={() => handleImagePickSimple(false)}
                  disabled={isLoading}
                >
                  <Text style={styles.secondaryButtonText}>Pilih dari Galeri</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.spacer} />

            <TouchableOpacity 
              style={[
                styles.registerButton,
                isLoading && styles.registerButtonDisabled
              ]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.registerButtonText}>Register</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginContainer}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginText}>
                Sudah punya akun? <Text style={styles.loginLink}>Masuk Sekarang</Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.extraSpacer} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 20,
    color: '#000000',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#978D8D',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  formContainer: {
    backgroundColor: '#0F0E0E',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 25,
    minHeight: 800,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  required: {
    color: '#FF4757',
  },
  input: {
    backgroundColor: 'rgba(243, 159, 41, 0.25)',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#F39F29',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#FF4757',
  },
  errorText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#FF4757',
    marginTop: 4,
  },
  fileInput: {
    backgroundColor: 'rgba(243, 159, 41, 0.25)',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#F39F29',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInputText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  fileInputSubtext: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#978D8D',
    marginTop: 4,
    textAlign: 'center',
  },
  filePreviewContainer: {
    marginBottom: 10,
  },
  filePreview: {
    flexDirection: 'row',
    backgroundColor: 'rgba(243, 159, 41, 0.25)',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#F39F29',
    padding: 12,
    alignItems: 'center',
  },
  filePreviewImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileName: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
    marginRight: 10,
  },
  removeButton: {
    backgroundColor: '#FF4757',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeButtonText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#FFFFFF',
  },
  fileInputButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(253, 203, 65, 0.3)',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    borderColor: '#FDCB41',
    borderWidth: 1,
  },
  galleryButton: {
    borderColor: '#F39F29',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#FFFFFF',
  },
  spacer: {
    height: 20,
  },
  extraSpacer: {
    height: 40,
  },
  registerButton: {
    backgroundColor: '#FDCB41',
    borderRadius: 20,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  loginContainer: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  loginText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loginLink: {
    color: '#F39F29',
    fontFamily: 'Poppins_500Medium',
  },
});