import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
  ScrollView,
  Platform,
} from 'react-native';
import Constants from 'expo-constants';
import { COLORS } from '@/constants/Colors';
import Loading from '@/components/common/Loading';
import Hero from '@/components/landing/Hero';
import Fleet from '@/components/landing/Fleet';
import WhyChooseUs from '@/components/landing/WhyChooseUs';
import Milestones from '@/components/landing/Milestones';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import BlurryGlow from '@/components/common/BlurryGlow';

export default function LandingScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 992;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate asset loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.mainWrapper}>
      <BlurryGlow style={{ top: 800, left: -400 }} />
      <BlurryGlow style={{ top: 1700, right: -400 }} />
      <BlurryGlow style={{ top: 2500, left: -300 }} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Hero isDesktop={isDesktop} />
        <Fleet />
        <WhyChooseUs />
        <Milestones />
        <CTA />
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: COLORS.darkGray,
    paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight : 0,
  },
  scrollContainer: {
    backgroundColor: 'transparent',
  },
});
