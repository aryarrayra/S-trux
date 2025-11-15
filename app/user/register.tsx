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

// Type untuk form state
type FormState = {
  username: string;
  password: string;
  email: string;
  fullName: string;
  companyName: string;
  companyAddress: string;
  phone: string;
  idCardNumber: string;
};

export default function RegisterScreen() {
  const [formState, setFormState] = useState<FormState>({
    username: '',
    password: '',
    email: '',
    fullName: '',
    companyName: '',
    companyAddress: '',
    phone: '',
    idCardNumber: '',
  });
  const [idCardFileName, setIdCardFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (name: keyof FormState, value: string): void => {
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handlePickDocument = (): void => {
    Alert.alert('Info', 'Fitur upload dokumen akan segera tersedia');
    setIdCardFileName('KTP_1234567890.jpg');
  };

  const handleRegister = async (): Promise<void> => {
    if (!formState.username.trim() || !formState.password.trim() || !formState.email.trim()) {
      Alert.alert('Error', 'Harap isi semua field yang wajib diisi');
      return;
    }

    if (formState.password.length < 6) {
      Alert.alert('Error', 'Password harus minimal 6 karakter');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (formState.username && formState.password.length >= 6 && formState.email) {
        console.log('User registration successful');
        router.replace('/user/dashboarduser');
      } else {
        Alert.alert('Registrasi Gagal', 'Harap periksa kembali data yang dimasukkan');
        setIsLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat registrasi');
      setIsLoading(false);
    }
  };

  const handleLogin = (): void => {
    router.back();
  };

  const renderInput = (
    label: string, 
    name: keyof FormState, 
    props?: any
  ) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={formState[name]}
        onChangeText={(val: string) => handleInputChange(name, val)}
        placeholderTextColor="#978D8D"
        editable={!isLoading}
        {...props}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          // Hilangkan keyboardDismissMode agar tidak ada conflict
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.subtitle}>
              Create your account, complete the information below!
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {renderInput('Username', 'username', { 
              autoCapitalize: 'none',
              returnKeyType: 'next'
            })}
            {renderInput('Password', 'password', { 
              secureTextEntry: true,
              returnKeyType: 'next'
            })}
            {renderInput('Email', 'email', { 
              keyboardType: 'email-address',
              autoCapitalize: 'none',
              returnKeyType: 'next'
            })}
            {renderInput('Full Name', 'fullName', {
              returnKeyType: 'next'
            })}
            {renderInput('Company Name', 'companyName', {
              returnKeyType: 'next'
            })}
            {renderInput('Company Address', 'companyAddress', {
              returnKeyType: 'next'
            })}
            {renderInput('Phone Number', 'phone', { 
              keyboardType: 'phone-pad',
              returnKeyType: 'next'
            })}
            {renderInput('ID Card Number', 'idCardNumber', {
              keyboardType: 'number-pad',
              returnKeyType: 'done'
            })}

            {/* File Input untuk ID Card */}
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

            {/* Spacer untuk beri ruang di bawah */}
            <View style={styles.spacer} />

            {/* Register Button */}
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

            {/* Login Link */}
            <TouchableOpacity 
              style={styles.loginContainer}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginText}>
                Sudah punya akun? <Text style={styles.loginLink}>Masuk Sekarang</Text>
              </Text>
            </TouchableOpacity>

            {/* Extra spacer untuk pastikan cukup ruang */}
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
    paddingBottom: 60, // Tambah padding bottom lebih banyak
    paddingHorizontal: 25,
    minHeight: 800, // Fixed height yang cukup
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