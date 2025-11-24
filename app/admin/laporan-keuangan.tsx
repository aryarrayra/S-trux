import React, { useState, useEffect, JSX } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { TrendingUp, TrendingDown, Download } from 'lucide-react-native';
import Svg, { Path, G } from 'react-native-svg';
import { COLORS } from '@/constants/Colors';
import SideBar from '@/components/admin/SideBar';

// === PAKET EXPO UNTUK PDF ===
import * as Print from 'expo-print';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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
        categories: [],
    });
    const [loading, setLoading] = useState(true);

    // Request izin simpan file (hanya sekali)
    useEffect(() => {
        (async () => {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Izin Ditolak', 'Aplikasi butuh izin untuk menyimpan PDF');
            }
        })();
    }, []);

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
            Alert.alert('Error', 'Gagal mengambil data, menggunakan data contoh');

            // Mock data kalau server mati
            setData({
                totalPendapatan: 18250000,
                categories: [
                    { name: 'Sewa Crane', percentage: 42, color: '#F59E0B', total_pendapatan: 7665000 },
                    { name: 'Sewa Alat Berat', percentage: 28, color: '#10B981', total_pendapatan: 5110000 },
                    { name: 'Sewa Truk', percentage: 18, color: '#3B82F6', total_pendapatan: 3285000 },
                    { name: 'Lainnya', percentage: 12, color: '#EF4444', total_pendapatan: 2190000 },
                ],
            });
        } finally {
            setLoading(false);
        }
    };

    const formatRupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

    // ====================== EXPORT PDF ======================
    const generateHtml = (data: Data, period: string) => {
        const rows = data.categories
            .map(
                (cat) => `
            <tr>
                <td style="padding:12px 0; border-bottom:1px solid #eee;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="width:16px; height:16px; background:${cat.color}; border-radius:4px;"></div>
                        <span style="font-weight:600;">${cat.name}</span>
                    </div>
                </td>
                <td style="text-align:right; font-weight:600;">${formatRupiah(
                    cat.total_pendapatan || 0
                )}</td>
                <td style="text-align:center;">${cat.percentage}%</td>
            </tr>`
            )
            .join('');

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Keuangan - ${period}</title>
    <style>
        body { font-family: Arial, sans-serif; padding:40px; background:#f9f9f9; color:#333; }
        .header { text-align:center; margin-bottom:40px; }
        .header h1 { color:#F59E0B; margin:0; font-size:28px; }
        .header p { margin:8px 0; color:#666; font-size:16px; }
        .summary { background:white; padding:25px; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.1); margin-bottom:30px; }
        .total { font-size:32px; font-weight:bold; color:#F59E0B; }
        table { width:100%; border-collapse:collapse; background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.1); }
        th { background:#F59E0B; color:white; padding:16px; text-align:left; }
        th:nth-child(2), td:nth-child(2) { text-align:right; }
        th:nth-child(3), td:nth-child(3) { text-align:center; }
        .footer { margin-top:60px; text-align:center; color:#999; font-size:12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laporan Keuangan</h1>
        <p>Periode: <strong>${period}</strong></p>
        <p>${new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })}</p>
    </div>

    <div class="summary">
        <table>
            <tr><td><strong>Total Pendapatan</strong></td><td class="total">${formatRupiah(
            data.totalPendapatan
        )}</td></tr>
            <tr><td><strong>Jumlah Kategori</strong></td><td>${data.categories.length} kategori</td></tr>
        </table>
    </div>

    <table>
        <thead>
            <tr>
                <th>Kategori</th>
                <th>Jumlah</th>
                <th>Persentase</th>
            </tr>
        </thead>
        <tbody>${rows}</tbody>
    </table>

    <div class="footer">
        Dicetak melalui Aplikasi S-Trux • ${new Date().toLocaleString('id-ID')}
    </div>
</body>
</html>`;
    };

    const exportToPDF = async () => {
        try {
            const html = generateHtml(data, period);

            const { uri } = await Print.printToFileAsync({ html });

            const fileName = `Laporan_Keuangan_${period.replace(/ /g, '_')}_${new Date()
                .toISOString()
                .slice(0, 10)}.pdf`;
            const destination = `${FileSystem.documentDirectory}${fileName}`;

            await FileSystem.moveAsync({ from: uri, to: destination });
            await MediaLibrary.saveToLibraryAsync(destination);

            Alert.alert('Berhasil!', `${fileName}\nTersimpan di folder Downloads`, [
                { text: 'OK' },
                { text: 'Buka PDF', onPress: () => Sharing.shareAsync(destination) },
            ]);
        } catch (err) {
            console.error(err);
            Alert.alert('Gagal', 'Tidak bisa membuat PDF. Pastikan izin penyimpanan diizinkan.');
        }
    };
    // ======================================================

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
                            year: 'numeric',
                        })}{' '}
                        WIB
                    </Text>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity style={styles.periodBtn} onPress={() => setShowDropdown(true)}>
                        <Text style={styles.periodText}>{period}</Text>
                        <Text style={{ marginLeft: 8 }}>▼</Text>
                    </TouchableOpacity>

                    {/* Tombol Export PDF */}
                    <TouchableOpacity style={styles.exportBtn} onPress={exportToPDF}>
                        <Download color="#fff" size={20} />
                        <Text style={styles.exportBtnText}> Export PDF</Text>
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

                            {/* Chart + Legend */}
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
                            {['1 bulan terakhir', '3 bulan terakhir', '6 bulan terakhir', '1 tahun terakhir'].map(
                                (p) => (
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
                                )
                            )}
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        </View>
    );
}

// ========================== PIE CHART + LEGEND ==========================
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

        const path = `M ${center},${center} L ${x1},${y1} A ${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`;
        segments.push(
            <Path key={cat.name} d={path} fill={cat.color} stroke="#fff" strokeWidth={3} />
        );

        // Label persen di dalam
        const midAngle = startAngle + sliceAngle / 2;
        const midRad = (midAngle - 90) * Math.PI / 180;
        const labelRadius = radius * 0.7;
        const lx = center + labelRadius * Math.cos(midRad);
        const ly = center + labelRadius * Math.sin(midRad);

        if (cat.percentage >= 5) {
            labelsInside.push({ x: lx, y: ly, percent: cat.percentage });
        }

        startAngle = endAngle;
    });

    return (
        <View style={styles.pieRow}>
            <View style={{ position: 'relative' }}>
                <Svg width={260} height={260} viewBox="0 0 260 260">
                    <G>{segments}</G>
                </Svg>
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

    controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    periodBtn: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
        alignItems: 'center',
    },
    periodText: { fontSize: 14, color: '#333' },

    exportBtn: {
        flexDirection: 'row',
        backgroundColor: '#F59E0B',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        gap: 8,
    },
    exportBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

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