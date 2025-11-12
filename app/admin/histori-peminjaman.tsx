import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Clock4, History, X, Phone, FileText } from "lucide-react-native";
import SideBar from "@/components/admin/SideBar";
import { Stack } from "expo-router";

// Base URL API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

type HistoryItem = {
    id_sewa: number;
    alat: string;
    perusahaan: string;
    penyewa: string;
    tanggal: string;
    berakhir: string;
    lokasi: string;
    telp: string;
    dokumen: string;
    kondisi: string;
    status: string;
    statusTime: string;
    kategori: string;
    series: string;
    pelanggan?: any;
    alat_data?: any;
    created_at?: string;
    updated_at?: string;
    status_sewa?: string; // Tambahkan field asli dari database
};

export default function HistoriPeminjaman() {
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
    const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch data history dari API
    const fetchHistoryData = async () => {
        try {
            setLoading(true);
            console.log('Fetching history data from:', `${API_BASE_URL}/penyewaan`);
            
            const response = await fetch(`${API_BASE_URL}/penyewaan`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('History API Response:', result);
            
            if (result.success) {
                // DEBUG: Log semua data yang diterima dari API
                console.log('All data from API:', result.data);
                
                const formattedData = result.data.map((item: any) => {
                    // DEBUG: Log setiap item untuk melihat status_sewa
                    console.log('Item:', item.id_sewa, 'Status:', item.status_sewa, 'Alat:', item.alat?.nama_alat);
                    
                    // Format status untuk display - gunakan status_sewa langsung
                    const statusDisplay = mapStatusToDisplay(item.status_sewa);
                    
                    // Format waktu status
                    const statusTime = formatStatusTime(item.updated_at || item.created_at);
                    
                    return {
                        id_sewa: item.id_sewa,
                        alat: item.alat?.nama_alat || 'Tidak ada data',
                        perusahaan: item.pelanggan?.nama_pelanggan || 'Tidak ada data',
                        penyewa: item.pelanggan?.nama_pelanggan || 'Tidak ada data',
                        tanggal: formatDate(item.tanggal_sewa),
                        berakhir: item.tanggal_kembali ? formatDate(item.tanggal_kembali) : 'Belum ditentukan',
                        lokasi: 'Lokasi penyewaan',
                        telp: item.pelanggan?.no_telp || '-',
                        dokumen: `DOC-${String(item.id_sewa).padStart(3, '0')}`,
                        kondisi: getKondisiAlat(item.status_sewa),
                        status: statusDisplay,
                        status_sewa: item.status_sewa, // Simpan status asli dari database
                        statusTime: statusTime,
                        kategori: item.alat?.jenis || '-',
                        series: item.alat?.nama_alat || '-',
                        pelanggan: item.pelanggan,
                        alat_data: item.alat,
                        created_at: item.created_at,
                        updated_at: item.updated_at
                    };
                });
                
                // DEBUG: Log data setelah formatting
                console.log('Formatted data before filter:', formattedData);
                
                // PERBAIKAN: Filter data - gunakan status_sewa asli dari database
                const filteredData = formattedData.filter((item: HistoryItem) => {
                    const shouldInclude = 
                        item.status_sewa === 'Selesai' || 
                        item.status_sewa === 'Dibatalkan' ||
                        item.status_sewa === 'Berjalan'; // Tambahkan Berjalan jika mau
                    
                    console.log(`Item ${item.id_sewa} - status_sewa: ${item.status_sewa} - include: ${shouldInclude}`);
                    return shouldInclude;
                });
                
                // DEBUG: Log data setelah filter
                console.log('Data after filter:', filteredData);
                
                setHistoryData(filteredData);
                console.log('Final history data:', filteredData.length, 'items');
            } else {
                Alert.alert('Error', result.message || 'Gagal memuat data history');
                setHistoryData([]);
            }
        } catch (err: any) {
            console.error('Gagal fetch data history:', err);
            Alert.alert(
                'Error', 
                `Tidak dapat terhubung ke server: ${err.message}`
            );
            setHistoryData([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Mapping status dari database ke display - PERBAIKAN
    const mapStatusToDisplay = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'Berjalan': 'Disewa',
            'Selesai': 'Selesai', 
            'Dibatalkan': 'Dibatalkan',
            'Menunggu Persetujuan': 'Menunggu',
            'Disetujui': 'Disetujui',
            'Ditolak': 'Ditolak'
        };
        return statusMap[status] || status;
    };

    // Mendapatkan kondisi alat berdasarkan status
    const getKondisiAlat = (status: string) => {
        const kondisiMap: { [key: string]: string } = {
            'Berjalan': 'Baik - Sedang disewa',
            'Selesai': 'Baik - Sudah dikembalikan', 
            'Dibatalkan': 'Baik - Tidak jadi disewa',
            'Menunggu Persetujuan': 'Baik - Menunggu persetujuan',
            'Disetujui': 'Baik - Siap disewa',
            'Ditolak': 'Baik - Persetujuan ditolak'
        };
        return kondisiMap[status] || 'Baik';
    };

    // Format waktu status
    const formatStatusTime = (timestamp: string) => {
        if (!timestamp) return 'Waktu tidak tersedia';
        
        try {
            const now = new Date();
            const time = new Date(timestamp);
            const diffMs = now.getTime() - time.getTime();
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
            if (diffMins < 1) {
                return 'Baru saja';
            } else if (diffMins < 60) {
                return `${diffMins} menit yang lalu`;
            } else if (diffHours < 24) {
                return `${diffHours} jam yang lalu`;
            } else {
                return `${diffDays} hari yang lalu`;
            }
        } catch (error) {
            return 'Waktu tidak valid';
        }
    };

    // Format tanggal
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return '-';
        }
    };

    // Refresh data
    const handleRefresh = () => {
        setRefreshing(true);
        fetchHistoryData();
    };

    // Use effect untuk fetch data saat component mount
    useEffect(() => {
        fetchHistoryData();
    }, []);

    const getCurrentDate = () => {
        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember",
        ];
        const now = new Date();
        const dayName = days[now.getDay()];
        const date = now.getDate();
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        return {
            full: `${dayName}, ${date} ${month} ${year}`,
            time: `${hours}:${minutes} WIB`,
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
                            <Text style={styles.title}>Histori Pinjaman</Text>
                            <Text style={styles.subtitle}>
                                Riwayat Penyewaan Dan Pengembalian Alat Berat
                            </Text>
                            <Text style={styles.debugInfo}>
                                Menampilkan: Selesai, Dibatalkan, Berjalan
                            </Text>
                        </View>

                        <View style={styles.dateContainer}>
                            <Text style={styles.dateText}>{currentDate.full}</Text>
                            <Text style={styles.timeText}>{currentDate.time}</Text>
                            <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
                                <Text style={styles.refreshText}>
                                    {refreshing ? 'Memuat...' : 'Refresh'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.historyBox}>
                        <View style={styles.historyHeader}>
                            <History size={20} color="#F59E0B" />
                            <Text style={styles.historyTitle}>Histori Aktivitas</Text>
                            {!loading && (
                                <View style={styles.countBadge}>
                                    <Text style={styles.countText}>{historyData.length}</Text>
                                </View>
                            )}
                        </View>

                        {/* Loading State */}
                        {loading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#F59E0B" />
                                <Text style={styles.loadingText}>Memuat data history...</Text>
                            </View>
                        )}

                        {/* Empty State */}
                        {!loading && historyData.length === 0 && (
                            <View style={styles.emptyContainer}>
                                <History size={48} color="#D1D5DB" />
                                <Text style={styles.emptyTitle}>Tidak Ada Data History</Text>
                                <Text style={styles.emptySubtitle}>
                                    Belum ada riwayat penyewaan dengan status Selesai atau Dibatalkan
                                </Text>
                                <Text style={styles.emptyDebug}>
                                    Periksa console untuk debug information
                                </Text>
                                <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
                                    <Text style={styles.retryText}>Muat Ulang Data</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* History List */}
                        {!loading && historyData.length > 0 && (
                            <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
                                {historyData.map((item, index) => (
                                    <TouchableOpacity
                                        key={item.id_sewa || index}
                                        onPress={() => setSelectedItem(item)}
                                        style={styles.historyItem}
                                    >
                                        <View style={[styles.bullet, getStatusBulletColor(item.status)]} />
                                        <View style={styles.historyContent}>
                                            <Text style={styles.alatText}>{item.alat}</Text>
                                            <Text style={styles.companyText}>{item.perusahaan}</Text>
                                            <View style={styles.timeContainer}>
                                                <Clock4 size={12} color="#F59E0B" />
                                                <Text style={styles.timeAgo}>{item.statusTime}</Text>
                                                <View style={[styles.statusBadge, getStatusBackgroundColor(item.status)]}>
                                                    <Text style={[styles.statusText, getStatusColor(item.status)]}>
                                                        {item.status}
                                                    </Text>
                                                </View>
                                                <Text style={styles.debugStatus}>
                                                    (DB: {item.status_sewa})
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                </View>

                {/* Modal Detail */}
                <Modal
                    visible={selectedItem !== null}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setSelectedItem(null)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalWrapper}>
                            <View style={styles.gradientLayer1} />
                            <View style={styles.gradientLayer2} />
                            <View style={styles.gradientLayer3} />
                            <View style={styles.gradientLayer4} />
                            <View style={styles.modalContent}>
                                <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedItem(null)}>
                                    <X size={24} color="#EF4444" />
                                </TouchableOpacity>

                                <Text style={styles.modalTitle}>{selectedItem?.alat}</Text>

                                <View style={styles.divider} />

                                <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
                                    <Text style={styles.sectionTitle}>Informasi Sewa</Text>

                                    <View style={styles.fieldContainer}>
                                        <View style={styles.twoColumnRow}>
                                            <View style={styles.leftColumn}>
                                                <Text style={styles.label}>Tanggal Sewa</Text>
                                                <View style={styles.input}>
                                                    <Text style={styles.inputText}>{selectedItem?.tanggal}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.rightColumn}>
                                                <Text style={styles.label}>Nama Penyewa</Text>
                                                <View style={styles.input}>
                                                    <Text style={styles.inputText}>{selectedItem?.penyewa}</Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.twoColumnRow}>
                                            <View style={styles.leftColumn}>
                                                <Text style={styles.label}>Sewa Berakhir</Text>
                                                <View style={styles.input}>
                                                    <Text style={styles.inputText}>{selectedItem?.berakhir}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.rightColumn}>
                                                <Text style={styles.label}>Nama Perusahaan</Text>
                                                <View style={styles.input}>
                                                    <Text style={styles.inputText}>{selectedItem?.perusahaan}</Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.twoColumnRow}>
                                            <View style={styles.leftColumn}>
                                                <Text style={styles.label}>Lokasi</Text>
                                                <View style={styles.input}>
                                                    <Text style={styles.inputText}>{selectedItem?.lokasi}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.rightColumn}>
                                                <Text style={styles.label}>Nomor Telepon</Text>
                                                <View style={[styles.input, styles.inputWithIcon]}>
                                                    <Text style={styles.inputText}>{selectedItem?.telp}</Text>
                                                    <Phone size={18} color="#F59E0B" strokeWidth={2.5} />
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.rightColumnOnly}>
                                            <Text style={styles.label}>ID Dokumen</Text>
                                            <View style={[styles.input, styles.inputWithIcon]}>
                                                <Text style={styles.inputText}>{selectedItem?.dokumen}</Text>
                                                <FileText size={18} color="#F59E0B" strokeWidth={2.5} />
                                            </View>
                                        </View>
                                    </View>

                                    <Text style={styles.sectionTitle}>Informasi Unit</Text>

                                    <View style={styles.fieldContainer}>
                                        <View style={styles.twoColumnRow}>
                                            <View style={styles.leftColumn}>
                                                <Text style={styles.label}>Kategori Unit</Text>
                                                <View style={styles.input}>
                                                    <Text style={styles.inputText}>{selectedItem?.kategori}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.rightColumn}>
                                                <Text style={styles.label}>Status Unit</Text>
                                                <View style={styles.input}>
                                                    <Text style={styles.inputText}>{selectedItem?.status}</Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.leftColumnOnly}>
                                            <Text style={styles.label}>Series</Text>
                                            <View style={styles.input}>
                                                <Text style={styles.inputText}>{selectedItem?.series}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.leftColumnOnly}>
                                            <Text style={styles.label}>Kondisi</Text>
                                            <View style={styles.input}>
                                                <Text style={styles.inputText}>{selectedItem?.kondisi}</Text>
                                            </View>
                                        </View>

                                        {/* Debug Information */}
                                        <View style={styles.leftColumnOnly}>
                                            <Text style={styles.debugLabel}>Status Database</Text>
                                            <View style={styles.debugInput}>
                                                <Text style={styles.debugInputText}>{selectedItem?.status_sewa}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Informasi Tambahan dari API */}
                                    {selectedItem?.created_at && (
                                        <>
                                            <Text style={styles.sectionTitle}>Informasi Sistem</Text>
                                            <View style={styles.fieldContainer}>
                                                <View style={styles.twoColumnRow}>
                                                    <View style={styles.leftColumn}>
                                                        <Text style={styles.label}>Dibuat Pada</Text>
                                                        <View style={styles.input}>
                                                            <Text style={styles.inputText}>
                                                                {formatDate(selectedItem.created_at)} {new Date(selectedItem.created_at).toLocaleTimeString('id-ID')}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <View style={styles.rightColumn}>
                                                        <Text style={styles.label}>Diupdate Pada</Text>
                                                        <View style={styles.input}>
                                                            <Text style={styles.inputText}>
                                                                {selectedItem.updated_at ? 
                                                                    `${formatDate(selectedItem.updated_at)} ${new Date(selectedItem.updated_at).toLocaleTimeString('id-ID')}` 
                                                                    : '-'
                                                                }
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </>
                                    )}
                                </ScrollView>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </>
    );
}

// Helper functions untuk styling
const getStatusBulletColor = (status: string) => {
    switch (status) {
        case 'Disewa': return { backgroundColor: '#F59E0B' };
        case 'Selesai': return { backgroundColor: '#10B981' };
        case 'Dibatalkan': return { backgroundColor: '#EF4444' };
        default: return { backgroundColor: '#6B7280' };
    }
};

const getStatusBackgroundColor = (status: string) => {
    switch (status) {
        case 'Disewa': return { backgroundColor: '#FEF3C7' };
        case 'Selesai': return { backgroundColor: '#D1FAE5' };
        case 'Dibatalkan': return { backgroundColor: '#FEE2E2' };
        default: return { backgroundColor: '#F3F4F6' };
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Disewa': return { color: '#F59E0B' };
        case 'Selesai': return { color: '#10B981' };
        case 'Dibatalkan': return { color: '#EF4444' };
        default: return { color: '#6B7280' };
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#F9F9F9"
    },
    mainContent: {
        flex: 1,
        padding: 40
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontFamily: "Poppins_600SemiBold",
        color: "#F59E0B"
    },
    subtitle: {
        fontSize: 14,
        color: "#555",
        fontFamily: "Poppins_400Regular"
    },
    apiInfo: {
        fontFamily: "Poppins_400Regular",
        fontSize: 10,
        color: "#666",
        marginTop: 2,
    },
    debugInfo: {
        fontFamily: "Poppins_400Regular",
        fontSize: 10,
        color: "#EF4444",
        marginTop: 2,
    },
    dateContainer: {
        alignItems: "flex-end"
    },
    dateText: {
        fontSize: 14,
        fontFamily: "Poppins_500Medium",
        color: "#F59E0B"
    },
    timeText: {
        fontSize: 16,
        fontFamily: "Poppins_500Medium",
        color: "#333"
    },
    refreshButton: {
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: "#F59E0B",
        borderRadius: 6,
    },
    refreshText: {
        fontFamily: "Poppins_500Medium",
        fontSize: 12,
        color: 'white',
    },
    historyBox: {
        backgroundColor: "#FFF6E5",
        borderWidth: 1.5,
        borderColor: "#F6C76F",
        borderRadius: 12,
        padding: 20,
        flex: 1,
    },
    historyHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#F6C76F",
        paddingBottom: 8,
    },
    historyTitle: {
        fontSize: 16,
        fontFamily: "Poppins_600SemiBold",
        color: "#F59E0B",
        marginLeft: 8,
    },
    countBadge: {
        backgroundColor: "#F59E0B",
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8,
    },
    countText: {
        fontSize: 12,
        fontFamily: "Poppins_500Medium",
        color: "white",
    },
    loadingContainer: {
        padding: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        fontSize: 14,
        fontFamily: "Poppins_400Regular",
        color: "#666",
        marginTop: 10,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontFamily: "Poppins_600SemiBold",
        color: "#6B7280",
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        fontFamily: "Poppins_400Regular",
        color: "#9CA3AF",
        textAlign: "center",
        marginBottom: 8,
    },
    emptyDebug: {
        fontSize: 12,
        fontFamily: "Poppins_400Regular",
        color: "#EF4444",
        textAlign: "center",
        marginBottom: 24,
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: "#F59E0B",
        borderRadius: 8,
    },
    retryText: {
        fontFamily: "Poppins_500Medium",
        fontSize: 14,
        color: "white",
    },
    historyList: {
        marginTop: 10
    },
    historyItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        borderBottomWidth: 1,
        borderBottomColor: "#F6C76F",
        paddingVertical: 12,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 6,
        marginRight: 10,
    },
    historyContent: {
        flex: 1
    },
    alatText: {
        fontSize: 14,
        fontFamily: "Poppins_500Medium",
        color: "#333"
    },
    companyText: {
        fontSize: 12,
        fontFamily: "Poppins_400Regular",
        color: "#F59E0B",
        marginTop: 2,
    },
    timeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4
    },
    timeAgo: {
        fontSize: 11,
        color: "#666",
        marginLeft: 4,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontFamily: "Poppins_500Medium",
    },
    debugStatus: {
        fontSize: 9,
        color: "#6B7280",
        marginLeft: 4,
        fontFamily: "Poppins_400Regular",
    },
    debugLabel: {
        fontSize: 11,
        fontFamily: "Poppins_500Medium",
        color: "#EF4444",
        marginBottom: 6,
    },
    debugInput: {
        backgroundColor: "#FEF2F2",
        borderWidth: 1.5,
        borderColor: "#EF4444",
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        minHeight: 42,
        justifyContent: "center",
    },
    debugInputText: {
        fontSize: 11,
        fontFamily: "Poppins_400Regular",
        color: "#EF4444",
        flex: 1,
    },
    // ... (styles lainnya tetap sama)
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalWrapper: {
        width: "50%",
        maxWidth: 600,
        maxHeight: "90%",
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
    },
    gradientLayer1: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "60%",
        backgroundColor: "#EA580C",
        opacity: 0.15,
        zIndex: 0,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    gradientLayer2: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "45%",
        backgroundColor: "#EA580C",
        opacity: 0.25,
        zIndex: 0,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    gradientLayer3: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "30%",
        backgroundColor: "#EA580C",
        opacity: 0.4,
        zIndex: 0,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    gradientLayer4: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "15%",
        backgroundColor: "#EA580C",
        opacity: 0.6,
        zIndex: 0,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    modalContent: {
        flex: 1,
        backgroundColor: "#FFFEF8",
        borderRadius: 16,
        padding: 28,
        paddingTop: 20,
        paddingBottom: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 1,
    },
    closeButton: {
        alignSelf: "flex-end",
        padding: 4,
        marginBottom: 6,
        zIndex: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: "Poppins_600SemiBold",
        color: "#F59E0B",
        textAlign: "center",
        marginBottom: 12,
    },
    divider: {
        height: 2,
        backgroundColor: "#F59E0B",
        marginBottom: 20,
    },
    scrollContent: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: "Poppins_600SemiBold",
        color: "#F59E0B",
        marginBottom: 14,
        marginTop: 4,
        marginLeft: 0,
    },
    fieldContainer: {
        paddingLeft: 30,
        paddingRight: 30,
        marginBottom: 8,
    },
    twoColumnRow: {
        flexDirection: "row",
        marginBottom: 16,
    },
    leftColumn: {
        flex: 1,
        paddingRight: 16,
    },
    rightColumn: {
        flex: 1,
        paddingLeft: 16,
    },
    leftColumnOnly: {
        width: "50%",
        paddingRight: 16,
        marginBottom: 16,
    },
    rightColumnOnly: {
        width: "50%",
        paddingLeft: 16,
        marginBottom: 16,
        alignSelf: "flex-end",
    },
    label: {
        fontSize: 11,
        fontFamily: "Poppins_500Medium",
        color: "#000",
        marginBottom: 6,
    },
    input: {
        backgroundColor: "#FFF",
        borderWidth: 1.5,
        borderColor: "#F59E0B",
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        minHeight: 42,
        justifyContent: "center",
    },
    inputWithIcon: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingRight: 10,
    },
    inputText: {
        fontSize: 11,
        fontFamily: "Poppins_400Regular",
        color: "#000",
        flex: 1,
    },
});