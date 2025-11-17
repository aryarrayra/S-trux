import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform, Image, Animated } from 'react-native';
import { Search, Edit2, Trash2, X, Camera, Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { COLORS } from '../../constants/Colors';
import SideBar from '../../components/admin/SideBar';
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

// Toast Component - VERSI YANG DIPERBAIKI
const Toast = ({ visible, message, type, onHide, duration = 4000 }: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning';
    onHide: () => void;
    duration?: number;
}) => {
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(-100);

    useEffect(() => {
        if (visible) {
            // Animate in
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto hide after duration
            const timer = setTimeout(() => {
                hideToast();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onHide();
        });
    };

    // Fungsi getToastStyle - DIPINDAHKAN KE DALAM KOMPONEN
    const getToastStyle = () => {
        switch (type) {
            case 'success':
                return styles.successToast;
            case 'error':
                return styles.errorToast;
            case 'warning':
                return styles.warningToast;
            default:
                return styles.successToast;
        }
    };

    // Fungsi getIcon - DIPINDAHKAN KE DALAM KOMPONEN
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle color="#fff" size={24} />;
            case 'error':
                return <XCircle color="#fff" size={24} />;
            case 'warning':
                return <AlertCircle color="#fff" size={24} />;
            default:
                return <CheckCircle color="#fff" size={24} />;
        }
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.toastContainer,
                getToastStyle(),
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <View style={styles.toastContent}>
                {getIcon()}
                <Text style={styles.toastText}>{message}</Text>
            </View>
        </Animated.View>
    );
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

    // Toast states
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');

    // Form states
    const [nama_alat, setNamaAlat] = useState('');
    const [jenis, setJenis] = useState('Excavator');
    const [kapasitas, setKapasitas] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [harga_sewa_per_hari, setHargaSewa] = useState('');
    const [status, setStatus] = useState('Tersedia');

    // Image states - DIPISAH UNTUK UPLOAD DAN PREVIEW
    const [imageBase64, setImageBase64] = useState(''); // Pure base64 untuk upload ke DB (tanpa prefix)
    const [previewUri, setPreviewUri] = useState<string | null>(null); // URI untuk preview (lokal atau prefixed base64)
    const [isUploading, setIsUploading] = useState(false);

    // Base URL untuk API
    const getBaseUrl = () => {
        return Platform.OS === 'android' ? 'http://10.0.2.2:8000/api' : 'http://127.0.0.1:8000/api';
    };

    // Create Axios instance
    const api = axios.create({
        baseURL: getBaseUrl(),
        timeout: 15000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });

    // Show toast function
    const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setToastVisible(true);
    };

    // Fungsi untuk check apakah string adalah base64
    const isBase64 = (str: string): boolean => {
        if (!str || typeof str !== 'string') return false;
        return /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/g.test(str);
    };

    // Di dalam pickImage - PERBAIKI UNTUK BASE64 DAN PREVIEW LOCAL + OPTIMASI SIZE
    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                showToast('Izin akses galeri diperlukan', 'error');
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.3, // TURUNIN quality untuk ukuran lebih kecil
                base64: true, // IMPORTANT: Enable base64
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                // Validasi ukuran base64 (max 1MB approx)
                const base64Size = asset.base64 ? (asset.base64.length * 3 / 4) : 0; // Approx bytes
                if (base64Size > 1000000) { // 1MB limit
                    showToast('Foto terlalu besar! Pilih yang lebih kecil.', 'warning');
                    return;
                }

                // Set preview URI lokal untuk tampilan cepat
                setPreviewUri(asset.uri);
                // Set pure base64 untuk upload (tanpa prefix)
                setImageBase64(asset.base64 || '');

                console.log('✅ Image picked: URI=', asset.uri, 'Base64 length=', asset.base64?.length, 'Size ~', base64Size, 'bytes');
                showToast('Gambar berhasil dipilih!', 'success');
                setIsUploading(false);
            }
        } catch (error) {
            console.error('❌ Error picking image:', error);
            showToast('Gagal memilih gambar', 'error');
            setIsUploading(false);
        }
    };

    // Fetch data dari API
    const fetchAlatBerat = async () => {
        setIsLoading(true);
        setError(null);

        try {
            console.log('🔄 Fetching alat berat from API...');
            const response = await api.get('/alat-berat');
            const data = response.data;

            console.log('✅ API Response data:', data);

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

            // Transform data - HANDLE FOTO DENGAN BENAR (prefix base64 jika perlu)
            const transformedData: AlatBerat[] = dataArray.map((item: any) => {
                let fotoUrl = item.foto || 'https://images.unsplash.com/photo-1558618047-3c8c98e967b7?w=400';

                // Jika foto adalah base64 murni dari DB, tambahkan prefix
                if (isBase64(item.foto)) {
                    fotoUrl = `data:image/jpeg;base64,${item.foto}`;
                }
                // Jika foto adalah path lokal, gunakan langsung
                else if (item.foto && item.foto.startsWith('file://')) {
                    fotoUrl = item.foto;
                }
                // Jika foto adalah path assets, gunakan langsung
                else if (item.foto && item.foto.includes('assets/')) {
                    fotoUrl = item.foto;
                }
                // Jika sudah prefixed base64 atau URL eksternal, gunakan langsung

                return {
                    id: item.id_alat?.toString() || item.id?.toString() || Math.random().toString(),
                    nama_alat: item.nama_alat || 'Nama alat tidak tersedia',
                    jenis: item.jenis || 'Lainnya',
                    kapasitas: item.kapasitas || '-',
                    deskripsi: item.deskripsi || 'Deskripsi tidak tersedia',
                    harga_sewa_per_hari: Number(item.harga_sewa_per_hari) || item.harga_sewa || 0,
                    status: item.status || 'Tersedia',
                    foto: fotoUrl,
                };
            });

            console.log('🔄 Transformed data:', transformedData);
            setAlatBeratList(transformedData);
        } catch (error) {
            console.error('❌ Error fetching alat berat:', error);
            const errorMessage = axios.isAxiosError(error)
                ? (error.response?.data?.message || error.message)
                : 'Terjadi kesalahan saat mengambil data';
            setError(errorMessage);
            setAlatBeratList(INITIAL_ALAT_BERAT);
        } finally {
            setIsLoading(false);
        }
    };

    // Validasi form
    const validateForm = (): boolean => {
        if (!nama_alat.trim()) {
            showToast('Nama alat harus diisi!', 'error');
            return false;
        }
        if (!jenis.trim()) {
            showToast('Jenis alat harus dipilih!', 'error');
            return false;
        }
        if (!kapasitas.trim()) {
            showToast('Kapasitas harus diisi!', 'error');
            return false;
        }
        if (!deskripsi.trim()) {
            showToast('Deskripsi harus diisi!', 'error');
            return false;
        }
        if (!harga_sewa_per_hari.trim() || isNaN(parseInt(harga_sewa_per_hari)) || parseInt(harga_sewa_per_hari) <= 0) {
            showToast('Harga sewa harus berupa angka yang valid!', 'error');
            return false;
        }
        if (!status.trim()) {
            showToast('Status harus dipilih!', 'error');
            return false;
        }
        return true;
    };

    // HANDLE SAVE - VERSI BARU (FormData + retry + detail error) - FIXED TS ERROR
    const handleSave = async (retryCount = 0) => {
        if (!validateForm()) return;

        try {
            setIsUploading(true);

            const newItemData = {
                nama_alat: nama_alat.trim(),
                jenis: jenis.trim(),
                kapasitas: kapasitas.trim(),
                deskripsi: deskripsi.trim(),
                harga_sewa_per_hari: parseInt(harga_sewa_per_hari),
                status: status,
                foto: imageBase64, // Pure base64 untuk simpan di DB
            };

            console.log('📤 Saving data:', newItemData);
            console.log('📤 Payload size (bytes):', JSON.stringify(newItemData).length);
            console.log('📤 Base64 preview (first 100 chars):', imageBase64?.substring(0, 100));

            // Ganti ke FormData buat handle foto lebih aman
            const formData = new FormData();
            formData.append('nama_alat', newItemData.nama_alat);
            formData.append('jenis', newItemData.jenis);
            formData.append('kapasitas', newItemData.kapasitas);
            formData.append('deskripsi', newItemData.deskripsi);
            formData.append('harga_sewa_per_hari', newItemData.harga_sewa_per_hari.toString());
            formData.append('status', newItemData.status);

            if (imageBase64 && previewUri) {
                formData.append('foto', {
                    uri: previewUri,
                    type: 'image/jpeg',
                    name: 'foto.jpg',
                } as any);
            }

            const response = await api.post('/alat-berat', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 30000, // Naikin timeout
            });

            console.log('✅ Save response:', response.data);

            // Refresh data
            await fetchAlatBerat();
            showToast('Data alat berat berhasil ditambahkan! 🎉', 'success');
            setModalVisible(false);
            resetForm();
        } catch (error: any) { // FIXED: Explicitly type as any untuk TS
            console.error('❌ Full error object:', error);
            const responseStatus = error.response?.status; // FIXED: Assign dengan optional chaining
            const responseData = error.response?.data; // FIXED: Assign dengan optional chaining

            console.error('❌ Response status:', responseStatus);
            console.error('❌ Response data:', responseData);

            let errorMessage = 'Gagal menambahkan data alat berat';

            if (axios.isAxiosError(error)) {
                if (responseStatus === 413) {
                    errorMessage = 'Foto terlalu besar! Coba pilih yang lebih kecil.';
                } else if (responseStatus === 422) {
                    // FIXED: Type assertion untuk errors sebagai Record<string, string[]>
                    const errors = responseData?.errors as Record<string, string[]> | undefined;
                    if (errors) {
                        const firstErrorArray = Object.values(errors)[0];
                        if (firstErrorArray && Array.isArray(firstErrorArray)) {
                            errorMessage = firstErrorArray[0] || 'Validasi gagal';
                        } else {
                            errorMessage = 'Validasi gagal';
                        }
                    } else {
                        errorMessage = 'Validasi gagal';
                    }
                } else if (responseStatus === 500) {
                    errorMessage = 'Server error. Cek log Laravel.';
                } else if (responseStatus === 0 || error.code === 'ECONNABORTED') {
                    errorMessage = 'Timeout. Coba lagi atau periksa koneksi.';
                    if (retryCount < 1) { // Retry sekali
                        setTimeout(() => handleSave(retryCount + 1), 1000);
                        return;
                    }
                } else {
                    errorMessage = responseData?.message || error.message;
                }
            }

            showToast(errorMessage, 'error');
        } finally {
            setIsUploading(false);
        }
    };

    // HANDLE UPDATE - VERSI BARU (mirip handleSave) - FIXED TS ERROR
    const handleUpdate = async (retryCount = 0) => {
        if (!validateForm() || !selectedAlatBerat) return;

        try {
            setIsUploading(true);

            const updateData = {
                nama_alat: nama_alat.trim(),
                jenis: jenis.trim(),
                kapasitas: kapasitas.trim(),
                deskripsi: deskripsi.trim(),
                harga_sewa_per_hari: parseInt(harga_sewa_per_hari),
                status: status,
                foto: imageBase64 || null, // Kirim base64 baru jika ada, null untuk keep foto lama
            };

            console.log('📤 Updating data:', updateData);

            // FormData untuk update juga
            const formData = new FormData();
            formData.append('nama_alat', updateData.nama_alat);
            formData.append('jenis', updateData.jenis);
            formData.append('kapasitas', updateData.kapasitas);
            formData.append('deskripsi', updateData.deskripsi);
            formData.append('harga_sewa_per_hari', updateData.harga_sewa_per_hari.toString());
            formData.append('status', updateData.status);

            if (imageBase64 && previewUri) {
                formData.append('foto', {
                    uri: previewUri,
                    type: 'image/jpeg',
                    name: 'foto.jpg',
                } as any);
            }

            const response = await api.put(`/alat-berat/${selectedAlatBerat.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 30000,
            });

            console.log('✅ Update response:', response.data);

            // Refresh data
            await fetchAlatBerat();
            showToast('Data alat berat berhasil diupdate! ✅', 'success');
            setModalVisible(false);
        } catch (error: any) { // FIXED: Explicitly type as any untuk TS
            console.error('❌ Full error object:', error);
            const responseStatus = error.response?.status; // FIXED: Assign dengan optional chaining
            const responseData = error.response?.data; // FIXED: Assign dengan optional chaining

            console.error('❌ Response status:', responseStatus);
            console.error('❌ Response data:', responseData);

            let errorMessage = 'Gagal mengupdate data alat berat';

            if (axios.isAxiosError(error)) {
                if (responseStatus === 413) {
                    errorMessage = 'Foto terlalu besar! Coba pilih yang lebih kecil.';
                } else if (responseStatus === 422) {
                    // FIXED: Type assertion untuk errors sebagai Record<string, string[]>
                    const errors = responseData?.errors as Record<string, string[]> | undefined;
                    if (errors) {
                        const firstErrorArray = Object.values(errors)[0];
                        if (firstErrorArray && Array.isArray(firstErrorArray)) {
                            errorMessage = firstErrorArray[0] || 'Validasi gagal';
                        } else {
                            errorMessage = 'Validasi gagal';
                        }
                    } else {
                        errorMessage = 'Validasi gagal';
                    }
                } else if (responseStatus === 500) {
                    errorMessage = 'Server error. Cek log Laravel.';
                } else if (responseStatus === 0 || error.code === 'ECONNABORTED') {
                    errorMessage = 'Timeout. Coba lagi atau periksa koneksi.';
                    if (retryCount < 1) {
                        setTimeout(() => handleUpdate(retryCount + 1), 1000);
                        return;
                    }
                } else {
                    errorMessage = responseData?.message || error.message;
                }
            }

            showToast(errorMessage, 'error');
        } finally {
            setIsUploading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setNamaAlat('');
        setJenis('Excavator');
        setKapasitas('');
        setDeskripsi('');
        setHargaSewa('');
        setStatus('Tersedia');
        setImageBase64(''); // Reset base64
        setPreviewUri(null); // Reset preview
        setError(null);
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
        setImageBase64(''); // Mulai kosong, user bisa ganti
        setPreviewUri(item.foto); // Preview foto lama (sudah prefixed jika base64)
        setModalVisible(true);
    };

    const handleAdd = () => {
        setSelectedAlatBerat(null);
        setIsAddMode(true);
        resetForm();
        setModalVisible(true);
    };

    const handleDelete = (item: AlatBerat) => {
        setSelectedAlatBerat(item);
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = async (confirmed: boolean) => {
        if (confirmed && selectedAlatBerat) {
            try {
                await api.delete(`/alat-berat/${selectedAlatBerat.id}`);
                setAlatBeratList(prev => prev.filter(item => item.id !== selectedAlatBerat.id));
                showToast('Data alat berat berhasil dihapus! 🗑️', 'success');
                if (!isAddMode) {
                    setModalVisible(false);
                }
            } catch (error: any) { // FIXED: Explicitly type as any
                console.error('❌ Error deleting alat berat:', error);
                const errorMessage = axios.isAxiosError(error)
                    ? (error.response?.data?.message || error.message)
                    : 'Gagal menghapus data dari server';
                showToast(errorMessage, 'error');
            }
        }
        setDeleteModalVisible(false);
        setSelectedAlatBerat(null);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setShowStatusDropdown(false);
        setShowJenisDropdown(false);
        resetForm();
    };

    const selectStatus = (selectedStatus: string) => {
        setStatus(selectedStatus);
        setShowStatusDropdown(false);
    };

    const selectJenis = (selectedJenis: string) => {
        setJenis(selectedJenis);
        setShowJenisDropdown(false);
    };

    const handleRefresh = () => {
        fetchAlatBerat();
    };

    // Search alat berat
    const searchAlatBerat = async (query: string) => {
        if (!query.trim()) {
            fetchAlatBerat();
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.get(`/alat-berat/search?q=${encodeURIComponent(query)}`);
            const data = response.data;

            let dataArray = [];
            if (data.success && Array.isArray(data.data)) {
                dataArray = data.data;
            } else if (Array.isArray(data)) {
                dataArray = data;
            } else {
                dataArray = [];
            }

            const transformedData: AlatBerat[] = dataArray.map((item: any) => ({
                id: item.id_alat?.toString() || item.id?.toString() || Math.random().toString(),
                nama_alat: item.nama_alat || 'Nama alat tidak tersedia',
                jenis: item.jenis || 'Lainnya',
                kapasitas: item.kapasitas || '-',
                deskripsi: item.deskripsi || 'Deskripsi tidak tersedia',
                harga_sewa_per_hari: Number(item.harga_sewa_per_hari) || item.harga_sewa || 0,
                status: item.status || 'Tersedia',
                foto: isBase64(item.foto) ? `data:image/jpeg;base64,${item.foto}` : (item.foto || 'https://images.unsplash.com/photo-1558618047-3c8c98e967b7?w=400'),
            }));

            setAlatBeratList(transformedData);
        } catch (error: any) { // FIXED: Explicitly type as any
            console.error('❌ Error searching alat berat:', error);
            showToast('Gagal melakukan pencarian', 'error');
            fetchAlatBerat();
        } finally {
            setIsLoading(false);
        }
    };

    // Filter by status
    const filterByStatus = async (status: string) => {
        setIsLoading(true);

        try {
            const response = await api.get(`/alat-berat/status/${encodeURIComponent(status)}`);
            const data = response.data;

            let dataArray = [];
            if (data.success && Array.isArray(data.data)) {
                dataArray = data.data;
            } else if (Array.isArray(data)) {
                dataArray = data;
            } else {
                dataArray = [];
            }

            const transformedData: AlatBerat[] = dataArray.map((item: any) => ({
                id: item.id_alat?.toString() || item.id?.toString() || Math.random().toString(),
                nama_alat: item.nama_alat || 'Nama alat tidak tersedia',
                jenis: item.jenis || 'Lainnya',
                kapasitas: item.kapasitas || '-',
                deskripsi: item.deskripsi || 'Deskripsi tidak tersedia',
                harga_sewa_per_hari: Number(item.harga_sewa_per_hari) || item.harga_sewa || 0,
                status: item.status || 'Tersedia',
                foto: isBase64(item.foto) ? `data:image/jpeg;base64,${item.foto}` : (item.foto || 'https://images.unsplash.com/photo-1558618047-3c8c98e967b7?w=400'),
            }));

            setAlatBeratList(transformedData);
        } catch (error: any) { // FIXED: Explicitly type as any
            console.error('❌ Error filtering by status:', error);
            showToast('Gagal memfilter data', 'error');
            fetchAlatBerat();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAlatBerat();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery.trim()) {
                searchAlatBerat(searchQuery);
            } else {
                fetchAlatBerat();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

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

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <SideBar />
                {/* Toast Component */}
                <Toast
                    visible={toastVisible}
                    message={toastMessage}
                    type={toastType}
                    onHide={() => setToastVisible(false)}
                />
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
                    {/* Filter by Status */}
                    <View style={styles.filterContainer}>
                        <Text style={styles.filterLabel}>Filter by Status:</Text>
                        <View style={styles.filterButtons}>
                            <TouchableOpacity
                                style={styles.filterButton}
                                onPress={() => filterByStatus('Tersedia')}
                            >
                                <Text style={styles.filterButtonText}>Tersedia</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.filterButton}
                                onPress={() => filterByStatus('Disewa')}
                            >
                                <Text style={styles.filterButtonText}>Disewa</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.filterButton}
                                onPress={() => filterByStatus('Perawatan')}
                            >
                                <Text style={styles.filterButtonText}>Perawatan</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.filterButton}
                                onPress={() => fetchAlatBerat()} // FIXED: Wrap in arrow function to avoid event param
                            >
                                <Text style={styles.filterButtonText}>Semua</Text>
                            </TouchableOpacity>
                        </View>
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
                            <TouchableOpacity style={styles.retryButton} onPress={() => fetchAlatBerat()}> {/* FIXED: Wrap in arrow function */}
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
                                                item.status === 'Tersedia' ? styles.statusAvailable :
                                                    item.status === 'Disewa' ? styles.statusRented :
                                                        styles.statusMaintenance
                                            ]}>
                                                <Text style={styles.statusText}>{item.status}</Text>
                                            </View>
                                            {/* Image dengan error handling */}
                                            <Image
                                                source={{ uri: item.foto }}
                                                style={styles.cardImage}
                                                onError={(e) => {
                                                    console.log('❌ Image load error:', item.foto);
                                                }}
                                                onLoad={() => console.log('✅ Image loaded:', item.foto)}
                                                defaultSource={{ uri: 'https://images.unsplash.com/photo-1558618047-3c8c98e967b7?w=400' }}
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
                                                    <View style={styles.actionButtons}>
                                                        <TouchableOpacity
                                                            style={styles.editIconButton}
                                                            onPress={() => handleEdit(item)}
                                                        >
                                                            <Edit2 color="#FDB022" size={20} />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            style={styles.deleteIconButton}
                                                            onPress={() => handleDelete(item)}
                                                        >
                                                            <Trash2 color="#EF4444" size={20} />
                                                        </TouchableOpacity>
                                                    </View>
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
                                                {previewUri ? (
                                                    <Image
                                                        source={{ uri: previewUri }}
                                                        style={styles.previewImage}
                                                        resizeMode="cover"
                                                        onError={() => console.log('❌ Preview image error')}
                                                    />
                                                ) : (
                                                    <View style={styles.placeholderContainer}>
                                                        <Camera color="#F59E0B" size={24} />
                                                        <Text style={styles.placeholderText}>Pilih Foto</Text>
                                                    </View>
                                                )}
                                                {isUploading && (
                                                    <View style={styles.uploadingOverlay}>
                                                        <Text style={styles.uploadingText}>Menyimpan...</Text>
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
                                        onPress={() => handleSave()} // FIXED: Wrap in arrow function to ignore event
                                        disabled={isUploading}
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
                                            onPress={() => handleUpdate()} // FIXED: Wrap in arrow function to ignore event
                                            disabled={isUploading}
                                        >
                                            <Text style={styles.updateButtonText}>Update</Text>
                                            <View style={styles.buttonIconContainer}>
                                                <Edit2 color={COLORS.white} size={18} />
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.clearButton}
                                            onPress={() => handleDelete(selectedAlatBerat!)}
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
                                    style={styles.dropdownItem}
                                    onPress={() => selectStatus('Disewa')}
                                >
                                    <Text style={styles.dropdownText}>Disewa</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
                                    onPress={() => selectStatus('Perawatan')}
                                >
                                    <Text style={styles.dropdownText}>Perawatan</Text>
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
        marginBottom: 15,
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
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 15,
    },
    filterLabel: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: '#333',
    },
    filterButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    filterButton: {
        backgroundColor: '#FDB022',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
    },
    filterButtonText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 12,
        color: COLORS.white,
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
        backgroundColor: '#10B981',
    },
    statusRented: {
        backgroundColor: '#F59E0B',
    },
    statusMaintenance: {
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
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    editIconButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#FFF4E6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteIconButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#FEE2E2',
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
    // Toast Styles
    toastContainer: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 9999,
    },
    successToast: {
        backgroundColor: '#10B981',
    },
    errorToast: {
        backgroundColor: '#EF4444',
    },
    warningToast: {
        backgroundColor: '#F59E0B',
    },
    toastContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    toastText: {
        color: '#fff',
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        flex: 1,
    },
});