import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated, Platform } from 'react-native';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import UserLoginScreen from '../../app/user/login';

const { width, height } = Dimensions.get('window');

export default function AnimatedSplashScreen() {
  const router = useRouter();
  const [showFirst, setShowFirst] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const firstAnimationRef = useRef<LottieView>(null);
  const secondAnimationRef = useRef<LottieView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const loginFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Play first animation
    firstAnimationRef.current?.play();

    // Schedule transition to second animation
    const transitionTimer = setTimeout(() => {
      // Fade out first animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowFirst(false);
        // Fade in second animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          secondAnimationRef.current?.play();
        });
      });
    }, 3000); // Durasi animasi pertama

    // Schedule transition to login screen
    const loginTimer = setTimeout(() => {
      // Fade out animations
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        // Show login screen with fade in
        setShowLogin(true);
        Animated.timing(loginFadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      });
    }, 5500); // Total durasi sebelum transition ke login

    return () => {
      clearTimeout(transitionTimer);
      clearTimeout(loginTimer);
    };
  }, []);

  // Jika web, redirect biasa tanpa animasi
  useEffect(() => {
    if (Platform.OS === 'web') {
      const timer = setTimeout(() => {
        router.replace('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Untuk web, tampilkan splash biasa
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.animationContainer, { opacity: fadeAnim }]}>
          <LottieView
            ref={firstAnimationRef}
            source={require('../../assets/animation/splash-main.json')}
            style={styles.animation}
            loop={false}
            resizeMode="cover"
          />
        </Animated.View>
      </View>
    );
  }

  // Untuk mobile: tampilkan animasi lengkap dengan transition ke login
  return (
    <View style={styles.container}>
      {/* Animations Container */}
      <Animated.View style={[styles.animationsContainer, { opacity: fadeAnim }]}>
        {/* First Animation */}
        <Animated.View style={[styles.animationContainer, { opacity: showFirst ? 1 : 0 }]}>
          <LottieView
            ref={firstAnimationRef}
            source={require('../../assets/animation/splash-main.json')}
            style={styles.animation}
            loop={false}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Second Animation */}
        <Animated.View style={[styles.animationContainer, { opacity: showFirst ? 0 : 1 }]}>
          <LottieView
            ref={secondAnimationRef}
            source={require('../../assets/animation/splash-welcome.json')}
            style={styles.animation}
            loop={false}
            resizeMode="cover"
          />
        </Animated.View>
      </Animated.View>

      {/* Login Screen dengan fade in */}
      {showLogin && (
        <Animated.View style={[styles.loginContainer, { opacity: loginFadeAnim }]}>
          <UserLoginScreen />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  animationsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  animationContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: width,
    height: height,
  },
  loginContainer: {
    ...StyleSheet.absoluteFillObject,
  },
});