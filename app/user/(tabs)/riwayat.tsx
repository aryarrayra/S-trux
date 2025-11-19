import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { History, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';

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

interface HistoryItem {
  id: string;
  status: HistoryStatus;
  transactionId: string;
  title: string;
  project: string;
  dateRange: string;
  imageUrl: string;
  totalCost: string;
  costDetail: string;
  rating?: number;
  cancelReason?: string;
}

const historyData: HistoryItem[] = [
  {
    id: '1',
    status: 'Aktif',
    transactionId: 'STX-2025-002',
    title: 'Excavator Caterpillar 3200D',
    project: 'Proyek penggalian gorong gorong bambu hitam',
    dateRange: '08 Nov 2025 - 23 Nov 2025',
    imageUrl:
      'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/bfea/564f/04fbd48ded688b16d060f50826d834a8?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qoWqP35~z1Moit1wyhoaXC9dMb7wCHPojQy~l3uuG3Vv32CrSn-ckTaSlAQZIHz6DFi9a8L~L~I0EqqP~OcmUSPgLgqanCQEXIcMoGXW8~cWZpQ1VmtsoPUqHBcgKHLoqTbwYqvbvPyn0WWnMamIvkikbcsXixjIJaUfGIMb8V5-sBDCXMNnyT3eDgLODT5ESYcqcQ1JRIzQRklBtjZxA9oGjcmSshLfiEUkgCjJuZEBWWFPk3FK4jW~eZIub475KF2dM6zSCZ-gv7g~JDJRSmRHf2IPv8KoVZNPFtj18Ox1O30zITQnyGP2jlbdRP1d1NGWV9-25Udfr~miS6D9mQ__',
    totalCost: 'RP. 12.000.000',
    costDetail: '15 hari x 800.000',
  },
  {
    id: '2',
    status: 'Aktif',
    transactionId: 'STX-2025-001',
    title: 'Dump Truck Hino D700',
    project: 'Proyek penggalian gorong gorong bambu hitam',
    dateRange: '08 Nov 2025 - 23 Nov 2025',
    imageUrl:
      'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/bfea/564f/04fbd48ded688b16d060f50826d834a8?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qoWqP35~z1Moit1wyhoaXC9dMb7wCHPojQy~l3uuG3Vv32CrSn-ckTaSlAQZIHz6DFi9a8L~L~I0EqqP~OcmUSPgLgqanCQEXIcMoGXW8~cWZpQ1VmtsoPUqHBcgKHLoqTbwYqvbvPyn0WWnMamIvkikbcsXixjIJaUfGIMb8V5-sBDCXMNnyT3eDgLODT5ESYcqcQ1JRIzQRklBtjZxA9oGjcmSshLfiEUkgCjJuZEBWWFPk3FK4jW~eZIub475KF2dM6zSCZ-gv7g~JDJRSmRHf2IPv8KoVZNPFtj18Ox1O30zITQnyGP2jlbdRP1d1NGWV9-25Udfr~miS6D9mQ__',
    totalCost: 'RP. 7.500.000',
    costDetail: '15 hari x 500.000',
  },
  {
    id: '3',
    status: 'Selesai',
    transactionId: 'STX-2025-003',
    title: 'Tower Crane Leibherr',
    project: 'Proyek pembangunan flyover',
    dateRange: '01 Jan 2025 - 08 Jan 2025',
    imageUrl:
      'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/bfea/564f/04fbd48ded688b16d060f50826d834a8?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qoWqP35~z1Moit1wyhoaXC9dMb7wCHPojQy~l3uuG3Vv32CrSn-ckTaSlAQZIHz6DFi9a8L~L~I0EqqP~OcmUSPgLgqanCQEXIcMoGXW8~cWZpQ1VmtsoPUqHBcgKHLoqTbwYqvbvPyn0WWnMamIvkikbcsXixjIJaUfGIMb8V5-sBDCXMNnyT3eDgLODT5ESYcqcQ1JRIzQRklBtjZxA9oGjcmSshLfiEUkgCjJuZEBWWFPk3FK4jW~eZIub475KF2dM6zSCZ-gv7g~JDJRSmRHf2IPv8KoVZNPFtj18Ox1O30zITQnyGP2jlbdRP1d1NGWV9-25Udfr~miS6D9mQ__',
    totalCost: 'RP. 12.000.000',
    costDetail: '8 hari x 1.500.000',
    rating: 5,
  },
  {
    id: '4',
    status: 'Dibatalkan',
    transactionId: 'STX-2025-004',
    title: 'Bulldozer LuiGong',
    project: 'Proyek pembangunan flyover',
    dateRange: '01 Jan 2025 - 08 Jan 2025',
    imageUrl:
      'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/bfea/564f/04fbd48ded688b16d060f50826d834a8?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qoWqP35~z1Moit1wyhoaXC9dMb7wCHPojQy~l3uuG3Vv32CrSn-ckTaSlAQZIHz6DFi9a8L~L~I0EqqP~OcmUSPgLgqanCQEXIcMoGXW8~cWZpQ1VmtsoPUqHBcgKHLoqTbwYqvbvPyn0WWnMamIvkikbcsXixjIJaUfGIMb8V5-sBDCXMNnyT3eDgLODT5ESYcqcQ1JRIzQRklBtjZxA9oGjcmSshLfiEUkgCjJuZEBWWFPk3FK4jW~eZIub475KF2dM6zSCZ-gv7g~JDJRSmRHf2IPv8KoVZNPFtj18Ox1O30zITQnyGP2jlbdRP1d1NGWV9-25Udfr~miS6D9mQ__',
    totalCost: 'RP. 12.800.000',
    costDetail: '8 hari x 1.600.000',
    cancelReason: 'Alasan: Merubah Tipe dan merek alat berat',
  },
];

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

const HistoryCard = ({ item }: { item: HistoryItem }) => {
  const router = useRouter();

  const handleDetailPress = () => {
    router.push({
      pathname: '/user/history',
      params: {
        transactionId: item.transactionId,
        itemName: item.title,
        itemImage: item.imageUrl,
        itemPrice: item.totalCost,
        projectName: item.project,
        dateRange: item.dateRange,
        status: item.status
      }
    });
  };

  const renderFooter = () => {
    switch (item.status) {
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
              <Text style={styles.ratingText}>Rating Anda: {item.rating}</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.reviewText}>Lihat Ulasan</Text>
            </TouchableOpacity>
          </View>
        );
      case 'Dibatalkan':
        return (
          <View style={[styles.reasonContainer, { backgroundColor: COLORS.cancelledButtonBg }]}>
            <Text style={styles.reasonText}>{item.cancelReason}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={styles.transactionId}>{item.transactionId}</Text>
      </View>
      <View style={styles.cardBody}>
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        <View style={styles.cardDetails}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.project}</Text>
          <Text style={styles.cardSubtitle}>{item.dateRange}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.cardCostSection}>
        <Text style={styles.totalCostLabel}>Total biaya</Text>
        <Text style={styles.totalCostValue}>{item.totalCost}</Text>
        <Text style={styles.costDetail}>{item.costDetail}</Text>
      </View>
      <View style={styles.divider} />
      {renderFooter()}
    </View>
  );
};

export default function HistoryScreen() {
  const [activeFilter, setActiveFilter] = useState('semua');

  const filteredData = historyData.filter((item) => {
    if (activeFilter === 'semua') return true;
    if (activeFilter === 'aktif') return item.status === 'Aktif';
    if (activeFilter === 'selesai') return item.status === 'Selesai' || item.status === 'Dibatalkan';
    return false;
  });

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
      </View>

      <View style={styles.titleContainer}>
        <View>
          <Text style={styles.title}>Riwayat Saya</Text>
          <Text style={styles.subtitle}>2 total transaksi</Text>
        </View>
        <TouchableOpacity>
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
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredData}
        renderItem={({ item }) => <HistoryCard item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
});