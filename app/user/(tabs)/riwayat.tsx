import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { History, Star, Database, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Penyewaan, 
  fetchPenyewaanByPelanggan,
  debugAllPenyewaan,
  getPelangganIdFromUserData,
  getPelangganIdFromUser
} from '@/services/apiService';

const COLORS = {
  background: '#F4F4F4',
  white: '#FFFFFF',
  black: '#000000',
  primary: '#F39F29',
  primaryGradientEnd: '#FDCB41',
  historyActive: '#4CAF50',
  historyCompleted: '#2196F3',
  historyCancelled: '#F44336',
  completedButtonBg: '#E3F2FD',
  cancelledButtonBg: '#FFEBEE',
  buttonYellow: '#FDCB41',
  buttonYellowText: '#000000',
  filterBackground: '#E5E5E5',
  cardShadow: '#000000',
  inactive: '#978D8D',
  line: '#D9D9D9',
};

type HistoryStatus = 'Aktif' | 'Selesai' | 'Dibatalkan';

// Map status dari API ke UI History
const mapStatusToHistory = (statusPersetujuan: string, statusSewa: string): HistoryStatus => {
  if (statusPersetujuan === 'Ditolak') return 'Dibatalkan';
  if (statusPersetujuan === 'Disetujui' && statusSewa === 'Berjalan') return 'Aktif';
  if (statusPersetujuan === 'Disetujui' && statusSewa === 'Selesai') return 'Selesai';
  if (statusPersetujuan === 'Disetujui') return 'Aktif';
  if (statusPersetujuan === 'Menunggu') return 'Aktif';
  
  return 'Aktif';
};

const getStatusStyle = (status: HistoryStatus) => {
  switch (status) {
    case 'Aktif':
      return { backgroundColor: COLORS.historyActive };
    case 'Selesai':
      return { backgroundColor: COLORS.historyCompleted };
    case 'Dibatalkan':
      return { backgroundColor: COLORS.historyCancelled };
  }
};

const HistoryCard = ({ item }: { item: Penyewaan }) => {
  const router = useRouter();

  const historyStatus = mapStatusToHistory(item.status_persetujuan, item.status_sewa);
  
  const formatDateRange = () => {
    try {
      const startDate = new Date(item.tanggal_sewa).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      
      const endDate = item.tanggal_kembali 
        ? new Date(item.tanggal_kembali).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })
        : 'Belum ditentukan';
      
      return `${startDate} - ${endDate}`;
    } catch (error) {
      return 'Tanggal tidak valid';
    }
  };

  const calculateCostDetail = () => {
    try {
      const start = new Date(item.tanggal_sewa);
      const end = new Date(item.tanggal_kembali || item.tanggal_sewa);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      
      const dailyPrice = item.alat?.harga_sewa || item.total_harga || 0;
      return `${diffDays} hari x ${new Intl.NumberFormat('id-ID').format(dailyPrice)}`;
    } catch (error) {
      return 'Perhitungan biaya tidak tersedia';
    }
  };

  const handleDetailPress = () => {
    router.push({
      pathname: '/user/history',
      params: {
        id_sewa: item.id_sewa,
        transactionId: `STS-${item.id_sewa}`,
        itemName: item.alat?.nama_alat,
        itemImage: item.alat?.gambar,
        itemPrice: item.total_harga,
        projectName: item.nama_proyek,
        dateRange: formatDateRange(),
        status: historyStatus,
        status_persetujuan: item.status_persetujuan,
        alasan_penolakan: item.alasan_penolakan
      }
    });
  };

  const renderFooter = () => {
    switch (historyStatus) {
      case 'Aktif':
        return (
          <TouchableOpacity 
            style={styles.detailButton}
            onPress={handleDetailPress}
          >
            <Text style={styles.detailButtonText}>Lihat detail</Text>
          </TouchableOpacity>
        );
      case 'Selesai':
        return (
          <View style={styles.footerRow}>
            <View style={[styles.ratingContainer, { backgroundColor: COLORS.completedButtonBg }]}>
              <Star size={18} color={COLORS.buttonYellow} fill={COLORS.buttonYellow} />
              <Text style={styles.ratingText}>Pesanan Selesai</Text>
            </View>
            <TouchableOpacity onPress={handleDetailPress}>
              <Text style={styles.reviewText}>Lihat Detail</Text>
            </TouchableOpacity>
          </View>
        );
      case 'Dibatalkan':
        return (
          <View style={[styles.reasonContainer, { backgroundColor: COLORS.cancelledButtonBg }]}>
            <Text style={styles.reasonText}>
              {item.alasan_penolakan || 'Pesanan dibatalkan'}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, getStatusStyle(historyStatus)]}>
          <Text style={styles.statusText}>{historyStatus}</Text>
        </View>
        <Text style={styles.transactionId}>STS-{item.id_sewa}</Text>
      </View>
      <View style={styles.cardBody}>
        <Image 
          source={{ 
            uri: item.alat?.gambar || 'https://via.placeholder.com/75'
          }} 
          style={styles.cardImage} 
          defaultSource={{ uri: 'https://via.placeholder.com/75' }}
        />
        <View style={styles.cardDetails}>
          <Text style={styles.cardTitle}>{item.alat?.nama_alat || 'Alat Berat'}</Text>
          <Text style={styles.cardSubtitle}>{item.nama_proyek || 'Tidak disebutkan'}</Text>
          <Text style={styles.cardSubtitle}>{formatDateRange()}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.cardCostSection}>
        <Text style={styles.totalCostLabel}>Total biaya</Text>
        <Text style={styles.totalCostValue}>
          {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          }).format(item.total_harga || 0)}
        </Text>
        <Text style={styles.costDetail}>{calculateCostDetail()}</Text>
      </View>
      <View style={styles.divider} />
      {renderFooter()}
    </View>
  );
};

export default function HistoryScreen() {
  const [activeFilter, setActiveFilter] = useState('semua');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyData, setHistoryData] = useState<Penyewaan[]>([]);
  const [idPelanggan, setIdPelanggan] = useState<number | null>(null);
  const router = useRouter();

  const fetchHistoryData = async () => {
    try {
      console.log('🚀 [HISTORY] Starting to fetch history data...');
      setLoading(true);
      
      // ✅ GUNAKAN FUNGSI YANG SUDAH ADA - fetchPenyewaanByPelanggan
      const data = await fetchPenyewaanByPelanggan();
      
      // Untuk debug, dapatkan juga ID pelanggan
      const pelangganId = await getPelangganIdFromUser();
      console.log('🔍 [HISTORY] Pelanggan ID from API:', pelangganId);
      setIdPelanggan(pelangganId);

      if (!pelangganId) {
        Alert.alert('Error', 'Tidak dapat menentukan ID pelanggan. Silakan login ulang.');
        setHistoryData([]);
        return;
      }
      
      console.log('🎯 [HISTORY] Final result:', {
        pelangganId,
        totalItems: data.length,
        items: data.map(item => ({
          id: item.id_sewa,
          alat: item.alat?.nama_alat,
          status: item.status_sewa,
          persetujuan: item.status_persetujuan
        }))
      });
      
      setHistoryData(data);
      
    } catch (error) {
      console.error('❌ [HISTORY] Final error:', error);
      Alert.alert('Error', 'Gagal mengambil data riwayat: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistoryData();
  };

  // Debug function untuk melihat user data structure
  const runUserDataDebug = async () => {
    console.log('👤 [USER DEBUG] Checking user data structure...');
    
    try {
      const userData = await AsyncStorage.getItem('userData');
      console.log('📋 [DEBUG] Raw user data from storage:', userData);
      
      if (userData) {
        const user = JSON.parse(userData);
        console.log('📋 [DEBUG] Parsed user data:', user);
        console.log('🔍 [DEBUG] All fields in user data:');
        
        Object.keys(user).forEach(key => {
          console.log(`   "${key}":`, user[key], `(type: ${typeof user[key]})`);
        });
        
        // Coba extract ID pelanggan
        const pelangganId = await getPelangganIdFromUser();
        console.log('🎯 [DEBUG] Extracted pelanggan ID:', pelangganId);
      }
      
      await debugAllPenyewaan();
      
      Alert.alert(
        'User Data Debug', 
        `Pelanggan ID: ${idPelanggan}\nTotal Data: ${historyData.length}\nCheck console for details`
      );
    } catch (error) {
      console.error('❌ [DEBUG] Error:', error);
    }
  };

  useEffect(() => {
    fetchHistoryData();
  }, []);

  // Filter tambahan berdasarkan tab
  const filteredData = historyData.filter((item) => {
    const historyStatus = mapStatusToHistory(item.status_persetujuan, item.status_sewa);
    
    if (activeFilter === 'semua') return true;
    if (activeFilter === 'aktif') return historyStatus === 'Aktif';
    if (activeFilter === 'selesai') return historyStatus === 'Selesai' || historyStatus === 'Dibatalkan';
    return false;
  });

  console.log('📊 [UI] Rendering with data:', {
    idPelanggan,
    historyData: historyData.length,
    filteredData: filteredData.length,
    activeFilter,
    loading
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat riwayat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={{
              uri: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/33f0/c75a/47eabbba22aaa62621dea29c2361007f?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=C~CJj6a0StCy0Ead0mPL-37afjxjtLddDumGkAQbUiiHuyQnxzir20YVScZPsEq7Q2hjbmeCwnOf14o6Qw886~LeBgdAjlRb8Z~rvEZbGHBtaidb0Zu14IU0Q6adYpRLDpU~rnI55tQlku13uH6-fJ3qStNV9rkD5ZypQV~7qKZ7K3dOAGlGzyHWpy3VStskVffrkg5r8qX7BRJXGpEcls4KHnjhOToZd8I-azwef3TMuCyN9uij2xV2y3KlXmoix6wfAhOJHHYZKvqQ3RmBHPJiagXyen7VkHgEGFHHfzI~bYcJmMUp5dKiEg0RCDJ95VrPtDzJV9Jvt6RMn1kKag__',
            }}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>S`Trux</Text>
        </View>
        <TouchableOpacity onPress={runUserDataDebug} style={styles.debugHeaderButton}>
          <User size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <View>
          <Text style={styles.title}>Riwayat Saya</Text>
          <Text style={styles.subtitle}>
            {filteredData.length} total transaksi 
            {idPelanggan && ` (Pelanggan ID: ${idPelanggan})`}
          </Text>
        </View>
        <TouchableOpacity onPress={onRefresh}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryGradientEnd]}
            style={styles.historyButton}>
            <History size={20} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {(['semua', 'aktif', 'selesai'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterButton, activeFilter === filter && styles.activeFilterButton]}
            onPress={() => setActiveFilter(filter)}>
            <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
              {filter === 'selesai' ? 'Selesai' : 
               filter === 'aktif' ? 'Aktif' : 'Semua'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredData}
        renderItem={({ item }) => <HistoryCard item={item} />}
        keyExtractor={(item) => item.id_sewa.toString()}
        contentContainerStyle={[
          styles.listContainer,
          filteredData.length === 0 && styles.emptyContainer
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Tidak ada riwayat transaksi</Text>
              <Text style={styles.emptySubtext}>
                {idPelanggan 
                  ? `Belum ada transaksi untuk pelanggan ID: ${idPelanggan}`
                  : 'Tidak dapat mengidentifikasi pelanggan'
                }
              </Text>
              <TouchableOpacity 
                style={styles.debugButton}
                onPress={runUserDataDebug}
              >
                <Text style={styles.debugButtonText}>Debug User Data</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debugHeaderButton: {
    padding: 8,
  },
  logoImage: {
    width: 34,
    height: 35,
  },
  logoText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: COLORS.black,
    marginLeft: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 30,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: COLORS.black,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.black,
    marginTop: 2,
  },
  historyButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.filterBackground,
    borderRadius: 25,
    marginHorizontal: 20,
    marginTop: 20,
    height: 27,
    padding: 3,
  },
  filterButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  activeFilterButton: {
    backgroundColor: COLORS.white,
  },
  filterText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: COLORS.black,
    textTransform: 'capitalize',
  },
  activeFilterText: {
    color: COLORS.black,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 9,
    marginBottom: 12,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 5,
  },
  statusText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: COLORS.white,
  },
  transactionId: {
    fontFamily: 'Poppins_300Light',
    fontSize: 10,
    color: COLORS.inactive,
    marginLeft: 8,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardImage: {
    width: 75,
    height: 75,
    borderRadius: 5,
  },
  cardDetails: {
    flex: 1,
    marginLeft: 9,
  },
  cardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: COLORS.black,
  },
  cardSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.black,
    marginTop: 5,
  },
  divider: {
    height: 0.5,
    backgroundColor: COLORS.line,
    opacity: 0.5,
    marginVertical: 10,
  },
  cardCostSection: {
    paddingHorizontal: 5,
  },
  totalCostLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.black,
  },
  totalCostValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: COLORS.black,
    marginTop: 4,
  },
  costDetail: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 8,
    color: COLORS.inactive,
    marginTop: 4,
  },
  detailButton: {
    backgroundColor: COLORS.buttonYellow,
    borderRadius: 3,
    paddingVertical: 6,
    alignItems: 'center',
    alignSelf: 'flex-end',
    width: 127,
  },
  detailButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: COLORS.buttonYellowText,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 3,
  },
  ratingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.black,
    marginLeft: 5,
  },
  reviewText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: COLORS.primary,
  },
  reasonContainer: {
    padding: 6,
    borderRadius: 3,
  },
  reasonText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.historyCancelled,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.inactive,
    marginTop: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.inactive,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: 'Poppins_300Light',
    fontSize: 12,
    color: COLORS.inactive,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 40,
    lineHeight: 16,
  },
  debugButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 5,
    marginTop: 10,
  },
  debugButtonText: {
    color: COLORS.white,
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
  },
});