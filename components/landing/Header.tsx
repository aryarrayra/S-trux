import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { NAV_LINKS } from '@/constants/data';

interface HeaderProps {
  isDesktop: boolean;
  onNavigate?: (sectionId: string) => void;
  activeSection?: string;
}

const Header = ({ isDesktop, onNavigate, activeSection = 'beranda' }: HeaderProps) => {
  const handleNavClick = (sectionId: string) => {
    console.log('Nav clicked:', sectionId);
    if (onNavigate) {
      onNavigate(sectionId);
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.contentWrapper}>
        {/* Logo */}
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => handleNavClick('beranda')}
          activeOpacity={0.8}
        >
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>ST</Text>
          </View>
          <Text style={styles.headerLogoBrand}>S'Trux</Text>
        </TouchableOpacity>

        {/* Navigation Links - Only show on desktop */}
        {isDesktop && (
          <View style={styles.navContainer}>
            {NAV_LINKS.map((link) => (
              <TouchableOpacity
                key={link.id}
                style={styles.navLinkButton}
                onPress={() => handleNavClick(link.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.navLink,
                    activeSection === link.id && styles.navLinkActive
                  ]}
                >
                  {link.label}
                </Text>
                {activeSection === link.id && (
                  <View style={styles.activeIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Login Button */}
        <Link href="/login" asChild>
          <TouchableOpacity style={styles.loginButton} activeOpacity={0.8}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Lebih solid, tidak terlalu transparan
    backdropFilter: 'blur(10px)', // Efek blur di web
  },
  contentWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    maxWidth: 1440,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    fontWeight: '600',
  },
  headerLogoBrand: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 22,
    color: COLORS.white,
    fontWeight: '600',
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
    flex: 2,
    justifyContent: 'center',
  },
  navLinkButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    position: 'relative',
  },
  navLink: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '500',
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  navLinkActive: {
    opacity: 1,
    color: COLORS.primary,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: COLORS.darkGray,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default Header;