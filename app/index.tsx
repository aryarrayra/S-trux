import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
  ScrollView,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import Constants from 'expo-constants';
import { COLORS } from '@/constants/Colors';
import Loading from '@/components/common/Loading';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Fleet from '@/components/landing/Fleet';
import WhyChooseUs from '@/components/landing/WhyChooseUs';
import Milestones from '@/components/landing/Milestones';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import BlurryGlow from '@/components/common/BlurryGlow';

export default function LandingScreen() {
  const { width, height } = useWindowDimensions();
  const isDesktop = width > 992;
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('beranda');
  const scrollViewRef = useRef<ScrollView>(null);

  // Store Y positions of each section
  const [sectionPositions, setSectionPositions] = useState({
    beranda: 0,
    'alat-berat': 0,
    keunggulan: 0,
    kontak: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleLayout = (sectionId: keyof typeof sectionPositions) => (event: LayoutChangeEvent) => {
    const { y } = event.nativeEvent.layout;
    console.log(`Section ${sectionId} position:`, y);
    setSectionPositions(prev => ({
      ...prev,
      [sectionId]: y,
    }));
  };

  const handleNavigate = (sectionId: string) => {
    console.log('Navigating to:', sectionId);

    const yPosition = sectionPositions[sectionId as keyof typeof sectionPositions];

    console.log('Scrolling to Y:', yPosition);

    if (scrollViewRef.current && yPosition !== undefined) {
      // Kurangi 80 (tinggi header) agar tidak tertutup header
      const scrollPosition = yPosition > 80 ? yPosition - 80 : yPosition;

      scrollViewRef.current.scrollTo({
        y: scrollPosition,
        animated: true,
      });
      setActiveSection(sectionId);
    }
  };

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;

    // Auto-detect active section based on scroll position
    const sections = Object.entries(sectionPositions).sort((a, b) => a[1] - b[1]);

    for (let i = sections.length - 1; i >= 0; i--) {
      const [sectionId, position] = sections[i];
      if (scrollY >= position - 100) { // 100px offset untuk lebih smooth
        if (activeSection !== sectionId) {
          setActiveSection(sectionId);
        }
        break;
      }
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.mainWrapper}>
      <Header
        isDesktop={isDesktop}
        onNavigate={handleNavigate}
        activeSection={activeSection}
      />

      <BlurryGlow style={{ top: 800, left: -400 }} />
      <BlurryGlow style={{ top: 1700, right: -400 }} />
      <BlurryGlow style={{ top: 2500, left: -300 }} />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View onLayout={handleLayout('beranda')}>
          <Hero isDesktop={isDesktop} />
        </View>

        <View onLayout={handleLayout('alat-berat')}>
          <Fleet />
        </View>

        <View onLayout={handleLayout('keunggulan')}>
          <WhyChooseUs />
          <Milestones />
        </View>

        <View onLayout={handleLayout('kontak')}>
          <CTA />
          <Footer />
        </View>
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
    paddingTop: 80, // Sesuai tinggi header
  },
});