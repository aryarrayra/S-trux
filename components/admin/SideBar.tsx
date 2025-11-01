import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { ADMIN_NAV_LINKS } from '@/constants/adminData';

const SideBar = () => {
  return (
    <View style={styles.sidebar}>
      <View>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>ST</Text>
          </View>
          <Text style={styles.logoBrand}>S`Trux</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.navContainer}>
          {ADMIN_NAV_LINKS.map((link, index) => (
            <TouchableOpacity key={index} style={styles.navLink}>
              <link.icon color={COLORS.white} size={24} />
              <Text style={styles.navLinkText}>{link.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View>
        <View style={styles.separator} />
        <Link href="/login" asChild>
          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
            <LogOut color={COLORS.primary} size={22} />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 294,
    backgroundColor: COLORS.sidebarBg,
    padding: 20,
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderRightColor: COLORS.primaryLight,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
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
    color: COLORS.white,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.primaryLight,
    marginVertical: 20,
  },
  navContainer: {
    gap: 25,
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingLeft: 10,
  },
  navLinkText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.white,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  logoutText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.primary,
  },
});

export default SideBar;
