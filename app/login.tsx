import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
  Platform,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Lock, Building, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  darkBrown: '#262011',
  darkGray: '#0F0E0E',
  lightGray: '#E8E8E8',
  primary: '#F39F29',
  primaryTransparent: 'rgba(243, 159, 41, 0.2)',
  line: '#978D8D',
  shadow: 'rgba(243, 159, 41, 0.25)',
  buttonShadow: '#FDCB41',
};

interface LoginData {
  identifier: string; // Bisa username atau email
  password: string;
  role: 'admin' | 'petugas';
}

interface ApiResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: any;
  data?: any;
}

const FormComponent = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'petugas'>('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [isIdentifierFocused, setIsIdentifierFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const router = useRouter();

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message, [{ text: 'OK' }]);
    }
  };

const handleLogin = async () => {
  console.log('Login button clicked', { identifier, password, role: selectedRole });

  // Basic validation
  if (!identifier.trim() || !password.trim()) {
    showAlert('Form Tidak Lengkap', 'Harap masukkan username/email dan password');
    return;
  }

  setIsLoading(true);

  try {
    console.log('Sending login request for:', selectedRole);

    // Tentukan endpoint dan format data berdasarkan role
    let endpoint: string;
    let requestData: any;

    if (selectedRole === 'admin') {
      endpoint = 'http://127.0.0.1:8000/api/admin/login';
      requestData = {
        username: identifier.trim(), // Admin pakai identifier
        password: password.trim(),
        role: selectedRole
      };
    } else {
      endpoint = 'http://127.0.0.1:8000/api/petugas/login';
      requestData = {
        email: identifier.trim(), // Petugas pakai email (bukan identifier)
        password: password.trim(),
        role: selectedRole
      };
    }

    console.log('Sending data:', requestData);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    console.log('Response status:', response.status);

    const data: ApiResponse = await response.json();
    console.log('Response data:', data);

    if (response.ok && data.success) {
      // Login successful
      showAlert('Berhasil', data.message || 'Login berhasil!');

      // Store user data in AsyncStorage
      const userData = {
        token: data.token,
        user: data.user || data.data,
        role: selectedRole,
        loginTime: new Date().toISOString(),
      };

      // Simpan ke AsyncStorage
      try {
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        console.log('User data saved to storage');
      } catch (storageError) {
        console.error('Error saving to storage:', storageError);
      }

      // Navigate based on role
      if (selectedRole === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/petugas/dashboard');
      }
    } else {
      // Login failed
      const errorMessage = data.message || 
        (data.errors ? Object.values(data.errors).flat().join(', ') : 'Username/Email atau password tidak sesuai');
      showAlert('Login Gagal', errorMessage);
    }
  } catch (error) {
    console.error('Login error:', error);
    showAlert(
      'Error Jaringan',
      'Tidak dapat terhubung ke server. Periksa koneksi Anda dan coba lagi.'
    );
  } finally {
    setIsLoading(false);
  }
};

  // Placeholder text berdasarkan role
const getIdentifierPlaceholder = () => {
  return selectedRole === 'admin' ? 'Masukkan username Anda' : 'Masukkan email Anda';
};

// Label text berdasarkan role
const getIdentifierLabel = () => {
  return selectedRole === 'admin' ? 'Username' : 'Email';
};

// Auto complete type
const getAutoCompleteType = () => {
  return selectedRole === 'admin' ? 'username' : 'email';
};

// Keyboard type
const getKeyboardType = () => {
  return selectedRole === 'admin' ? 'default' : 'email-address';
};

  return (
    <View style={styles.formContainer}>
      <View style={styles.formCard}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>ST</Text>
          </View>
          <Text style={styles.logoBrand}>S`Trux</Text>
        </View>

        <View style={styles.separator} />

        <Text style={styles.formTitle}>Masukkan Identitas Akun Anda</Text>

        {/* Role Selection */}
        <View style={styles.roleSelectionContainer}>
          <Text style={styles.label}>Login Sebagai</Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                selectedRole === 'admin' && styles.roleButtonActive
              ]}
              onPress={() => setSelectedRole('admin')}
              disabled={isLoading}
            >
              <Building 
                size={16} 
                color={selectedRole === 'admin' ? COLORS.white : COLORS.primary} 
              />
              <Text style={[
                styles.roleButtonText,
                selectedRole === 'admin' && styles.roleButtonTextActive
              ]}>
                Admin
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                selectedRole === 'petugas' && styles.roleButtonActive
              ]}
              onPress={() => setSelectedRole('petugas')}
              disabled={isLoading}
            >
              <Users 
                size={16} 
                color={selectedRole === 'petugas' ? COLORS.white : COLORS.primary} 
              />
              <Text style={[
                styles.roleButtonText,
                selectedRole === 'petugas' && styles.roleButtonTextActive
              ]}>
                Petugas
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{getIdentifierLabel()}</Text>
          <View style={[
            styles.inputContainer,
            isIdentifierFocused && styles.inputContainerFocused
          ]}>
              <TextInput
                style={styles.input}
                placeholder={getIdentifierPlaceholder()}
                placeholderTextColor="#777"
                autoCapitalize="none"
                autoComplete={getAutoCompleteType()}
                keyboardType={getKeyboardType()}
                value={identifier}
                onChangeText={setIdentifier}
                editable={!isLoading}
                onFocus={() => setIsIdentifierFocused(true)}
                onBlur={() => setIsIdentifierFocused(false)}
                returnKeyType="next"
              />
            <User color={COLORS.primary} size={20} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={[
            styles.inputContainer,
            isPasswordFocused && styles.inputContainerFocused
          ]}>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#777"
              secureTextEntry
              autoComplete="password"
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              onSubmitEditing={handleLogin}
              returnKeyType="go"
            />
            <Lock color={COLORS.primary} size={20} />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.loginButton,
            isLoading && styles.loginButtonDisabled
          ]}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Sedang Login...' : `Login sebagai ${selectedRole === 'admin' ? 'Admin' : 'Petugas'}`}
          </Text>
        </TouchableOpacity>

        {/* Info untuk testing */}
        <View style={styles.testInfo}>
          <Text style={styles.testInfoTitle}>Info Login:</Text>
          <Text style={styles.testInfoText}>
            • <Text style={styles.boldText}>Admin:</Text> gunakan username & password admin{'\n'}
            • <Text style={styles.boldText}>Petugas:</Text> gunakan email & password dari data petugas
          </Text>
        </View>
      </View>
    </View>
  );
};

interface BrandingComponentProps {
  isDesktop: boolean;
}

const BrandingComponent = ({ isDesktop }: BrandingComponentProps) => (
  <View style={[styles.brandingContainer, !isDesktop && { paddingTop: 40 }]}>
    <View>
      <Text style={[styles.brandingTitle, !isDesktop && styles.mobileBrandingTitle]}>
        Sistem Penyewaan {'\n'}
        <Text style={{ color: COLORS.primary }}>Alat Berat</Text>
      </Text>
      <Text style={[styles.brandingSubtitle, !isDesktop && { textAlign: 'center' }]}>
        SOLUSI PENYEWAAN ALAT BERAT PREMIUM UNTUK PROYEK ANDA
      </Text>
    </View>
    <Image
      source={{
        uri: 'https://img-wrapper.vercel.app/api?url=https://s3-alpha-sig.figma.com/img/573c/f841/5960ca53b5fafb38315e4a83831f8165?Expires=1762732800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=Yb0DnLtkQV6CLk7EtX9Z9ewqzaWGeFxwoUpYkU~fSe~e1t80FJBtUvhSdRcQAyfsEpa4a4QxRqQqUeoXP-njGyFEhzZCrn88AM8rx5deLw1wE4LuAWde7Wrn9MlaEJdzCDRuZXnhAh691e0dQxfSypUL7ZKDsEN6O2E8ewt8oXHiU3pqocp5hOjZykqG338fjRh2Qys2hSXBg4Ny-JhVvlHphOPl9yhGPsWmT3Rc52cKggYvWIFEPl~cf-bQ77iLjpomLg0vSMIdv3v8-ecgNtdod96MUAbNNORCDxlOP3ekVRCgbbzNMYiEUQmX54lJMww0A9oDDpZaCIsGdscRhg__',
      }}
      style={styles.excavatorImage}
      resizeMode="contain"
    />
  </View>
);

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 992;

  return (
    <LinearGradient colors={[COLORS.darkBrown, COLORS.darkGray]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.outerFrame}>
            <View style={[styles.mainContainer, isDesktop && styles.desktopContainer]}>
              <FormComponent />
              {isDesktop && <BrandingComponent isDesktop={isDesktop} />}
            </View>
          </View>
          {!isDesktop && <BrandingComponent isDesktop={isDesktop} />}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  outerFrame: {
    flex: 1,
    margin: Platform.OS === 'web' ? 40 : 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 25,
    justifyContent: 'center',
    minHeight: 650,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  desktopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: Platform.OS === 'web' ? 40 : 30,
    ...Platform.select({
      web: {
        boxShadow: `0px 0px 26px ${COLORS.shadow}`,
      },
      native: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 26,
        elevation: 10,
      },
    }),
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBox: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: COLORS.darkGray,
  },
  logoBrand: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: COLORS.darkGray,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.line,
    marginVertical: 20,
  },
  formTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 30,
  },
  // Role Selection Styles
  roleSelectionContainer: {
    marginBottom: 25,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.primary,
  },
  roleButtonTextActive: {
    color: COLORS.white,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: COLORS.darkGray,
    marginBottom: 6,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryTransparent,
    borderRadius: 7,
    paddingHorizontal: 15,
    borderWidth: 0,
  },
  inputContainerFocused: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  input: {
    flex: 1,
    height: 44,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    ...(Platform.OS === 'web' && {
      // @ts-ignore - outline is a web-only CSS property
      outline: 'none',
    }),
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    ...Platform.select({
      web: {
        boxShadow: `0px 0px 5px ${COLORS.buttonShadow}`,
        cursor: 'pointer',
      },
      native: {
        shadowColor: COLORS.buttonShadow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 5,
        elevation: 5,
      },
    }),
    alignSelf: 'center',
    width: '100%',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: COLORS.white,
  },
  // Test Info Styles
  testInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  testInfoTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 5,
  },
  testInfoText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.darkGray,
    lineHeight: 14,
  },
  boldText: {
    fontFamily: 'Poppins_600SemiBold',
  },
  brandingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  brandingTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 48,
    color: COLORS.white,
    textAlign: 'left',
    lineHeight: 72,
  },
  mobileBrandingTitle: {
    fontSize: 36,
    textAlign: 'center',
    lineHeight: 54,
  },
  brandingSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.white,
    textAlign: 'left',
    marginTop: 16,
    opacity: 0.8,
    maxWidth: 450,
  },
  excavatorImage: {
    width: '100%',
    maxWidth: 498,
    height: 350,
    marginTop: 40,
  },
});