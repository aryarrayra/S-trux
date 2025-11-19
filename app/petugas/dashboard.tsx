// app/petugas/dashboard.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import PetugasSidebar from '@/components/petugas/SideBar';

export default function PetugasDashboardScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1024;

    const [currentDate, setCurrentDate] = useState({ full: '', time: '' });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentDate({
                full: now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
                time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const stats = { masuk: 45, dijadwalkan: 25, berjalan: 19, dibatalkan: 7 };
    const deliveryToday = [
        { no: 'STX0098', dest: 'Jln Bambu Hitam, Jakarta timur', company: 'PT Acong Makmur Jaya' },
        { no: 'STX0098', dest: 'Jln Bambu Hitam, Jakarta timur', company: 'PT Acong Makmur Jaya' },
        { no: 'STX0098', dest: 'Jln Bambu Hitam, Jakarta timur', company: 'PT Acong Makmur Jaya' },
    ];

    return (
        <View style={styles.container}>
            {/* SIDEBAR FIXED */}
            {isDesktop && <PetugasSidebar />}

            {/* KONTEN UTAMA – MULAI DARI SAMPING SIDEBAR */}
            <ScrollView style={[styles.content, isDesktop && styles.contentWithSidebar]}>
                {/* HEADER */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Dashboard Petugas</Text>
                        <Text style={styles.subtitle}>Selamat datang kembali, mari mulai pekerjaan hari ini!</Text>
                    </View>
                    <View style={styles.dateBox}>
                        <Text style={styles.dateDay}>{currentDate.full}</Text>
                        <Text style={styles.dateTime}>{currentDate.time}</Text>
                    </View>
                </View>

                {/* BAR CHART */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Pesanan</Text>
                    <View style={styles.barWrapper}>
                        {[
                            { label: 'Masuk', value: stats.masuk },
                            { label: 'Dijadwalkan', value: stats.dijadwalkan },
                            { label: 'Berjalan', value: stats.berjalan },
                            { label: 'Dibatalkan', value: stats.dibatalkan },
                        ].map((item) => (
                            <View key={item.label} style={styles.barItem}>
                                <View style={[styles.bar, { height: (item.value / 60) * 220 }]} />
                                <Text style={styles.barLabel}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* BOTTOM ROW */}
                <View style={styles.bottomRow}>
                    {/* DONUT */}
                    <View style={styles.donutCard}>
                        <View style={styles.donutContainer}>
                            <View style={styles.donutBg} />
                            <View style={styles.donutProgress}>
                                <View style={styles.donutProgressFill} />
                            </View>
                            <View style={styles.donutCenter} />
                        </View>
                        <View style={styles.legend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendBox, { backgroundColor: '#F59E0B' }]} />
                                <Text style={styles.legendText}>Diantar</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendBox, { backgroundColor: '#FFDA6A' }]} />
                                <Text style={styles.legendText}>Menunggu kurir</Text>
                            </View>
                        </View>
                    </View>

                    {/* JADWAL */}
                    <View style={styles.scheduleCard}>
                        <Text style={styles.scheduleTitle}>Jadwal pengiriman hari ini</Text>
                        {deliveryToday.map((item, i) => (
                            <View key={i} style={styles.scheduleItem}>
                                <View>
                                    <Text style={styles.scheduleNo}>{item.no} - {item.dest}</Text>
                                    <Text style={styles.scheduleCompany}>{item.company}</Text>
                                </View>
                                <ArrowRight size={22} color="#F59E0B" />
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5E6D3' },
    content: { flex: 1, paddingHorizontal: 40, paddingTop: 32 },
    contentWithSidebar: { marginLeft: 280 }, // EXACT MATCH SIDEBAR WIDTH

    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
    subtitle: { fontSize: 15, color: '#666', marginTop: 6 },
    dateBox: { alignItems: 'flex-end' },
    dateDay: { fontSize: 14, fontWeight: 'bold', color: '#F59E0B' },
    dateTime: { fontSize: 14, color: '#666' },

    chartCard: { backgroundColor: '#FFFCF5', borderRadius: 20, padding: 32, marginBottom: 24 },
    chartTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 32 },
    barWrapper: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 260 },
    barItem: { alignItems: 'center' },
    bar: { width: 80, backgroundColor: '#F59E0B', borderRadius: 8 },
    barLabel: { marginTop: 12, fontSize: 13, color: '#666' },

    bottomRow: { flexDirection: 'row', gap: 24 },

    donutCard: { flex: 1, backgroundColor: '#FFFCF5', borderRadius: 20, padding: 40, alignItems: 'center' },
    donutContainer: { width: 200, height: 200, position: 'relative' },
    donutBg: { ...StyleSheet.absoluteFillObject, borderRadius: 100, backgroundColor: '#FFDA6A' },
    donutProgress: { ...StyleSheet.absoluteFillObject, borderRadius: 100, overflow: 'hidden' },
    donutProgressFill: { width: '100%', height: '100%', backgroundColor: '#F59E0B', transform: [{ rotate: '130deg' }] },
    donutCenter: { position: 'absolute', top: 40, left: 40, width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFFCF5' },

    legend: { marginTop: 32, gap: 16 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    legendBox: { width: 16, height: 16, borderRadius: 4 },
    legendText: { fontSize: 14, color: '#333' },

    scheduleCard: { flex: 1, backgroundColor: '#FFFCF5', borderRadius: 20, paddingVertical: 32, paddingHorizontal: 28 },
    scheduleTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 24 },
    scheduleItem: { backgroundColor: '#FFF', padding: 18, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    scheduleNo: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    scheduleCompany: { fontSize: 13, color: '#888', marginTop: 4 },
});