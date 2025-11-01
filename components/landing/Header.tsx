import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { NAV_LINKS } from '@/constants/data';

interface HeaderProps {
  isDesktop: boolean;
}

const Header = ({ isDesktop }: HeaderProps) => (
  <View style={styles.headerContainer}>
    <View style={styles.logoContainer}>
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>ST</Text>
      </View>
      <Text style={styles.headerLogoBrand}>S`Trux</Text>
    </View>
    {isDesktop && (
      <View style={styles.navContainer}>
        {NAV_LINKS.map((link) => (
          <TouchableOpacity key={link}>
            <Text style={styles.navLink}>{link}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
    <Link href="/login" asChild>
      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
    </Link>
  </View>
);

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerLogoBrand: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: COLORS.white,
  },
  navContainer: {
    flexDirection: 'row',
    gap: 30,
  },
  navLink: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: COLORS.white,
  },
  loginButton: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 25,
  },
  loginButtonText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 15,
    color: COLORS.white,
  },
});

export default Header;
