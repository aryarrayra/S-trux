import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUp, ClipboardList } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { STATS } from '@/constants/data';
// HAPUS import Header from './Header'; ❌

interface HeroProps {
  isDesktop: boolean;
}

const Hero = ({ isDesktop }: HeroProps) => (
  <ImageBackground
    source={{ uri: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/056c/fa0c/f93a0aa8ed8b12baaa00cfb3f30136fe?Expires=1762732800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=iSMtCI7Dfx3eHsUx5NVp1bNq8Boxwct2lxu56asiVOjCgaF07HSwWeAUzoaFiisK~BHvHQL8PvxVpZuuBTnqUdzaj2Ik0e-qGQw~ux~A3jFCjccCfMITL5Rq0m5UBrAEfjtgsGWUozvNc2701Di~QTWoPfXrA4V3QjB2XOgiAnR0M8DPniiUVKa5irajdxDgzdsm-g4ubW9ZxLLOM~D9DPuXULbUBZPRPxPTfZErbRNaDjWi6UBP9F527zde4OdsuPHSn35K2isTlZ3DNU6FIXRJlM7Sh2gMcqyqZJNTjy8PwT7m9RoW0aOrP3rH9Vr~c1Gd7lfbsqiW1l-qnJpo1Q__' }}
    style={styles.heroBackground}
    resizeMode="cover"
  >
    <LinearGradient colors={['rgba(15,14,14,0.8)', 'rgba(15,14,14,1)']} style={StyleSheet.absoluteFill} />
    {/* HAPUS <Header isDesktop={isDesktop} /> ❌ */}
    <View style={[styles.heroContent, !isDesktop && styles.mobileHeroContent]}>
      <Text style={[styles.heroTitle, !isDesktop && styles.mobileHeroTitle]}>
        SOLUSI PENYEWAAN{'\n'}
        <Text style={{ color: COLORS.primary }}>ALAT BERAT PREMIUM</Text>{'\n'}
        UNTUK PROYEK ANDA
      </Text>
      <Text style={[styles.heroSubtitle, !isDesktop && styles.mobileHeroSubtitle]}>
        Tingkatkan produktivitas proyek konstruksi Anda dengan armada alat berat modern kami. Kualitas terjamin, harga kompetitif, dan layanan 24/7.
      </Text>
      <View style={[styles.heroButtons, !isDesktop && styles.mobileHeroButtons]}>
        <TouchableOpacity style={[styles.heroButton, styles.heroButtonPrimary]}>
          <Text style={styles.heroButtonText}>Mulai Sewa</Text>
          <ClipboardList color={COLORS.white} size={16} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.heroButton, styles.heroButtonSecondary]}>
          <Text style={[styles.heroButtonText, { color: COLORS.primary }]}>Jelajahi</Text>
          <ArrowUp color={COLORS.primary} size={16} />
        </TouchableOpacity>
      </View>
      <View style={[styles.statsContainer, !isDesktop && styles.mobileStatsContainer]}>
        {STATS.map((stat) => (
          <View key={stat.label} style={styles.statItem}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  </ImageBackground>
);

const styles = StyleSheet.create({
  heroBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
    display: 'flex',
  },
  heroContent: {
    alignSelf: 'center',
    maxWidth: 1200,
    width: '100%',
    marginTop: 100,
    paddingHorizontal: 10,
  },
  mobileHeroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 36,
    color: COLORS.white,
    lineHeight: 48,
  },
  mobileHeroTitle: {
    fontSize: 30,
    lineHeight: 42,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: 'Helvetica',
    fontSize: 24,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 20,
    lineHeight: 32,
  },
  heroInner: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileHeroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  heroButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 30,
    columnGap: 20,
  },
  mobileHeroButtons: {
    justifyContent: 'center',
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    gap: 8,
  },
  heroButtonPrimary: {
    backgroundColor: COLORS.primaryLight,
  },
  heroButtonSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  heroButtonText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: COLORS.white,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 40,
    marginTop: 60,
  },
  mobileStatsContainer: {
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 36,
    color: COLORS.primary,
  },
  statLabel: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 5,
  },
});

export default Hero;