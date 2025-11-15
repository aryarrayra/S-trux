import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, FileText, Calendar, MapPin, Clock } from 'lucide-react-native';

const termsText =
  'Ketentuan Sewa\nPenyewa wajib menggunakan alat berat sesuai dengan spesifikasi dan fungsinya\nKerusakan akibat kelalaian penyewa menjadi tanggung jawab penyewa\nAlat berat harus dikembalikan dalam kondisi yang sama seperti saat diterima\nPembayaran dilakukan sebelum alat berat digunakan\nTanggung Jawab\nPenyewa bertanggung jawab atas keselamatan operator dan pekerja\nPenyewa wajib melakukan maintenance rutin sesuai jadwal\nBiaya bahan bakar dan pelumas ditanggung oleh penyewa\nPenyewa wajib melaporkan setiap kerusakan atau masalah segera\nPembatalan & Pengembalian\nPembatalan dapat dilakukan maksimal 3 hari sebelum tanggal mulai\nBiaya pembatalan sebesar 20% dari total biaya sewa\nPengembalian lebih cepat tidak mengurangi biaya sewa yang harus dibayar\nKeterlambatan pengembalian dikenakan biaya tambahan Rp 500.000/hari';

const termsSections = [
  'Ketentuan Sewa',
  'Tanggung Jawab',
  'Pembatalan & Pengembalian',
];

export default function HistorySewaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Ambil data dari params atau gunakan default
  const transactionId = params.transactionId as string || 'STS23947820';
  const itemName = params.itemName as string || 'Excavator Caterpillar 3200D';
  const itemImage = params.itemImage as string || 'https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/bfea/564f/04fbd48ded688b16d060f50826d834a8?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qoWqP35~z1Moit1wyhoaXC9dMb7wCHPojQy~l3uuG3Vv32CrSn-ckTaSlAQZIHz6DFi9a8L~L~I0EqqP~OcmUSPgLgqanCQEXIcMoGXW8~cWZpQ1VmtsoPUqHBcgKHLoqTbwYqvbvPyn0WWnMamIvkikbcsXixjIJaUfGIMb8V5-sBDCXMNnyT3eDgLODT5ESYcqcQ1JRIzQRklBtjZxA9oGjcmSshLfiEUkgCjJuZEBWWFPk3FK4jW~eZIub475KF2dM6zSCZ-gv7g~JDJRSmRHf2IPv8KoVZNPFtj18Ox1O30zITQnyGP2jlbdRP1d1NGWV9-25Udfr~miS6D9mQ__';
  const itemPrice = params.itemPrice as string || 'Rp 800.000/hari';
  const projectName = params.projectName as string || 'Proyek penggalian gorong gorong bambu hitam';
  const dateRange = params.dateRange as string || '08 Nov 2025 - 23 Nov 2025';
  const status = params.status as string || 'Aktif';

  // Fungsi back yang lebih reliable
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback jika tidak bisa go back, arahkan ke halaman history
      router.push('/user/(tabs)/riwayat');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aktif':
        return '#4CAF50';
      case 'selesai':
        return '#2196F3';
      case 'dibatalkan':
        return '#F44336';
      case 'menunggu':
        return '#FF9800';
      default:
        return '#978D8D';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aktif':
        return 'Sedang Berjalan';
      case 'selesai':
        return 'Selesai';
      case 'dibatalkan':
        return 'Dibatalkan';
      case 'menunggu':
        return 'Menunggu Persetujuan';
      default:
        return status;
    }
  };

  const renderTerms = () => {
    return termsText.split('\n').map((line, index) => {
      const isTitle = termsSections.includes(line.trim());
      return (
        <Text
          key={index}
          style={isTitle ? styles.termsSectionTitle : styles.termsItem}
        >
          {isTitle ? line : `• ${line}`}
        </Text>
      );
    });
  };

  const calculateDuration = (dateRange: string) => {
    const dates = dateRange.split(' - ');
    if (dates.length === 2) {
      const start = new Date(dates[0]);
      const end = new Date(dates[1]);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 9; // Default fallback
  };

  const calculateTotalCost = (duration: number) => {
    const pricePerDay = 800000;
    return duration * pricePerDay;
  };

  const duration = calculateDuration(dateRange);
  const totalCost = calculateTotalCost(duration);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        backgroundColor="#F4F4F4" 
        barStyle="dark-content" 
        translucent={false}
      />
      
      {/* Header dengan tombol back yang jelas */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleBack} 
          style={styles.backButton}
        >
          <ArrowLeft name="arrow-left" size={28} color="#F39F29" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Detail Penyewaan</Text>
          <View style={styles.statusContainer}>
            <View 
              style={[
                styles.statusDot, 
                { backgroundColor: getStatusColor(status) }
              ]} 
            />
            <Text style={styles.headerStatus}>
              Status: {getStatusText(status)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.yellowCard}>
          <FileText color="#FFFFFF" size={48} strokeWidth={1.5} />
          <Text style={styles.yellowCardTitle}>Kontrak Penyewaan</Text>
          <Text style={styles.yellowCardSubtitle}>ID Sewa: {transactionId}</Text>
        </View>

        {/* Card Informasi Penyewaan */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Penyewaan</Text>
          
          <View style={styles.itemContainer}>
            <Image source={{ uri: itemImage }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{itemName}</Text>
              <Text style={styles.itemPrice}>{itemPrice}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={16} color="#F39F29" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Periode Sewa</Text>
              <Text style={styles.infoValue}>{dateRange}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Clock size={16} color="#F39F29" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Durasi</Text>
              <Text style={styles.infoValue}>{duration} Hari</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={16} color="#F39F29" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Lokasi Proyek</Text>
              <Text style={styles.infoValue}>{projectName}</Text>
            </View>
          </View>
        </View>

        {/* Card Ringkasan Biaya */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ringkasan Biaya</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Harga per hari</Text>
            <Text style={styles.summaryValue}>Rp 800.000</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Durasi sewa</Text>
            <Text style={styles.summaryValue}>{duration} hari</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total Biaya</Text>
            <Text style={styles.summaryTotalValue}>{formatCurrency(totalCost)}</Text>
          </View>
        </View>

        {/* Card Status Pembayaran */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status Pembayaran</Text>
          <View style={styles.paymentStatus}>
            <View style={styles.paymentStatusItem}>
              <Text style={styles.paymentLabel}>DP (30%)</Text>
              <Text style={styles.paymentValue}>{formatCurrency(totalCost * 0.3)}</Text>
              <Text style={styles.paymentStatusText}>Lunas</Text>
            </View>
            <View style={styles.paymentStatusItem}>
              <Text style={styles.paymentLabel}>Pelunasan (70%)</Text>
              <Text style={styles.paymentValue}>{formatCurrency(totalCost * 0.7)}</Text>
              <Text style={[
                styles.paymentStatusText,
                status === 'Aktif' ? styles.paymentPending : styles.paymentPaid
              ]}>
                {status === 'Aktif' ? 'Menunggu' : 'Lunas'}
              </Text>
            </View>
          </View>
        </View>

        {/* Card Syarat dan Ketentuan */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Syarat dan Ketentuan</Text>
          {renderTerms()}
        </View>

        {/* Tombol Aksi berdasarkan Status */}
        <View style={styles.actionButtons}>
          {status === 'Aktif' && (
            <>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Ajukan Perpanjangan</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Hubungi Support</Text>
              </TouchableOpacity>
            </>
          )}
          {status === 'Selesai' && (
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Beri Ulasan</Text>
            </TouchableOpacity>
          )}
          {status === 'Dibatalkan' && (
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Sewa Lagi</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tambahan padding di bottom untuk safety */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F4F4F4',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#F39F29',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  headerStatus: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#978D8D',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  yellowCard: {
    backgroundColor: '#FDCB41',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    minHeight: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  yellowCardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 12,
  },
  yellowCardSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#000000',
    marginBottom: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#000000',
  },
  itemPrice: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#F39F29',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#978D8D',
  },
  infoValue: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#000000',
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  summaryLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#333',
  },
  summaryValue: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#F39F29',
  },
  divider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 10,
  },
  summaryTotalLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#000000',
  },
  summaryTotalValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#F39F29',
  },
  paymentStatus: {
    marginTop: 10,
  },
  paymentStatusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  paymentLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  paymentValue: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#F39F29',
    flex: 1,
    textAlign: 'center',
  },
  paymentStatusText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#4CAF50',
    flex: 1,
    textAlign: 'right',
  },
  paymentPending: {
    color: '#FF9800',
  },
  paymentPaid: {
    color: '#4CAF50',
  },
  termsSectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#0F0E0E',
    marginTop: 15,
    marginBottom: 5,
  },
  termsItem: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#555555',
    lineHeight: 20,
    marginBottom: 5,
  },
  actionButtons: {
    marginTop: 10,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#F39F29',
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#F39F29',
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#F39F29',
  },
  bottomPadding: {
    height: 20,
  },
});