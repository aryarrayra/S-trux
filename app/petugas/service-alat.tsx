import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Search, Plus, X, Send, CheckCircle } from 'lucide-react-native';
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
    tanggal_perawatan: string | null;
    keterangan: string | null;
    biaya_perawatan: number;
    status: 'Menunggu' | 'Dijadwalkan' | 'Selesai';
    alat?: AlatBerat;
}

export default function ServiceAlat() {
    const [searchTerm, setSearchTerm] = useState('');
    const [services, setServices] = useState<PerawatanAlat[]>([]);
    const [alatList, setAlatList] = useState<AlatBerat[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [modalRekomendasi, setModalRekomendasi] = useState(false);
    const [selectedAlatId, setSelectedAlatId] = useState<number | null>(null);
    const [alasan, setAlasan] = useState('');
    const [showAlatDropdown, setShowAlatDropdown] = useState(false);

    useEffect(() => {
        fetchServices();
        fetchAlatList();
        const interval = setInterval(() => {
            fetchServices();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/perawatan-alat`);
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                setServices(json.data);
            }
        } catch {
            Alert.alert('Error', 'Gagal memuat data');
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

    const ajukanRekomendasi = async () => {
        if (!selectedAlatId) {
            Alert.alert('Error', 'Pilih alat terlebih dahulu!');
            return;
        }
        if (!alasan.trim()) {
            Alert.alert('Error', 'Isi alasan/keluhan!');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/perawatan-alat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_alat: selectedAlatId,
                    tanggal_perawatan: null,
                    keterangan: `[REKOMENDASI PETUGAS]\n${alasan.trim()}`,
                    biaya_perawatan: 0,
                    status: 'Menunggu',
                }),
            });

            const result = await res.json();

            if (res.ok) {
                Alert.alert('Sukses!', 'Rekomendasi berhasil dikirim ke Admin');
                setModalRekomendasi(false);
                setAlasan('');
                setSelectedAlatId(null);
                setShowAlatDropdown(false);
                fetchServices();
            } else {
                Alert.alert('Gagal', result.message || 'Gagal mengirim rekomendasi');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Periksa koneksi internet');
        }
    };

    const filteredServices = services.filter(s =>
        s.alat?.nama_alat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.keterangan || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSelectedAlatName = () => {
        if (!selectedAlatId) return 'Pilih Alat Berat';
        const alat = alatList.find(a => a.id_alat === selectedAlatId);
        return alat?.nama_alat || 'Pilih Alat Berat';
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Belum Dijadwalkan';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const getStatusText = (status: string) => {
        if (status === 'Menunggu') return 'Menunggu Persetujuan Admin';
        if (status === 'Dijadwalkan') return 'Sudah Dijadwalkan';
        if (status === 'Selesai') return 'Sudah Selesai Diperbaiki';
        return status;
    };

    const getStatusColor = (status: string) => {
        if (status === 'Menunggu') return '#F59E0B';     
        if (status === 'Dijadwalkan') return '#16A34A';  
        if (status === 'Selesai') return '#3B82F6';     
        return '#666';
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <SideBar />

                <View style={styles.main}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Service Unit</Text>
                            <Text style={styles.subtitle}>Lihat status rekomendasi & ajukan service baru</Text>
                        </View>
                    </View>

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

                    {isLoading ? (
                        <ActivityIndicator size="large" color="#F59E0B" style={{ marginTop: 60 }} />
                    ) : filteredServices.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Belum ada rekomendasi service</Text>
                        </View>
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {filteredServices.map(service => {
                                const isRekomendasi = service.keterangan?.includes('[REKOMENDASI PETUGAS]');
                                const isSelesai = service.status === 'Selesai';

                                return (
                                    <View
                                        key={service.id_perawatan}
                                        style={[
                                            styles.card,
                                            service.status === 'Menunggu' && styles.cardMenunggu,
                                            service.status === 'Dijadwalkan' && styles.cardJadwal,
                                            isSelesai && styles.cardSelesai  
                                        ]}
                                    >
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.alatName}>
                                                {service.alat?.nama_alat || 'Alat #' + service.id_alat}
                                            </Text>
                                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                                {isRekomendasi && (
                                                    <View style={styles.badgeRekom}>
                                                        <Text style={styles.badgeText}>Rekomendasi Anda</Text>
                                                    </View>
                                                )}
                                                {isSelesai && (
                                                    <View style={styles.badgeSelesai}>
                                                        <CheckCircle size={16} color="#FFF" />
                                                        <Text style={styles.badgeText}>Selesai</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>

                                        <Text style={styles.keterangan}>
                                            {service.keterangan?.replace('[REKOMENDASI PETUGAS]\n', '').trim() || '-'}
                                        </Text>

                                        <View style={styles.cardFooter}>
                                            <Text style={styles.tanggal}>
                                                Tanggal: {formatDate(service.tanggal_perawatan)}
                                            </Text>
                                            <Text style={styles.biaya}>
                                                {formatCurrency(service.biaya_perawatan)}
                                            </Text>
                                        </View>

                                        <View style={styles.statusInfo}>
                                            <Text style={[styles.statusText, { color: getStatusColor(service.status) }]}>
                                                {getStatusText(service.status)}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>

                {}
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

                            <Text style={styles.label}>Alat Berat *</Text>
                            <TouchableOpacity style={styles.selectBox} onPress={() => setShowAlatDropdown(true)}>
                                <Text style={styles.selectText}>{getSelectedAlatName()}</Text>
                            </TouchableOpacity>

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

                            <Text style={styles.label}>Alasan / Keluhan *</Text>
                            <TextInput
                                style={styles.textArea}
                                multiline
                                numberOfLines={6}
                                placeholder="Contoh: HM sudah 4980 jam, getar keras, oli bocor, dll..."
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
    cardMenunggu: { borderLeftColor: '#F59E0B', backgroundColor: '#FFFBEB' },
    cardJadwal: { borderLeftColor: '#16A34A', backgroundColor: '#F0FDF4' },
    cardSelesai: { borderLeftColor: '#3B82F6', backgroundColor: '#EFF6FF' }, // Biru untuk selesai
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    alatName: { fontSize: 16, fontWeight: '600', flex: 1 },
    badgeRekom: { backgroundColor: '#F59E0B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, flexDirection: 'row', gap: 4, alignItems: 'center' },
    badgeSelesai: { backgroundColor: '#3B82F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, flexDirection: 'row', gap: 4, alignItems: 'center' },
    badgeText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
    keterangan: { color: '#444', marginBottom: 12, fontSize: 14, lineHeight: 20 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    tanggal: { fontSize: 13, color: '#666' },
    biaya: { fontWeight: '600', color: '#F59E0B' },
    statusInfo: { marginTop: 12, padding: 10, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8 },
    statusText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
    emptyContainer: { paddingVertical: 60, alignItems: 'center' },
    emptyText: { color: '#666', fontSize: 16 },
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
    textArea: { borderWidth: 1.5, borderColor: '#F59E0B', borderRadius: 8, padding: 14, textAlignVertical: 'top', height: 140, marginBottom: 20 },
    modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    btnBatal: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#E5E7EB', borderRadius: 20 },
    btnBatalText: { fontWeight: '600' },
    btnKirim: { flexDirection: 'row', gap: 8, backgroundColor: '#F59E0B', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
    btnKirimText: { color: '#FFF', fontWeight: '600' },
});