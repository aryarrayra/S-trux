import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PenyewaanDetail {
  id_sewa: number;
  id_pelanggan: number;
  id_alat: number;
  tanggal_sewa: string;
  tanggal_kembali: string | null;
  total_harga: number;
  status_sewa: string;
  status_persetujuan: string;
  alasan_penolakan: string | null;
  nama_proyek: string | null;
  lokasi_proyek: string | null;
  deskripsi_proyek: string | null;
  latitude: number | null;
  longitude: number | null;
  dokumen_data: string | null;
  created_at: string;
  updated_at: string;
  alat?: {
    id_alat: number;
    nama_alat: string;
    gambar: string;
    harga_sewa: number;
    deskripsi: string;
  };
  pelanggan?: {
    id_pelanggan: number;
    nama: string;
    foto_profil?: string;
  };
  pembayaran?: Array<{
    id_pembayaran: number;
    jumlah: number;
    status_pembayaran: string;
    tanggal_pembayaran: string;
    metode_pembayaran: string;
  }>;
}

// ============================================================================
// API SERVICE
// ============================================================================

class ApiService {
  private baseUrl: string = 'https://strux-api.loca.lt/api';

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getPenyewaanDetail(idSewa: number): Promise<PenyewaanDetail> {
    try {
      console.log(`🔍 Fetching detail for penyewaan ID: ${idSewa}`);
      const response = await fetch(`${this.baseUrl}/penyewaan/${idSewa}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const result = await this.handleResponse(response);
      
      if (result.data) {
        return result.data;
      } else if (result.id_sewa) {
        return result;
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('❌ Error fetching penyewaan detail:', error);
      throw error;
    }
  }
}

const apiService = new ApiService();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return 'Tanggal tidak valid';
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const calculateRentalDays = (startDate: string, endDate: string): number => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    return 0;
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Disetujui':
      return '#10B981';
    case 'Ditolak':
      return '#EF4444';
    case 'Menunggu':
      return '#F59E0B';
    case 'Berjalan':
      return '#3B82F6';
    case 'Selesai':
      return '#10B981';
    case 'Dibatalkan':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

const getStatusText = (status: string): string => {
  switch (status) {
    case 'Disetujui':
      return 'Disetujui';
    case 'Ditolak':
      return 'Ditolak';
    case 'Menunggu':
      return 'Menunggu Persetujuan';
    case 'Berjalan':
      return 'Sedang Berjalan';
    case 'Selesai':
      return 'Selesai';
    case 'Dibatalkan':
      return 'Dibatalkan';
    default:
      return status;
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HistoryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PenyewaanDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const idSewa = params.id_sewa ? parseInt(params.id_sewa as string) : null;

  const fetchDetailData = async () => {
    if (!idSewa) {
      setError('ID penyewaan tidak valid');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching detail data...');
      const detailData = await apiService.getPenyewaanDetail(idSewa);
      console.log('✅ Detail data received:', detailData);
      
      setData(detailData);
    } catch (err: any) {
      console.error('❌ Error fetching detail:', err);
      setError(err.message || 'Gagal memuat data detail');
      
      // Fallback ke data dari params jika API gagal
      if (params.itemName) {
        setData({
          id_sewa: idSewa,
          id_pelanggan: 0,
          id_alat: 0,
          tanggal_sewa: new Date().toISOString(),
          tanggal_kembali: new Date().toISOString(),
          total_harga: params.itemPrice ? parseInt(params.itemPrice as string) : 0,
          status_sewa: params.status as string || 'Menunggu',
          status_persetujuan: params.status_persetujuan as string || 'Menunggu',
          alasan_penolakan: params.alasan_penolakan as string || null,
          nama_proyek: params.projectName as string || null,
          lokasi_proyek: null,
          deskripsi_proyek: null,
          latitude: null,
          longitude: null,
          dokumen_data: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          alat: {
            id_alat: 0,
            nama_alat: params.itemName as string || 'Alat Berat',
            gambar: params.itemImage as string || 'https://via.placeholder.com/300',
            harga_sewa: 0,
            deskripsi: ''
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetailData();
  }, [idSewa]);

  const handleRetry = () => {
    fetchDetailData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={styles.loadingText}>Memuat detail penyewaan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Gagal Memuat Data</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={64} color="#6B7280" />
          <Text style={styles.errorTitle}>Data Tidak Ditemukan</Text>
          <Text style={styles.errorMessage}>Detail penyewaan tidak dapat ditemukan</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Kembali ke Riwayat</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const rentalDays = calculateRentalDays(data.tanggal_sewa, data.tanggal_kembali || data.tanggal_sewa);
  const dailyPrice = data.alat?.harga_sewa || data.total_harga / (rentalDays || 1);

  const terms = [
    'Penyewa wajib menggunakan alat berat sesuai dengan spesifikasi dan tuntunannya',
    'Penyewa dilarang mengubah struktur atau melakukan modifikasi pada alat berat',
    'Alat berat harus dikembalikan dalam kondisi yang sama seperti saat diterima',
    'Pembayaran dilakukan sesuai dengan ketentuan yang telah disepakati',
    'Penyewa bertanggung jawab atas keselamatan operator dan pekerja',
    'Penyewa wajib melakukan maintenance rutin sesuai jadwal operasi',
    'Biaya bahan bakar dan pelumas ditanggung oleh penyewa selama masa sewa'
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#F59E0B" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Detail Penyewaan</Text>
          <Text style={styles.headerSubtitle}>
            Status: <Text style={{ color: getStatusColor(data.status_persetujuan) }}>
              {getStatusText(data.status_persetujuan)}
            </Text>
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Contract Card */}
        <View style={styles.contractCard}>
          <Ionicons name="document-text-outline" size={56} color="#FFFFFF" />
          <Text style={styles.contractTitle}>Kontrak Penyewaan</Text>
          <Text style={styles.contractSubtitle}>STS-{data.id_sewa}</Text>
        </View>

        {/* Equipment Info */}
        <View style={styles.equipmentCard}>
          <Image
            source={{ uri: data.alat?.gambar || 'https://via.placeholder.com/300' }}
            style={styles.equipmentImage}
          />
          <View style={styles.equipmentInfo}>
            <Text style={styles.equipmentName}>{data.alat?.nama_alat || 'Alat Berat'}</Text>
            <Text style={styles.equipmentPrice}>{formatCurrency(dailyPrice)}/hari</Text>
            {data.alat?.deskripsi && (
              <Text style={styles.equipmentDescription} numberOfLines={2}>
                {data.alat.desktipsi}
              </Text>
            )}
          </View>
        </View>

        {/* Project Info */}
        {data.nama_proyek && (
          <View style={styles.projectCard}>
            <Ionicons name="business-outline" size={20} color="#F59E0B" />
            <View style={styles.projectInfo}>
              <Text style={styles.projectTitle}>Proyek</Text>
              <Text style={styles.projectName}>{data.nama_proyek}</Text>
              {data.lokasi_proyek && (
                <Text style={styles.projectLocation}>{data.lokasi_proyek}</Text>
              )}
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Ringkasan Pesanan</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tanggal Mulai</Text>
            <Text style={styles.summaryValue}>{formatDate(data.tanggal_sewa)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tanggal Selesai</Text>
            <Text style={styles.summaryValue}>
              {data.tanggal_kembali ? formatDate(data.tanggal_kembali) : 'Belum ditentukan'}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Durasi Sewa</Text>
            <Text style={styles.summaryValue}>{rentalDays} Hari</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Harga Sewa per hari</Text>
            <Text style={styles.summaryValue}>{formatCurrency(dailyPrice)}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Biaya</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.total_harga)}</Text>
          </View>
        </View>

        {/* Rejection Reason */}
        {data.status_persetujuan === 'Ditolak' && data.alasan_penolakan && (
          <View style={styles.rejectionCard}>
            <Ionicons name="warning-outline" size={20} color="#EF4444" />
            <View style={styles.rejectionInfo}>
              <Text style={styles.rejectionTitle}>Alasan Penolakan</Text>
              <Text style={styles.rejectionMessage}>{data.alasan_penolakan}</Text>
            </View>
          </View>
        )}

        {/* Terms and Conditions */}
        <View style={styles.termsCard}>
          <Text style={styles.termsTitle}>Syarat dan Ketentuan</Text>
          
          <View style={styles.termsList}>
            <Text style={styles.termsSubtitle}>Ketentuan Sewa</Text>
            {terms.map((term, index) => (
              <View key={index} style={styles.termItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.termText}>{term}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Informasi Tambahan</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID Transaksi</Text>
            <Text style={styles.infoValue}>STS-{data.id_sewa}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal Pengajuan</Text>
            <Text style={styles.infoValue}>{formatDate(data.created_at)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status Sewa</Text>
            <Text style={[styles.infoValue, { color: getStatusColor(data.status_sewa) }]}>
              {getStatusText(data.status_sewa)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  contractCard: {
    backgroundColor: '#FCD34D',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
  },
  contractSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  equipmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  equipmentImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  equipmentPrice: {
    fontSize: 12,
    color: '#F59E0B',
    marginBottom: 4,
  },
  equipmentDescription: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 14,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  projectInfo: {
    flex: 1,
    marginLeft: 12,
  },
  projectTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  projectLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  rejectionCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  rejectionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  rejectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 4,
  },
  rejectionMessage: {
    fontSize: 13,
    color: '#B91C1C',
    lineHeight: 18,
  },
  termsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  termsList: {
    gap: 12,
  },
  termsSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#111827',
    marginRight: 8,
    marginTop: 2,
  },
  termText: {
    flex: 1,
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  backButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
});