import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Modal, 
    ActivityIndicator, 
    Alert,
    Platform,
    Linking
} from 'react-native';
import { TrendingUp, TrendingDown, Download } from 'lucide-react-native';
import Svg, { Path, G } from 'react-native-svg';
import { COLORS } from '@/constants/Colors';
import SideBar from '@/components/admin/SideBar';

const API_URL = 'http://127.0.0.1:8000/api/laporan-keuangan';
const DOWNLOAD_URL = 'http://127.0.0.1:8000/api/pembayaran/download-pdf';

interface Category { 
    name: string; 
    percentage: number; 
    color: string; 
    total_pendapatan?: number;
    total_sewa?: number;
}

interface Data { 
    totalPendapatan: number; 
    categories: Category[]; 
}

interface Label { 
    name: string; 
    persen: number; 
    x: number; 
    y: number; 
}

export default function LaporanKeuangan() {
    const [period, setPeriod] = useState('6 bulan terakhir');
    const [showDropdown, setShowDropdown] = useState(false);
    const [data, setData] = useState<Data>({ 
        totalPendapatan: 0, 
        categories: [] 
    });
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => { 
        fetchData(); 
    }, [period]);

    const fetchData = async () => {
        setLoading(true);
        try {
            console.log('🟡 Fetching data for period:', period);
            const res = await fetch(`${API_URL}?period=${encodeURIComponent(period)}`);
            
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            
            const json = await res.json();
            console.log('🟡 API Response:', json);
            
            if (json.success) {
                setData(json.data);
            } else {
                throw new Error(json.message || 'Data tidak ditemukan');
            }
        } catch (e: any) { 
            console.error('❌ Fetch error:', e);
            Alert.alert('Error', 'Gagal mengambil data dari server');
            
            // Fallback ke mock data
            setData({
                totalPendapatan: 18250000,
                categories: [
                    { name: 'Sewa Crane', percentage: 42, color: '#F59E0B', total_pendapatan: 7665000 },
                    { name: 'Sewa Alat Berat', percentage: 28, color: '#10B981', total_pendapatan: 5110000 },
                    { name: 'Sewa Truk', percentage: 18, color: '#3B82F6', total_pendapatan: 3285000 },
                    { name: 'Lainnya', percentage: 12, color: '#EF4444', total_pendapatan: 2190000 }
                ]
            });
        }
        finally { 
            setLoading(false); 
        }
    };

    const formatRupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

    const handleExportPDF = async () => {
        try {
            Alert.alert(
                'Download PDF',
                `Download laporan keuangan untuk periode "${period}"?`,
                [
                    {
                        text: 'Download PDF',
                        onPress: () => downloadPDF()
                    },
                    {
                        text: 'Batal',
                        style: 'cancel'
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Gagal memulai download');
        }
    };

    const downloadPDF = async () => {
        try {
            setDownloading(true);
            
            const downloadUrl = `${DOWNLOAD_URL}?period=${encodeURIComponent(period)}`;
            console.log('📥 Download URL:', downloadUrl);

            // Cek apakah bisa buka URL
            const supported = await Linking.canOpenURL(downloadUrl);
            
            if (supported) {
                // Buka di browser untuk download
                await Linking.openURL(downloadUrl);
                
                Alert.alert(
                    'Download Dimulai',
                    `PDF laporan untuk periode "${period}" sedang didownload di browser.\n\nSetelah download selesai, Anda bisa kembali ke aplikasi.`,
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert(
                    'Error',
                    `Tidak bisa membuka URL download.\n\nSilakan buka link manual:\n${downloadUrl}`,
                    [{ text: 'OK' }]
                );
            }

        } catch (error: any) {
            console.error('❌ Download error:', error);
            Alert.alert('Error', `Gagal membuka URL download: ${error.message}`);
        } finally {
            setDownloading(false);
        }
    };

    // Fungsi untuk generate pie chart segments
    const generatePieChart = () => {
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

        return { segments, labels };
    };

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
                    
                    <TouchableOpacity 
                        style={[
                            styles.exportBtn, 
                            downloading && styles.exportBtnDisabled
                        ]} 
                        onPress={handleExportPDF}
                        disabled={downloading}
                    >
                        {downloading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Download color="#fff" size={18} />
                        )}
                        <Text style={styles.exportText}>
                            {downloading ? 'Membuka...' : 'Ekspor PDF'}
                        </Text>
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
                            <View style={styles.cards}>
                                <View style={styles.cardIncome}>
                                    <View style={styles.cardHead}>
                                        <Text style={styles.cardTitle}>Total Pendapatan</Text>
                                        <TrendingUp color="#D97706" size={24} />
                                    </View>
                                    <Text style={styles.amount}>
                                        {formatRupiah(data.totalPendapatan)}
                                    </Text>
                                    <Text style={styles.cardSubtitle}>
                                        {data.categories.length} kategori pendapatan
                                    </Text>
                                </View>
                                
                                <View style={styles.cardExpense}>
                                    <View style={styles.cardHead}>
                                        <Text style={[styles.cardTitle, { color: '#fff' }]}>
                                            Total Pengeluaran
                                        </Text>
                                        <TrendingDown color="#fff" size={24} />
                                    </View>
                                    <Text style={[styles.amount, { color: '#fff' }]}>
                                        Rp 0
                                    </Text>
                                    <Text style={[styles.cardSubtitle, { color: '#fff' }]}>
                                        Data pengeluaran belum tersedia
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.chartCard}>
                                <Text style={styles.chartTitle}>Pendapatan per Kategori - {period}</Text>
                                <View style={{ alignItems: 'center' }}>
                                    <PieChart data={data} />
                                </View>
                                
                                <View style={styles.legend}>
                                    {data.categories.map((category, index) => (
                                        <View key={index} style={styles.legendItem}>
                                            <View 
                                                style={[
                                                    styles.legendColor, 
                                                    { backgroundColor: category.color }
                                                ]} 
                                            />
                                            <Text style={styles.legendText}>
                                                {category.name} ({category.percentage}%) - {formatRupiah(category.total_pendapatan || 0)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Tambahkan info download */}
                            <View style={styles.infoCard}>
                                <Text style={styles.infoTitle}>💡 Cara Download PDF</Text>
                                <Text style={styles.infoText}>
                                    1. Klik tombol "Ekspor PDF" di atas{'\n'}
                                    2. Aplikasi akan membuka browser{'\n'}
                                    3. PDF akan otomatis terdownload{'\n'}
                                    4. Setelah selesai, kembali ke aplikasi
                                </Text>
                            </View>
                        </>
                    )}
                </ScrollView>

                <Modal 
                    transparent 
                    visible={showDropdown} 
                    onRequestClose={() => setShowDropdown(false)}
                >
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

// Komponen PieChart yang terpisah
const PieChart = ({ data }: { data: Data }) => {
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
        <>
            <Svg width={300} height={300} viewBox="0 0 300 300">
                <G>{segments}</G>
            </Svg>
            {labels.map((l, i) => (
                <View 
                    key={i} 
                    style={[
                        styles.label, 
                        { 
                            left: l.x - 55, 
                            top: l.y - 12 
                        }
                    ]}
                >
                    <Text style={styles.labelText}>
                        {l.name} {l.persen}%
                    </Text>
                </View>
            ))}
        </>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        flexDirection: 'row', 
        backgroundColor: '#F5F5F5' 
    },
    main: { 
        flex: 1, 
        padding: 30 
    },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 20 
    },
    title: { 
        fontSize: 32, 
        fontWeight: 'bold', 
        color: '#F59E0B' 
    },
    subtitle: { 
        fontSize: 14, 
        color: '#666' 
    },
    date: { 
        fontSize: 16, 
        color: '#333', 
        textAlign: 'right' 
    },
    controls: { 
        flexDirection: 'row', 
        gap: 15, 
        marginBottom: 30 
    },
    periodBtn: { 
        flexDirection: 'row', 
        backgroundColor: '#fff', 
        paddingHorizontal: 20, 
        paddingVertical: 12, 
        borderRadius: 8, 
        borderWidth: 1, 
        borderColor: '#eee', 
        alignItems: 'center',
        flex: 1
    },
    periodText: { 
        fontSize: 14, 
        color: '#333' 
    },
    exportBtn: { 
        flexDirection: 'row', 
        backgroundColor: '#FDB022', 
        paddingHorizontal: 24, 
        paddingVertical: 12, 
        borderRadius: 8, 
        alignItems: 'center', 
        gap: 8 
    },
    exportBtnDisabled: {
        backgroundColor: '#FDBA74',
        opacity: 0.7
    },
    exportText: { 
        color: '#fff', 
        fontWeight: '500' 
    },
    cards: { 
        flexDirection: 'row', 
        gap: 20, 
        marginBottom: 30 
    },
    cardIncome: { 
        flex: 1, 
        backgroundColor: '#FEF3C7', 
        padding: 24, 
        borderRadius: 16 
    },
    cardExpense: { 
        flex: 1, 
        backgroundColor: '#F87171', 
        padding: 24, 
        borderRadius: 16 
    },
    cardHead: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 16 
    },
    cardTitle: { 
        fontSize: 16, 
        fontWeight: '500', 
        color: '#78350F' 
    },
    amount: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        color: '#78350F', 
        marginBottom: 8 
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#A16207',
        opacity: 0.8
    },
    chartCard: { 
        backgroundColor: '#fff', 
        borderRadius: 16, 
        padding: 30,
        marginBottom: 20
    },
    chartTitle: { 
        fontSize: 18, 
        fontWeight: '600', 
        color: '#333', 
        marginBottom: 30, 
        textAlign: 'center' 
    },
    label: { 
        position: 'absolute' 
    },
    labelText: { 
        fontSize: 13, 
        fontWeight: '500', 
        color: '#F59E0B', 
        backgroundColor: 'rgba(255,255,255,0.95)', 
        paddingHorizontal: 8, 
        paddingVertical: 3, 
        borderRadius: 6 
    },
    legend: {
        marginTop: 20,
        flexDirection: 'column',
        gap: 8
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8
    },
    legendText: {
        fontSize: 12,
        color: '#666',
        flex: 1
    },
    infoCard: {
        backgroundColor: '#EFF6FF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6'
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E40AF',
        marginBottom: 10
    },
    infoText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20
    },
    overlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.3)', 
        justifyContent: 'flex-start', 
        paddingTop: 150, 
        paddingLeft: 220 
    },
    dropdown: { 
        backgroundColor: '#fff', 
        borderRadius: 8, 
        minWidth: 220, 
        elevation: 10 
    },
    item: { 
        padding: 15, 
        borderBottomWidth: 1, 
        borderBottomColor: '#eee' 
    },
    itemText: { 
        fontSize: 14, 
        color: '#333' 
    },
    loadingContainer: {
        marginTop: 100,
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666'
    }
});