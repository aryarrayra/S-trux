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
  Dimensions,
} from 'react-native';
import { User, Lock, Eye, EyeOff } from 'lucide-react-native';
import { router } from 'expo-router';

const { height, width } = Dimensions.get('window');

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
  const scrollViewRef = useRef<ScrollView>(null);

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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (username && password.length >= 6) {
        console.log('User login successful');
        
        setIsTransitioning(true);
        
        // Fade out seluruh container login
        Animated.timing(containerAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          // Setelah login view menghilang, mulai animasi titik oranye
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
    // Animasi titik kecil -> membesar memenuhi layar -> fade out
    Animated.sequence([
      // Zoom in dan fade out bersamaan
      Animated.parallel([
        // Zoom in dari titik kecil ke besar
        Animated.timing(orangeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ])
    ]).start(() => {
      // Setelah animasi selesai, navigasi ke dashboard
      router.replace('/user/dashboarduser');
    });
  };

  const handleForgotPassword = () => {
    Alert.alert('Lupa Password', 'Fitur reset password akan segera tersedia');
  };

  const handleRegister = () => {
    router.push('/user/register');
  };

  // Handle keyboard show/hide
  const handleFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 100, animated: true });
    }, 100);
  };

  // Interpolasi untuk animasi titik oranye
  const orangeEllipseScale = orangeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(width, height) * 2], // Dari titik kecil -> sangat besar
  });

  const orangeEllipseOpacity = orangeAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 0.8, 0], // Tetap terlihat -> mulai fade out -> hilang
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -500}
        >
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* Animasi Titik Oranye */}
            <Animated.View 
              style={[
                styles.orangeEllipse,
                {
                  transform: [
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
                      onFocus={handleFocus}
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
                      onFocus={handleFocus}
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
    minHeight: height,
    justifyContent: 'center',
  },
  loginContent: {
    flex: 1,
    justifyContent: 'center',
  },
  // Animasi Titik Oranye
  orangeEllipse: {
    position: 'absolute',
    width: 1, // Mulai dari titik sangat kecil
    height: 1,
    borderRadius: 0.5,
    backgroundColor: '#F39F29',
    alignSelf: 'center',
    top: height / 2, // Posisi di tengah layar
    left: width / 2,
    zIndex: 10,
  },
  ellipseBackground: {
    position: 'absolute',
    width: 900,
    height: 900,
    borderRadius: 450,
    backgroundColor: '#0F0E0E',
    left: -260,
    top: 200,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 160,
    marginTop: 0,
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
    lineHeight: 20,
    color: '#645959ff',
    marginTop: 2,
  },
  formContainer: {
    paddingHorizontal: 50,
    marginBottom: 10,
  },
  inputWrapper: {
    marginBottom: 25,
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    lineHeight: 15,
    color: '#FFFFFF',
    marginBottom: 5,
    marginLeft: 15,
  },
  inputContainer: {
    height: 45,
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
    fontSize: 12,
    color: '#FFFFFF',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 5,
    marginBottom: 20,
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
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
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
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 50,
  },
  registerContainer: {
    marginTop: 10,
  },
  registerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    lineHeight: 19.5,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  registerLink: {
    color: '#F39F29',
  },
});