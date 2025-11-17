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
} from 'react-native';
import { router } from 'expo-router';
import {API_BASE_URL} from '../../constants/ApiConfig';


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
  const [idCardFileName, setIdCardFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string>('');

  const handleInputChange = (name: keyof FormState, value: string): void => {
    setFormState((prevState) => ({ ...prevState, [name]: value }));
    
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const handlePickDocument = (): void => {
    Alert.alert('Info', 'Fitur upload dokumen akan segera tersedia');
    setIdCardFileName('KTP_1234567890.jpg');
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

    return true;
  };

  const handleRegister = async (): Promise<void> => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { confirmPassword, ...submitData } = formState;

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Sukses', 'Registrasi berhasil!');
        router.replace('/user/dashboarduser');
      } else {
        Alert.alert('Error', data.message || 'Registrasi gagal');
      }

    } catch (error: any) {
      console.error('Error:', error);
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
              <Text style={styles.label}>ID Card Photo</Text>
              <TouchableOpacity 
                style={styles.fileInput}
                onPress={handlePickDocument}
                disabled={isLoading}
              >
                <Text style={[
                  styles.fileInputText,
                  !idCardFileName && styles.fileInputPlaceholder
                ]}>
                  {idCardFileName || 'Pilih File...'}
                </Text>
              </TouchableOpacity>
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
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  fileInputText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
  },
  fileInputPlaceholder: {
    color: '#978D8D',
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