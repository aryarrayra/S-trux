import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { TrendingUp, TrendingDown, Download } from 'lucide-react-native';
import Svg, { Path, G } from 'react-native-svg';
import { COLORS } from '@/constants/Colors';
import SideBar from '@/components/admin/SideBar';

const API_URL = 'http://192.168.1.100:8000/api/laporan-keuangan'; // GANTI IP KAMU

interface Category { name: string; percentage: number; color: string; }
interface Data { totalPendapatan: number; categories: Category[]; }
interface Label { name: string; persen: number; x: number; y: number; }

export default function LaporanKeuangan() {
    const [period, setPeriod] = useState('6 bulan terakhir');
    const [showDropdown, setShowDropdown] = useState(false);
    const [data, setData] = useState<Data>({ totalPendapatan: 0, categories: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, [period]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}?period=${encodeURIComponent(period)}`);
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch (e) { Alert.alert('Error', 'Gagal konek server'); }
        finally { setLoading(false); }
    };

    const formatRupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

    // PIE CHART
    const cx = 150, cy = 150, r = 140;
    let angle = 0;
    const segments: React.ReactElement[] = [];
    const labels: Label[] = [];

    const cats = data.categories.length ? data.categories : [{ name: 'Belum Ada Data', percentage: 100, color: '#CCCCCC' }];

    const polar = (a: number) => {
        const rad = (a - 90) * Math.PI / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };

    cats.forEach(c => {
        const slice = (c.percentage / 100) * 360;
        const end = angle + slice;
        const large = slice > 180 ? 1 : 0;
        const s = polar(angle);
        const e = polar(end);
        const d = `M${s.x.toFixed(2)},${s.y.toFixed(2)} A${r},${r} 0 ${large},1 ${e.x.toFixed(2)},${e.y.toFixed(2)} L${cx},${cy} Z`;
        segments.push(<Path key={c.name} d={d} fill={c.color} stroke="#fff" strokeWidth={3} />);

        const mid = angle + slice / 2;
        const labelR = r + (c.name.includes('Crane') || c.name.includes('Lainnya') ? 35 : 55);
        const rad = (mid - 90) * Math.PI / 180;
        const lx = cx + labelR * Math.cos(rad);
        const ly = cy + labelR * Math.sin(rad);
        labels.push({ name: c.name, persen: c.percentage, x: lx, y: ly });

        angle = end;
    });

    return (
        <View style={styles.container}>
            <SideBar />
            <View style={styles.main}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Laporan Keuangan</Text>
                        <Text style={styles.subtitle}>Monitor pendapatan dan pengeluaran bisnis</Text>
                    </View>
                    <Text style={styles.date}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} WIB</Text>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity style={styles.periodBtn} onPress={() => setShowDropdown(true)}>
                        <Text style={styles.periodText}>{period}</Text>
                        <Text style={{ marginLeft: 8 }}>▼</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.exportBtn}>
                        <Download color="#fff" size={18} />
                        <Text style={styles.exportText}>Ekspor PDF</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView>
                    {loading ? <ActivityIndicator size="large" color="#F59E0B" style={{ marginTop: 100 }} /> : (
                        <>
                            <View style={styles.cards}>
                                <View style={styles.cardIncome}>
                                    <View style={styles.cardHead}>
                                        <Text style={styles.cardTitle}>Total Pendapatan</Text>
                                        <TrendingUp color="#D97706" size={24} />
                                    </View>
                                    <Text style={styles.amount}>{formatRupiah(data.totalPendapatan)}</Text>
                                </View>
                                <View style={styles.cardExpense}>
                                    <View style={styles.cardHead}>
                                        <Text style={[styles.cardTitle, { color: '#fff' }]}>Total Pengeluaran</Text>
                                        <TrendingDown color="#fff" size={24} />
                                    </View>
                                    <Text style={[styles.amount, { color: '#fff' }]}>Rp 0</Text>
                                </View>
                            </View>

                            <View style={styles.chartCard}>
                                <Text style={styles.chartTitle}>Pendapatan per Kategori</Text>
                                <View style={{ alignItems: 'center' }}>
                                    <Svg width={300} height={300} viewBox="0 0 300 300">
                                        <G>{segments}</G>
                                    </Svg>
                                    {labels.map((l, i) => (
                                        <View key={i} style={[styles.label, { left: l.x - 55, top: l.y - 12 }]}>
                                            <Text style={styles.labelText}>{l.name} {l.persen}%</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </>
                    )}
                </ScrollView>

                <Modal transparent visible={showDropdown} onRequestClose={() => setShowDropdown(false)}>
                    <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowDropdown(false)}>
                        <View style={styles.dropdown}>
                            {['1 bulan terakhir', '3 bulan terakhir', '6 bulan terakhir', '1 tahun terakhir'].map(p => (
                                <TouchableOpacity key={p} style={styles.item} onPress={() => { setPeriod(p); setShowDropdown(false); }}>
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

const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: 'row', backgroundColor: '#F5F5F5' },
    main: { flex: 1, padding: 30 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#F59E0B' },
    subtitle: { fontSize: 14, color: '#666' },
    date: { fontSize: 16, color: '#333', textAlign: 'right' },
    controls: { flexDirection: 'row', gap: 15, marginBottom: 30 },
    periodBtn: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', alignItems: 'center' },
    periodText: { fontSize: 14, color: '#333' },
    exportBtn: { flexDirection: 'row', backgroundColor: '#FDB022', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, alignItems: 'center', gap: 8 },
    exportText: { color: '#fff', fontWeight: '500' },
    cards: { flexDirection: 'row', gap: 20, marginBottom: 30 },
    cardIncome: { flex: 1, backgroundColor: '#FEF3C7', padding: 24, borderRadius: 16 },
    cardExpense: { flex: 1, backgroundColor: '#F87171', padding: 24, borderRadius: 16 },
    cardHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    cardTitle: { fontSize: 16, fontWeight: '500', color: '#78350F' },
    amount: { fontSize: 28, fontWeight: 'bold', color: '#78350F', marginBottom: 8 },
    chartCard: { backgroundColor: '#fff', borderRadius: 16, padding: 30 },
    chartTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 30, textAlign: 'center' },
    label: { position: 'absolute' },
    labelText: { fontSize: 13, fontWeight: '500', color: '#F59E0B', backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', paddingTop: 150, paddingLeft: 220 },
    dropdown: { backgroundColor: '#fff', borderRadius: 8, minWidth: 220, elevation: 10 },
    item: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    itemText: { fontSize: 14, color: '#333' },
});