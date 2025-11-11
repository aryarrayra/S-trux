import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { User, Lock, Eye, EyeOff } from 'lucide-react-native';
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
};

export default function UserLoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const containerAnim = useRef(new Animated.Value(1)).current;
  const orangeAnim = useRef(new Animated.Value(0)).current;

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Harap isi username dan password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password harus minimal 6 karakter');
      return;
    }

    setIsLoading(true);

    try {
      // Simulasi proses login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validasi sederhana
      if (username && password.length >= 6) {
        console.log('User login successful');
        
        // Mulai proses transition
        setIsTransitioning(true);
        
        // Fade out seluruh container login
        Animated.timing(containerAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // Setelah login view menghilang, mulai animasi ellipse oranye
          startOrangeAnimation();
        });
        
      } else {
        Alert.alert('Login Gagal', 'Username atau password salah');
        setIsLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat login');
      setIsLoading(false);
    }
  };

  const startOrangeAnimation = () => {
    // Animasi ellipse oranye muncul dari bawah dan membesar
    Animated.parallel([
      Animated.timing(orangeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Setelah animasi selesai, navigasi ke dashboard
      setTimeout(() => {
        router.replace('/user/dashboarduser');
      }, 200);
    });
  };

  const handleForgotPassword = () => {
    Alert.alert('Lupa Password', 'Fitur reset password akan segera tersedia');
  };

  const handleRegister = () => {
    Alert.alert('Daftar Akun', 'Fitur pendaftaran akan segera tersedia');
  };

  // Interpolasi untuk animasi ellipse oranye
  const orangeEllipseTransform = orangeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1000, -1000], // Mulai dari jauh di bawah, naik ke atas
  });

  const orangeEllipseScale = orangeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 15], // Membesar hingga menutupi layar
  });

  const orangeEllipseOpacity = orangeAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 1, 1], // Muncul perlahan
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Animasi Ellipse Oranye - akan muncul saat transition */}
            <Animated.View 
              style={[
                styles.orangeEllipse,
                {
                  transform: [
                    { translateY: orangeEllipseTransform },
                    { scale: orangeEllipseScale }
                  ],
                  opacity: orangeEllipseOpacity
                }
              ]}
            />
            
            {/* Container utama login - akan fade out */}
            <Animated.View 
              style={[
                styles.loginContent,
                {
                  opacity: containerAnim
                }
              ]}
            >
              {/* Background Ellipse */}
              <View style={styles.ellipseBackground} />
              
              {/* Header Section */}
              <View style={styles.headerContainer}>
                <Text style={styles.welcomeText}>Selamat Datang!</Text>
                <Text style={styles.subtitleText}>Masuk ke akun anda</Text>
              </View>

              {/* Form Section */}
              <View style={styles.formContainer}>
                {/* Username Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Username</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={username}
                      onChangeText={setUsername}
                      placeholder=""
                      placeholderTextColor={COLORS.lightGray}
                      autoCapitalize="none"
                      autoComplete="username"
                      editable={!isLoading && !isTransitioning}
                      returnKeyType="next"
                    />
                    <View style={styles.iconContainer}>
                      <User size={20} color={COLORS.primary} strokeWidth={1.5} />
                    </View>
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholder=""
                      placeholderTextColor={COLORS.lightGray}
                      editable={!isLoading && !isTransitioning}
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                    />
                    <TouchableOpacity 
                      style={styles.iconContainer}
                      onPress={() => setShowPassword(!showPassword)}
                      disabled={isLoading || isTransitioning}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={COLORS.primary} strokeWidth={1.5} />
                      ) : (
                        <Eye size={20} color={COLORS.primary} strokeWidth={1.5} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Lupa Password */}
                <TouchableOpacity 
                  onPress={handleForgotPassword}
                  disabled={isLoading || isTransitioning}
                  style={styles.forgotPasswordContainer}
                >
                  <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity 
                  style={[
                    styles.loginButton,
                    (isLoading || isTransitioning) && styles.loginButtonDisabled
                  ]}
                  onPress={handleLogin}
                  disabled={isLoading || isTransitioning}
                >
                  {(isLoading || isTransitioning) ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <Text style={styles.loginButtonText}>MASUK</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Footer Section */}
              <View style={styles.footerContainer}>
                <TouchableOpacity 
                  style={styles.registerContainer}
                  onPress={handleRegister}
                  disabled={isLoading || isTransitioning}
                >
                  <Text style={styles.registerText}>
                    Belum punya akun? <Text style={styles.registerLink}>Daftar Sekarang</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: 800,
  },
  loginContent: {
    flex: 1,
  },
  // Animasi Ellipse Oranye
  orangeEllipse: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F39F29',
    alignSelf: 'center',
    bottom: -50, // Posisi awal di bawah layar
    zIndex: 10,
  },
  ellipseBackground: {
    position: 'absolute',
    width: 900,
    height: 900,
    borderRadius: 450,
    backgroundColor: '#0F0E0E',
    left: -260,
    top: 300,
  },
  headerContainer: {
    position: 'absolute',
    top: 200,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  welcomeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    lineHeight: 30,
    color: '#000000',
  },
  subtitleText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#978D8D',
    marginTop: 2,
  },
  formContainer: {
    position: 'absolute',
    top: 420,
    left: 50,
    right: 50,
  },
  inputWrapper: {
    marginBottom: 38,
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    lineHeight: 15,
    color: '#FFFFFF',
    marginBottom: 2,
    marginLeft: 15,
  },
  inputContainer: {
    height: 31,
    borderRadius: 7,
    borderWidth: 0.5,
    borderColor: '#F39F29',
    backgroundColor: 'rgba(243, 159, 41, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    shadowColor: 'rgba(253, 203, 65, 0.15)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 13,
    elevation: 5,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -10,
    marginBottom: 15,
  },
  forgotPasswordText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    lineHeight: 19.5,
    color: '#FFFFFF',
    textAlign: 'right',
  },
  loginButton: {
    backgroundColor: '#F39F29',
    borderRadius: 25,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 18,
    shadowColor: '#FDCB41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
    alignSelf: 'center',
    width: 144,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  footerContainer: {
    position: 'absolute',
    top: 650,
    left: 50,
    right: 50,
  },
  registerContainer: {
    marginTop: 25,
  },
  registerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    lineHeight: 19.5,
    color: '#FFFFFF',
    textAlign: 'left',
  },
  registerLink: {
    color: '#F39F29',
  },
});