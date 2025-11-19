// app/user/(tabs)/notification.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, History } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { penyewaanApi, Penyewaan, StatusPenyewaan } from '../../../services/penyewaanApi';

const COLORS = {
  background: '#F4F4F4',
  white: '#FFFFFF',
  black: '#000000',
  primary: '#F39F29',
  primaryGradientEnd: '#FDCB41',
  notificationActive: '#4CAF50',
  notificationCompleted: '#2196F3',
  notificationCancelled: '#F44336',
  completedButtonBg: '#E3F2FD',
  cancelledButtonBg: '#FFEBEE',
  buttonYellow: '#FDCB41',
  buttonYellowText: '#000000',
  filterBackground: '#E5E5E5',
  cardShadow: '#000000',
  inactive: '#978D8D',
  line: '#D9D9D9',
  warning: '#FF9800',
};

// Map status dari API ke UI Notification
const mapStatusToNotification = (statusPersetujuan: string, statusSewa: string): 'Menunggu' | 'Sukses' | 'Dibatalkan' | 'Diproses' => {
  if (statusPersetujuan === 'Menunggu') return 'Menunggu';
  if (statusPersetujuan === 'Ditolak') return 'Dibatalkan';
  if (statusPersetujuan === 'Disetujui' && statusSewa === 'Berjalan') return 'Diproses';
  if (statusPersetujuan === 'Disetujui' && statusSewa === 'Selesai') return 'Sukses';
  return 'Menunggu';
};

const getStatusStyle = (status: 'Menunggu' | 'Sukses' | 'Dibatalkan' | 'Diproses') => {
  switch (status) {
    case 'Menunggu':
      return { backgroundColor: COLORS.warning };
    case 'Sukses':
      return { backgroundColor: COLORS.notificationCompleted };
    case 'Dibatalkan':
      return { backgroundColor: COLORS.notificationCancelled };
    case 'Diproses':
      return { backgroundColor: COLORS.notificationActive };
  }
};

const NotificationCard = ({ item }: { item: Penyewaan }) => {
  const router = useRouter();

  const notificationStatus = mapStatusToNotification(item.status_persetujuan, item.status_sewa);
  
  // Format date range
  const formatDateRange = () => {
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
  };

  // Hitung detail biaya
  const calculateCostDetail = () => {
    const start = new Date(item.tanggal_sewa);
    const end = new Date(item.tanggal_kembali || item.tanggal_sewa);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const dailyPrice = item.alat?.harga_sewa || 0;
    return `${diffDays} hari x ${new Intl.NumberFormat('id-ID').format(dailyPrice)}`;
  };

  // Generate notification title berdasarkan status
  const getNotificationTitle = () => {
    switch (notificationStatus) {
      case 'Menunggu':
        return 'Pesanan Menunggu Persetujuan';
      case 'Diproses':
        return 'Pesanan Diproses';
      case 'Sukses':
        return 'Pesanan Selesai';
      case 'Dibatalkan':
        return 'Pesanan Dibatalkan';
      default:
        return 'Pesanan';
    }
  };

  const handleDetailPress = () => {
    router.push({
      pathname: '/user/notificationdetail',
      params: {
        id_sewa: item.id_sewa,
        notificationId: item.id_sewa,
        itemName: item.alat?.nama_alat,
        itemImage: item.alat?.gambar,
        itemPrice: item.total_harga,
        projectName: item.nama_proyek,
        dateRange: formatDateRange(),
        status: notificationStatus,
        status_persetujuan: item.status_persetujuan,
        alasan_penolakan: item.alasan_penolakan
      }
    });
  };

  const renderFooter = () => {
    switch (notificationStatus) {
      case 'Menunggu':
        return (
          <TouchableOpacity 
            style={styles.detailButton}
            onPress={handleDetailPress}
          >
            <Text style={styles.detailButtonText}>Lihat Detail</Text>
          </TouchableOpacity>
        );
      case 'Sukses':
        return (
          <View style={styles.footerRow}>
            <View style={[styles.ratingContainer, { backgroundColor: COLORS.completedButtonBg }]}>
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
            <TouchableOpacity onPress={handleDetailPress} style={styles.detailLink}>
              <Text style={styles.reviewText}>Lihat Detail</Text>
            </TouchableOpacity>
          </View>
        );
      case 'Diproses':
        return (
          <TouchableOpacity 
            style={styles.detailButton}
            onPress={handleDetailPress}
          >
            <Text style={styles.detailButtonText}>Lihat Detail</Text>
          </TouchableOpacity>
        );
      default:
        return (
          <TouchableOpacity 
            style={styles.detailButton}
            onPress={handleDetailPress}
          >
            <Text style={styles.detailButtonText}>Lihat Detail</Text>
          </TouchableOpacity>
        );
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, getStatusStyle(notificationStatus)]}>
          <Text style={styles.statusText}>{notificationStatus}</Text>
        </View>
        <Text style={styles.notificationId}>STS-{item.id_sewa}</Text>
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
          <Text style={styles.cardTitle}>{getNotificationTitle()}</Text>
          <Text style={styles.cardSubtitle}>{item.alat?.nama_alat || 'Alat Berat'}</Text>
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
          }).format(item.total_harga)}
        </Text>
        <Text style={styles.costDetail}>{calculateCostDetail()}</Text>
      </View>
      <View style={styles.divider} />
      {renderFooter()}
    </View>
  );
};

export default function NotificationScreen() {
  const [activeFilter, setActiveFilter] = useState('semua');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationData, setNotificationData] = useState<Penyewaan[]>([]);
  const router = useRouter();

  const fetchNotificationData = async () => {
    try {
      // Untuk user, ambil data penyewaan berdasarkan pelanggan yang login
      // Sementara pakai getAll dulu, nanti bisa disesuaikan dengan user ID
      const penyewaanData = await penyewaanApi.getAllPenyewaan();
      setNotificationData(penyewaanData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Gagal mengambil data notifikasi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotificationData();
  };

  useEffect(() => {
    fetchNotificationData();
  }, []);

  const filteredData = notificationData.filter((item) => {
    const notificationStatus = mapStatusToNotification(item.status_persetujuan, item.status_sewa);
    
    if (activeFilter === 'semua') return true;
    if (activeFilter === 'menunggu') return notificationStatus === 'Menunggu';
    if (activeFilter === 'selesai') return notificationStatus === 'Sukses' || notificationStatus === 'Diproses';
    return false;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat notifikasi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
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
      </View>

      <View style={styles.titleContainer}>
        <View>
          <Text style={styles.title}>Notifikasi</Text>
          <Text style={styles.subtitle}>{notificationData.length} total notifikasi</Text>
        </View>
        <TouchableOpacity onPress={onRefresh}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryGradientEnd]}
            style={styles.notificationButton}>
            <Bell size={20} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {(['semua', 'menunggu', 'selesai'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterButton, activeFilter === filter && styles.activeFilterButton]}
            onPress={() => setActiveFilter(filter)}>
            <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
              {filter === 'selesai' ? 'Selesai' : 
               filter === 'menunggu' ? 'Menunggu' : 'Semua'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredData}
        renderItem={({ item }) => <NotificationCard item={item} />}
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
              <Text style={styles.emptyText}>Tidak ada notifikasi</Text>
              <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Coba Lagi</Text>
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
    paddingTop: 50,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginTop: 20,
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: COLORS.black,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.inactive,
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.filterBackground,
    borderRadius: 25,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    height: 35,
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
    fontSize: 12,
    color: COLORS.black,
    textTransform: 'capitalize',
  },
  activeFilterText: {
    color: COLORS.black,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: COLORS.white,
  },
  notificationId: {
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
    borderRadius: 8,
  },
  cardDetails: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: COLORS.inactive,
    marginTop: 2,
    lineHeight: 14,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.line,
    opacity: 0.5,
    marginVertical: 12,
  },
  cardCostSection: {
    paddingHorizontal: 4,
  },
  totalCostLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: COLORS.black,
  },
  totalCostValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.black,
    marginTop: 4,
  },
  costDetail: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
    color: COLORS.inactive,
    marginTop: 2,
  },
  detailButton: {
    backgroundColor: COLORS.buttonYellow,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    alignSelf: 'flex-end',
    width: 120,
  },
  detailButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  ratingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.black,
    marginLeft: 6,
  },
  reviewText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: COLORS.primary,
  },
  reasonContainer: {
    padding: 10,
    borderRadius: 6,
  },
  reasonText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.notificationCancelled,
    lineHeight: 14,
    marginBottom: 8,
  },
  detailLink: {
    alignSelf: 'flex-end',
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
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: COLORS.white,
  },
});