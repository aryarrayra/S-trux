// components/common/AnimatedSplashScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function AnimatedSplashScreen() {
  const router = useRouter();
  const [showFirst, setShowFirst] = useState(true);
  const firstAnimationRef = useRef<LottieView>(null);
  const secondAnimationRef = useRef<LottieView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Play first animation
    firstAnimationRef.current?.play();

    // Schedule transition
    const transitionTimer = setTimeout(() => {
      // Fade out first animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowFirst(false);
        // Fade in second animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          secondAnimationRef.current?.play();
        });
      });
    }, 3000); // Durasi animasi pertama

    // Schedule navigation
    const navigationTimer = setTimeout(() => {
      router.replace('/');
    }, 6000); // Total durasi

    return () => {
      clearTimeout(transitionTimer);
      clearTimeout(navigationTimer);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* First Animation */}
      <Animated.View style={[styles.animationContainer, { opacity: showFirst ? fadeAnim : 0 }]}>
        <LottieView
          ref={firstAnimationRef}
          source={require('../../assets/animation/splash-main.json')}
          style={styles.animation}
          loop={false}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Second Animation */}
      <Animated.View style={[styles.animationContainer, { opacity: showFirst ? 0 : fadeAnim }]}>
        <LottieView
          ref={secondAnimationRef}
          source={require('../../assets/animation/splash-welcome.json')}
          style={styles.animation}
          loop={false}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Blue Overlay untuk menutupi celah */}
      <View style={styles.blueOverlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000ff',
  },
  animationContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  animation: {
    width: width,
    height: height,
  },
  blueOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0066CC',
    zIndex: -1, // Di belakang animasi
  },
});