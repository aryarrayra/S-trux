import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Modal, 
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import { TrendingUp, TrendingDown, Download } from 'lucide-react-native';
import Svg, { Path, G } from 'react-native-svg';
import { COLORS } from '@/constants/Colors';
import SideBar from '@/components/admin/SideBar';
import { api } from '@/utils/api';

interface LabelPosition {
    name: string;
    percentage: number;
    x: number;
    y: number;
}

interface FinancialData {
    totalPendapatan: number;
    totalPengeluaran: number;
    percentageChange: number;
    categories: Array<{
        name: string;
        percentage: number;
        color: string;
        total_pendapatan?: number;
        total_sewa?: number;
    }>;
    period: string;
    dateRange: {
        start: string;
        end: string;
    };
}

// Default data fallback
const DEFAULT_FINANCIAL_DATA: FinancialData = {
    totalPendapatan: 0,
    totalPengeluaran: 0,
    percentageChange: 0,
    categories: [],
    period: '6 bulan terakhir',
    dateRange: {
        start: new Date().toISOString(),
        end: new Date().toISOString()
    }
};

// Default colors for categories
const CATEGORY_COLORS: { [key: string]: string } = {
    'Excavator': '#F4E5C2',
    'Bulldozer': '#F0B952',
    'Dump Truck': '#F5C771',
    'Crane': '#F5D7A1',
    'Loader': '#E8A855',
    'Motor Grader': '#D4A574',
    'Lainnya': '#CCCCCC'
};

export default function LaporanKeuangan() {
    const [selectedPeriod, setSelectedPeriod] = useState('6 bulan terakhir');
    const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
    const [financialData, setFinancialData] = useState<FinancialData>(DEFAULT_FINANCIAL_DATA);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchLaporanKeuangan();
    }, [selectedPeriod]);

    const fetchLaporanKeuangan = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/pembayaran/laporan-keuangan?period=${selectedPeriod}`);
            
            // Process categories dengan warna
            const processedData = {
                ...response.data.data,
                categories: response.data.data.categories.map((category: any) => ({
                    ...category,
                    color: CATEGORY_COLORS[category.name] || '#CCCCCC'
                }))
            };
            
            setFinancialData(processedData);
        } catch (error) {
            console.error('Error fetching laporan keuangan:', error);
            Alert.alert('Error', 'Gagal memuat data laporan keuangan');
            // Fallback ke data default
            setFinancialData(DEFAULT_FINANCIAL_DATA);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        try {
            setExporting(true);
            
            if (Platform.OS === 'web') {
                // Untuk web, langsung download
                const exportUrl = `${api.defaults.baseURL}/pembayaran/export-laporan?period=${selectedPeriod}&format=html`;
                window.open(exportUrl, '_blank');
            } else {
                // Untuk mobile, tampilkan pilihan format
                Alert.alert(
                    'Export Laporan',
                    'Pilih format export:',
                    [
                        { text: 'Batal', style: 'cancel' },
                        { 
                            text: 'HTML', 
                            onPress: () => downloadReport('html')
                        },
                        { 
                            text: 'CSV', 
                            onPress: () => downloadReport('csv')
                        }
                    ]
                );
            }
        } catch (error) {
            console.error('Error exporting:', error);
            Alert.alert('Error', 'Gagal mengekspor laporan');
        } finally {
            setExporting(false);
        }
    };

    const downloadReport = async (format: string) => {
        try {
            const exportUrl = `${api.defaults.baseURL}/pembayaran/export-laporan?period=${selectedPeriod}&format=${format}`;
            
            if (Platform.OS === 'web') {
                window.open(exportUrl, '_blank');
            } else {
                // Untuk React Native, Anda bisa menggunakan Linking atau download manager
                Alert.alert('Info', `File ${format.toUpperCase()} akan diunduh`);
                // Contoh menggunakan Linking:
                // Linking.openURL(exportUrl);
            }
        } catch (error) {
            Alert.alert('Error', 'Gagal mengunduh file');
        }
    };

    const getCurrentDate = () => {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const now = new Date();
        const dayName = days[now.getDay()];
        const date = now.getDate();
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        return {
            full: `${dayName}, ${date} ${month} ${year}`,
            time: `${hours}:${minutes} WIB`
        };
    };

    const currentDate = getCurrentDate();

    const formatCurrency = (amount: number) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const selectPeriod = (period: string) => {
        setSelectedPeriod(period);
        setShowPeriodDropdown(false);
    };

    // Pie chart functions
    const polarToCartesian = (cx: number, cy: number, r: number, a: number) => {
        const radians = (a - 90) * Math.PI / 180;
        return {
            x: cx + r * Math.cos(radians),
            y: cy + r * Math.sin(radians)
        };
    };

    const describeArc = (cx: number, cy: number, r: number, start: number, end: number) => {
        const startP = polarToCartesian(cx, cy, r, start);
        const endP = polarToCartesian(cx, cy, r, end);
        const large = Math.abs(end - start) > 180 ? 1 : 0;
        return [
            `M ${startP.x.toFixed(2)} ${startP.y.toFixed(2)}`,
            `A ${r} ${r} 0 ${large} 1 ${endP.x.toFixed(2)} ${endP.y.toFixed(2)}`,
            `L ${cx} ${cy}`,
            'Z'
        ].join(' ');
    };

    // Compute segments and label positions
    const centerX = 150;
    const centerY = 150;
    const radius = 140;
    let currentAngle = 0;
    const segments: React.ReactElement[] = [];
    const labelPositions: LabelPosition[] = [];

    financialData.categories.forEach((category, index) => {
        const startAngle = currentAngle;
        const slice = (category.percentage / 100) * 360;
        const endAngle = startAngle + slice;
        const midAngle = (startAngle + endAngle) / 2;
        currentAngle = endAngle;

        // Arc path
        const path = describeArc(centerX, centerY, radius, startAngle, endAngle);
        segments.push(
            <Path
                d={path}
                fill={category.color}
                stroke={'#FFFFFF'}
                strokeWidth={2}
                key={category.name}
            />
        );

        // Label position
        let labelRadius = radius + 60;
        // Adjust for smaller segments
        if (category.percentage < 10) {
            labelRadius = radius + 40;
        }
        
        const radians = (midAngle - 90) * Math.PI / 180;
        const labelX = centerX + labelRadius * Math.cos(radians);
        const labelY = centerY + labelRadius * Math.sin(radians);

        labelPositions.push({
            name: category.name,
            percentage: category.percentage,
            x: labelX,
            y: labelY
        });
    });

    if (loading) {
        return (
            <View style={styles.container}>
                <SideBar />
                <View style={[styles.mainContent, styles.centered]}>
                    <ActivityIndicator size="large" color="#F59E0B" />
                    <Text style={styles.loadingText}>Memuat data laporan keuangan...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SideBar />

            {/* Main Content */}
            <View style={styles.mainContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.pageTitle}>Laporan Keuangan</Text>
                        <Text style={styles.pageSubtitle}>Monitor pendapatan dan pengeluaran bisnis</Text>
                    </View>
                    <View style={styles.dateTimeContainer}>
                        <Text style={styles.dateText}>{currentDate.full}</Text>
                        <Text style={styles.timeText}>{currentDate.time}</Text>
                    </View>
                </View>

                {/* Filter & Export Section */}
                <View style={styles.controlsRow}>
                    <TouchableOpacity
                        style={styles.periodButton}
                        onPress={() => setShowPeriodDropdown(true)}
                    >
                        <Text style={styles.periodButtonText}>{selectedPeriod}</Text>
                        <Text style={styles.dropdownArrow}>▼</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.exportButton, exporting && styles.exportButtonDisabled]} 
                        onPress={handleExportPDF}
                        disabled={exporting}
                    >
                        {exporting ? (
                            <ActivityIndicator size="small" color={COLORS.white} />
                        ) : (
                            <Download color={COLORS.white} size={18} />
                        )}
                        <Text style={styles.exportButtonText}>
                            {exporting ? 'Mengekspor...' : 'Ekspor Laporan'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Summary Cards */}
                    <View style={styles.cardsRow}>
                        {/* Total Pendapatan Card */}
                        <View style={styles.cardPendapatan}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>Total Pendapatan</Text>
                                <View style={styles.iconContainer}>
                                    <TrendingUp color="#D97706" size={24} />
                                </View>
                            </View>
                            <Text style={styles.cardAmount}>{formatCurrency(financialData.totalPendapatan)}</Text>
                            <Text style={styles.cardSubtext}>
                                {financialData.percentageChange >= 0 ? '+' : ''}{financialData.percentageChange}% dari periode sebelumnya
                            </Text>
                        </View>

                        {/* Total Pengeluaran Card */}
                        <View style={styles.cardPengeluaran}>
                            <View style={styles.cardHeader}>
                                <Text style={[styles.cardTitle, { color: COLORS.white }]}>Total Pengeluaran</Text>
                                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                    <TrendingDown color={COLORS.white} size={24} />
                                </View>
                            </View>
                            <Text style={[styles.cardAmount, { color: COLORS.white }]}>
                                {formatCurrency(financialData.totalPengeluaran)}
                            </Text>
                            <Text style={[styles.cardSubtext, { color: 'rgba(255,255,255,0.9)' }]}>
                                Data pengeluaran akan tersedia soon
                            </Text>
                        </View>
                    </View>

                    {/* Pie Chart Section */}
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Pendapatan per kategori</Text>

                        <View style={styles.chartContainer}>
                            {financialData.categories.length > 0 ? (
                                <View style={styles.pieChartWrapper}>
                                    <Svg width={300} height={300} viewBox="0 0 300 300">
                                        <G>
                                            {segments}
                                        </G>
                                    </Svg>

                                    {/* Dynamic Category Labels near segments */}
                                    {labelPositions.map((label, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.labelContainer,
                                                {
                                                    left: label.x - 50,
                                                    top: label.y - 8,
                                                }
                                            ]}
                                        >
                                            <Text style={styles.labelText}>
                                                {label.name} {label.percentage}%
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View style={styles.noDataContainer}>
                                    <Text style={styles.noDataText}>Tidak ada data untuk periode ini</Text>
                                    <Text style={styles.noDataSubtext}>
                                        Tidak ada pembayaran terverifikasi pada {selectedPeriod.toLowerCase()}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Category Details */}
                        {financialData.categories.length > 0 && (
                            <View style={styles.categoryDetails}>
                                <Text style={styles.categoryDetailsTitle}>Detail Kategori</Text>
                                {financialData.categories.map((category, index) => (
                                    <View key={index} style={styles.categoryItem}>
                                        <View style={[styles.colorIndicator, { backgroundColor: category.color }]} />
                                        <View style={styles.categoryInfo}>
                                            <Text style={styles.categoryName}>{category.name}</Text>
                                            <Text style={styles.categorySubtext}>
                                                {category.total_sewa} sewa • {category.percentage}%
                                            </Text>
                                        </View>
                                        <Text style={styles.categoryAmount}>
                                            Rp {category.total_pendapatan?.toLocaleString('id-ID')}
                                        </Text>
                                    </View>
                                ))}
                                
                                {/* Total */}
                                <View style={[styles.categoryItem, styles.totalItem]}>
                                    <View style={[styles.colorIndicator, { backgroundColor: '#F59E0B' }]} />
                                    <View style={styles.categoryInfo}>
                                        <Text style={[styles.categoryName, styles.totalText]}>TOTAL</Text>
                                        <Text style={styles.categorySubtext}>
                                            {financialData.categories.reduce((sum, cat) => sum + (cat.total_sewa || 0), 0)} sewa • 100%
                                        </Text>
                                    </View>
                                    <Text style={[styles.categoryAmount, styles.totalText]}>
                                        {formatCurrency(financialData.totalPendapatan)}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Period Info */}
                    <View style={styles.periodInfoCard}>
                        <Text style={styles.periodInfoTitle}>Informasi Periode</Text>
                        <View style={styles.periodInfoRow}>
                            <Text style={styles.periodInfoLabel}>Periode yang ditampilkan:</Text>
                            <Text style={styles.periodInfoValue}>{selectedPeriod}</Text>
                        </View>
                        <View style={styles.periodInfoRow}>
                            <Text style={styles.periodInfoLabel}>Rentang tanggal:</Text>
                            <Text style={styles.periodInfoValue}>
                                {new Date(financialData.dateRange.start).toLocaleDateString('id-ID')} - {new Date(financialData.dateRange.end).toLocaleDateString('id-ID')}
                            </Text>
                        </View>
                        <View style={styles.periodInfoRow}>
                            <Text style={styles.periodInfoLabel}>Data terakhir diperbarui:</Text>
                            <Text style={styles.periodInfoValue}>{currentDate.full} {currentDate.time}</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>

            {/* Period Dropdown Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showPeriodDropdown}
                onRequestClose={() => setShowPeriodDropdown(false)}
            >
                <TouchableOpacity
                    style={styles.dropdownOverlay}
                    activeOpacity={1}
                    onPress={() => setShowPeriodDropdown(false)}
                >
                    <View style={styles.dropdownContent}>
                        <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => selectPeriod('1 bulan terakhir')}
                        >
                            <Text style={styles.dropdownText}>1 bulan terakhir</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => selectPeriod('3 bulan terakhir')}
                        >
                            <Text style={styles.dropdownText}>3 bulan terakhir</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => selectPeriod('6 bulan terakhir')}
                        >
                            <Text style={styles.dropdownText}>6 bulan terakhir</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
                            onPress={() => selectPeriod('1 tahun terakhir')}
                        >
                            <Text style={styles.dropdownText}>1 tahun terakhir</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
    },
    mainContent: {
        flex: 1,
        padding: 30,
        backgroundColor: '#F5F5F5',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 16,
        color: '#666',
        marginTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30,
    },
    pageTitle: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 32,
        color: '#F59E0B',
        marginBottom: 5,
        letterSpacing: 0.2,
    },
    pageSubtitle: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: '#666',
    },
    dateTimeContainer: {
        alignItems: 'flex-end',
    },
    dateText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: '#F59E0B',
    },
    timeText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 18,
        color: '#333',
    },
    controlsRow: {
        flexDirection: 'row',
        marginBottom: 30,
        gap: 15,
    },
    periodButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        gap: 10,
    },
    periodButtonText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: '#333',
    },
    dropdownArrow: {
        fontSize: 10,
        color: '#666',
    },
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDB022',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    exportButtonDisabled: {
        backgroundColor: '#FDBA74',
        opacity: 0.7,
    },
    exportButtonText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: COLORS.white,
    },
    scrollContent: {
        flex: 1,
    },
    cardsRow: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 30,
    },
    cardPendapatan: {
        flex: 1,
        backgroundColor: '#FEF3C7',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardPengeluaran: {
        flex: 1,
        backgroundColor: '#F87171',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 16,
        color: '#78350F',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(217, 119, 6, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardAmount: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 28,
        color: '#78350F',
        marginBottom: 8,
    },
    cardSubtext: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 12,
        color: '#92400E',
    },
    chartCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20,
    },
    chartTitle: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 18,
        color: '#333',
        marginBottom: 30,
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
    },
    pieChartWrapper: {
        width: 400,
        height: 400,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    labelContainer: {
        position: 'absolute',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    labelText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 13,
        color: '#F59E0B',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    noDataContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    noDataText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    noDataSubtext: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    categoryDetails: {
        marginTop: 30,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        paddingTop: 20,
    },
    categoryDetailsTitle: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 16,
        color: '#333',
        marginBottom: 15,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    totalItem: {
        borderTopWidth: 2,
        borderTopColor: '#E5E5E5',
        borderBottomWidth: 0,
        paddingTop: 15,
        marginTop: 5,
    },
    colorIndicator: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 12,
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: '#333',
        marginBottom: 2,
    },
    totalText: {
        fontFamily: 'Poppins_700Bold',
        color: '#F59E0B',
    },
    categorySubtext: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 12,
        color: '#666',
    },
    categoryAmount: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: '#333',
    },
    periodInfoCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 30,
    },
    periodInfoTitle: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 16,
        color: '#333',
        marginBottom: 15,
    },
    periodInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    periodInfoLabel: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: '#666',
    },
    periodInfoValue: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: '#333',
    },
    dropdownOverlay: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingTop: 150,
        paddingLeft: 220,
    },
    dropdownContent: {
        backgroundColor: COLORS.white,
        borderRadius: 8,
        minWidth: 200,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    dropdownItem: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    dropdownText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: '#333',
    },
});