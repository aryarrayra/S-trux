import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Platform } from 'react-native';
import { TrendingUp, TrendingDown, Download } from 'lucide-react-native';
import Svg, { Path, G } from 'react-native-svg';
import { COLORS } from '@/constants/Colors';
import SideBar from '@/components/admin/SideBar';

// Mock data
const FINANCIAL_DATA = {
    totalPendapatan: 330000000,
    totalPengeluaran: 330000000,
    percentageChange: 2.5,
    categories: [
        { name: 'Excavator', percentage: 35, color: '#F4E5C2' },
        { name: 'Crane', percentage: 10, color: '#F5D7A1' },
        { name: 'Dump truck', percentage: 25, color: '#F5C771' },
        { name: 'Lainnya', percentage: 5, color: '#E8A855' },
        { name: 'Bulldozer', percentage: 25, color: '#F0B952' },
    ],
};

export default function LaporanKeuangan() {
    const [selectedPeriod, setSelectedPeriod] = useState('6 bulan terakhir');
    const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

    const getCurrentDate = () => {
        return {
            full: 'Rabu, 12 November 2025',
            time: '06:15 WIB'
        };
    };

    const currentDate = getCurrentDate();

    const formatCurrency = (amount: number) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const handleExportPDF = () => {
        console.log('Export PDF clicked');
        // Implement PDF export logic here
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

    // Generate segments
    let currentAngle = 0;
    const segments = FINANCIAL_DATA.categories.map((category) => {
        const startAngle = currentAngle;
        const slice = (category.percentage / 100) * 360;
        const endAngle = startAngle + slice;
        currentAngle = endAngle;
        const path = describeArc(150, 150, 140, startAngle, endAngle);
        return (
            <Path
                d={path}
                fill={category.color}
                stroke={'#FFFFFF'}
                strokeWidth={2}
                key={category.name}
            />
        );
    });

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

                    <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF}>
                        <Download color={COLORS.white} size={18} />
                        <Text style={styles.exportButtonText}>Ekspor PDF</Text>
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
                            <Text style={styles.cardAmount}>{formatCurrency(FINANCIAL_DATA.totalPendapatan)}</Text>
                            <Text style={styles.cardSubtext}>
                                +{FINANCIAL_DATA.percentageChange}% dari periode sebelumnya
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
                                {formatCurrency(FINANCIAL_DATA.totalPengeluaran)}
                            </Text>
                            <Text style={[styles.cardSubtext, { color: 'rgba(255,255,255,0.9)' }]}>
                                +{FINANCIAL_DATA.percentageChange}% dari periode sebelumnya
                            </Text>
                        </View>
                    </View>

                    {/* Pie Chart Section */}
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Pendapatan per kategori</Text>
                        
                        <View style={styles.chartContainer}>
                            {/* Pie Chart */}
                            <View style={styles.pieChartWrapper}>
                                <Svg width={300} height={300} viewBox="0 0 300 300">
                                    <G>
                                        {segments}
                                    </G>
                                </Svg>
                                
                                {/* Category Labels */}
                                <View style={styles.labelExcavator}>
                                    <Text style={styles.labelText}>Excavator 35%</Text>
                                </View>
                                <View style={styles.labelCrane}>
                                    <Text style={styles.labelText}>Crane 10%</Text>
                                </View>
                                <View style={styles.labelDumpTruck}>
                                    <Text style={styles.labelText}>Dump truck 25%</Text>
                                </View>
                                <View style={styles.labelLainnya}>
                                    <Text style={styles.labelText}>Lainnya 5%</Text>
                                </View>
                                <View style={styles.labelBulldozer}>
                                    <Text style={styles.labelText}>Bulldozer 25%</Text>
                                </View>
                            </View>
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
        marginBottom: 30,
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
    },
    pieChartWrapper: {
        width: 400,
        height: 400,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    labelExcavator: {
        position: 'absolute',
        top: 50,
        right: 50,
    },
    labelCrane: {
        position: 'absolute',
        top: 130,
        right: 50,
    },
    labelDumpTruck: {
        position: 'absolute',
        bottom: 130,
        right: 50,
    },
    labelLainnya: {
        position: 'absolute',
        bottom: 50,
        left: 50,
    },
    labelBulldozer: {
        position: 'absolute',
        top: 130,
        left: 50,
    },
    labelText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 13,
        color: '#F59E0B',
    },
    categoryLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    colorBox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        marginRight: 10,
    },
    categoryText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: '#666',
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