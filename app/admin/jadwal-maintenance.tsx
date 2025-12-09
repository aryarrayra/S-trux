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
    Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
    Search,
    RefreshCw,
    Calendar,
    AlertTriangle,
    X,
    Check,
    CheckCircle,
} from 'lucide-react-native';
import SideBar from '@/components/admin/SideBar';
import { Stack } from 'expo-router';

const API_BASE = 'http://localhost:8000/api';

interface AlatBerat {
    id_alat: number;
    nama_alat: string;
    kode_alat?: string;
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

export default function JadwalMaintenance() {
    const [schedules, setSchedules] = useState<PerawatanAlat[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PerawatanAlat | null>(null);
    const [tanggal, setTanggal] = useState<Date>(new Date());
    const [tanggalInput, setTanggalInput] = useState<string>('');
    const [showPicker, setShowPicker] = useState(false);
    const [biaya, setBiaya] = useState<string>('');

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/perawatan-alat`);
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                setSchedules(json.data);
            }
        } catch {
            Alert.alert('Error', 'Gagal memuat data');
        } finally {
            setIsLoading(false);
        }
    };

    const [modalSelesai, setModalSelesai] = useState(false);
    const [itemSelesai, setItemSelesai] = useState<PerawatanAlat | null>(null);

    const bukaModalSelesai = (item: PerawatanAlat) => {
        setItemSelesai(item);
        setModalSelesai(true);
    };

    const konfirmasiSelesai = async () => {
        if (!itemSelesai) return;

        setSaving(true);
        try {
            let res = await fetch(`${API_BASE}/perawatan-alat/${itemSelesai.id_perawatan}/selesai`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) {
                res = await fetch(`${API_BASE}/perawatan-alat/${itemSelesai.id_perawatan}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_alat: itemSelesai.id_alat,
                        tanggal_perawatan: itemSelesai.tanggal_perawatan,
                        keterangan: itemSelesai.keterangan,
                        biaya_perawatan: itemSelesai.biaya_perawatan,
                        status: 'Selesai',
                    }),
                });
            }

            if (res.ok) {
                setSchedules(prev => prev.map(item =>
                    item.id_perawatan === itemSelesai.id_perawatan
                        ? { ...item, status: 'Selesai' as const }
                        : item
                ));
                setModalSelesai(false);
                setItemSelesai(null);
                setTimeout(() => {
                    fetchSchedules();
                }, 300);
            } else {
                const errorData = await res.json().catch(() => ({}));
                Alert.alert('Gagal', errorData.message || 'Server menolak permintaan');
            }
        } catch (error) {
            console.error('Error tandai selesai:', error);
            Alert.alert('Error', 'Koneksi bermasalah: ' + error);
        } finally {
            setSaving(false);
        }
    };
    const bukaModalAcc = (item: PerawatanAlat) => {
        setSelectedItem(item);
        setTanggal(new Date());
        setTanggalInput(formatTanggalInput(new Date()));
        setBiaya('');
        setModalVisible(true);
    };
    const formatTanggalInput = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    const parseTanggalInput = (input: string): Date | null => {
        const parts = input.split('/');
        if (parts.length !== 3) return null;

        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);

        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
        if (day < 1 || day > 31 || month < 0 || month > 11 || year < 2000) return null;

        const date = new Date(year, month, day);
        if (date.getDate() !== day || date.getMonth() !== month) return null;

        return date;
    };

    const handleTanggalChange = (text: string) => {
        const cleaned = text.replace(/[^0-9/]/g, '');

        let formatted = cleaned;
        if (cleaned.length === 2 && !cleaned.includes('/')) {
            formatted = cleaned + '/';
        } else if (cleaned.length === 5 && cleaned.split('/').length === 2) {
            formatted = cleaned + '/';
        }

        setTanggalInput(formatted);
        if (formatted.length === 10) {
            const parsedDate = parseTanggalInput(formatted);
            if (parsedDate) {
                setTanggal(parsedDate);
            }
        }
    };

    const handleDatePickerChange = (event: any, selectedDate?: Date) => {
        setShowPicker(Platform.OS === 'ios');
        if (selectedDate) {
            setTanggal(selectedDate);
            setTanggalInput(formatTanggalInput(selectedDate));
        }
    };

    const simpanAcc = async () => {
        if (!selectedItem) return;

        const finalDate = parseTanggalInput(tanggalInput);
        if (!finalDate) {
            Alert.alert('Error', 'Format tanggal tidak valid! Gunakan format DD/MM/YYYY');
            return;
        }

        const biayaNum = parseInt(biaya.replace(/\./g, '').replace(/,/g, '')) || 0;

        if (biayaNum === 0) {
            Alert.alert('Error', 'Biaya harus diisi!');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                id_alat: selectedItem.id_alat,
                tanggal_perawatan: finalDate.toISOString().split('T')[0],
                keterangan: selectedItem.keterangan,
                biaya_perawatan: biayaNum,
                status: 'Dijadwalkan',
            };

            const res = await fetch(`${API_BASE}/perawatan-alat/${selectedItem.id_perawatan}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                setSchedules(prev => prev.map(item =>
                    item.id_perawatan === selectedItem.id_perawatan
                        ? {
                            ...item,
                            status: 'Dijadwalkan' as const,
                            tanggal_perawatan: finalDate.toISOString().split('T')[0],
                            biaya_perawatan: biayaNum
                        }
                        : item
                ));

                setModalVisible(false);
                setBiaya('');
                setTanggalInput('');
                setSelectedItem(null);
                fetchSchedules();
            } else {
                Alert.alert('Gagal', result.message || 'Server menolak');
            }
        } catch (error) {
            Alert.alert('Error', 'Koneksi bermasalah: ' + error);
        } finally {
            setSaving(false);
        }
    };

    const handleBiayaChange = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        const formatted = cleaned ? Number(cleaned).toLocaleString('id-ID') : '';
        setBiaya(formatted);
    };

    const filtered = schedules.filter(item => {
        const q = searchQuery.toLowerCase();
        const nama = item.alat?.nama_alat?.toLowerCase() || '';
        const ket = item.keterangan?.toLowerCase() || '';
        return nama.includes(q) || ket.includes(q);
    });

    const jumlahMenunggu = filtered.filter(i => i.status === 'Menunggu').length;

    const formatTanggal = (tgl: string | null) => {
        if (!tgl) return 'Belum Ditentukan';
        const date = new Date(tgl);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <SideBar />
                <View style={styles.main}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Jadwal Maintenance</Text>
                        <Text style={styles.dateHeader}>
                            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </Text>
                    </View>

                    {jumlahMenunggu > 0 && (
                        <View style={styles.warningBox}>
                            <AlertTriangle size={20} color="#DC2626" />
                            <Text style={styles.warningText}>
                                {jumlahMenunggu} rekomendasi menunggu persetujuan
                            </Text>
                        </View>
                    )}

                    <View style={styles.searchContainer}>
                        <View style={styles.searchBox}>
                            <Search size={20} color="#999" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Cari nama alat atau keterangan..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                        <TouchableOpacity onPress={fetchSchedules} style={styles.refreshButton}>
                            <RefreshCw size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Daftar Rekomendasi Service</Text>
                        </View>

                        <View style={styles.tableHeader}>
                            <Text style={[styles.th, { flex: 2 }]}>Unit</Text>
                            <Text style={[styles.th, { flex: 2.5 }]}>Keterangan</Text>
                            <Text style={[styles.th, { flex: 1.3 }]}>Tanggal</Text>
                            <Text style={[styles.th, { flex: 1.2 }]}>Biaya</Text>
                            <Text style={[styles.th, { flex: 1 }]}>Status</Text>
                            <Text style={[styles.th, { flex: 1.2 }]}>Aksi</Text>
                        </View>

                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#F59E0B" />
                            </View>
                        ) : filtered.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Tidak ada rekomendasi service</Text>
                            </View>
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {filtered.map(item => {
                                    const menunggu = item.status === 'Menunggu';
                                    const dijadwalkan = item.status === 'Dijadwalkan';

                                    return (
                                        <View key={item.id_perawatan} style={[styles.tableRow, menunggu && styles.rowPending]}>
                                            <View style={[styles.td, { flex: 2 }]}>
                                                <Text style={styles.unitName}>{item.alat?.nama_alat || '—'}</Text>
                                            </View>
                                            <View style={[styles.td, { flex: 2.5 }]}>
                                                <Text style={styles.ketText} numberOfLines={2}>
                                                    {item.keterangan?.replace('[REKOMENDASI PETUGAS]\n', '').trim() || '—'}
                                                </Text>
                                            </View>
                                            <View style={[styles.td, { flex: 1.3 }]}>
                                                <Text style={styles.tdText}>{formatTanggal(item.tanggal_perawatan)}</Text>
                                            </View>
                                            <View style={[styles.td, { flex: 1.2 }]}>
                                                <Text style={styles.tdText}>
                                                    Rp {item.biaya_perawatan.toLocaleString('id-ID')}
                                                </Text>
                                            </View>
                                            <View style={[styles.td, { flex: 1 }]}>
                                                <Text style={[styles.statusText, {
                                                    color: menunggu ? '#DC2626' : dijadwalkan ? '#16A34A' : '#6B7280'
                                                }]}>
                                                    {menunggu ? 'Menunggu' : dijadwalkan ? 'Dijadwalkan' : 'Selesai'}
                                                </Text>
                                            </View>
                                            <View style={[styles.tdAction, { flex: 1.2 }]}>
                                                {menunggu && (
                                                    <TouchableOpacity
                                                        style={styles.btnSetujui}
                                                        onPress={() => bukaModalAcc(item)}
                                                    >
                                                        <CheckCircle size={22} color="#16A34A" />
                                                    </TouchableOpacity>
                                                )}
                                                {dijadwalkan && (
                                                    <TouchableOpacity
                                                        style={styles.btnSelesai}
                                                        onPress={() => bukaModalSelesai(item)}
                                                    >
                                                        <Check size={22} color="#3B82F6" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    );
                                })}
                            </ScrollView>
                        )}
                    </View>
                </View>

                {}
                <Modal visible={modalVisible} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Setujui Rekomendasi</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <X size={28} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.modalUnitName}>
                                {selectedItem?.alat?.nama_alat}
                            </Text>

                            <Text style={styles.modalKeterangan}>
                                {selectedItem?.keterangan?.replace('[REKOMENDASI PETUGAS]\n', '').trim() || 'Tidak ada keterangan'}
                            </Text>

                            <Text style={styles.modalLabel}>Tanggal Service *</Text>
                            <View style={styles.dateInputContainer}>
                                <TextInput
                                    style={styles.dateInput}
                                    placeholder="DD/MM/YYYY"
                                    placeholderTextColor="#999"
                                    value={tanggalInput}
                                    onChangeText={handleTanggalChange}
                                    maxLength={10}
                                    keyboardType="numeric"
                                />
                                <TouchableOpacity
                                    style={styles.calendarBtn}
                                    onPress={() => setShowPicker(true)}
                                >
                                    <Calendar size={22} color="#F59E0B" />
                                </TouchableOpacity>
                            </View>

                            {showPicker && (
                                <DateTimePicker
                                    value={tanggal}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleDatePickerChange}
                                />
                            )}

                            <Text style={styles.modalLabel}>Estimasi Biaya (Rp) *</Text>
                            <TextInput
                                style={styles.biayaInput}
                                keyboardType="numeric"
                                placeholder="Masukkan estimasi biaya"
                                placeholderTextColor="#999"
                                value={biaya}
                                onChangeText={handleBiayaChange}
                            />

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.btnBatal} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.btnBatalText}>Batal</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btnSimpan, saving && { opacity: 0.7 }]}
                                    onPress={simpanAcc}
                                    disabled={saving}
                                >
                                    {saving ? <ActivityIndicator color="#FFF" /> : <Check size={18} color="#FFF" />}
                                    <Text style={styles.btnSimpanText}>
                                        {saving ? 'Menyimpan...' : 'Setujui & Jadwalkan'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {}
                <Modal visible={modalSelesai} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { maxWidth: 420 }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: '#3B82F6' }]}>Tandai Selesai</Text>
                                <TouchableOpacity onPress={() => setModalSelesai(false)}>
                                    <X size={28} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.warningBox, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                                <Check size={24} color="#3B82F6" />
                                <Text style={[styles.warningText, { flex: 1, marginLeft: 12, color: '#1E40AF' }]}>
                                    Maintenance ini akan ditandai sebagai selesai dan dipindahkan ke riwayat.
                                </Text>
                            </View>

                            <View style={styles.detailBox}>
                                <Text style={styles.detailLabel}>Unit:</Text>
                                <Text style={styles.detailValue}>
                                    {itemSelesai?.alat?.nama_alat}
                                </Text>
                            </View>

                            <View style={styles.detailBox}>
                                <Text style={styles.detailLabel}>Tanggal Service:</Text>
                                <Text style={styles.detailValue}>
                                    {formatTanggal(itemSelesai?.tanggal_perawatan || null)}
                                </Text>
                            </View>

                            <View style={styles.detailBox}>
                                <Text style={styles.detailLabel}>Biaya:</Text>
                                <Text style={styles.detailValue}>
                                    Rp {itemSelesai?.biaya_perawatan.toLocaleString('id-ID') || 0}
                                </Text>
                            </View>

                            <Text style={[styles.confirmText, { color: '#3B82F6' }]}>
                                Yakin maintenance sudah selesai dikerjakan?
                            </Text>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.btnBatal}
                                    onPress={() => setModalSelesai(false)}
                                    disabled={saving}
                                >
                                    <Text style={styles.btnBatalText}>Batal</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btnSelesaiModal, saving && { opacity: 0.7 }]}
                                    onPress={konfirmasiSelesai}
                                    disabled={saving}
                                >
                                    {saving ? <ActivityIndicator color="#FFF" /> : <Check size={18} color="#FFF" />}
                                    <Text style={styles.btnSelesaiText}>
                                        {saving ? 'Memproses...' : 'Ya, Selesai'}
                                    </Text>
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
    container: { flex: 1, flexDirection: 'row', backgroundColor: '#f5f5f5' },
    main: { flex: 1, padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 28, fontWeight: '700', color: '#F59E0B' },
    dateHeader: { fontSize: 15, color: '#666' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
    searchBox: { flex: 1, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', elevation: 2 },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 16, paddingVertical: 12 },
    refreshButton: { backgroundColor: '#F59E0B', padding: 14, borderRadius: 12, elevation: 3 },
    warningBox: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    warningText: { color: '#DC2626', fontWeight: '600' },
    card: { backgroundColor: '#fff', borderRadius: 16, elevation: 4, overflow: 'hidden' },
    cardHeader: { backgroundColor: '#FFF7ED', padding: 16, borderBottomWidth: 1, borderBottomColor: '#FED7AA' },
    cardTitle: { fontSize: 18, fontWeight: '600', color: '#C2410C' },
    tableHeader: { flexDirection: 'row', backgroundColor: '#FFFBEB', paddingVertical: 16, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: '#F59E0B' },
    th: { fontWeight: '600', color: '#92400E', fontSize: 13, textAlign: 'center' },
    tableRow: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    rowPending: { backgroundColor: '#FFFBEB', borderLeftWidth: 5, borderLeftColor: '#F59E0B' },
    td: { justifyContent: 'center', alignItems: 'center' },
    tdText: { fontSize: 14, color: '#1F2937', textAlign: 'center' },
    unitName: { fontWeight: '600', fontSize: 14, textAlign: 'center' },
    ketText: { fontSize: 13, color: '#555', textAlign: 'center' },
    statusText: { fontSize: 13, fontWeight: '600' },
    tdAction: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
    btnSetujui: { backgroundColor: '#DCFCE7', padding: 10, borderRadius: 8 },
    btnSelesai: { backgroundColor: '#DBEAFE', padding: 10, borderRadius: 8 },
    loadingContainer: { paddingVertical: 60, alignItems: 'center' },
    emptyContainer: { paddingVertical: 60, alignItems: 'center' },
    emptyText: { color: '#666', fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', width: '90%', maxWidth: 460, borderRadius: 20, padding: 24, elevation: 10 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: '700', color: '#F59E0B' },
    modalUnitName: { fontSize: 20, fontWeight: '600', marginBottom: 12, color: '#1F2937' },
    modalKeterangan: { fontSize: 15, color: '#666', fontStyle: 'italic', marginBottom: 24, lineHeight: 22 },
    modalLabel: { fontSize: 15, fontWeight: '600', marginBottom: 10, color: '#333' },
    dateInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#F59E0B', borderRadius: 12, marginBottom: 20, backgroundColor: '#FFF' },
    dateInput: { flex: 1, padding: 16, fontSize: 16, color: '#333' },
    calendarBtn: { paddingHorizontal: 16, paddingVertical: 16 },
    biayaInput: { borderWidth: 1.5, borderColor: '#F59E0B', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 32 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
    btnBatal: { paddingHorizontal: 32, paddingVertical: 14, backgroundColor: '#E5E7EB', borderRadius: 30 },
    btnBatalText: { fontWeight: '600', color: '#374151' },
    btnSimpan: { flexDirection: 'row', gap: 10, backgroundColor: '#F59E0B', paddingHorizontal: 36, paddingVertical: 14, borderRadius: 30, alignItems: 'center' },
    btnSimpanText: { color: '#FFF', fontWeight: '600', fontSize: 15 },
    btnSelesaiModal: { flexDirection: 'row', gap: 10, backgroundColor: '#3B82F6', paddingHorizontal: 36, paddingVertical: 14, borderRadius: 30, alignItems: 'center' },
    btnSelesaiText: { color: '#FFF', fontWeight: '600', fontSize: 15 },
    detailBox: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#F59E0B' },
    detailLabel: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 6 },
    detailValue: { fontSize: 15, color: '#1F2937', lineHeight: 22 },
    confirmText: { fontSize: 16, fontWeight: '600', color: '#DC2626', textAlign: 'center', marginTop: 12, marginBottom: 24 },
});