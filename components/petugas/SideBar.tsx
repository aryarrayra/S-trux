// components/petugas/SideBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { LogOut, LayoutDashboard, Package, Wrench, History } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import type { Href } from 'expo-router';

const PETUGAS_NAV_LINKS = [
    { icon: LayoutDashboard, text: 'Dashboard Petugas', route: '/petugas/dashboard' as const },
    { icon: Package, text: 'Pengantaran', route: '/petugas/pengantaran' as const },
    { icon: Wrench, text: 'Service Alat', route: '/petugas/service-alat' as const },
    { icon: History, text: 'Riwayat bayar', route: '/petugas/riwayat-bayar' as const },
] as const;

const SideBar = () => {
    const router = useRouter();
    const pathname = usePathname();

    const handleNavigation = (route: Href) => {
        router.push(route);
    };

    const isActive = (route: string) => {
        return pathname === route;
    };

    return (
        <View style={styles.sidebar}>
            <View>
                <TouchableOpacity
                    style={styles.logoContainer}
                    onPress={() => handleNavigation('/petugas/dashboard' as Href)}
                    activeOpacity={0.7}
                >
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText}>ST</Text>
                    </View>
                    <Text style={styles.logoBrand}>S'Trux</Text>
                </TouchableOpacity>
                <View style={styles.separator} />

                {/* Menu Items */}
                <View style={styles.navContainer}>
                    {PETUGAS_NAV_LINKS.map((link, index) => {
                        const IconComponent = link.icon;
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.navLink,
                                    isActive(link.route) && styles.navLinkActive
                                ]}
                                onPress={() => handleNavigation(link.route as Href)}
                            >
                                <IconComponent
                                    color={isActive(link.route) ? COLORS.darkGray : COLORS.white}
                                    size={24}
                                />
                                <Text style={[
                                    styles.navLinkText,
                                    isActive(link.route) && styles.navLinkTextActive
                                ]}>
                                    {link.text}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
            <View>
                <View style={styles.separator} />
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => router.push('/login' as Href)}
                >
                    <Text style={styles.logoutText}>Logout</Text>
                    <LogOut color={COLORS.primary} size={22} />
                </TouchableOpacity>
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
        paddingVertical: 10,
        paddingRight: 10,
        borderRadius: 8,
    },
    navLinkActive: {
        backgroundColor: COLORS.primary,
    },
    navLinkText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: COLORS.white,
    },
    navLinkTextActive: {
        color: COLORS.darkGray,
        fontWeight: '600',
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