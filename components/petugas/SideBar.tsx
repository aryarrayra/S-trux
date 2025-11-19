// components/petugas/Sidebar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { LayoutDashboard, Package, Wrench, History, LogOut } from 'lucide-react-native';

const MENU = [
    { name: 'Dashboard', icon: LayoutDashboard, route: '/petugas/dashboard' as const },
    { name: 'Pengantaran', icon: Package, route: '/petugas/pengantaran' as const },
    { name: 'Service Alat', icon: Wrench, route: '/petugas/service-alat' as const },
    { name: 'Riwayat bayar', icon: History, route: '/petugas/riwayat-bayar' as const },
] as const;

export default function PetugasSidebar() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <View style={styles.sidebar}>
            {/* LOGO ST - KLIK KE DASHBOARD */}
            <TouchableOpacity
                style={styles.logo}
                onPress={() => router.push('/petugas/dashboard')}
                activeOpacity={0.7}
            >
                <View style={styles.logoBox}>
                    <Text style={styles.logoST}>ST</Text>
                </View>
                <Text style={styles.logoBrand}>S`Trux</Text>
            </TouchableOpacity>

            {/* MENU */}
            <View style={styles.menu}>
                {MENU.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.route;

                    return (
                        <TouchableOpacity
                            key={item.name}
                            style={[styles.menuItem, active && styles.active]}
                            onPress={() => router.push(item.route)}
                        >
                            <Icon size={24} color={active ? '#000' : '#FFF'} />
                            <Text style={[styles.menuText, active && styles.activeText]}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* LOGOUT */}
            <View style={styles.bottom}>
                <View style={styles.separator} />
                <TouchableOpacity style={styles.logout}>
                    <Text style={styles.logoutText}>Logout</Text>
                    <LogOut size={22} color="#F59E0B" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sidebar: {
        width: 280,
        backgroundColor: '#1F1F1F',
        paddingVertical: 40,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        borderRightWidth: 0, // sudah rapih tanpa border kuning
    },
    logo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 60,
    },
    logoBox: {
        width: 48,
        height: 48,
        backgroundColor: '#F59E0B',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoST: { fontSize: 20, fontWeight: 'bold', color: '#000' },
    logoBrand: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
    menu: { gap: 10 },
    menuItem: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12 },
    active: { backgroundColor: '#F59E0B' },
    menuText: { fontSize: 15.5, color: '#FFF', fontWeight: '500' },
    activeText: { color: '#000', fontWeight: '600' },
    bottom: { marginTop: 'auto' },
    separator: { height: 1, backgroundColor: '#444', marginBottom: 20 },
    logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
    logoutText: { fontSize: 16, color: '#F59E0B', fontWeight: '600' },
});