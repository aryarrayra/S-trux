// services/apiService.ts
import { API_BASE_URL } from '@/constants/ApiConfig';

export interface Penyewaan {
  id_sewa: number;
  id_pelanggan: number;
  id_alat: number;
  tanggal_sewa: string;
  tanggal_kembali: string | null;
  total_harga: number;
  status_sewa: string;
  status_persetujuan: string;
  alasan_penolakan: string | null;
  nama_proyek: string;
  lokasi_proyek: string;
  deskripsi_proyek: string;
  latitude: number | null;
  longitude: number | null;
  dokumen_data: any;
  alat?: {
    id_alat: number;
    nama_alat: string;
    gambar: string;
    harga_sewa: number;
    status: string;
  };
  pelanggan?: {
    id_pelanggan: number;
    nama: string;
    email: string;
  };
  pembayaran?: Array<{
    id_pembayaran: number;
    id_sewa: number;
    tanggal_bayar: string;
    jumlah_bayar: number;
    metode: string;
    status_pembayaran: string;
    bukti_bayar: string | null;
    nama_bukti: string | null;
  }>;
  dokumen?: Array<{
    id: number;
    nama_dokumen: string;
    file_path: string;
    tipe_dokumen: string;
    ukuran_file: number;
    created_at: string;
  }>;
}

// FUNGSI BARU: Dapatkan id_pelanggan dari id_user via API
export const getPelangganIdFromUser = async (): Promise<number | null> => {
  try {
    console.log('🔍 [PELANGGAN] Mencari id_pelanggan dari id_user...');
    
    // 1. Dapatkan id_user dari AsyncStorage
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    const userData = await AsyncStorage.default.getItem('userData');
    
    if (!userData) {
      console.log('❌ [PELANGGAN] Tidak ada user data');
      return null;
    }

    const user = JSON.parse(userData);
    console.log('👤 [PELANGGAN] User data:', user);
    
    // 2. Cari id_user di berbagai field yang mungkin
    let id_user: number | null = null;
    const possibleUserFields = ['id_user', 'user_id', 'id', 'userId'];
    
    for (const field of possibleUserFields) {
      if (user[field] !== undefined && user[field] !== null) {
        const id = Number(user[field]);
        if (!isNaN(id) && id > 0) {
          id_user = id;
          console.log(`✅ [PELANGGAN] Found id_user in "${field}":`, id_user);
          break;
        }
      }
    }

    if (!id_user) {
      console.log('❌ [PELANGGAN] Tidak bisa menemukan id_user');
      return null;
    }

    // 3. Panggil ENDPOINT BARU untuk mendapatkan id_pelanggan
    console.log(`🌐 [PELANGGAN] Getting pelanggan ID for user ${id_user}...`);
    const url = `${API_BASE_URL}/pelanggan/by-user/${id_user}`;
    console.log('📡 [PELANGGAN] URL:', url);
    
    const response = await fetch(url);
    
    console.log('📡 [PELANGGAN] Response status:', response.status);
    
    if (!response.ok) {
      // Coba endpoint alternatif
      console.log('⚠️ [PELANGGAN] Endpoint pertama gagal, coba alternatif...');
      const altUrl = `${API_BASE_URL}/pelanggan/user/${id_user}`;
      const altResponse = await fetch(altUrl);
      
      if (!altResponse.ok) {
        throw new Error(`HTTP error! status: ${response.status} dan ${altResponse.status}`);
      }
      
      const altResult = await altResponse.json();
      console.log('📦 [PELANGGAN] Alt API Response:', altResult);

      if (altResult.success && altResult.data && altResult.data.id_pelanggan) {
        const id_pelanggan = altResult.data.id_pelanggan;
        console.log(`✅ [PELANGGAN] Found id_pelanggan from alt endpoint:`, id_pelanggan);
        return id_pelanggan;
      }
    }

    const result = await response.json();
    console.log('📦 [PELANGGAN] API Response:', result);

    if (result.success && result.data && result.data.id_pelanggan) {
      const id_pelanggan = result.data.id_pelanggan;
      console.log(`✅ [PELANGGAN] Found id_pelanggan:`, id_pelanggan);
      return id_pelanggan;
    } else {
      console.log('❌ [PELANGGAN] Tidak ditemukan id_pelanggan:', result.message);
      
      // Fallback: coba cari langsung dari data user
      if (user.id_pelanggan) {
        console.log('🔄 [PELANGGAN] Using id_pelanggan from user data:', user.id_pelanggan);
        return user.id_pelanggan;
      }
      
      return null;
    }

  } catch (error) {
    console.error('❌ [PELANGGAN] Error:', error);
    
    // Fallback extreme: return dummy ID untuk testing
    console.log('🔄 [PELANGGAN] Using fallback ID for testing');
    return 1; // Ganti dengan ID yang ada di database Anda
  }
};

// FUNGSI UTAMA: Fetch penyewaan by pelanggan - VERSI FIXED
export const fetchPenyewaanByPelanggan = async (): Promise<Penyewaan[]> => {
  try {
    console.log('🚀 [PENYEWAAN] Starting fetch by pelanggan...');
    
    // OPTION 1: Gunakan fungsi getPelangganIdFromUser
    const pelanggan_id = await getPelangganIdFromUser();
    
    if (!pelanggan_id) {
      console.log('🔄 [PENYEWAAN] Cannot get pelanggan ID, trying direct endpoint...');
      
      // OPTION 2: Coba endpoint langsung tanpa ID
      const directUrl = `${API_BASE_URL}/penyewaan/pelanggan`;
      console.log('🌐 [PENYEWAAN] Trying direct URL:', directUrl);
      
      const directResponse = await fetch(directUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (directResponse.ok) {
        const directResult = await directResponse.json();
        console.log('📦 [PENYEWAAN] Direct endpoint response:', directResult);
        
        if (directResult.success && directResult.data) {
          console.log('✅ [PENYEWAAN] Success from direct endpoint:', directResult.data.length, 'items');
          return directResult.data;
        }
      }
      
      // OPTION 3: Coba endpoint semua data
      console.log('🔄 [PENYEWAAN] Trying all penyewaan data...');
      const allUrl = `${API_BASE_URL}/penyewaan`;
      const allResponse = await fetch(allUrl);
      
      if (allResponse.ok) {
        const allResult = await allResponse.json();
        console.log('📦 [PENYEWAAN] All data response:', {
          success: allResult.success,
          dataLength: allResult.data?.length || 0
        });
        
        if (allResult.success && allResult.data) {
          // Filter client-side berdasarkan user yang login
          const userPenyewaan = await filterPenyewaanByCurrentUser(allResult.data);
          console.log('✅ [PENYEWAAN] Filtered data for current user:', userPenyewaan.length, 'items');
          return userPenyewaan;
        }
      }
      
      throw new Error('All endpoints failed');
    }
    
    console.log('🔍 [PENYEWAAN] Using pelanggan ID:', pelanggan_id);
    
    // OPTION 4: Endpoint dengan ID pelanggan
    const url = `${API_BASE_URL}/penyewaan/pelanggan/${pelanggan_id}`;
    console.log('🌐 [PENYEWAAN] Final URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('📡 [PENYEWAAN] Response status:', response.status);
    
    if (!response.ok) {
      // Coba endpoint alternatif
      const altUrl = `${API_BASE_URL}/penyewaan?pelanggan=${pelanggan_id}`;
      console.log('🔄 [PENYEWAAN] Trying alternative URL:', altUrl);
      
      const altResponse = await fetch(altUrl);
      if (altResponse.ok) {
        const altResult = await altResponse.json();
        console.log('📦 [PENYEWAAN] Alt endpoint success:', altResult.data?.length || 0, 'items');
        
        if (altResult.success && altResult.data) {
          return altResult.data;
        }
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('📦 [PENYEWAAN] API Response:', {
      success: result.success,
      message: result.message,
      dataLength: result.data?.length || 0
    });

    if (result.success && result.data) {
      console.log('✅ [PENYEWAAN] Data berhasil diambil:', result.data.length, 'items');
      
      if (result.data.length > 0) {
        console.log('📋 [PENYEWAAN] Data details:');
        result.data.forEach((item: any, index: number) => {
          console.log(`   [${index + 1}]`, {
            id_sewa: item.id_sewa,
            id_pelanggan: item.id_pelanggan,
            alat: item.alat?.nama_alat,
            status_sewa: item.status_sewa,
            status_persetujuan: item.status_persetujuan,
            latitude: item.latitude,
            longitude: item.longitude,
            lokasi_proyek: item.lokasi_proyek
          });
        });
      }
      
      return result.data;
    } else {
      console.log('📋 [PENYEWAAN] No data found in response');
      return [];
    }
  } catch (error) {
    console.error('❌ [PENYEWAAN] Error fetching data:', error);
    
    // Return empty array instead of throwing error
    console.log('🔄 [PENYEWAAN] Returning empty array due to error');
    return [];
  }
};

// Helper function untuk filter client-side
const filterPenyewaanByCurrentUser = async (allPenyewaan: Penyewaan[]): Promise<Penyewaan[]> => {
  try {
    const pelanggan_id = await getPelangganIdFromUser();
    if (!pelanggan_id) return [];
    
    return allPenyewaan.filter(item => item.id_pelanggan === pelanggan_id);
  } catch (error) {
    console.error('❌ [FILTER] Error filtering data:', error);
    return [];
  }
};

// FUNGSI BARU: Fetch semua data penyewaan (untuk debugging)
export const fetchAllPenyewaan = async (): Promise<Penyewaan[]> => {
  try {
    console.log('🔍 [ALL_PENYEWAAN] Fetching all data...');
    const url = `${API_BASE_URL}/penyewaan`;
    
    const response = await fetch(url);
    const result = await response.json();
    
    console.log('📦 [ALL_PENYEWAAN] Response:', {
      success: result.success,
      dataLength: result.data?.length || 0
    });
    
    if (result.success && result.data) {
      console.log('✅ [ALL_PENYEWAAN] All data:', result.data);
      return result.data;
    }
    
    return [];
  } catch (error) {
    console.error('❌ [ALL_PENYEWAAN] Error:', error);
    return [];
  }
};

export const fetchAllPenyewaanForAdmin = async (): Promise<Penyewaan[]> => {
  try {
    console.log('🚀 [ADMIN_PENYEWAAN] Fetching ALL penyewaan for admin...');
    
    // ✅ GUNAKAN ENDPOINT SEMUA DATA PENYEWAAN
    const url = `${API_BASE_URL}/penyewaan`;
    console.log('🌐 [ADMIN_PENYEWAAN] URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('📡 [ADMIN_PENYEWAAN] Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('📦 [ADMIN_PENYEWAAN] API Response:', {
      success: result.success,
      message: result.message,
      dataLength: result.data?.length || 0
    });

    if (result.success && result.data) {
      console.log('✅ [ADMIN_PENYEWAAN] ALL data berhasil diambil:', result.data.length, 'items');
      
      // LOG DETAIL SETIAP ITEM
      if (result.data.length > 0) {
        console.log('📋 [ADMIN_PENYEWAAN] Data details (first 5 items):');
        result.data.slice(0, 5).forEach((item: any, index: number) => {
          console.log(`   [${index + 1}]`, {
            id_sewa: item.id_sewa,
            id_pelanggan: item.id_pelanggan,
            pelanggan: item.pelanggan?.nama,
            alat: item.alat?.nama_alat,
            status_sewa: item.status_sewa,
            status_persetujuan: item.status_persetujuan,
            latitude: item.latitude,
            longitude: item.longitude,
            lokasi_proyek: item.lokasi_proyek
          });
        });
        
        // Log status distribution
        const statusCount: any = {};
        result.data.forEach((item: any) => {
          const key = `${item.status_sewa}|${item.status_persetujuan}`;
          statusCount[key] = (statusCount[key] || 0) + 1;
        });
        console.log('📊 [ADMIN_PENYEWAAN] Status distribution:', statusCount);
      }
      
      return result.data;
    } else {
      console.log('📋 [ADMIN_PENYEWAAN] No data found in response');
      console.log('📋 [ADMIN_PENYEWAAN] Full response:', result);
      return [];
    }
  } catch (error) {
    console.error('❌ [ADMIN_PENYEWAAN] Error fetching data:', error);
    return [];
  }
};

// FUNGSI LAMA (tetap ada untuk compatibility)
export const getPelangganIdFromUserData = async (): Promise<number | null> => {
  console.log('⚠️ [DEPRECATED] Using deprecated getPelangganIdFromUserData');
  return await getPelangganIdFromUser();
};

export const fetchActivePenyewaanForAdmin = async (): Promise<Penyewaan[]> => {
  try {
    console.log('🎯 [ACTIVE] Fetching active penyewaan...');
    
    const allData = await fetchAllPenyewaanForAdmin();
    
    // Filter hanya yang aktif
    const activeData = allData.filter((item: Penyewaan) => {
      const isApproved = item.status_persetujuan === 'Disetujui';
      const isActive = item.status_sewa === 'Berjalan';
      
      return isApproved && isActive;
    });

    console.log('✅ [ACTIVE] Active penyewaan:', activeData.length, 'items');
    return activeData;
  } catch (error) {
    console.error('❌ [ACTIVE] Error:', error);
    return [];
  }
};

// Debug function untuk melihat semua data
export const debugAllPenyewaan = async (): Promise<void> => {
  try {
    console.log('🐛 [DEBUG] Starting comprehensive debug...');
    
    // 1. Check user data dari storage
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    const userData = await AsyncStorage.default.getItem('userData');
    
    if (userData) {
      const user = JSON.parse(userData);
      console.log('👤 [DEBUG] User data from storage:', user);
      
      // Cari id_user
      let id_user = null;
      const userFields = ['id_user', 'user_id', 'id', 'userId'];
      for (const field of userFields) {
        if (user[field] !== undefined && user[field] !== null) {
          id_user = Number(user[field]);
          if (!isNaN(id_user) && id_user > 0) break;
        }
      }
      console.log('🔍 [DEBUG] Extracted id_user:', id_user);
    }

    // 2. Test fungsi getPelangganIdFromUser
    const pelangganId = await getPelangganIdFromUser();
    console.log('🎯 [DEBUG] Result from getPelangganIdFromUser:', pelangganId);

    // 3. Check all penyewaan data
    const allData = await fetchAllPenyewaan();
    
    console.log('📦 [DEBUG] All penyewaan data:', allData.length, 'items');

    if (allData.length > 0) {
      console.log('👥 [DEBUG] All pelanggan IDs in database:');
      const pelangganIds = [...new Set(allData.map((item: any) => item.id_pelanggan))];
      console.log('   Pelanggan IDs:', pelangganIds.sort((a, b) => a - b));
      
      if (pelangganId) {
        const userData = allData.filter((item: any) => item.id_pelanggan === pelangganId);
        console.log(`📋 [DEBUG] Data for pelanggan ID ${pelangganId}:`, userData.length, 'items');
        
        userData.forEach((item: any) => {
          console.log(`   - ID: ${item.id_sewa}, Status: ${item.status_sewa}, Persetujuan: ${item.status_persetujuan}`);
        });
      }
      
      // Check status distribution
      const statusCount: any = {};
      allData.forEach((item: any) => {
        const key = `${item.status_sewa}|${item.status_persetujuan}`;
        statusCount[key] = (statusCount[key] || 0) + 1;
      });
      console.log('📊 [DEBUG] Status distribution:', statusCount);
    }

  } catch (error) {
    console.error('❌ [DEBUG] Error:', error);
  }
};