import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { MapPin, Search, X, Clock, Calendar } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import SideBar from '@/components/admin/SideBar';
import { Stack } from 'expo-router';

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
    }
];

// Web Map Component
const WebMap = ({ loans, onMarkerClick }: any) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        let script: HTMLScriptElement | null = null;
        let link: HTMLLinkElement | null = null;

        const initializeMap = () => {
            if (!(window as any).L || !mapContainerRef.current || mapRef.current) return;

            try {
                const L = (window as any).L;
                const map = L.map(mapContainerRef.current).setView([-6.2088, 106.8456], 11);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);

                mapRef.current = map;
                setMapLoaded(true);
            } catch (error) {
                console.error('Error initializing map:', error);
            }
        };

        const loadLeaflet = () => {
            // Check if already loaded
            if ((window as any).L) {
                initializeMap();
                return;
            }

            // Load Leaflet CSS from CDN
            link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
            link.crossOrigin = '';
            document.head.appendChild(link);

            // Load Leaflet JS from CDN
            script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            script.onload = initializeMap;
            document.head.appendChild(script);
        };

        loadLeaflet();

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }
            if (script && document.head.contains(script)) {
                document.head.removeChild(script);
            }
            if (link && document.head.contains(link)) {
                document.head.removeChild(link);
            }
        };
    }, []);

    useEffect(() => {
        if (!mapLoaded || !mapRef.current || !(window as any).L) return;

        const L = (window as any).L;
        
        // Clear existing markers
        mapRef.current.eachLayer((layer: any) => {
            if (layer instanceof L.Marker) {
                mapRef.current.removeLayer(layer);
            }
        });

        // Add markers
        loans.forEach((loan: any) => {
            const marker = L.marker([loan.location.latitude, loan.location.longitude])
                .addTo(mapRef.current)
                .bindPopup(`
                    <div style="padding: 8px; min-width: 200px;">
                        <strong style="font-size: 14px;">${loan.equipment}</strong><br/>
                        <small style="color: #666;">${loan.borrower}</small><br/>
                        <button 
                            onclick="window.dispatchEvent(new CustomEvent('markerClick', { detail: '${loan.id}' }))" 
                            style="margin-top: 8px; padding: 6px 12px; background: #F59E0B; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;"
                        >
                            Detail
                        </button>
                    </div>
                `);

            marker.on('click', () => {
                onMarkerClick(loan);
            });
        });

        // Handle marker clicks from popup buttons
        const handleMarkerClick = (event: CustomEvent) => {
            const loan = loans.find((l: any) => l.id === event.detail);
            if (loan) onMarkerClick(loan);
        };

        window.addEventListener('markerClick', handleMarkerClick as EventListener);
        
        return () => {
            window.removeEventListener('markerClick', handleMarkerClick as EventListener);
        };
    }, [loans, mapLoaded, onMarkerClick]);

    return (
        <View style={styles.map}>
            <div 
                ref={mapContainerRef} 
                style={{ 
                    width: '100%', 
                    height: '100%',
                    borderRadius: '10px'
                }}
            />
        </View>
    );
};

export default function PantauPeminjaman() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeLoans] = useState(INITIAL_ACTIVE_LOANS);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<any>(null);

    const filteredLoans = activeLoans.filter(loan =>
        loan.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.borrower.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenDetail = (loan: any) => {
        setSelectedLoan(loan);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    const getCurrentDate = () => {
        const now = new Date();
        return {
            full: now.toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            time: now.toLocaleTimeString('id-ID', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZoneName: 'short'
            })
        };
    };

    const currentDate = getCurrentDate();

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
                        <WebMap
                            loans={filteredLoans}
                            onMarkerClick={handleOpenDetail}
                        />
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
                                                <Text style={styles.fieldLabel}>Perusahaan</Text>
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
                                        <View style={styles.fieldWrapper}>
                                            <Text style={styles.fieldLabel}>Series</Text>
                                            <View style={styles.fieldInputBox}>
                                                <Text style={styles.fieldValue}>{selectedLoan?.equipment}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.fieldWrapper}>
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
        fontSize: 32,
        fontWeight: '600',
        color: '#F59E0B',
        marginBottom: 5,
    },
    pageSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    dateTimeContainer: {
        alignItems: 'flex-end',
    },
    headerDateText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.primary,
    },
    timeText: {
        fontSize: 18,
        fontWeight: '500',
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
    legendContainer: {
        marginBottom: 20,
    },
    legendTitle: {
        fontSize: 16,
        fontWeight: '600',
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
        fontSize: 14,
        color: '#666',
    },
    listContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
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
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.darkGray,
    },
    equipmentText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    borrowerText: {
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
        fontSize: 12,
        color: '#666',
    },
    durationText: {
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
        position: 'relative',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '600',
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
        fontSize: 16,
        fontWeight: '500',
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
        fontSize: 14,
        color: '#000',
    },
});