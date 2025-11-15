import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform, Image } from 'react-native';
import { Search, Edit2, Trash2, X, Camera, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '@/constants/Colors';
import SideBar from '@/components/admin/SideBar';
import { Stack } from 'expo-router';

// Mock data untuk Alat Berat (fallback)
const INITIAL_ALAT_BERAT = [
    {
        id: '1',
        nama_alat: 'Excavator Caterpillar 320DD',
        jenis: 'Excavator',
        kapasitas: '2.5 Ton',
        deskripsi: 'Your description here....\nLorem ipsum dolor sit amet consectetur',
        harga_sewa_per_hari: 800000,
        status: 'Tersedia',
        foto: 'https://images.unsplash.com/photo-1523800503107-5bc3ba2a6f81?w=400',
    },
];

type AlatBerat = {
    id: string;
    nama_alat: string;
    jenis: string;
    kapasitas: string;
    deskripsi: string;
    harga_sewa_per_hari: number;
    status: string;
    foto: string;
};

export default function KelolaAlatBerat() {
    const [searchQuery, setSearchQuery] = useState('');
    const [alatBeratList, setAlatBeratList] = useState<AlatBerat[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedAlatBerat, setSelectedAlatBerat] = useState<AlatBerat | null>(null);
    const [isAddMode, setIsAddMode] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showJenisDropdown, setShowJenisDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [nama_alat, setNamaAlat] = useState('');
    const [jenis, setJenis] = useState('Excavator');
    const [kapasitas, setKapasitas] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [harga_sewa_per_hari, setHargaSewa] = useState('');
    const [status, setStatus] = useState('Tersedia');
    const [foto, setFoto] = useState(''); // URL foto setelah upload
    const [selectedImage, setSelectedImage] = useState<string | null>(null); // Local URI sementara untuk preview
    const [isUploading, setIsUploading] = useState(false); // State untuk loading upload

    // Fetch data dari API dengan field yang sesuai
    const fetchAlatBerat = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('🔄 Fetching alat berat from API...');
            // Handle URL untuk emulator: Android gunakan 10.0.2.2, iOS gunakan localhost
            const apiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000/api/alat-berat' : 'http://127.0.0.1:8000/api/alat-berat';
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    // Uncomment jika butuh auth token dari login
                    // 'Authorization': `Bearer ${token}`,
                },
            });

            console.log('📊 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Body:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ API Response data:', data);

            // Handle struktur response dari Laravel BaseController: {success: true, data: [...], message: '...'}
            let dataArray = [];
            if (data.success && Array.isArray(data.data)) {
                dataArray = data.data;
            } else if (Array.isArray(data)) {
                dataArray = data;
            } else {
                console.warn('⚠️ Unexpected data structure:', data);
                dataArray = [];
            }

            console.log('📦 Data array to process:', dataArray);

            // Transform data dengan field yang sesuai dari database
            const transformedData: AlatBerat[] = dataArray.map((item: any) => ({
                id: item.id_alat?.toString() || item.id?.toString() || Math.random().toString(),
                nama_alat: item.nama_alat || 'Nama alat tidak tersedia',
                jenis: item.jenis || 'Lainnya',
                kapasitas: item.kapasitas || '-',
                deskripsi: item.deskripsi || 'Deskripsi tidak tersedia',
                harga_sewa_per_hari: Number(item.harga_sewa_per_hari) || item.harga_sewa || 0,
                status: item.status || 'Tersedia',
                foto: item.foto || 'https://images.unsplash.com/photo-1558618047-3c8c98e967b7?w=400',
            }));

            console.log('🔄 Transformed data:', transformedData);
            setAlatBeratList(transformedData);

        } catch (error) {
            console.error('❌ Error fetching alat berat:', error);
            setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil data');
            // Gunakan data fallback
            setAlatBeratList(INITIAL_ALAT_BERAT);
        } finally {
            setIsLoading(false);
        }
    };

    // Request permission untuk image picker
    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
            return false;
        }
        return true;
    };

    // Pick image dari galeri (atau kamera jika diinginkan)
    const pickImage = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const localUri = result.assets[0].uri;
            setSelectedImage(localUri);
            // Upload image ke server dan dapatkan URL
            await uploadImage(localUri);
        }
    };

    // Fungsi upload image ke backend (asumsi endpoint /upload-foto)
    const uploadImage = async (localUri: string) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('foto', {
                uri: localUri,
                type: 'image/jpeg', // Sesuaikan dengan tipe image
                name: 'foto.jpg',
            } as any);

            const apiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000/api/upload-foto' : 'http://127.0.0.1:8000/api/upload-foto';
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // 'Authorization': `Bearer ${token}`, // Jika butuh auth
                },
            });

            if (response.ok) {
                const result = await response.json();
                const uploadedUrl = result.url || result.data?.url; // Sesuaikan dengan response backend
                setFoto(uploadedUrl);
                console.log('✅ Image uploaded:', uploadedUrl);
                Alert.alert('Sukses', 'Foto berhasil diupload!');
            } else {
                throw new Error('Upload gagal');
            }
        } catch (error) {
            console.error('❌ Upload error:', error);
            Alert.alert('Error', 'Gagal mengupload foto. Silakan coba lagi.');
            setSelectedImage(null);
        } finally {
            setIsUploading(false);
        }
    };

    // Fetch data saat component mount
    useEffect(() => {
        fetchAlatBerat();
    }, []);

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

    const filteredAlatBerat = alatBeratList.filter(item =>
        item.nama_alat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.jenis.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number).replace('Rp', 'RP.');
    };

    const handleEdit = (item: AlatBerat) => {
        setSelectedAlatBerat(item);
        setIsAddMode(false);
        setNamaAlat(item.nama_alat);
        setJenis(item.jenis);
        setKapasitas(item.kapasitas);
        setDeskripsi(item.deskripsi);
        setHargaSewa(String(item.harga_sewa_per_hari));
        setStatus(item.status);
        setFoto(item.foto);
        setSelectedImage(null); // Reset local image
        setModalVisible(true);
    };

    const handleAdd = () => {
        setSelectedAlatBerat(null);
        setIsAddMode(true);
        resetForm();
        setModalVisible(true);
    };

    const resetForm = () => {
        setNamaAlat('');
        setJenis('Excavator');
        setKapasitas('');
        setDeskripsi('');
        setHargaSewa('');
        setStatus('Tersedia');
        setFoto('');
        setSelectedImage(null);
    };

    const handleDelete = (item: AlatBerat) => {
        setSelectedAlatBerat(item);
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = async (confirmed: boolean) => {
        if (confirmed && selectedAlatBerat) {
            try {
                console.log('🗑️ Deleting alat berat:', selectedAlatBerat.id);
                const apiUrl = Platform.OS === 'android' ? `http://10.0.2.2:8000/api/alat-berat/${selectedAlatBerat.id}` : `http://127.0.0.1:8000/api/alat-berat/${selectedAlatBerat.id}`;
                const response = await fetch(apiUrl, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    // Hapus dari state lokal
                    setAlatBeratList(prev => prev.filter(item => item.id !== selectedAlatBerat.id));
                    console.log('✅ Unit Alat Berat dihapus:', selectedAlatBerat.id);
                    Alert.alert('Sukses', 'Data berhasil dihapus');
                    if (!isAddMode) {
                        setModalVisible(false);
                    }
                } else {
                    throw new Error('Gagal menghapus data');
                }
            } catch (error) {
                console.error('❌ Error deleting alat berat:', error);
                Alert.alert('Error', 'Gagal menghapus data dari server');
            }
        }
        setDeleteModalVisible(false);
        setSelectedAlatBerat(null);
    };

    const validateForm = (): boolean => {
        if (!nama_alat.trim() || !jenis.trim() || !kapasitas.trim() || !deskripsi.trim() || !harga_sewa_per_hari.trim() || !status.trim()) {
            Alert.alert('Error', 'Semua field harus diisi dengan benar!');
            return false;
        }
        return true;
    };

    const handleUpdate = async () => {
        if (!validateForm()) return;
        if (selectedAlatBerat) {
            try {
                const updateData = {
                    nama_alat: nama_alat,
                    jenis: jenis,
                    kapasitas: kapasitas,
                    deskripsi: deskripsi,
                    harga_sewa_per_hari: parseInt(harga_sewa_per_hari),
                    status: status,
                    foto: foto, // Gunakan URL yang sudah diupload
                };

                console.log('📤 Update data:', updateData);
                const apiUrl = Platform.OS === 'android' ? `http://10.0.2.2:8000/api/alat-berat/${selectedAlatBerat.id}` : `http://127.0.0.1:8000/api/alat-berat/${selectedAlatBerat.id}`;
                const response = await fetch(apiUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify(updateData),
                });

                if (response.ok) {
                    // Update state lokal
                    setAlatBeratList(prev => prev.map(item =>
                        item.id === selectedAlatBerat.id
                            ? {
                                ...item,
                                nama_alat,
                                jenis,
                                kapasitas,
                                deskripsi,
                                harga_sewa_per_hari: parseInt(harga_sewa_per_hari),
                                status,
                                foto,
                            }
                            : item
                    ));
                    console.log('✅ Data diupdate:', selectedAlatBerat.id);
                    Alert.alert('Sukses', 'Data berhasil diupdate');
                    setModalVisible(false);
                } else {
                    throw new Error('Gagal mengupdate data');
                }
            } catch (error) {
                console.error('❌ Error updating alat berat:', error);
                Alert.alert('Error', 'Gagal mengupdate data di server');
            }
        }
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            const newItemData = {
                nama_alat: nama_alat,
                jenis: jenis,
                kapasitas: kapasitas,
                deskripsi: deskripsi,
                harga_sewa_per_hari: parseInt(harga_sewa_per_hari),
                status: status,
                foto: foto || 'https://images.unsplash.com/photo-1558618047-3c8c98e967b7?w=400', // Default jika tidak ada foto baru
            };

            console.log('📤 Save data:', newItemData);
            const apiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000/api/alat-berat' : 'http://127.0.0.1:8000/api/alat-berat';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(newItemData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Save result:', result);

                // Refresh data setelah berhasil menambah
                fetchAlatBerat();

                Alert.alert('Sukses', 'Data berhasil ditambahkan');
                setModalVisible(false);
            } else {
                throw new Error('Gagal menambahkan data');
            }
        } catch (error) {
            console.error('❌ Error adding alat berat:', error);
            Alert.alert('Error', 'Gagal menambahkan data ke server');
        }
    };

    const handleClear = () => {
        if (selectedAlatBerat) {
            handleDelete(selectedAlatBerat);
        }
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        resetForm(); // Reset form saat close
    };

    const selectStatus = (selectedStatus: string) => {
        setStatus(selectedStatus);
        setShowStatusDropdown(false);
    };

    const selectJenis = (selectedJenis: string) => {
        setJenis(selectedJenis);
        setShowJenisDropdown(false);
    };

    // Refresh data
    const handleRefresh = () => {
        fetchAlatBerat();
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <SideBar />

                {/* Main Content */}
                <View style={styles.mainContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.pageTitle}>Kelola Alat Berat</Text>
                            <Text style={styles.pageSubtitle}>Lorem Ipsum Dolor Sit Amet Consectetur</Text>
                        </View>
                        <View style={styles.dateTimeContainer}>
                            <Text style={styles.dateText}>{currentDate.full}</Text>
                            <Text style={styles.timeText}>{currentDate.time}</Text>
                            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                                <Text style={styles.refreshButtonText}>Refresh</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search Bar & Add Button */}
                    <View style={styles.searchRow}>
                        <View style={styles.searchContainer}>
                            <Search color="#999" size={20} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Cari berdasarkan nama atau jenis alat berat..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor="#999"
                            />
                        </View>
                        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                            <Text style={styles.addButtonText}>Tambahkan</Text>
                            <Text style={styles.addButtonIcon}>+</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Debug Info */}
                    <View style={styles.debugContainer}>
                        <Text style={styles.debugText}>
                            Total Data: {alatBeratList.length} item
                            {error && ` | Error: ${error}`}
                        </Text>
                    </View>

                    {/* Loading & Error State */}
                    {isLoading && (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Memuat data alat berat...</Text>
                        </View>
                    )}

                    {error && !isLoading && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>Error: {error}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={fetchAlatBerat}>
                                <Text style={styles.retryButtonText}>Coba Lagi</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Card Grid */}
                    {!isLoading && !error && (
                        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                            {filteredAlatBerat.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyStateText}>Tidak ada data alat berat</Text>
                                    <Text style={styles.emptyStateSubtext}>
                                        {alatBeratList.length === 0
                                            ? 'Data tidak ditemukan atau terjadi kesalahan'
                                            : 'Tidak ada hasil pencarian yang sesuai'
                                        }
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.cardGrid}>
                                    {filteredAlatBerat.map((item) => (
                                        <View key={item.id} style={styles.card}>
                                            {/* Status Badge */}
                                            <View style={[
                                                styles.statusBadge,
                                                item.status === 'Tersedia' ? styles.statusAvailable : styles.statusUnavailable
                                            ]}>
                                                <Text style={styles.statusText}>{item.status}</Text>
                                            </View>

                                            {/* Image */}
                                            <Image
                                                source={{ uri: item.foto }}
                                                style={styles.cardImage}
                                                onError={() => console.log('❌ Image load error:', item.foto)}
                                            />

                                            {/* Content */}
                                            <View style={styles.cardContent}>
                                                <Text style={styles.cardTitle}>{item.nama_alat}</Text>
                                                <Text style={styles.cardDescription} numberOfLines={2}>
                                                    {item.deskripsi}
                                                </Text>

                                                {/* Info Row */}
                                                <View style={styles.infoRow}>
                                                    <View style={styles.infoItem}>
                                                        <Text style={styles.infoIcon}>🏗️</Text>
                                                        <Text style={styles.infoText}>{item.jenis}</Text>
                                                    </View>
                                                    <View style={styles.infoItem}>
                                                        <Text style={styles.infoIcon}>⚖️</Text>
                                                        <Text style={styles.infoText}>{item.kapasitas}</Text>
                                                    </View>
                                                </View>

                                                {/* Price & Actions */}
                                                <View style={styles.cardFooter}>
                                                    <View>
                                                        <Text style={styles.priceLabel}>Harga per hari:</Text>
                                                        <Text style={styles.priceValue}>{formatRupiah(item.harga_sewa_per_hari)}</Text>
                                                    </View>
                                                    <TouchableOpacity
                                                        style={styles.editIconButton}
                                                        onPress={() => handleEdit(item)}
                                                    >
                                                        <Edit2 color="#FDB022" size={20} />
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
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={handleCloseModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            {/* Header Modal */}
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={handleCloseModal}>
                                    <X color="#F59E0B" size={24} />
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>
                                    {isAddMode ? 'Tambah Unit Alat Berat' : 'Update Data Alat Berat'}
                                </Text>
                                <View style={styles.modalDateContainer}>
                                    <Text style={styles.modalDateText}>{currentDate.full}</Text>
                                    <Text style={styles.modalTimeText}>{currentDate.time}</Text>
                                </View>
                            </View>

                            {/* Content Modal */}
                            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                                <View style={styles.formContainer}>
                                    <View style={styles.formRow}>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Nama Alat</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={nama_alat}
                                                onChangeText={setNamaAlat}
                                                placeholder="Excavator Volvo"
                                                placeholderTextColor="#999"
                                            />
                                        </View>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Jenis</Text>
                                            <TouchableOpacity
                                                style={styles.selectInput}
                                                onPress={() => setShowJenisDropdown(true)}
                                            >
                                                <Text style={styles.selectText}>
                                                    {jenis}
                                                </Text>
                                                <Text style={styles.selectArrow}>▼</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.formRow}>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Kapasitas</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={kapasitas}
                                                onChangeText={setKapasitas}
                                                placeholder="2.5 Ton"
                                                placeholderTextColor="#999"
                                            />
                                        </View>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Harga Sewa (RP)</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={harga_sewa_per_hari}
                                                onChangeText={setHargaSewa}
                                                placeholder="800.000"
                                                placeholderTextColor="#999"
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.formRow}>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Status</Text>
                                            <TouchableOpacity
                                                style={styles.selectInput}
                                                onPress={() => setShowStatusDropdown(true)}
                                            >
                                                <Text style={styles.selectText}>
                                                    {status}
                                                </Text>
                                                <Text style={styles.selectArrow}>▼</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.label}>Foto</Text>
                                            <TouchableOpacity
                                                style={[
                                                    styles.fotoInputContainer,
                                                    isUploading && styles.uploadingContainer
                                                ]}
                                                onPress={pickImage}
                                                disabled={isUploading}
                                            >
                                                {selectedImage || foto ? (
                                                    <Image
                                                        source={{ uri: selectedImage || foto }}
                                                        style={styles.previewImage}
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <View style={styles.placeholderContainer}>
                                                        <Camera color="#F59E0B" size={24} />
                                                        <Text style={styles.placeholderText}>Pilih Foto</Text>
                                                    </View>
                                                )}
                                                {isUploading && (
                                                    <View style={styles.uploadingOverlay}>
                                                        <Text style={styles.uploadingText}>Mengupload...</Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.formRow}>
                                        <View style={[styles.formGroup, { flex: 2 }]}>
                                            <Text style={styles.label}>Deskripsi</Text>
                                            <TextInput
                                                style={[styles.input, styles.textArea]}
                                                value={deskripsi}
                                                onChangeText={setDeskripsi}
                                                placeholder="Deskripsi alat berat..."
                                                placeholderTextColor="#999"
                                                multiline
                                                numberOfLines={4}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </ScrollView>

                            {/* Footer Modal - Buttons */}
                            <View style={styles.modalFooter}>
                                {isAddMode ? (
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={handleSave}
                                    >
                                        <Text style={styles.saveButtonText}>Simpan</Text>
                                        <View style={styles.buttonIconContainer}>
                                            <Plus color={COLORS.white} size={18} />
                                        </View>
                                    </TouchableOpacity>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            style={styles.updateButton}
                                            onPress={handleUpdate}
                                        >
                                            <Text style={styles.updateButtonText}>Update</Text>
                                            <View style={styles.buttonIconContainer}>
                                                <Edit2 color={COLORS.white} size={18} />
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.clearButton}
                                            onPress={handleClear}
                                        >
                                            <Text style={styles.clearButtonText}>Hapus</Text>
                                            <View style={styles.buttonIconContainer}>
                                                <Trash2 color={COLORS.white} size={18} />
                                            </View>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Dropdown Modal untuk Status */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={showStatusDropdown}
                        onRequestClose={() => setShowStatusDropdown(false)}
                    >
                        <TouchableOpacity
                            style={styles.dropdownOverlay}
                            activeOpacity={1}
                            onPress={() => setShowStatusDropdown(false)}
                        >
                            <View style={styles.dropdownContent}>
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => selectStatus('Tersedia')}
                                >
                                    <Text style={styles.dropdownText}>Tersedia</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
                                    onPress={() => selectStatus('Tidak Tersedia')}
                                >
                                    <Text style={styles.dropdownText}>Tidak Tersedia</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Modal>

                    {/* Dropdown Modal untuk Jenis */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={showJenisDropdown}
                        onRequestClose={() => setShowJenisDropdown(false)}
                    >
                        <TouchableOpacity
                            style={styles.dropdownOverlay}
                            activeOpacity={1}
                            onPress={() => setShowJenisDropdown(false)}
                        >
                            <View style={styles.dropdownContent}>
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => selectJenis('Excavator')}
                                >
                                    <Text style={styles.dropdownText}>Excavator</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => selectJenis('Crane')}
                                >
                                    <Text style={styles.dropdownText}>Crane</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => selectJenis('Bulldozer')}
                                >
                                    <Text style={styles.dropdownText}>Bulldozer</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => selectJenis('Dump Truck')}
                                >
                                    <Text style={styles.dropdownText}>Dump Truck</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
                                    onPress={() => selectJenis('Lainnya')}
                                >
                                    <Text style={styles.dropdownText}>Lainnya</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Modal>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={deleteModalVisible}
                    onRequestClose={() => setDeleteModalVisible(false)}
                >
                    <View style={styles.confirmOverlay}>
                        <View style={styles.confirmContent}>
                            <View style={styles.confirmIconContainer}>
                                <View style={styles.confirmIcon}>
                                    <Trash2 color="#EF4444" size={64} />
                                </View>
                            </View>
                            <View style={styles.dividerLine} />
                            <Text style={styles.confirmTitle}>Anda Yakin Menghapus Unit Ini?</Text>
                            <View style={styles.confirmButtons}>
                                <TouchableOpacity
                                    style={styles.confirmYesButton}
                                    onPress={() => handleConfirmDelete(true)}
                                >
                                    <Text style={styles.confirmButtonText}>Ya</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.confirmNoButton}
                                    onPress={() => handleConfirmDelete(false)}
                                >
                                    <Text style={styles.confirmButtonText}>Tidak</Text>
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
        backgroundColor: COLORS.white,
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
    searchRow: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 15,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: '#333',
    },
    refreshButton: {
        marginTop: 10,
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: '#F59E0B',
        borderRadius: 8,
        alignItems: 'center',
    },
    refreshButtonText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 12,
        color: COLORS.white,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDB022',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    addButtonText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: COLORS.white,
    },
    addButtonIcon: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 20,
        color: COLORS.white,
    },
    debugContainer: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        marginBottom: 10,
    },
    debugText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 12,
        color: '#666',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 16,
        color: '#F59E0B',
    },
    errorContainer: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        borderRadius: 10,
        marginBottom: 20,
    },
    errorText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: '#DC2626',
        textAlign: 'center',
        marginBottom: 10,
    },
    retryButton: {
        backgroundColor: '#FDB022',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: COLORS.white,
    },
    scrollContainer: {
        flex: 1,
    },
    cardGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
    },
    card: {
        width: '23%',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        zIndex: 1,
    },
    statusAvailable: {
        backgroundColor: '#3B82F6',
    },
    statusUnavailable: {
        backgroundColor: '#EF4444',
    },
    statusText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 11,
        color: COLORS.white,
    },
    cardImage: {
        width: '100%',
        height: 160,
        backgroundColor: '#E5E5E5',
    },
    cardContent: {
        padding: 15,
    },
    cardTitle: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 15,
        color: '#333',
        marginBottom: 8,
    },
    cardDescription: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 12,
        color: '#666',
        marginBottom: 12,
        lineHeight: 18,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 15,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    infoIcon: {
        fontSize: 14,
    },
    infoText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 12,
        color: '#666',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    priceLabel: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 11,
        color: '#666',
        marginBottom: 3,
    },
    priceValue: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 16,
        color: '#F59E0B',
    },
    editIconButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#FFF4E6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderRadius: 10,
        width: '85%',
        maxWidth: 900,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    modalTitle: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 20,
        color: '#F59E0B',
        flex: 1,
        marginLeft: 15,
        textAlign: 'center',
    },
    modalDateContainer: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    modalDateText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 12,
        color: '#F59E0B',
    },
    modalTimeText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: '#333',
    },
    modalBody: {
        padding: 30,
        maxHeight: 500,
    },
    formContainer: {
        gap: 20,
    },
    formRow: {
        flexDirection: 'row',
        gap: 20,
    },
    formGroup: {
        flex: 1,
    },
    label: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 13,
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: '#F59E0B',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontFamily: 'Poppins_400Regular',
        fontSize: 13,
        color: '#333',
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    selectInput: {
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: '#F59E0B',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 13,
        color: '#333',
    },
    selectArrow: {
        fontSize: 12,
        color: '#F59E0B',
    },
    fotoInputContainer: {
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: '#F59E0B',
        borderRadius: 8,
        padding: 0,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
    },
    previewImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
    },
    placeholderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 12,
        color: '#999',
        marginTop: 5,
    },
    uploadingContainer: {
        opacity: 0.7,
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    uploadingText: {
        color: COLORS.white,
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 20,
        gap: 15,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    updateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10B981',
        paddingHorizontal: 35,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 10,
    },
    updateButtonText: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 14,
        color: COLORS.white,
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EF4444',
        paddingHorizontal: 35,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 10,
    },
    clearButtonText: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 14,
        color: COLORS.white,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDB022',
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 10,
    },
    saveButtonText: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 14,
        color: COLORS.white,
    },
    buttonIconContainer: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
        borderRadius: 4,
    },
    dropdownOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dropdownContent: {
        backgroundColor: COLORS.white,
        borderRadius: 8,
        width: '80%',
        maxWidth: 300,
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
        fontSize: 16,
        color: '#333',
    },
    confirmOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    confirmContent: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        padding: 40,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    confirmIconContainer: {
        marginBottom: 20,
    },
    confirmIcon: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    dividerLine: {
        width: '100%',
        height: 1,
        backgroundColor: '#F59E0B',
        marginVertical: 20,
    },
    confirmTitle: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 16,
        color: '#F59E0B',
        textAlign: 'center',
        marginBottom: 30,
    },
    confirmButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    confirmYesButton: {
        backgroundColor: '#FDB022',
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 25,
        minWidth: 100,
        alignItems: 'center',
    },
    confirmNoButton: {
        backgroundColor: '#FDB022',
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 25,
        minWidth: 100,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 14,
        color: COLORS.white,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});