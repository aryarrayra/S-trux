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
} from 'lucide-react-native';
import SideBar from '@/components/admin/SideBar';
import { Stack } from 'expo-router';

const API_BASE = 'http://localhost:8000/api';

interface AlatBerat {
    id_alat: number;
    nama_alat: string;
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

export default function JadwalMaintenance() {
    const [schedules, setSchedules] = useState<PerawatanAlat[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PerawatanAlat | null>(null);
    const [tanggal, setTanggal] = useState<Date>(new Date());
    const [tanggalText, setTanggalText] = useState<string>('');
    const [showPicker, setShowPicker] = useState(false);
    const [biaya, setBiaya] = useState<string>('');

    // Format tanggal header otomatis hari ini
    const formatTanggalHeader = () => {
        return new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    // Refresh data saat modal ditutup
    useEffect(() => {
        if (!modalVisible) {
            fetchSchedules();
        }
    }, [modalVisible]);

    const fetchSchedules = async () => {
        setIsLoading(true);
        try {
            console.log('🔄 Fetching schedules...');
            const res = await fetch(`${API_BASE}/perawatan-alat`);
            
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            
            const json = await res.json();
            console.log('📥 Schedules response:', json);
            
            if (json.success) {
                setSchedules(json.data);
            } else {
                Alert.alert('Error', 'Format data tidak valid');
            }
        } catch (error: any) {
            console.error('❌ Fetch error:', error);
            Alert.alert('Error', 'Gagal memuat data jadwal: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const isRekomendasi = (item: PerawatanAlat) =>
        item.keterangan?.includes('[REKOMENDASI PETUGAS]') ?? false;

    const resetFormState = () => {
        setSelectedItem(null);
        setTanggal(new Date());
        setTanggalText('');
        setBiaya('');
        setSaving(false);
    };

    const jadwalkanRekomendasi = (item: PerawatanAlat) => {
        console.log('📅 Opening modal for:', item);
        
        // Reset dulu sebelum buka modal baru
        resetFormState();
        
        setSelectedItem(item);
        setTanggal(new Date());
        setTanggalText('');
        
        // Default biaya
        const defaultBiaya = item.biaya_perawatan > 0
            ? item.biaya_perawatan.toLocaleString('id-ID')
            : '10.000.000';
        setBiaya(defaultBiaya);
        
        setModalVisible(true);
    };

    const simpanJadwal = async () => {
        if (!selectedItem) return;

        console.log('=== SIMPAN JADWAL START ===');
        console.log('Selected item:', selectedItem);

        const biayaClean = biaya.replace(/\./g, '').trim();
        console.log('Biaya clean:', biayaClean);
        
        if (biayaClean && isNaN(Number(biayaClean))) {
            Alert.alert('Error', 'Biaya harus berupa angka');
            return;
        }

        setSaving(true);

        const cleanKeterangan =
            selectedItem.keterangan?.replace('[REKOMENDASI PETUGAS]\n', '').trim() || '';
        console.log('Keterangan cleaned:', cleanKeterangan);

        try {
            // Format tanggal ke YYYY-MM-DD
            const formattedDate = tanggal.toISOString().split('T')[0];
            console.log('Tanggal formatted:', formattedDate);
            
            const payload = {
                tanggal_perawatan: formattedDate,
                biaya_perawatan: parseFloat(biayaClean) || 0,
                keterangan: cleanKeterangan,
                status: 'Dijadwalkan',
                id_alat: selectedItem.id_alat
            };

            console.log('📤 Sending PUT request:', {
                url: `${API_BASE}/perawatan-alat/${selectedItem.id_perawatan}`,
                payload: payload
            });

            const res = await fetch(`${API_BASE}/perawatan-alat/${selectedItem.id_perawatan}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload),
            });

            console.log('📥 Response status:', res.status);
            
            const responseText = await res.text();
            console.log('📥 Raw response:', responseText);
            
            let jsonResponse;
            try {
                jsonResponse = JSON.parse(responseText);
                console.log('📥 Parsed JSON:', jsonResponse);
            } catch (parseError) {
                console.error('❌ JSON parse error:', parseError);
            }

            if (res.ok && jsonResponse?.success) {
                console.log('✅ Success! Data:', jsonResponse.data);
                
                // **AUTO CLOSE MODAL & UPDATE STATE LANGSUNG**
                setModalVisible(false);
                
                // Update state lokal langsung (real-time update)
                const updatedSchedules = schedules.map(schedule => {
                    if (schedule.id_perawatan === selectedItem.id_perawatan) {
                        return {
                            ...schedule,
                            tanggal_perawatan: formattedDate,
                            biaya_perawatan: parseFloat(biayaClean) || 0,
                            keterangan: cleanKeterangan,
                            status: 'Dijadwalkan' as const
                        };
                    }
                    return schedule;
                });
                
                setSchedules(updatedSchedules);
                
                // Reset form
                resetFormState();
                
                // Tampilkan alert sukses tanpa blocking
                setTimeout(() => {
                    Alert.alert(
                        'Sukses! ✅',
                        'Jadwal maintenance berhasil disimpan',
                        [{ text: 'OK' }]
                    );
                }, 300);
                
            } else {
                console.error('❌ Server error:', res.status);
                const errorMsg = jsonResponse?.message || 
                               jsonResponse?.errors || 
                               'Server menolak. Coba lagi.';
                console.error('❌ Error details:', errorMsg);
                Alert.alert('Gagal', `Error ${res.status}: ${JSON.stringify(errorMsg)}`);
            }
        } catch (err: any) {
            console.error('❌ Network error:', err);
            Alert.alert('Error', 'Koneksi bermasalah: ' + err.message);
        } finally {
            console.log('=== SIMPAN JADWAL END ===');
            setSaving(false);
        }
    };

    const onChangeDate = (_event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || tanggal;
        setShowPicker(Platform.OS === 'ios');
        setTanggal(currentDate);
        setTanggalText(currentDate.toLocaleDateString('id-ID'));
    };

    const handleManualTanggal = (text: string) => {
        setTanggalText(text);
        const match = text.match(/(\d{1,2})[\/\-\.\s](\d{1,2})[\/\-\.\s](\d{4})/);
        if (match) {
            const d = parseInt(match[1], 10);
            const m = parseInt(match[2], 10);
            const y = parseInt(match[3], 10);
            const date = new Date(y, m - 1, d);
            if (!isNaN(date.getTime())) setTanggal(date);
        }
    };

    // Auto format biaya ribuan
    const handleBiayaChange = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        const formatted = cleaned ? Number(cleaned).toLocaleString('id-ID') : '';
        setBiaya(formatted);
    };

    // Format tanggal untuk display
    const formatTanggalDisplay = (dateStr: string) => {
        if (dateStr.includes('2000-01-01') || !dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString('id-ID');
        } catch {
            return dateStr;
        }
    };

    const filtered = schedules.filter((s) => {
        const nama = s.alat?.nama_alat || '';
        const ket = s.keterangan || '';
        const q = searchQuery.toLowerCase();
        return nama.toLowerCase().includes(q) || ket.toLowerCase().includes(q);
    });

    const rekomendasiBelum = filtered.filter(
        (s) => isRekomendasi(s) && s.tanggal_perawatan.includes('2000-01-01')
    );

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <SideBar />
                <View style={styles.main}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Jadwal Maintenance</Text>
                        <Text style={styles.dateHeader}>{formatTanggalHeader()}</Text>
                    </View>

                    {/* Warning */}
                    {rekomendasiBelum.length > 0 && (
                        <View style={styles.warningBox}>
                            <AlertTriangle size={20} color="#DC2626" />
                            <Text style={styles.warningText}>
                                {rekomendasiBelum.length} rekomendasi petugas belum dijadwalkan
                            </Text>
                        </View>
                    )}

                    {/* Search + Refresh */}
                    <View style={styles.topBar}>
                        <View style={styles.searchBar}>
                            <Search size={20} color="#999" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Cari alat atau keterangan..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                        <TouchableOpacity onPress={fetchSchedules} style={styles.refreshBtn}>
                            <RefreshCw size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={styles.th}>Kode</Text>
                        <Text style={styles.th}>Unit</Text>
                        <Text style={styles.th}>Jenis</Text>
                        <Text style={styles.th}>Serv./Terakhir</Text>
                        <Text style={styles.th}>Berikutnya</Text>
                        <Text style={styles.th}>Biaya</Text>
                        <Text style={styles.th}>Status</Text>
                        <Text style={styles.th}>Aksi</Text>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator size="large" color="#F59E0B" style={{ marginTop: 80 }} />
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {filtered.map((item) => {
                                const dariPetugas = isRekomendasi(item);
                                const belumJadwal = dariPetugas && item.tanggal_perawatan.includes('2000-01-01');

                                return (
                                    <View key={item.id_perawatan} style={[styles.tableRow, belumJadwal && styles.rowRekom]}>
                                        <View style={styles.td}><Text style={styles.tdText}>MT28733</Text></View>
                                        <View style={styles.td}><Text style={[styles.tdText, styles.unitName]}>{item.alat?.nama_alat || '-'}</Text></View>
                                        <View style={styles.td}><Text style={styles.tdText}>Excavator</Text></View>
                                        <View style={styles.td}><Text style={styles.tdText}>29 Aug 2024</Text></View>
                                        <View style={styles.td}>
                                            <Text style={styles.tdText}>
                                                {formatTanggalDisplay(item.tanggal_perawatan)}
                                            </Text>
                                        </View>
                                        <View style={styles.td}>
                                            <Text style={styles.tdText}>
                                                Rp {item.biaya_perawatan.toLocaleString('id-ID')}
                                            </Text>
                                        </View>
                                        <View style={styles.td}>
                                            <Text style={[
                                                styles.tdText, 
                                                { 
                                                    color: item.status === 'Dijadwalkan' ? '#F59E0B' : 
                                                           item.status === 'Selesai' ? '#10B981' : '#DC2626',
                                                    fontWeight: '600' 
                                                }
                                            ]}>
                                                {item.status || 'Menunggu'}
                                            </Text>
                                        </View>
                                        <View style={styles.td}>
                                            {belumJadwal && (
                                                <TouchableOpacity 
                                                    style={styles.btnJadwalkan} 
                                                    onPress={() => jadwalkanRekomendasi(item)}
                                                >
                                                    <Calendar size={18} color="#FFF" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>

                {/* Modal */}
                <Modal 
                    visible={modalVisible} 
                    transparent 
                    animationType="fade"
                    onRequestClose={() => {
                        console.log('Modal closing via back button');
                        setModalVisible(false);
                        resetFormState();
                    }}
                >
                    <View style={styles.overlay}>
                        <View style={styles.modalSquare}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Buat Jadwal Maintenance</Text>
                                <TouchableOpacity onPress={() => {
                                    setModalVisible(false);
                                    resetFormState();
                                }}>
                                    <X size={28} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.alatModal}>{selectedItem?.alat?.nama_alat}</Text>
                            <Text style={styles.ketModal}>
                                {selectedItem?.keterangan?.replace('[REKOMENDASI PETUGAS]\n', '').trim() || 'Tidak ada keterangan'}
                            </Text>

                            {/* Tanggal */}
                            <Text style={styles.label}>Tanggal Perawatan</Text>
                            <View style={styles.dateInputContainer}>
                                <TextInput
                                    style={styles.dateInput}
                                    placeholder="dd/mm/yyyy"
                                    value={tanggalText || tanggal.toLocaleDateString('id-ID')}
                                    onChangeText={handleManualTanggal}
                                    keyboardType="number-pad"
                                />
                                <TouchableOpacity style={styles.calendarIcon} onPress={() => setShowPicker(true)}>
                                    <Calendar size={22} color="#F59E0B" />
                                </TouchableOpacity>
                            </View>

                            {showPicker && (
                                <DateTimePicker
                                    value={tanggal}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onChangeDate}
                                />
                            )}

                            {/* Biaya dengan auto-format */}
                            <Text style={styles.label}>Estimasi Biaya (Rp)</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="15.000.000"
                                value={biaya}
                                onChangeText={handleBiayaChange}
                            />

                            <View style={styles.modalFooter}>
                                <TouchableOpacity 
                                    style={styles.btnBatal} 
                                    onPress={() => {
                                        setModalVisible(false);
                                        resetFormState();
                                    }}
                                    disabled={saving}
                                >
                                    <Text style={styles.btnBatalText}>Batal</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.btnSimpanOrange, saving && styles.buttonDisabled]}
                                    onPress={simpanJadwal}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <Check size={18} color="#FFF" />
                                    )}
                                    <Text style={styles.btnSimpanText}>
                                        {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
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
    container: { 
        flex: 1, 
        flexDirection: 'row', 
        backgroundColor: '#f3f4f6' 
    },
    main: { 
        flex: 1, 
        padding: 24 
    },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16 
    },
    title: { 
        fontSize: 28, 
        fontWeight: '700', 
        color: '#F59E0B' 
    },
    dateHeader: { 
        color: '#666', 
        fontSize: 15 
    },
    topBar: { 
        flexDirection: 'row', 
        gap: 12, 
        marginBottom: 20, 
        alignItems: 'center' 
    },
    searchBar: { 
        flex: 1, 
        flexDirection: 'row', 
        backgroundColor: '#F5F5F5', 
        borderRadius: 12, 
        paddingHorizontal: 12, 
        alignItems: 'center' 
    },
    searchInput: { 
        flex: 1, 
        marginLeft: 10, 
        fontSize: 16 
    },
    refreshBtn: { 
        backgroundColor: '#F59E0B', 
        padding: 12, 
        borderRadius: 12 
    },
    warningBox: { 
        backgroundColor: '#FEF2F2', 
        borderWidth: 1, 
        borderColor: '#FECACA', 
        padding: 14, 
        borderRadius: 12, 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 10, 
        marginBottom: 16 
    },
    warningText: { 
        color: '#DC2626', 
        fontWeight: '600' 
    },
    tableHeader: { 
        flexDirection: 'row', 
        backgroundColor: '#FFF', 
        paddingVertical: 14, 
        paddingHorizontal: 12, 
        borderRadius: 12, 
        marginBottom: 8, 
        borderBottomWidth: 3, 
        borderBottomColor: '#F59E0B' 
    },
    th: { 
        flex: 1, 
        fontWeight: '600', 
        color: '#92400E', 
        fontSize: 13, 
        textAlign: 'center' 
    },
    tableRow: { 
        flexDirection: 'row', 
        backgroundColor: '#FFF', 
        paddingVertical: 16, 
        paddingHorizontal: 12, 
        borderRadius: 12, 
        marginBottom: 8, 
        alignItems: 'center' 
    },
    rowRekom: { 
        borderLeftWidth: 6, 
        borderLeftColor: '#DC2626', 
        backgroundColor: '#FFEBEB' 
    },
    td: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    tdText: { 
        fontSize: 14, 
        color: '#1F2937', 
        textAlign: 'center' 
    },
    unitName: { 
        fontWeight: '600' 
    },
    btnJadwalkan: { 
        backgroundColor: '#F59E0B', 
        padding: 10, 
        borderRadius: 8 
    },
    overlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    modalSquare: { 
        backgroundColor: '#FFF', 
        width: '90%', 
        maxWidth: 440, 
        borderRadius: 16, 
        padding: 24, 
        elevation: 20 
    },
    modalHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 20 
    },
    modalTitle: { 
        fontSize: 22, 
        fontWeight: '700', 
        color: '#F59E0B' 
    },
    alatModal: { 
        fontSize: 19, 
        fontWeight: '600', 
        marginBottom: 6 
    },
    ketModal: { 
        color: '#555', 
        fontStyle: 'italic', 
        marginBottom: 24, 
        lineHeight: 22 
    },
    label: { 
        fontWeight: '600', 
        marginBottom: 8, 
        color: '#333' 
    },
    dateInputContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderWidth: 1.5, 
        borderColor: '#F59E0B', 
        borderRadius: 10, 
        marginBottom: 16 
    },
    dateInput: { 
        flex: 1, 
        padding: 14, 
        fontSize: 16 
    },
    calendarIcon: { 
        paddingHorizontal: 14 
    },
    input: { 
        borderWidth: 1.5, 
        borderColor: '#F59E0B', 
        borderRadius: 10, 
        padding: 14, 
        fontSize: 16, 
        marginBottom: 32 
    },
    modalFooter: { 
        flexDirection: 'row', 
        justifyContent: 'flex-end', 
        gap: 16 
    },
    btnBatal: { 
        paddingHorizontal: 32, 
        paddingVertical: 14, 
        backgroundColor: '#E5E7EB', 
        borderRadius: 30 
    },
    btnBatalText: { 
        fontWeight: '600', 
        color: '#374151' 
    },
    btnSimpanOrange: {
        flexDirection: 'row',
        gap: 10,
        backgroundColor: '#F59E0B',
        paddingHorizontal: 36,
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
        minWidth: 180,
        justifyContent: 'center',
    },
    btnSimpanText: { 
        color: '#FFF', 
        fontWeight: '600', 
        fontSize: 15 
    },
    buttonDisabled: {
        opacity: 0.7
    }
});