import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform, ActivityIndicator } from 'react-native';
import { Search, Edit2, Trash2, X, Check, Calendar, RefreshCw } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import SideBar from '@/components/admin/SideBar';
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
    created_at?: string;
    updated_at?: string;
    alat?: AlatBerat;
}

interface ApiResponse {
    success: boolean;
    data?: PerawatanAlat[] | PerawatanAlat;
    message?: string;
}

export default function JadwalMaintenance() {
    const [searchQuery, setSearchQuery] = useState('');
    const [schedules, setSchedules] = useState<PerawatanAlat[]>([]);
    const [alatList, setAlatList] = useState<AlatBerat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<PerawatanAlat | null>(null);
    const [isAddMode, setIsAddMode] = useState(false);

    // Dropdown states
    const [showAlatDropdown, setShowAlatDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        id_alat: '',
        tanggal_perawatan: '',
        keterangan: '',
        biaya_perawatan: '',
        status: 'Dijadwalkan'
    });

    // Fetch perawatan data
    const fetchSchedules = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/perawatan-alat`, {
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data: ApiResponse = await response.json();
            if (data.success && Array.isArray(data.data)) {
                setSchedules(data.data);
            }
        } catch (err) {
            console.error('Error fetching schedules:', err);
            setError(err instanceof Error ? err.message : 'Gagal mengambil data');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch alat berat list
    const fetchAlatList = async () => {
        try {
            const response = await fetch(`${API_BASE}/alat-berat`, {
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success && Array.isArray(data.data)) {
                    setAlatList(data.data);
                }
            }
        } catch (err) {
            console.error('Error fetching alat list:', err);
        }
    };

    useEffect(() => {
        fetchSchedules();
        fetchAlatList();
    }, []);

    const getCurrentDate = () => {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const now = new Date();
        return {
            full: `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
            time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`
        };
    };

    const currentDate = getCurrentDate();

    // Format date untuk display (DD/MM/YYYY)
    const formatDateDisplay = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    // Get alat name by id
    const getAlatName = (id_alat: number) => {
        const alat = alatList.find(a => a.id_alat === id_alat);
        return alat?.nama_alat || `Alat #${id_alat}`;
    };

    // Filter schedules
    const filteredSchedules = schedules.filter(schedule => {
        const alatName = schedule.alat?.nama_alat || getAlatName(schedule.id_alat);
        return alatName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (schedule.keterangan?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            schedule.status.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Reset form
    const resetForm = () => {
        setFormData({
            id_alat: '',
            tanggal_perawatan: '',
            keterangan: '',
            biaya_perawatan: '',
            status: 'Dijadwalkan'
        });
    };

    // Handle Add
    const handleAdd = () => {
        setSelectedSchedule(null);
        setIsAddMode(true);
        resetForm();
        setModalVisible(true);
    };

    // Handle Edit
    const handleEdit = (schedule: PerawatanAlat) => {
        setSelectedSchedule(schedule);
        setIsAddMode(false);
        setFormData({
            id_alat: schedule.id_alat.toString(),
            tanggal_perawatan: schedule.tanggal_perawatan,
            keterangan: schedule.keterangan || '',
            biaya_perawatan: schedule.biaya_perawatan.toString(),
            status: schedule.status
        });
        setModalVisible(true);
    };

    // Handle Delete Click
    const handleDeleteClick = (schedule: PerawatanAlat) => {
        setSelectedSchedule(schedule);
        setDeleteModalVisible(true);
    };

    // Validate form
    const validateForm = (): boolean => {
        if (!formData.id_alat) { Alert.alert('Error', 'Pilih alat berat!'); return false; }
        if (!formData.tanggal_perawatan) { Alert.alert('Error', 'Tanggal perawatan harus diisi!'); return false; }
        if (!formData.biaya_perawatan) { Alert.alert('Error', 'Biaya perawatan harus diisi!'); return false; }
        return true;
    };

    // Handle Save (Create)
    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            const payload = {
                id_alat: parseInt(formData.id_alat),
                tanggal_perawatan: formData.tanggal_perawatan,
                keterangan: formData.keterangan || null,
                biaya_perawatan: parseFloat(formData.biaya_perawatan),
                status: formData.status
            };

            const response = await fetch(`${API_BASE}/perawatan-alat`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Gagal menambah data');
            }

            Alert.alert('Sukses', 'Jadwal maintenance berhasil ditambahkan!');
            setModalVisible(false);
            fetchSchedules();
        } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Terjadi kesalahan');
        }
    };

    // Handle Update
    const handleUpdate = async () => {
        if (!validateForm() || !selectedSchedule) return;

        try {
            const payload = {
                id_alat: parseInt(formData.id_alat),
                tanggal_perawatan: formData.tanggal_perawatan,
                keterangan: formData.keterangan || null,
                biaya_perawatan: parseFloat(formData.biaya_perawatan),
                status: formData.status
            };

            const response = await fetch(`${API_BASE}/perawatan-alat/${selectedSchedule.id_perawatan}`, {
                method: 'PUT',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Gagal mengupdate data');
            }

            Alert.alert('Sukses', 'Jadwal maintenance berhasil diupdate!');
            setModalVisible(false);
            fetchSchedules();
        } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Terjadi kesalahan');
        }
    };

    // Handle Delete
    const handleConfirmDelete = async (confirmed: boolean) => {
        if (confirmed && selectedSchedule) {
            try {
                const response = await fetch(`${API_BASE}/perawatan-alat/${selectedSchedule.id_perawatan}`, {
                    method: 'DELETE',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
                });

                if (!response.ok) throw new Error('Gagal menghapus data');

                Alert.alert('Sukses', 'Jadwal maintenance berhasil dihapus!');
                fetchSchedules();
            } catch (err) {
                Alert.alert('Error', err instanceof Error ? err.message : 'Terjadi kesalahan');
            }
        }
        setDeleteModalVisible(false);
        setSelectedSchedule(null);
    };

    // Select alat
    const selectAlat = (alat: AlatBerat) => {
        setFormData({ ...formData, id_alat: alat.id_alat.toString() });
        setShowAlatDropdown(false);
    };

    // Select status
    const selectStatus = (status: string) => {
        setFormData({ ...formData, status });
        setShowStatusDropdown(false);
    };

    // Get selected alat name
    const getSelectedAlatName = () => {
        if (!formData.id_alat) return 'Pilih Alat';
        const alat = alatList.find(a => a.id_alat === parseInt(formData.id_alat));
        return alat?.nama_alat || 'Pilih Alat';
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <SideBar />

                <View style={styles.mainContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.pageTitle}>Jadwal Maintenance</Text>
                            <Text style={styles.pageSubtitle}>Kelola jadwal perawatan alat berat</Text>
                        </View>
                        <View style={styles.dateTimeContainer}>
                            <Text style={styles.dateText}>{currentDate.full}</Text>
                            <Text style={styles.timeText}>{currentDate.time}</Text>
                            <TouchableOpacity style={styles.refreshButton} onPress={fetchSchedules}>
                                <RefreshCw color="#FFF" size={14} />
                                <Text style={styles.refreshButtonText}>Refresh</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search & Add */}
                    <View style={styles.searchRow}>
                        <View style={styles.searchContainer}>
                            <Search color="#999" size={20} />
                            <TextInput style={styles.searchInput} placeholder="Cari berdasarkan nama alat, keterangan, atau status..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor="#999" />
                        </View>
                        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                            <Text style={styles.addButtonText}>Tambahkan</Text>
                            <Text style={styles.addButtonIcon}>+</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Loading/Error */}
                    {isLoading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#F59E0B" />
                            <Text style={styles.loadingText}>Memuat data...</Text>
                        </View>
                    )}

                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>Error: {error}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={fetchSchedules}>
                                <Text style={styles.retryButtonText}>Coba Lagi</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Table */}
                    {!isLoading && !error && (
                        <ScrollView style={styles.tableContainer}>
                            {filteredSchedules.length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>Tidak ada data jadwal maintenance</Text>
                                </View>
                            ) : (
                                <View style={styles.table}>
                                    {/* Header */}
                                    <View style={styles.tableHeader}>
                                        <View style={[styles.tableHeaderCell, { flex: 1.5 }]}><Text style={styles.tableHeaderText}>Nama Alat</Text></View>
                                        <View style={[styles.tableHeaderCell, styles.borderLeft, { flex: 1 }]}><Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Tanggal</Text></View>
                                        <View style={[styles.tableHeaderCell, styles.borderLeft, { flex: 1.5 }]}><Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Keterangan</Text></View>
                                        <View style={[styles.tableHeaderCell, styles.borderLeft, { flex: 1 }]}><Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Biaya</Text></View>
                                        <View style={[styles.tableHeaderCell, styles.borderLeft, { flex: 0.8 }]}><Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Status</Text></View>
                                        <View style={[styles.tableHeaderCell, styles.borderLeft, { flex: 0.8 }]}><Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Aksi</Text></View>
                                    </View>

                                    {/* Rows */}
                                    {filteredSchedules.map((schedule) => (
                                        <View key={schedule.id_perawatan} style={styles.tableRow}>
                                            <View style={[styles.tableCell, { flex: 1.5, alignItems: 'flex-start' }]}>
                                                <Text style={styles.cellText}>{schedule.alat?.nama_alat || getAlatName(schedule.id_alat)}</Text>
                                            </View>
                                            <View style={[styles.tableCell, styles.borderLeft, { flex: 1 }]}>
                                                <Text style={styles.cellText}>{formatDateDisplay(schedule.tanggal_perawatan)}</Text>
                                            </View>
                                            <View style={[styles.tableCell, styles.borderLeft, { flex: 1.5 }]}>
                                                <Text style={styles.cellText} numberOfLines={2}>{schedule.keterangan || '-'}</Text>
                                            </View>
                                            <View style={[styles.tableCell, styles.borderLeft, { flex: 1 }]}>
                                                <Text style={styles.cellText}>{formatCurrency(schedule.biaya_perawatan)}</Text>
                                            </View>
                                            <View style={[styles.tableCell, styles.borderLeft, { flex: 0.8 }]}>
                                                <View style={[styles.statusBadge, schedule.status === 'Selesai' ? styles.statusSelesai : styles.statusDijadwalkan]}>
                                                    <Text style={styles.statusText}>{schedule.status}</Text>
                                                </View>
                                            </View>
                                            <View style={[styles.tableCell, styles.borderLeft, { flex: 0.8 }]}>
                                                <View style={styles.actionButtons}>
                                                    <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(schedule)}>
                                                        <Edit2 color="#FFF" size={16} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteClick(schedule)}>
                                                        <Trash2 color="#FFF" size={16} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </ScrollView>
                    )}
                </View>

                {/* Add/Edit Modal */}
                <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setModalVisible(false)}><X color="#F59E0B" size={24} /></TouchableOpacity>
                                <Text style={styles.modalTitle}>{isAddMode ? 'Tambah Jadwal' : 'Update Jadwal'}</Text>
                                <View style={styles.modalDateContainer}>
                                    <Text style={styles.modalDateText}>{currentDate.full}</Text>
                                    <Text style={styles.modalTimeText}>{currentDate.time}</Text>
                                </View>
                            </View>

                            <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 20 }}>
                                <View style={styles.formContainer}>
                                    {/* Alat Dropdown */}
                                    <View style={styles.formRow}>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Alat Berat *</Text>
                                            <TouchableOpacity style={styles.selectInput} onPress={() => setShowAlatDropdown(true)}>
                                                <Text style={styles.selectText}>{getSelectedAlatName()}</Text>
                                                <Text style={styles.selectArrow}>▼</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Tanggal Perawatan * (YYYY-MM-DD)</Text>
                                            <TextInput style={styles.input} value={formData.tanggal_perawatan} onChangeText={(v) => setFormData({ ...formData, tanggal_perawatan: v })} placeholder="2025-01-15" placeholderTextColor="#999" />
                                        </View>
                                    </View>

                                    <View style={styles.formRow}>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Biaya Perawatan *</Text>
                                            <TextInput style={styles.input} value={formData.biaya_perawatan} onChangeText={(v) => setFormData({ ...formData, biaya_perawatan: v })} placeholder="5000000" placeholderTextColor="#999" keyboardType="numeric" />
                                        </View>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Status</Text>
                                            <TouchableOpacity style={styles.selectInput} onPress={() => setShowStatusDropdown(true)}>
                                                <Text style={styles.selectText}>{formData.status}</Text>
                                                <Text style={styles.selectArrow}>▼</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.formRow}>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Keterangan</Text>
                                            <TextInput style={[styles.input, styles.textArea]} value={formData.keterangan} onChangeText={(v) => setFormData({ ...formData, keterangan: v })} placeholder="Service tahunan, ganti oli, dll" placeholderTextColor="#999" multiline numberOfLines={3} />
                                        </View>
                                    </View>
                                </View>
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                {isAddMode ? (
                                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.7}>
                                        <Text style={styles.saveButtonText}>Simpan</Text>
                                        <Check color="#FFF" size={18} />
                                    </TouchableOpacity>
                                ) : (
                                    <>
                                        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate} activeOpacity={0.7}>
                                            <Text style={styles.updateButtonText}>Update</Text>
                                            <Check color="#FFF" size={18} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.clearButton} onPress={resetForm} activeOpacity={0.7}>
                                            <Text style={styles.clearButtonText}>Clear</Text>
                                            <X color="#FFF" size={18} />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Alat Dropdown Modal */}
                <Modal animationType="fade" transparent visible={showAlatDropdown} onRequestClose={() => setShowAlatDropdown(false)}>
                    <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setShowAlatDropdown(false)}>
                        <View style={styles.dropdownContent}>
                            <ScrollView style={{ maxHeight: 300 }}>
                                {alatList.map(alat => (
                                    <TouchableOpacity key={alat.id_alat} style={styles.dropdownItem} onPress={() => selectAlat(alat)}>
                                        <Text style={styles.dropdownText}>{alat.nama_alat}</Text>
                                    </TouchableOpacity>
                                ))}
                                {alatList.length === 0 && <Text style={[styles.dropdownText, { padding: 15 }]}>Tidak ada data alat</Text>}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Status Dropdown Modal */}
                <Modal animationType="fade" transparent visible={showStatusDropdown} onRequestClose={() => setShowStatusDropdown(false)}>
                    <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setShowStatusDropdown(false)}>
                        <View style={styles.dropdownContent}>
                            {['Dijadwalkan', 'Selesai'].map(s => (
                                <TouchableOpacity key={s} style={styles.dropdownItem} onPress={() => selectStatus(s)}>
                                    <Text style={styles.dropdownText}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Delete Modal */}
                <Modal animationType="fade" transparent visible={deleteModalVisible} onRequestClose={() => setDeleteModalVisible(false)}>
                    <View style={styles.confirmOverlay}>
                        <View style={styles.confirmContent}>
                            <View style={styles.confirmIcon}><Trash2 color="#EF4444" size={48} /></View>
                            <Text style={styles.confirmTitle}>Anda Yakin Menghapus Jadwal Ini?</Text>
                            <View style={styles.confirmButtons}>
                                <TouchableOpacity style={styles.confirmYesButton} onPress={() => handleConfirmDelete(true)}><Text style={styles.confirmButtonText}>YA</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.confirmNoButton} onPress={() => handleConfirmDelete(false)}><Text style={styles.confirmButtonText}>Tidak</Text></TouchableOpacity>
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
    mainContent: { flex: 1, padding: 30, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
    pageTitle: { fontSize: 32, color: '#F59E0B', marginBottom: 5, fontWeight: '500' },
    pageSubtitle: { fontSize: 14, color: '#666' },
    dateTimeContainer: { alignItems: 'flex-end' },
    dateText: { fontSize: 14, color: '#F59E0B', fontWeight: '500' },
    timeText: { fontSize: 18, color: '#333', fontWeight: '500' },
    refreshButton: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#F59E0B', borderRadius: 6, gap: 6 },
    refreshButtonText: { fontSize: 12, color: '#FFF', fontWeight: '500' },
    searchRow: { flexDirection: 'row', marginBottom: 20, gap: 15 },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, gap: 10 },
    searchInput: { flex: 1, fontSize: 14, color: '#333' },
    addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDB022', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, gap: 8 },
    addButtonText: { fontSize: 14, color: '#FFF', fontWeight: '500' },
    addButtonIcon: { fontSize: 20, color: '#FFF', fontWeight: '600' },
    loadingContainer: { padding: 40, alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 14, color: '#F59E0B' },
    errorContainer: { padding: 20, alignItems: 'center', backgroundColor: '#FEE2E2', borderRadius: 10, marginBottom: 20 },
    errorText: { fontSize: 14, color: '#DC2626', marginBottom: 10 },
    retryButton: { backgroundColor: '#F59E0B', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 6 },
    retryButtonText: { color: '#FFF', fontWeight: '500' },
    emptyContainer: { padding: 40, alignItems: 'center' },
    emptyText: { fontSize: 14, color: '#666' },
    tableContainer: { flex: 1 },
    table: { backgroundColor: '#FFF', borderRadius: 10, overflow: 'hidden', borderWidth: 2, borderColor: '#D4A574' },
    tableHeader: { flexDirection: 'row', backgroundColor: '#E8D5C4', borderBottomWidth: 2, borderBottomColor: '#D4A574' },
    tableHeaderCell: { paddingVertical: 15, paddingHorizontal: 12, justifyContent: 'center' },
    tableHeaderText: { fontSize: 13, color: '#333', fontWeight: '600' },
    tableRow: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#D4A574' },
    tableCell: { paddingVertical: 12, paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5EFE7' },
    borderLeft: { borderLeftWidth: 2, borderLeftColor: '#D4A574' },
    cellText: { fontSize: 12, color: '#333' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusDijadwalkan: { backgroundColor: '#FEF3C7' },
    statusSelesai: { backgroundColor: '#DCFCE7' },
    statusText: { fontSize: 11, fontWeight: '500', color: '#333' },
    actionButtons: { flexDirection: 'row', gap: 6 },
    editButton: { backgroundColor: '#FDB022', width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    deleteButton: { backgroundColor: '#FDB022', width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#FFF', borderRadius: 10, width: '85%', maxWidth: 800, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
    modalTitle: { fontSize: 18, color: '#F59E0B', flex: 1, marginLeft: 15, textAlign: 'center', fontWeight: '500' },
    modalDateContainer: { alignItems: 'flex-end' },
    modalDateText: { fontSize: 11, color: '#F59E0B' },
    modalTimeText: { fontSize: 13, color: '#333', fontWeight: '500' },
    modalBody: { padding: 24, maxHeight: 400 },
    formContainer: { gap: 16 },
    formRow: { flexDirection: 'row', gap: 16 },
    formGroup: { flex: 1 },
    label: { fontSize: 13, color: '#333', marginBottom: 6, fontWeight: '500' },
    input: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#F59E0B', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#333' },
    textArea: { minHeight: 80, textAlignVertical: 'top' },
    selectInput: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#F59E0B', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    selectText: { fontSize: 13, color: '#333' },
    selectArrow: { fontSize: 10, color: '#F59E0B' },
    modalFooter: { flexDirection: 'row', justifyContent: 'center', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#E5E5E5', backgroundColor: '#FFF' },
    saveButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDB022', paddingHorizontal: 30, paddingVertical: 10, borderRadius: 20, gap: 8 },
    saveButtonText: { fontSize: 14, color: '#FFF', fontWeight: '600' },
    updateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingHorizontal: 30, paddingVertical: 10, borderRadius: 20, gap: 8 },
    updateButtonText: { fontSize: 14, color: '#FFF', fontWeight: '600' },
    clearButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF4444', paddingHorizontal: 30, paddingVertical: 10, borderRadius: 20, gap: 8 },
    clearButtonText: { fontSize: 14, color: '#FFF', fontWeight: '600' },
    dropdownOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    dropdownContent: { backgroundColor: '#FFF', borderRadius: 8, width: '80%', maxWidth: 300 },
    dropdownItem: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
    dropdownText: { fontSize: 14, color: '#333' },
    confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    confirmContent: { backgroundColor: '#FFF', borderRadius: 16, width: '100%', maxWidth: 300, padding: 30, alignItems: 'center' },
    confirmIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    confirmTitle: { fontSize: 14, color: '#F59E0B', textAlign: 'center', marginBottom: 20, fontWeight: '600' },
    confirmButtons: { flexDirection: 'row', gap: 12 },
    confirmYesButton: { backgroundColor: '#FDB022', paddingHorizontal: 28, paddingVertical: 10, borderRadius: 20, minWidth: 70, alignItems: 'center' },
    confirmNoButton: { backgroundColor: '#FDB022', paddingHorizontal: 28, paddingVertical: 10, borderRadius: 20, minWidth: 70, alignItems: 'center' },
    confirmButtonText: { fontSize: 13, color: '#FFF', fontWeight: '600' },
});