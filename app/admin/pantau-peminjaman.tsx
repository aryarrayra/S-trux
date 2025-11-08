import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Platform } from 'react-native';
import { MapPin, Search, X, Clock, User, Calendar } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import SideBar from '@/components/admin/SideBar';
import { Stack } from 'expo-router';

// Declare global for Leaflet
declare global {
    interface Window {
        L: any;
        openLoanDetail: (loanId: string) => void;
    }
}

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

// Web Map Component
const WebMapView = ({ loans, onMarkerClick }: any) => {
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const mapContainerRef = useRef<any>(null);

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

    useEffect(() => {
        if (Platform.OS !== 'web') return;

        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
        document.head.appendChild(link);

        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
        script.async = true;
        script.onload = () => {
            if (window.L && mapContainerRef.current && !mapRef.current) {
                const map = window.L.map(mapContainerRef.current).setView([-6.2088, 106.8456], 11);

                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19,
                }).addTo(map);

                mapRef.current = map;
            }
        };
        document.head.appendChild(script);

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (Platform.OS !== 'web') return;
        if (!mapRef.current || !window.L) return;

        // Clear markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Set window function
        window.openLoanDetail = (loanId: string) => {
            const loan = loans.find((l: any) => l.id === loanId);
            if (loan) {
                onMarkerClick(loan);
            }
        };

        // Add markers
        loans.forEach((loan: any) => {
            const color = getPinColor(loan.type);

            const icon = window.L.divIcon({
                html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                className: 'custom-marker',
                iconSize: [24, 24],
                iconAnchor: [12, 24],
            });

            const marker = window.L.marker(
                [loan.location.latitude, loan.location.longitude],
                { icon }
            ).addTo(mapRef.current);

            marker.bindPopup(`
                <div style="font-family: sans-serif;">
                    <strong style="font-size: 14px; color: #333;">${loan.equipment}</strong><br/>
                    <span style="font-size: 12px; color: #666;">${loan.borrower}</span><br/>
                    <button 
                        onclick="window.openLoanDetail('${loan.id}')" 
                        style="margin-top: 8px; padding: 4px 12px; background-color: #F59E0B; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;"
                    >
                        Detail
                    </button>
                </div>
            `);

            markersRef.current.push(marker);
        });
    }, [loans, onMarkerClick]);

    return (
        <View style={styles.map}>
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
        </View>
    );
};

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
                            <WebMapView
                                loans={filteredLoans}
                                onMarkerClick={handleOpenDetail}
                            />
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
                                    <X color="#FF0000" size={28} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                <View style={styles.infoSection}>
                                    <Text style={styles.sectionTitleModal}>Informasi Sewa</Text>

                                    <View style={styles.fieldsContainer}>
                                        <View style={styles.rowFields}>
                                            <View style={styles.fieldWrapper}>
                                                <Text style={styles.fieldLabel}>Tanggal Sewa</Text>
                                                <View style={styles.fieldInputBox}>
                                                    <Text style={styles.fieldValue}>{selectedLoan?.startDate}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.fieldWrapper}>
                                                <Text style={styles.fieldLabel}>Nama Penyewa</Text>
                                                <View style={styles.fieldInputBox}>
                                                    <Text style={styles.fieldValue}>{selectedLoan?.borrower}</Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.rowFields}>
                                            <View style={styles.fieldWrapper}>
                                                <Text style={styles.fieldLabel}>Sewa Berakhir</Text>
                                                <View style={styles.fieldInputBox}>
                                                    <Text style={styles.fieldValue}>{selectedLoan?.endDate}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.fieldWrapper}>
                                                <Text style={styles.fieldLabel}>Nama Perusahaan</Text>
                                                <View style={styles.fieldInputBox}>
                                                    <Text style={styles.fieldValue}>{selectedLoan?.unit}</Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.fieldWrapper}>
                                            <Text style={styles.fieldLabel}>Lokasi</Text>
                                            <View style={styles.fieldInputBox}>
                                                <Text style={styles.fieldValue}>{selectedLoan?.location?.title}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.infoSection}>
                                    <Text style={styles.sectionTitleModal}>Informasi Unit</Text>

                                    <View style={styles.fieldsContainer}>
                                        <View style={styles.fieldWrapper}>
                                            <Text style={styles.fieldLabel}>Kategori Unit</Text>
                                            <View style={styles.fieldInputBox}>
                                                <Text style={styles.fieldValue}>{selectedLoan?.type}</Text>
                                            </View>
                                        </View>

                                        <View style={[styles.fieldWrapper, { marginTop: 20 }]}>
                                            <Text style={styles.fieldLabel}>Series</Text>
                                            <View style={styles.fieldInputBox}>
                                                <Text style={styles.fieldValue}>{selectedLoan?.equipment}</Text>
                                            </View>
                                        </View>

                                        <View style={[styles.fieldWrapper, { marginTop: 20 }]}>
                                            <Text style={styles.fieldLabel}>Kondisi</Text>
                                            <View style={styles.fieldInputBox}>
                                                <Text style={styles.fieldValue}>{selectedLoan?.condition}</Text>
                                            </View>
                                        </View>
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
        maxWidth: 900,
        maxHeight: '80%',
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
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingTop: 25,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F59E0B',
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        position: 'relative',
    },
    modalTitle: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 22,
        color: '#F59E0B',
    },
    closeButton: {
        padding: 5,
        position: 'absolute',
        right: 20,
        top: 20,
    },
    modalBody: {
        padding: 30,
        paddingTop: 20,
    },
    infoSection: {
        marginBottom: 30,
    },
    sectionTitleModal: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 16,
        color: '#F59E0B',
        marginBottom: 20,
    },
    fieldsContainer: {
        marginLeft: 50,
    },
    rowFields: {
        flexDirection: 'row',
        gap: 30,
        marginBottom: 20,
    },
    fieldWrapper: {
        flex: 1,
        maxWidth: 320,
    },
    fieldLabel: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: '#000',
        marginBottom: 8,
    },
    fieldInputBox: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F59E0B',
        borderRadius: 8,
        padding: 12,
    },
    fieldValue: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: '#000',
    },
});