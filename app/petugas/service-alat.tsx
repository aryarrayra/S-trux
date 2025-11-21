import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { Search, Plus, X, Send } from 'lucide-react-native';
import SideBar from '@/components/petugas/SideBar';
import { Stack } from 'expo-router';

const API_BASE = 'http://localhost:8000/api';

interface AlatBerat {
    id_alat: number;
    nama_alat: string;
    kategori?: string;
}

interface PerawatanAlat {
    id_perawatan: number;
    id_alat: number;
    tanggal_perawatan: string;
    keterangan: string | null;
    biaya_perawatan: number;
    status: 'Dijadwalkan' | 'Selesai';
    alat?: AlatBerat;
}

export default function ServiceAlat() {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [services, setServices] = useState<PerawatanAlat[]>([]);
    const [alatList, setAlatList] = useState<AlatBerat[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Modal Ajukan Rekomendasi
    const [modalRekomendasi, setModalRekomendasi] = useState<boolean>(false);
    const [selectedAlatId, setSelectedAlatId] = useState<number | null>(null); // ← ini yang bener
    const [alasan, setAlasan] = useState<string>('');
    const [showAlatDropdown, setShowAlatDropdown] = useState<boolean>(false);

    useEffect(() => {
        fetchServices();
        fetchAlatList();
    }, []);

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/perawatan-alat`);
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                setServices(json.data);
            }
        } catch (err) {
            Alert.alert('Error', 'Gagal memuat jadwal');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAlatList = async () => {
        try {
            const res = await fetch(`${API_BASE}/alat-berat`);
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                setAlatList(json.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // === AJUKAN REKOMENDASI KE ADMIN ===
    const ajukanRekomendasi = async () => {
        if (!selectedAlatId || !alasan.trim()) {
            Alert.alert('Error', 'Pilih alat dan isi alasan rekomendasi!');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/perawatan-alat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_alat: selectedAlatId,
                    tanggal_perawatan: '2000-01-01', // dummy biar admin tau ini rekomendasi
                    keterangan: `[REKOMENDASI PETUGAS]\n${alasan.trim()}`,
                    biaya_perawatan: 0,
                    status: 'Dijadwalkan' as const,
                }),
            });

            if (!response.ok) throw new Error('Gagal mengirim');

            Alert.alert('Sukses!', 'Rekomendasi service berhasil dikirim ke Admin 🚀');
            setModalRekomendasi(false);
            setSelectedAlatId(null);
            setAlasan('');
            setShowAlatDropdown(false);
            fetchServices();
        } catch (err) {
            Alert.alert('Gagal', 'Tidak bisa mengirim rekomendasi');
        }
    };

    const filteredServices = services.filter(s =>
        s.alat?.nama_alat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.keterangan || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSelectedAlatName = (): string => {
        if (!selectedAlatId) return 'Pilih Alat Berat';
        const alat = alatList.find(a => a.id_alat === selectedAlatId);
        return alat?.nama_alat || 'Pilih Alat Berat';
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateStr: string): string => {
        if (dateStr === '2000-01-01') return 'Menunggu Jadwal dari Admin';
        return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <SideBar />

                <View style={styles.main}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Service Unit</Text>
                            <Text style={styles.subtitle}>Lihat jadwal & ajukan rekomendasi service</Text>
                        </View>
                    </View>

                    {/* Search + Ajukan Button */}
                    <View style={styles.topBar}>
                        <View style={styles.searchBox}>
                            <Search size={20} color="#999" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Cari alat atau keterangan..."
                                value={searchTerm}
                                onChangeText={setSearchTerm}
                            />
                        </View>
                        <TouchableOpacity style={styles.btnAjukan} onPress={() => setModalRekomendasi(true)}>
                            <Plus size={20} color="#FFF" />
                            <Text style={styles.btnText}>Ajukan Rekomendasi</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Loading */}
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#F59E0B" style={{ marginTop: 60 }} />
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {filteredServices.length === 0 ? (
                                <Text style={styles.empty}>Belum ada jadwal maintenance</Text>
                            ) : (
                                filteredServices.map(service => {
                                    const isRekomendasi = service.keterangan?.includes('[REKOMENDASI PETUGAS]');
                                    const belumDijadwalkan = service.tanggal_perawatan === '2000-01-01';

                                    return (
                                        <View key={service.id_perawatan} style={[styles.card, belumDijadwalkan && styles.cardPending]}>
                                            <View style={styles.cardHeader}>
                                                <Text style={styles.alatName}>
                                                    {service.alat?.nama_alat || 'Alat #' + service.id_alat}
                                                </Text>
                                                {isRekomendasi && (
                                                    <View style={styles.badgeRekom}>
                                                        <Text style={styles.badgeText}>Rekomendasi Anda</Text>
                                                    </View>
                                                )}
                                            </View>

                                            <Text style={styles.keterangan}>
                                                {service.keterangan?.replace('[REKOMENDASI PETUGAS]\n', '') || '-'}
                                            </Text>

                                            <View style={styles.cardFooter}>
                                                <Text style={styles.tanggal}>📅 {formatDate(service.tanggal_perawatan)}</Text>
                                                <Text style={styles.biaya}>{formatCurrency(service.biaya_perawatan)}</Text>
                                            </View>

                                            {belumDijadwalkan && (
                                                <View style={styles.pendingInfo}>
                                                    <Text style={styles.pendingText}>Menunggu Admin menjadwalkan...</Text>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })
                            )}
                        </ScrollView>
                    )}
                </View>

                {/* Modal Ajukan Rekomendasi */}
                <Modal visible={modalRekomendasi} transparent animationType="fade">
                    <View style={styles.overlay}>
                        <View style={styles.modal}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Ajukan Rekomendasi Service</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setModalRekomendasi(false);
                                        setSelectedAlatId(null);
                                        setAlasan('');
                                        setShowAlatDropdown(false);
                                    }}
                                >
                                    <X size={24} color="#F59E0B" />
                                </TouchableOpacity>
                            </View>

                            {/* Pilih Alat */}
                            <Text style={styles.label}>Alat Berat *</Text>
                            <TouchableOpacity style={styles.selectBox} onPress={() => setShowAlatDropdown(true)}>
                                <Text style={styles.selectText}>{getSelectedAlatName()}</Text>
                            </TouchableOpacity>

                            {/* Dropdown Alat */}
                            <Modal visible={showAlatDropdown} transparent animationType="fade">
                                <TouchableOpacity style={styles.dropdownOverlay} onPress={() => setShowAlatDropdown(false)}>
                                    <View style={styles.dropdown}>
                                        <ScrollView>
                                            {alatList.map(alat => (
                                                <TouchableOpacity
                                                    key={alat.id_alat}
                                                    style={styles.dropdownItem}
                                                    onPress={() => {
                                                        setSelectedAlatId(alat.id_alat);
                                                        setShowAlatDropdown(false);
                                                    }}
                                                >
                                                    <Text style={styles.dropdownText}>{alat.nama_alat}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                </TouchableOpacity>
                            </Modal>

                            {/* Alasan */}
                            <Text style={styles.label}>Alasan / Keluhan *</Text>
                            <TextInput
                                style={styles.textArea}
                                multiline
                                numberOfLines={5}
                                placeholder="Contoh: HM sudah 4980, getar keras, oli bocor, dll..."
                                value={alasan}
                                onChangeText={setAlasan}
                            />

                            <View style={styles.modalFooter}>
                                <TouchableOpacity style={styles.btnBatal} onPress={() => setModalRekomendasi(false)}>
                                    <Text style={styles.btnBatalText}>Batal</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnKirim} onPress={ajukanRekomendasi}>
                                    <Send size={18} color="#FFF" />
                                    <Text style={styles.btnKirimText}>Kirim ke Admin</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </>
    );
}

// Styles tetap sama (aku copy dari versi sebelumnya yang udah bagus)
const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: 'row', backgroundColor: '#FFF' },
    main: { flex: 1, padding: 24 },
    header: { marginBottom: 20 },
    title: { fontSize: 28, fontWeight: '700', color: '#F59E0B' },
    subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
    topBar: { flexDirection: 'row', marginBottom: 20, gap: 12, alignItems: 'center' },
    searchBox: { flex: 1, flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 12, alignItems: 'center' },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14 },
    btnAjukan: { flexDirection: 'row', backgroundColor: '#F59E0B', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, alignItems: 'center', gap: 8 },
    btnText: { color: '#FFF', fontWeight: '600' },
    card: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, marginBottom: 12, borderLeftWidth: 5, borderLeftColor: '#D4A574' },
    cardPending: { borderLeftColor: '#DC2626', backgroundColor: '#FEF2F2' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    alatName: { fontSize: 16, fontWeight: '600' },
    badgeRekom: { backgroundColor: '#DC2626', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
    keterangan: { color: '#444', marginBottom: 12, fontSize: 14 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    tanggal: { fontSize: 13, color: '#666' },
    biaya: { fontWeight: '600', color: '#F59E0B' },
    pendingInfo: { marginTop: 12, padding: 10, backgroundColor: '#FFF4E5', borderRadius: 8 },
    pendingText: { fontSize: 12, color: '#D97706', fontStyle: 'italic', textAlign: 'center' },
    empty: { textAlign: 'center', marginTop: 60, color: '#666', fontSize: 16 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modal: { backgroundColor: '#FFF', width: '90%', maxWidth: 400, borderRadius: 16, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: '600', color: '#F59E0B' },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
    selectBox: { borderWidth: 1.5, borderColor: '#F59E0B', borderRadius: 8, padding: 14, marginBottom: 16 },
    selectText: { fontSize: 14, color: '#333' },
    dropdownOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    dropdown: { backgroundColor: '#FFF', width: '80%', maxHeight: 300, borderRadius: 12, elevation: 5 },
    dropdownItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    dropdownText: { fontSize: 14 },
    textArea: { borderWidth: 1.5, borderColor: '#F59E0B', borderRadius: 8, padding: 14, textAlignVertical: 'top', height: 120, marginBottom: 20 },
    modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    btnBatal: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#E5E7EB', borderRadius: 20 },
    btnBatalText: { fontWeight: '600' },
    btnKirim: { flexDirection: 'row', gap: 8, backgroundColor: '#F59E0B', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
    btnKirimText: { color: '#FFF', fontWeight: '600' },
});