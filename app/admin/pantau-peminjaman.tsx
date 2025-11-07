import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Platform } from 'react-native';
import { MapPin, Search, X, Clock, User, Calendar } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import SideBar from '@/components/admin/SideBar';
import { Stack } from 'expo-router';

// Load maps ONLY on mobile (no import at top)
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
    try {
        const rnMaps = require('react-native-maps');
        MapView = rnMaps.default;
        Marker = rnMaps.Marker;
        PROVIDER_GOOGLE = rnMaps.PROVIDER_GOOGLE;
    } catch (e) {
        console.warn('Maps not loaded');
    }
}

// Mock data
const INITIAL_ACTIVE_LOANS = [
    {
        id: 'PJ000-07112025-001',
        equipment: 'Excavator CAT 320D',
        type: 'Excavator',
        borrower: 'Santos Merogo',
        unit: 'PT. Sumber Makmur',
        location: {
            latitude: -6.2088,
            longitude: 106.8456,
            title: 'Tebak dong mniz',
        },
        startDate: '17/10/2025',
        endDate: '30/10/2025',
        duration: '30 hari',
        condition: 'baik/rusak',
    },
    {
        id: 'PJ000-07112025-002',
        equipment: 'Bulldozer CAT D8R',
        type: 'Bulldozer',
        borrower: 'Nama Peminjam',
        unit: 'PT. Sumber Jaya',
        location: {
            latitude: -6.2340,
            longitude: 106.8294,
            title: 'Jakarta Selatan',
        },
        startDate: '20/10/2025',
        endDate: '04/11/2025',
        duration: '45 hari',
        condition: 'baik',
    },
    {
        id: 'PJ000-07112025-003',
        equipment: 'Dump Truck CAT 777',
        type: 'Dump Truck',
        borrower: 'Borrower Name',
        unit: 'PT. Trans Logistik',
        location: {
            latitude: -6.1754,
            longitude: 106.8272,
            title: 'Jakarta Utara',
        },
        startDate: '25/10/2025',
        endDate: '14/11/2025',
        duration: '20 hari',
        condition: 'rusak',
    },
];

export default function PantauPeminjaman() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeLoans, setActiveLoans] = useState(INITIAL_ACTIVE_LOANS);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<any>(null);

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

    const filteredLoans = activeLoans.filter(loan =>
        loan.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.borrower.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getPinColor = (type: string) => {
        switch (type) {
            case 'Excavator':
                return '#F59E0B';
            case 'Bulldozer':
                return '#FDB022';
            case 'Dump Truck':
                return '#000000';
            default:
                return '#F59E0B';
        }
    };

    const handleOpenDetail = (loan: any) => {
        setSelectedLoan(loan);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    const handleMarkerPress = (loan: any) => {
        handleOpenDetail(loan);
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <SideBar />

                <View style={styles.mainContent}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.pageTitle}>Pantau Peminjaman</Text>
                            <Text style={styles.pageSubtitle}>Lokasi Alat Berat Peminjaman</Text>
                        </View>
                        <View style={styles.dateTimeContainer}>
                            <Text style={styles.headerDateText}>{currentDate.full}</Text>
                            <Text style={styles.timeText}>{currentDate.time}</Text>
                        </View>
                    </View>

                    <View style={styles.searchContainer}>
                        <Search color="#999" size={20} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Cari berdasarkan ID, peralatan, atau peminjam..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.mapContainer}>
                        {Platform.OS === 'web' ? (
                            <View style={styles.map}>
                                <Text style={styles.mapPlaceholder}>Maps only on mobile app</Text>
                            </View>
                        ) : (
                            MapView ? (
                                <MapView
                                    provider={PROVIDER_GOOGLE}
                                    style={styles.map}
                                    initialRegion={{
                                        latitude: -6.2088,
                                        longitude: 106.8456,
                                        latitudeDelta: 0.5,
                                        longitudeDelta: 0.5,
                                    }}
                                >
                                    {filteredLoans.map((loan, index) => (
                                        <Marker
                                            key={index}
                                            coordinate={loan.location}
                                            title={loan.equipment}
                                            description={loan.borrower}
                                            pinColor={getPinColor(loan.type)}
                                            onPress={() => handleMarkerPress(loan)}
                                        />
                                    ))}
                                </MapView>
                            ) : (
                                <View style={styles.map}>
                                    <Text>Maps loading...</Text>
                                </View>
                            )
                        )}
                    </View>

                    <View style={styles.legendContainer}>
                        <Text style={styles.legendTitle}>Legenda</Text>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendItem, { backgroundColor: '#F59E0B' }]} />
                            <Text style={styles.legendText}>Excavator</Text>
                        </View>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendItem, { backgroundColor: '#FDB022' }]} />
                            <Text style={styles.legendText}>Bulldozer</Text>
                        </View>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendItem, { backgroundColor: '#000000' }]} />
                            <Text style={styles.legendText}>Dump Truck</Text>
                        </View>
                    </View>

                    <View style={styles.listContainer}>
                        <Text style={styles.sectionTitle}>Peminjaman Aktif</Text>
                        <ScrollView style={styles.listScroll}>
                            {filteredLoans.map((loan, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.loanItem}
                                    onPress={() => handleOpenDetail(loan)}
                                >
                                    <View style={styles.loanHeader}>
                                        <Text style={styles.loanId}>{loan.id}</Text>
                                        <MapPin size={20} color="#F59E0B" />
                                    </View>
                                    <Text style={styles.equipmentText}>{loan.equipment}</Text>
                                    <Text style={styles.borrowerText}>{loan.borrower} - {loan.unit}</Text>
                                    <View style={styles.loanFooter}>
                                        <View style={styles.dateContainer}>
                                            <Calendar size={16} color="#666" />
                                            <Text style={styles.loanDateText}>{loan.startDate}</Text>
                                        </View>
                                        <View style={styles.durationContainer}>
                                            <Clock size={16} color="#666" />
                                            <Text style={styles.durationText}>{loan.duration}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={handleCloseModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.detailModalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{selectedLoan?.equipment}</Text>
                                <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                                    <X color="#666" size={24} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                <View style={styles.infoSection}>
                                    <Text style={styles.sectionTitleModal}>Informasi Sewa</Text>
                                    <View style={styles.rowContainer}>
                                        <View style={styles.fieldContainer}>
                                            <Text style={styles.fieldLabel}>Tanggal Sewa</Text>
                                            <Text style={styles.fieldValue}>{selectedLoan?.startDate}</Text>
                                        </View>
                                        <View style={styles.fieldContainer}>
                                            <Text style={styles.fieldLabel}>Nama Peminjam</Text>
                                            <Text style={styles.fieldValue}>{selectedLoan?.borrower}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.rowContainer}>
                                        <View style={styles.fieldContainer}>
                                            <Text style={styles.fieldLabel}>Sewa Berakhir</Text>
                                            <Text style={styles.fieldValue}>{selectedLoan?.endDate}</Text>
                                        </View>
                                        <View style={styles.fieldContainer}>
                                            <Text style={styles.fieldLabel}>Nama Perusahaan</Text>
                                            <Text style={styles.fieldValue}>{selectedLoan?.unit}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.singleFieldContainer}>
                                        <Text style={styles.fieldLabel}>Lokasi</Text>
                                        <Text style={styles.fieldValue}>{selectedLoan?.location?.title}</Text>
                                    </View>
                                </View>

                                <View style={styles.infoSection}>
                                    <Text style={styles.sectionTitleModal}>Informasi Unit</Text>
                                    <View style={styles.singleFieldContainer}>
                                        <Text style={styles.fieldLabel}>Kategori Unit</Text>
                                        <Text style={styles.fieldValue}>{selectedLoan?.type}</Text>
                                    </View>
                                    <View style={styles.singleFieldContainer}>
                                        <Text style={styles.fieldLabel}>Series</Text>
                                        <Text style={styles.fieldValue}>{selectedLoan?.equipment}</Text>
                                    </View>
                                    <View style={styles.singleFieldContainer}>
                                        <Text style={styles.fieldLabel}>Kondisi</Text>
                                        <Text style={styles.fieldValue}>{selectedLoan?.condition}</Text>
                                    </View>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </View>
        </>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: COLORS.white,
    },
    mainContent: {
        flex: 1,
        padding: 30,
        backgroundColor: COLORS.white,
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
    headerDateText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: COLORS.primary,
    },
    timeText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 18,
        color: COLORS.darkGray,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 20,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: COLORS.darkGray,
    },
    mapContainer: {
        height: 300,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
    },
    map: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    mapPlaceholder: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    legendContainer: {
        marginBottom: 20,
    },
    legendTitle: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 16,
        color: COLORS.darkGray,
        marginBottom: 10,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    legendItem: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 8,
    },
    legendText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: '#666',
    },
    listContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 18,
        color: COLORS.darkGray,
        marginBottom: 15,
    },
    listScroll: {
        flex: 1,
    },
    loanItem: {
        backgroundColor: '#F5EFE7',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    loanHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    loanId: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: COLORS.darkGray,
    },
    equipmentText: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    borrowerText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    loanFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    durationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    loanDateText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 12,
        color: '#666',
    },
    durationText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 12,
        color: '#666',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    detailModalContent: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        width: '95%',
        maxWidth: 500,
        maxHeight: '60%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        backgroundColor: '#FFF8E1',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    modalTitle: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 18,
        color: '#333',
    },
    closeButton: {
        padding: 5,
    },
    modalBody: {
        padding: 20,
        paddingTop: 10,
    },
    infoSection: {
        marginBottom: 20,
    },
    sectionTitleModal: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 16,
        color: '#F59E0B',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F59E0B',
        paddingBottom: 5,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    fieldContainer: {
        flex: 1,
        marginHorizontal: 5,
        backgroundColor: '#FFF8E1',
        borderWidth: 1,
        borderColor: '#F59E0B',
        padding: 10,
        borderRadius: 8,
    },
    singleFieldContainer: {
        backgroundColor: '#FFF8E1',
        borderWidth: 1,
        borderColor: '#F59E0B',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    fieldLabel: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    fieldValue: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: '#333',
    },
});