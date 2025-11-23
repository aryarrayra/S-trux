import React, { useState, useEffect, JSX } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    Alert
} from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import Svg, { Path, G } from 'react-native-svg';
import { COLORS } from '@/constants/Colors';
import SideBar from '@/components/admin/SideBar';

const API_URL = 'http://127.0.0.1:8000/api/laporan-keuangan';

interface Category {
    name: string;
    percentage: number;
    color: string;
    total_pendapatan?: number;
}

interface Data {
    totalPendapatan: number;
    categories: Category[];
}

export default function LaporanKeuangan() {
    const [period, setPeriod] = useState('6 bulan terakhir');
    const [showDropdown, setShowDropdown] = useState(false);
    const [data, setData] = useState<Data>({
        totalPendapatan: 0,
        categories: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}?period=${encodeURIComponent(period)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();

            if (json.success) {
                setData(json.data);
            } else {
                throw new Error(json.message || 'Data tidak ditemukan');
            }
        } catch (e) {
            console.error('Fetch error:', e);
            Alert.alert('Error', 'Gagal mengambil data dari server');

            // Mock data fallback
            setData({
                totalPendapatan: 18250000,
                categories: [
                    { name: 'Sewa Crane', percentage: 42, color: '#F59E0B', total_pendapatan: 7665000 },
                    { name: 'Sewa Alat Berat', percentage: 28, color: '#10B981', total_pendapatan: 5110000 },
                    { name: 'Sewa Truk', percentage: 18, color: '#3B82F6', total_pendapatan: 3285000 },
                    { name: 'Lainnya', percentage: 12, color: '#EF4444', total_pendapatan: 2190000 }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    const formatRupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

    return (
        <View style={styles.container}>
            <SideBar />
            <View style={styles.main}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Laporan Keuangan</Text>
                        <Text style={styles.subtitle}>Monitor pendapatan dan pengeluaran bisnis</Text>
                    </View>
                    <Text style={styles.date}>
                        {new Date().toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })} WIB
                    </Text>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity
                        style={styles.periodBtn}
                        onPress={() => setShowDropdown(true)}
                    >
                        <Text style={styles.periodText}>{period}</Text>
                        <Text style={{ marginLeft: 8 }}>▼</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#F59E0B" />
                            <Text style={styles.loadingText}>Memuat data laporan...</Text>
                        </View>
                    ) : (
                        <>
                            {/* Card Pendapatan & Pengeluaran */}
                            <View style={styles.cards}>
                                <View style={styles.cardIncome}>
                                    <View style={styles.cardHead}>
                                        <Text style={styles.cardTitle}>Total Pendapatan</Text>
                                        <TrendingUp color="#D97706" size={24} />
                                    </View>
                                    <Text style={styles.amount}>{formatRupiah(data.totalPendapatan)}</Text>
                                    <Text style={styles.cardSubtitle}>
                                        {data.categories.length} kategori pendapatan
                                    </Text>
                                </View>

                                <View style={styles.cardExpense}>
                                    <View style={styles.cardHead}>
                                        <Text style={[styles.cardTitle, { color: '#fff' }]}>Total Pengeluaran</Text>
                                        <TrendingDown color="#fff" size={24} />
                                    </View>
                                    <Text style={[styles.amount, { color: '#fff' }]}>Rp 0</Text>
                                    <Text style={[styles.cardSubtitle, { color: '#fff' }]}>
                                        Data pengeluaran belum tersedia
                                    </Text>
                                </View>
                            </View>

                            {/* Chart + Legend Berjejer */}
                            <View style={styles.chartCard}>
                                <Text style={styles.chartTitle}>
                                    Pendapatan per Kategori - {period}
                                </Text>

                                <View style={styles.chartContainer}>
                                    <PieChart data={data} />
                                </View>
                            </View>
                        </>
                    )}
                </ScrollView>

                {/* Dropdown Periode */}
                <Modal transparent visible={showDropdown} onRequestClose={() => setShowDropdown(false)}>
                    <TouchableOpacity
                        style={styles.overlay}
                        activeOpacity={1}
                        onPress={() => setShowDropdown(false)}
                    >
                        <View style={styles.dropdown}>
                            {['1 bulan terakhir', '3 bulan terakhir', '6 bulan terakhir', '1 tahun terakhir'].map(p => (
                                <TouchableOpacity
                                    key={p}
                                    style={styles.item}
                                    onPress={() => {
                                        setPeriod(p);
                                        setShowDropdown(false);
                                    }}
                                >
                                    <Text style={styles.itemText}>{p}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        </View>
    );
}

// ========================== PIE CHART + LEGEND BERJEJER ==========================
const PieChart = ({ data }: { data: Data }) => {
    const total = data.totalPendapatan || 0;
    const radius = 110;
    const center = 130;
    let startAngle = 0;

    const categories = data.categories.length > 0
        ? data.categories
        : [{ name: 'Belum Ada Data', percentage: 100, color: '#CCCCCC' }];

    const segments: JSX.Element[] = [];
    const labelsInside: { x: number; y: number; percent: number }[] = [];

    categories.forEach((cat) => {
        const sliceAngle = (cat.percentage / 100) * 360;
        const endAngle = startAngle + sliceAngle;
        const largeArc = sliceAngle > 180 ? 1 : 0;

        const startRad = (startAngle - 90) * Math.PI / 180;
        const endRad = (endAngle - 90) * Math.PI / 180;

        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);

        const path = `
            M ${center},${center}
            L ${x1},${y1}
            A ${radius},${radius} 0 ${largeArc},1 ${x2},${y2}
            Z
        `;

        segments.push(
            <Path key={cat.name} d={path} fill={cat.color} stroke="#fff" strokeWidth={3} />
        );

        // Label persen di dalam pie
        const midAngle = startAngle + sliceAngle / 2;
        const midRad = (midAngle - 90) * Math.PI / 180;
        const labelRadius = radius * 0.7;
        const lx = center + labelRadius * Math.cos(midRad);
        const ly = center + labelRadius * Math.sin(midRad);

        if (cat.percentage >= 5) { // hanya tampilkan jika >=5%
            labelsInside.push({ x: lx, y: ly, percent: cat.percentage });
        }

        startAngle = endAngle;
    });

    return (
        <View style={styles.pieRow}>
            {/* PIE CHART */}
            <View style={{ position: 'relative' }}>
                <Svg width={260} height={260} viewBox="0 0 260 260">
                    <G>{segments}</G>
                </Svg>

                {/* Label persen di dalam */}
                {labelsInside.map((lbl, i) => (
                    <View
                        key={i}
                        style={{
                            position: 'absolute',
                            left: lbl.x - 22,
                            top: lbl.y - 14,
                        }}
                    >
                        <Text style={styles.percentLabel}>{lbl.percent}%</Text>
                    </View>
                ))}
            </View>

            {/* TOTAL + LEGEND DI KANAN */}
            <View style={styles.rightSection}>
                <Text style={styles.totalText}>{formatRupiah(total)}</Text>
                <Text style={styles.totalLabel}>Total Pendapatan</Text>

                <View style={styles.legendContainer}>
                    {categories.map((cat, idx) => (
                        <View key={idx} style={styles.legendRow}>
                            <View style={[styles.legendBox, { backgroundColor: cat.color }]} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.legendName}>{cat.name}</Text>
                                <Text style={styles.legendAmount}>
                                    {formatRupiah(cat.total_pendapatan || 0)} ({cat.percentage}%)
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

const formatRupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

// ========================== STYLES ==========================
const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: 'row', backgroundColor: '#F5F5F5' },
    main: { flex: 1, padding: 30 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#F59E0B' },
    subtitle: { fontSize: 14, color: '#666' },
    date: { fontSize: 16, color: '#333', textAlign: 'right' },
    controls: { flexDirection: 'row', marginBottom: 30 },
    periodBtn: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
        alignItems: 'center'
    },
    periodText: { fontSize: 14, color: '#333' },

    cards: { flexDirection: 'row', gap: 20, marginBottom: 30 },
    cardIncome: { flex: 1, backgroundColor: '#FEF3C7', padding: 24, borderRadius: 16 },
    cardExpense: { flex: 1, backgroundColor: '#F87171', padding: 24, borderRadius: 16 },
    cardHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    cardTitle: { fontSize: 16, fontWeight: '500', color: '#78350F' },
    amount: { fontSize: 28, fontWeight: 'bold', color: '#78350F', marginBottom: 8 },
    cardSubtitle: { fontSize: 12, color: '#A16207', opacity: 0.8 },

    chartCard: { backgroundColor: '#fff', borderRadius: 16, padding: 30, marginBottom: 20 },
    chartTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 30, textAlign: 'center' },
    chartContainer: { alignItems: 'center' },

    // Layout pie + legend berjejer
    pieRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 50 },

    rightSection: { minWidth: 260 },
    totalText: { fontSize: 32, fontWeight: 'bold', color: '#F59E0B' },
    totalLabel: { fontSize: 14, color: '#666', marginBottom: 20 },

    legendContainer: { gap: 12 },
    legendRow: { flexDirection: 'row', alignItems: 'center' },
    legendBox: { width: 16, height: 16, borderRadius: 4, marginRight: 12 },
    legendName: { fontSize: 14, fontWeight: '600', color: '#333' },
    legendAmount: { fontSize: 13, color: '#666' },

    percentLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },

    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', paddingTop: 150, paddingLeft: 220 },
    dropdown: { backgroundColor: '#fff', borderRadius: 8, minWidth: 220, elevation: 10 },
    item: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    itemText: { fontSize: 14, color: '#333' },

    loadingContainer: { marginTop: 100, alignItems: 'center' },
    loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
});