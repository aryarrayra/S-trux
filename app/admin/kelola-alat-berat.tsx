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
  Platform, 
  Image, 
  Animated,
  ActivityIndicator
} from 'react-native';
import { Search, Edit2, Trash2, X, Camera, Plus, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
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

// Toast Component
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

  // Image states
  const [imageBase64, setImageBase64] = useState('');
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Base URL untuk API
  const getBaseUrl = () => {
    if (__DEV__) {
      return Platform.OS === 'android' 
        ? 'http://10.0.2.2:8000/api' 
        : 'http://127.0.0.1:8000/api';
    }
    return 'https://your-production-api.com/api';
  };

  // Create Axios instance dengan config yang lebih baik
  const api = axios.create({
    baseURL: getBaseUrl(),
    timeout: 30000, // 30 detik timeout
    headers: {
      'Accept': 'application/json',
    },
  });

  // Tambahkan interceptor untuk logging
  api.interceptors.request.use(
    (config) => {
      console.log('📤 Request:', {
        url: config.url,
        method: config.method,
        data: config.data
      });
      return config;
    },
    (error) => {
      console.error('❌ Request error:', error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      console.log('📥 Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
      return response;
    },
    (error) => {
      console.error('❌ Response error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      return Promise.reject(error);
    }
  );

  // Show toast function
  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // ✅ FIXED: pickImage Function
  const pickImage = async () => {
    try {
      console.log('📸 Starting image picker...');

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast('Izin akses galeri diperlukan', 'error');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      console.log('📸 Picker result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];

        if (!asset.base64) {
          showToast('Gagal membaca data gambar', 'error');
          return;
        }

        const base64Size = (asset.base64.length * 3 / 4);
        console.log('📸 Image size:', base64Size, 'bytes (~', Math.round(base64Size / 1024), 'KB)');

        if (base64Size > 2000000) {
          showToast('Foto terlalu besar! Max 2MB', 'warning');
          return;
        }

        setPreviewUri(asset.uri);
        setImageBase64(asset.base64);

        console.log('✅ Image set successfully');
        console.log('✅ Preview URI:', asset.uri);

        showToast('Gambar berhasil dipilih!', 'success');
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
      showToast('Gagal memilih gambar', 'error');
    }
  };

  // ✅ Helper: Convert Laravel URL to React Native accessible URL
const convertToReactNativeUrl = (url: string): string => {
  if (!url) return '';
  
  console.log('🔧 Converting URL:', url);
  
  // Jika sudah URL placeholder, return as is
  if (url.includes('placeholder.com')) {
    return url;
  }
  
  // Jika sudah full URL http/https
  if (url.startsWith('http')) {
    // Replace localhost with actual IP for Android emulator
    if (__DEV__) {
      if (url.includes('localhost') || url.includes('127.0.0.1')) {
        // Untuk Android emulator
        if (Platform.OS === 'android') {
          const replaced = url.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
          console.log('🔧 Converted for Android:', replaced);
          return replaced;
        }
        // Untuk iOS simulator
        else if (Platform.OS === 'ios') {
          const replaced = url.replace('localhost', '127.0.0.1');
          console.log('🔧 Converted for iOS:', replaced);
          return replaced;
        }
      }
    }
    return url;
  }
  
  return url;
};

// ✅ Helper: Build URL from database path for React Native
const buildImageUrlForReactNative = (path: string): string => {
  if (!path) return '';
  
  console.log('🔧 Building URL from path:', path);
  
  // Jika path sudah mengandung http, return as is
  if (path.startsWith('http')) {
    return convertToReactNativeUrl(path);
  }
  
  // Base URL untuk React Native
  let baseUrl = '';
  
  if (__DEV__) {
    if (Platform.OS === 'android') {
      baseUrl = 'http://10.0.2.2:8000';
    } else {
      baseUrl = 'http://127.0.0.1:8000';
    }
  } else {
    baseUrl = 'https://your-production-api.com';
  }
  
  // Normalize path
  let normalizedPath = path;
  
  // Jika path dimulai dengan 'images/alat-berat/'
  if (path.startsWith('images/alat-berat/')) {
    return `${baseUrl}/${path}`;
  }
  
  // Jika path dimulai dengan 'alat-berat/' (storage)
  if (path.startsWith('alat-berat/')) {
    return `${baseUrl}/storage/${path}`;
  }
  
  // Jika path dimulai dengan 'storage/'
  if (path.startsWith('storage/')) {
    return `${baseUrl}/${path}`;
  }
  
  // Default: assume it's in storage
  return `${baseUrl}/storage/${path}`;
};

  // ✅ FIXED: Fetch data alat berat
// ✅ FIXED: Fetch data alat berat dengan URL yang benar untuk React Native
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

    const transformedData: AlatBerat[] = dataArray.map((item: any) => {
      console.log('📸 Processing item:', {
        id: item.id_alat,
        nama: item.nama_alat,
        foto_field: item.foto,
        foto_url: item.foto_url
      });

      // 🔥 FIX: Tentukan foto URL untuk React Native
      let fotoUrl = null;

      // Priority 1: Jika ada foto_url dari API
      if (item.foto_url) {
        console.log('📸 Using foto_url from API:', item.foto_url);
        // Convert Laravel URL to React Native accessible URL
        fotoUrl = convertToReactNativeUrl(item.foto_url);
      }
      // Priority 2: Jika ada foto path di database
      else if (item.foto) {
        console.log('📸 Using foto path from database:', item.foto);
        // Build URL untuk React Native
        fotoUrl = buildImageUrlForReactNative(item.foto);
      }

      // Fallback ke default image jika masih null
      if (!fotoUrl) {
        fotoUrl = 'https://via.placeholder.com/400x300?text=No+Image';
        console.log('📸 Using fallback image');
      }

      console.log('🎯 Final image URL:', fotoUrl);

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

    console.log('🔄 Transformed data count:', transformedData.length);
    setAlatBeratList(transformedData);
  } catch (error) {
    console.error('❌ Error fetching alat berat:', error);
    const errorMessage = axios.isAxiosError(error)
      ? (error.response?.data?.message || error.message)
      : 'Terjadi kesalahan saat mengambil data';
    setError(errorMessage);
    showToast(errorMessage, 'error');
    setAlatBeratList(INITIAL_ALAT_BERAT);
  } finally {
    setIsLoading(false);
  }
};

  // ✅ FIXED: Test API connection
  const testApiConnection = async () => {
    try {
      console.log('🧪 Testing API connection...');
      
      // Test 1: Health check
      const healthResponse = await api.get('/health');
      console.log('✅ Health check:', healthResponse.data);
      
      // Test 2: Get alat berat
      const alatResponse = await api.get('/alat-berat');
      console.log('✅ Alat berat data:', alatResponse.data);
      
      showToast('API connection successful!', 'success');
      return true;
    } catch (error) {
      console.error('❌ API test failed:', error);
      showToast('API connection failed', 'error');
      return false;
    }
  };

  // ✅ FIXED: Validate form
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

  // ✅ FIXED: handleSave Function
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsUploading(true);
      console.log('💾 Starting save...');

      // 1. Buat FormData
      const formData = new FormData();
      
      console.log('📝 Form values:', {
        nama_alat,
        jenis,
        kapasitas,
        deskripsi,
        harga_sewa_per_hari,
        status,
        previewUri: previewUri ? 'Exists' : 'None'
      });

      // 2. Tambahkan text fields
      formData.append('nama_alat', nama_alat.trim());
      formData.append('jenis', jenis.trim());
      formData.append('kapasitas', kapasitas.trim());
      formData.append('deskripsi', deskripsi.trim());
      formData.append('harga_sewa_per_hari', harga_sewa_per_hari);
      formData.append('status', status);

      // 3. Tambahkan file JIKA ADA
      if (previewUri && previewUri.startsWith('file://')) {
        console.log('📁 Preparing file:', previewUri);
        
        try {
          // Extract filename
          const filename = previewUri.split('/').pop() || `alat_${Date.now()}.jpg`;
          
          console.log('📁 Creating file object:', {
            uri: previewUri,
            name: filename,
            type: 'image/jpeg'
          });
          
          // Buat file object untuk FormData
          const file = {
            uri: previewUri,
            type: 'image/jpeg',
            name: filename,
          };
          
          formData.append('foto', file as any);
          console.log('✅ File added to FormData');
        } catch (fileError) {
          console.error('❌ File preparation error:', fileError);
          showToast('Gagal menyiapkan file', 'error');
        }
      } else {
        console.log('ℹ️ No file to upload');
      }

      // 4. Debug FormData content
      console.log('📋 FormData content prepared');

      // 5. Kirim request dengan fetch langsung untuk FormData
      console.log('🚀 Sending request to:', `${getBaseUrl()}/alat-berat`);
      
      const response = await fetch(`${getBaseUrl()}/alat-berat`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          // Jangan set Content-Type, biarkan browser handle
        },
        body: formData,
      });

      console.log('📥 Response status:', response.status);
      
      // Get response text untuk debugging
      const responseText = await response.text();
      console.log('📥 Raw response text (first 500 chars):', responseText.substring(0, 500));
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ Parsed response:', data);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('❌ Full raw response:', responseText);
        showToast('Invalid response from server', 'error');
        return;
      }
      
      if (response.ok && data.success) {
        console.log('✅ Save successful:', data);
        await fetchAlatBerat();
        showToast('Data alat berat berhasil ditambahkan! 🎉', 'success');
        setModalVisible(false);
        resetForm();
      } else {
        console.error('❌ Save failed:', data);
        const errorMsg = data.message || data.error || 'Gagal menyimpan data';
        showToast(errorMsg, 'error');
      }
      
    } catch (error: any) {
      console.error('❌ Network error:', error);
      
      let errorMessage = 'Gagal menambahkan data alat berat';
      
      if (error.message?.includes('Network request failed')) {
        errorMessage = 'Tidak bisa terhubung ke server. Pastikan server berjalan.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Request timeout. Coba lagi.';
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ FIXED: handleUpdate Function
  const handleUpdate = async () => {
    if (!validateForm() || !selectedAlatBerat) return;

    try {
      setIsUploading(true);
      console.log('🔄 Starting update for ID:', selectedAlatBerat.id);

      const formData = new FormData();
      formData.append('nama_alat', nama_alat.trim());
      formData.append('jenis', jenis.trim());
      formData.append('kapasitas', kapasitas.trim());
      formData.append('deskripsi', deskripsi.trim());
      formData.append('harga_sewa_per_hari', harga_sewa_per_hari);
      formData.append('status', status);
      formData.append('_method', 'PUT'); // Untuk Laravel update

      // Tambahkan file jika ada yang baru
      if (previewUri && previewUri.startsWith('file://')) {
        console.log('📁 New file detected for update');
        
        const filename = previewUri.split('/').pop() || `alat_${Date.now()}.jpg`;
        const file = {
          uri: previewUri,
          type: 'image/jpeg',
          name: filename,
        };
        
        formData.append('foto', file as any);
        console.log('✅ New file attached for update');
      } else {
        console.log('ℹ️ No new file, keeping existing one');
      }

      console.log('📤 Updating item ID:', selectedAlatBerat.id);

      // Gunakan POST dengan _method=PUT untuk update
      const response = await fetch(`${getBaseUrl()}/alat-berat/${selectedAlatBerat.id}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      console.log('📥 Update response status:', response.status);
      
      const responseText = await response.text();
      console.log('📥 Update raw response:', responseText.substring(0, 500));
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ Update parsed response:', data);
      } catch (parseError) {
        console.error('❌ Update JSON parse error:', parseError);
        showToast('Invalid response from server', 'error');
        return;
      }

      if (response.ok && data.success) {
        console.log('✅ Update successful:', data);
        await fetchAlatBerat();
        showToast('Data alat berat berhasil diupdate! ✅', 'success');
        setModalVisible(false);
        resetForm();
      } else {
        console.error('❌ Update failed:', data);
        const errorMsg = data.message || data.error || 'Gagal mengupdate data';
        showToast(errorMsg, 'error');
      }

    } catch (error: any) {
      console.error('❌ Update error:', error);
      
      let errorMessage = 'Gagal mengupdate data alat berat';
      
      if (error.message?.includes('Network request failed')) {
        errorMessage = 'Tidak bisa terhubung ke server.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Request timeout. Coba lagi.';
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    console.log('🔄 Resetting form...');
    setNamaAlat('');
    setJenis('Excavator');
    setKapasitas('');
    setDeskripsi('');
    setHargaSewa('');
    setStatus('Tersedia');
    setImageBase64('');
    setPreviewUri(null);
    setError(null);
    setIsUploading(false);
  };

  // Handle edit
  const handleEdit = (item: AlatBerat) => {
    console.log('✏️ Editing item:', item);

    setSelectedAlatBerat(item);
    setIsAddMode(false);
    setNamaAlat(item.nama_alat);
    setJenis(item.jenis);
    setKapasitas(item.kapasitas);
    setDeskripsi(item.deskripsi);
    setHargaSewa(String(item.harga_sewa_per_hari));
    setStatus(item.status);
    setImageBase64('');
    setPreviewUri(null);
    setModalVisible(true);
  };

  // Handle add
  const handleAdd = () => {
    setSelectedAlatBerat(null);
    setIsAddMode(true);
    resetForm();
    setModalVisible(true);
  };

  // Handle delete
  const handleDelete = (item: AlatBerat) => {
    setSelectedAlatBerat(item);
    setDeleteModalVisible(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async (confirmed: boolean) => {
    if (confirmed && selectedAlatBerat) {
      try {
        console.log('🗑️ Deleting item ID:', selectedAlatBerat.id);
        await api.delete(`/alat-berat/${selectedAlatBerat.id}`);
        
        // Update local state
        setAlatBeratList(prev => prev.filter(item => item.id !== selectedAlatBerat.id));
        
        showToast('Data alat berat berhasil dihapus! 🗑️', 'success');
        
        // Close modal jika sedang edit
        if (!isAddMode) {
          setModalVisible(false);
        }
      } catch (error: any) {
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

  // Close modal
  const handleCloseModal = () => {
    setModalVisible(false);
    setShowStatusDropdown(false);
    setShowJenisDropdown(false);
    resetForm();
  };

  // Select status
  const selectStatus = (selectedStatus: string) => {
    setStatus(selectedStatus);
    setShowStatusDropdown(false);
  };

  // Select jenis
  const selectJenis = (selectedJenis: string) => {
    setJenis(selectedJenis);
    setShowJenisDropdown(false);
  };

  // Handle refresh
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
      console.log('🔍 Searching for:', query);
      const response = await api.get(`/alat-berat/search?q=${encodeURIComponent(query)}`);
      const data = response.data;

      let dataArray = [];
      if (data.success && Array.isArray(data.data)) {
        dataArray = data.data;
      } else if (Array.isArray(data)) {
        dataArray = data;
      }

      const transformedData: AlatBerat[] = dataArray.map((item: any) => {
        let fotoUrl = 'https://via.placeholder.com/400x300?text=No+Image';

        if (item.foto_url) {
          fotoUrl = item.foto_url;
        } else if (item.foto) {
          if (item.foto.startsWith('storage/')) {
            const baseUrl = getBaseUrl();
            const baseWithoutApi = baseUrl.replace('/api', '');
            fotoUrl = `${baseWithoutApi}/${item.foto}`;
          } else if (item.foto.startsWith('alat-berat/')) {
            const baseUrl = getBaseUrl();
            const baseWithoutApi = baseUrl.replace('/api', '');
            fotoUrl = `${baseWithoutApi}/storage/${item.foto}`;
          } else if (item.foto.startsWith('http')) {
            fotoUrl = item.foto;
          }
        }

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

      setAlatBeratList(transformedData);
    } catch (error: any) {
      console.error('❌ Error searching alat berat:', error);
      showToast('Gagal melakukan pencarian', 'error');
      fetchAlatBerat();
    } finally {
      setIsLoading(false);
    }
  };

  // Filter by status
  const filterByStatus = async (statusFilter: string) => {
    setIsLoading(true);

    try {
      console.log('🔍 Filtering by status:', statusFilter);
      const response = await api.get(`/alat-berat/status/${encodeURIComponent(statusFilter)}`);
      const data = response.data;

      let dataArray = [];
      if (data.success && Array.isArray(data.data)) {
        dataArray = data.data;
      } else if (Array.isArray(data)) {
        dataArray = data;
      }

      const transformedData: AlatBerat[] = dataArray.map((item: any) => {
        let fotoUrl = 'https://via.placeholder.com/400x300?text=No+Image';

        if (item.foto_url) {
          fotoUrl = item.foto_url;
        } else if (item.foto) {
          if (item.foto.startsWith('storage/')) {
            const baseUrl = getBaseUrl();
            const baseWithoutApi = baseUrl.replace('/api', '');
            fotoUrl = `${baseWithoutApi}/${item.foto}`;
          } else if (item.foto.startsWith('alat-berat/')) {
            const baseUrl = getBaseUrl();
            const baseWithoutApi = baseUrl.replace('/api', '');
            fotoUrl = `${baseWithoutApi}/storage/${item.foto}`;
          } else if (item.foto.startsWith('http')) {
            fotoUrl = item.foto;
          }
        }

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

      setAlatBeratList(transformedData);
    } catch (error: any) {
      console.error('❌ Error filtering by status:', error);
      showToast('Gagal memfilter data', 'error');
      fetchAlatBerat();
    } finally {
      setIsLoading(false);
    }
  };

  // Get current date
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

  // Format Rupiah
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number).replace('Rp', 'RP.');
  };

  // UseEffect untuk fetch data
  useEffect(() => {
    fetchAlatBerat();
  }, []);

  // UseEffect untuk search
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

  const currentDate = getCurrentDate();
  const filteredAlatBerat = alatBeratList.filter(item =>
    item.nama_alat.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.jenis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <SideBar />
        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          onHide={() => setToastVisible(false)}
        />
        <View style={styles.mainContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.pageTitle}>Kelola Alat Berat</Text>
              <Text style={styles.pageSubtitle}>Manajemen data alat berat sewa</Text>
            </View>
            <View style={styles.dateTimeContainer}>
              <Text style={styles.dateText}>{currentDate.full}</Text>
              <Text style={styles.timeText}>{currentDate.time}</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                <RefreshCw color="#FFFFFF" size={16} />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search and Add Row */}
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
              <Plus color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </View>

          {/* Filter Buttons */}
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
                onPress={() => fetchAlatBerat()}
              >
                <Text style={styles.filterButtonText}>Semua</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Debug Info */}
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>
              Total Data: {alatBeratList.length} item | 
              API: {getBaseUrl()} | 
              {error && ` Error: ${error}`}
            </Text>
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={testApiConnection}
            >
              <Text style={styles.debugButtonText}>Test API</Text>
            </TouchableOpacity>
          </View>

          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F59E0B" />
              <Text style={styles.loadingText}>Memuat data alat berat...</Text>
            </View>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <View style={styles.errorContainer}>
              <AlertCircle color="#DC2626" size={32} />
              <Text style={styles.errorText}>Error: {error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => fetchAlatBerat()}>
                <RefreshCw color="#FFFFFF" size={16} />
                <Text style={styles.retryButtonText}>Coba Lagi</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Data List */}
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
                  <TouchableOpacity style={styles.emptyStateButton} onPress={handleAdd}>
                    <Plus color="#FFFFFF" size={16} />
                    <Text style={styles.emptyStateButtonText}>Tambah Alat Berat</Text>
                  </TouchableOpacity>
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

                      {/* Image */}
                      <Image
                        source={{ 
                          uri: item.foto,
                          cache: 'force-cache'
                        }}
                        style={styles.cardImage}
                        resizeMode="cover"
                        onError={(e) => {
                          console.log('❌ Image load error untuk:', item.nama_alat);
                        }}
                        onLoad={() => {
                          console.log('✅ Image loaded:', item.nama_alat);
                        }}
                      />

                      {/* Card Content */}
                      <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>{item.nama_alat}</Text>
                        <Text style={styles.cardDescription} numberOfLines={2}>
                          {item.deskripsi}
                        </Text>
                        
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
              {/* Modal Header */}
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

              {/* Modal Body */}
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                  {/* Row 1: Nama Alat & Jenis */}
                  <View style={styles.formRow}>
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Nama Alat *</Text>
                      <TextInput
                        style={styles.input}
                        value={nama_alat}
                        onChangeText={setNamaAlat}
                        placeholder="Excavator Volvo"
                        placeholderTextColor="#999"
                        editable={!isUploading}
                      />
                    </View>
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Jenis *</Text>
                      <TouchableOpacity
                        style={styles.selectInput}
                        onPress={() => setShowJenisDropdown(true)}
                        disabled={isUploading}
                      >
                        <Text style={styles.selectText}>{jenis}</Text>
                        <Text style={styles.selectArrow}>▼</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Row 2: Kapasitas & Harga */}
                  <View style={styles.formRow}>
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Kapasitas *</Text>
                      <TextInput
                        style={styles.input}
                        value={kapasitas}
                        onChangeText={setKapasitas}
                        placeholder="2.5 Ton"
                        placeholderTextColor="#999"
                        editable={!isUploading}
                      />
                    </View>
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Harga Sewa (RP) *</Text>
                      <TextInput
                        style={styles.input}
                        value={harga_sewa_per_hari}
                        onChangeText={setHargaSewa}
                        placeholder="800.000"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        editable={!isUploading}
                      />
                    </View>
                  </View>

                  {/* Row 3: Status & Foto */}
                  <View style={styles.formRow}>
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Status *</Text>
                      <TouchableOpacity
                        style={styles.selectInput}
                        onPress={() => setShowStatusDropdown(true)}
                        disabled={isUploading}
                      >
                        <Text style={styles.selectText}>{status}</Text>
                        <Text style={styles.selectArrow}>▼</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Foto {isAddMode ? '*' : '(Opsional)'}</Text>
                      <TouchableOpacity
                        style={[
                          styles.fotoInputContainer,
                          isUploading && styles.uploadingContainer
                        ]}
                        onPress={pickImage}
                        disabled={isUploading}
                      >
                        {previewUri ? (
                          <>
                            <Image
                              source={{ uri: previewUri }}
                              style={styles.previewImage}
                              resizeMode="cover"
                            />
                            {isUploading && (
                              <View style={styles.uploadingOverlay}>
                                <ActivityIndicator color="#FFFFFF" />
                                <Text style={styles.uploadingText}>Menyimpan...</Text>
                              </View>
                            )}
                          </>
                        ) : (
                          <View style={styles.placeholderContainer}>
                            <Camera color="#F59E0B" size={24} />
                            <Text style={styles.placeholderText}>
                              {isAddMode ? 'Pilih Foto' : 'Pilih Foto Baru (Opsional)'}
                            </Text>
                            {!isAddMode && (
                              <Text style={[styles.placeholderText, { fontSize: 10, marginTop: 5 }]}>
                                Foto lama akan dipertahankan
                              </Text>
                            )}
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Row 4: Deskripsi */}
                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 2 }]}>
                      <Text style={styles.label}>Deskripsi *</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        value={deskripsi}
                        onChangeText={setDeskripsi}
                        placeholder="Deskripsi alat berat..."
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={4}
                        editable={!isUploading}
                      />
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                {isAddMode ? (
                  <TouchableOpacity
                    style={[styles.saveButton, isUploading && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.saveButtonText}>Simpan</Text>
                        <Plus color="#FFFFFF" size={18} />
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.updateButton, isUploading && styles.buttonDisabled]}
                      onPress={handleUpdate}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <>
                          <Text style={styles.updateButtonText}>Update</Text>
                          <Edit2 color="#FFFFFF" size={18} />
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.clearButton, isUploading && styles.buttonDisabled]}
                      onPress={() => handleDelete(selectedAlatBerat!)}
                      disabled={isUploading}
                    >
                      <Text style={styles.clearButtonText}>Hapus</Text>
                      <Trash2 color="#FFFFFF" size={18} />
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
              <Text style={styles.confirmSubtitle}>
                Data yang sudah dihapus tidak dapat dikembalikan
              </Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={styles.confirmNoButton}
                  onPress={() => handleConfirmDelete(false)}
                >
                  <Text style={styles.confirmNoButtonText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmYesButton}
                  onPress={() => handleConfirmDelete(true)}
                >
                  <Text style={styles.confirmYesButtonText}>Hapus</Text>
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
  // Container
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
  },
  mainContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingTop: 10,
  },
  pageTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 28,
    color: '#111827',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  dateTimeContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#F59E0B',
    marginBottom: 2,
  },
  timeText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  refreshButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },

  // Search and Add
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Filter
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  filterLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#374151',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  filterButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },

  // Debug
  debugContainer: {
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  debugText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 6,
  },
  debugButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#6B7280',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  debugButtonText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#FFFFFF',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },

  // Error
  errorContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    marginVertical: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  retryButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Scroll Container
  scrollContainer: {
    flex: 1,
  },

  // Empty State
  emptyState: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  emptyStateButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Card Grid
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 20,
  },

  // Card
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    fontSize: 10,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  cardImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 8,
  },
  cardDescription: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  priceLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  priceValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#F59E0B',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editIconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  deleteIconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 800,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: '#111827',
    flex: 1,
    marginLeft: 12,
    textAlign: 'center',
  },
  modalDateContainer: {
    alignItems: 'flex-end',
  },
  modalDateText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#6B7280',
  },
  modalTimeText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#374151',
  },
  modalBody: {
    padding: 24,
    maxHeight: 600,
  },

  // Form
  formContainer: {
    gap: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
  },
  formGroup: {
    flex: 1,
  },
  label: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  selectInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#111827',
  },
  selectArrow: {
    fontSize: 10,
    color: '#6B7280',
  },
  fotoInputContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderStyle: 'dashed',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  placeholderText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'center',
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  uploadingText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    marginTop: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  updateButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  clearButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Dropdown
  dropdownOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  dropdownContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#374151',
  },

  // Confirm Modal
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  confirmIconContainer: {
    marginBottom: 16,
  },
  confirmIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dividerLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },
  confirmTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmYesButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmYesButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  confirmNoButton: {
    flex: 1,
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmNoButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Toast
  toastContainer: {
    position: 'absolute',
    top: 60,
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