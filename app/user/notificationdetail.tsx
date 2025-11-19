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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const NotificationDetail = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [calculatedData, setCalculatedData] = useState({
    days: 1,
    totalPrice: '0'
  });
  
  const router = useRouter();
  const params = useLocalSearchParams();

  // Ambil data dari params
  const {
    id_sewa = '0',
    itemName = 'Alat Berat',
    itemImage = 'https://via.placeholder.com/60',
    itemPrice = '0',
    projectName = 'Tidak disebutkan',
    dateRange = '',
    status = 'Menunggu',
    status_persetujuan = 'Menunggu',
    alasan_penolakan = ''
  } = params;

  // Format currency - TAMPILAN SAJA
  const formatCurrency = (amount: any) => {
    try {
      // Jika sudah format Indonesia dengan titik dan koma, return langsung
      if (typeof amount === 'string' && amount.includes('.') && amount.includes(',')) {
        return `Rp ${amount}`;
      }
      
      // Jika number, format biasa
      const num = typeof amount === 'string' ? parseInt(amount) || 0 : amount || 0;
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(num);
    } catch (error) {
      return 'Rp 0';
    }
  };

  // Hitung jumlah hari dari date range - FIXED POSITION
// Hitung jumlah hari dari date range - FIXED VERSION
const calculateDays = (dateRange: string) => {
  try {
    console.log('🔍 calculateDays input:', dateRange);
    
    if (!dateRange || dateRange === 'undefined - undefined' || dateRange === 'null - null') {
      console.log('❌ Invalid dateRange, returning 1');
      return 1;
    }
    
    let startStr, endStr;
    
    // Handle berbagai format
    if (dateRange.includes(' - ')) {
      [startStr, endStr] = dateRange.split(' - ');
    } else if (dateRange.includes(' to ')) {
      [startStr, endStr] = dateRange.split(' to ');
    } else {
      console.log('❌ Unknown dateRange format:', dateRange);
      return 1;
    }
    
    // Clean the date strings
    startStr = startStr?.trim();
    endStr = endStr?.trim();
    
    console.log('📅 Parsed dates - Start:', startStr, 'End:', endStr);
    
    if (!startStr || !endStr) {
      console.log('❌ Empty start or end date');
      return 1;
    }
    
    // FIX: Parse manual untuk format "DD MMM YYYY"
    const parseCustomDate = (dateStr: string) => {
      const months: { [key: string]: number } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      const parts = dateStr.split(' ');
      if (parts.length !== 3) return new Date(NaN);
      
      const day = parseInt(parts[0]);
      const month = months[parts[1]];
      const year = parseInt(parts[2]);
      
      console.log(`🔍 Parsing "${dateStr}": day=${day}, month=${month}, year=${year}`);
      
      if (isNaN(day) || month === undefined || isNaN(year)) {
        return new Date(NaN);
      }
      
      return new Date(year, month, day);
    };
    
    const start = parseCustomDate(startStr);
    const end = parseCustomDate(endStr);
    
    console.log('📅 Date objects - Start:', start, 'End:', end);
    console.log('✅ Date validity - Start valid:', !isNaN(start.getTime()), 'End valid:', !isNaN(end.getTime()));
    
    // Validasi date
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.log('❌ Invalid dates, returning 1');
      return 1;
    }
    
    // Hitung selisih hari (end - start) + 1 untuk include both dates
    const diffTime = end.getTime() - start.getTime();
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    console.log('📅 Calculated days:', days);
    return days > 0 ? days : 1;
  } catch (error) {
    console.error('❌ Error calculating days:', error);
    return 1;
  }
};

  // Format date range untuk display
const formatDateRangeForDisplay = (dateRange: string) => {
  if (!dateRange || dateRange === 'undefined - undefined' || dateRange === 'null - null') {
    return 'Tanggal tidak tersedia';
  }
  
  try {
    let startStr, endStr;
    
    if (dateRange.includes(' - ')) {
      [startStr, endStr] = dateRange.split(' - ');
    } else if (dateRange.includes(' to ')) {
      [startStr, endStr] = dateRange.split(' to ');
    } else {
      return dateRange;
    }
    
    // FIX: Gunakan parsing yang sama seperti calculateDays
    const parseCustomDate = (dateStr: string) => {
      const months: { [key: string]: number } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      const parts = dateStr.trim().split(' ');
      if (parts.length !== 3) return new Date(NaN);
      
      const day = parseInt(parts[0]);
      const month = months[parts[1]];
      const year = parseInt(parts[2]);
      
      if (isNaN(day) || month === undefined || isNaN(year)) {
        return new Date(NaN);
      }
      
      return new Date(year, month, day);
    };
    
    const start = parseCustomDate(startStr);
    const end = parseCustomDate(endStr);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return dateRange;
    }
    
    // Format ke Indonesia
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    };
    
    const startFormatted = start.toLocaleDateString('id-ID', options);
    const endFormatted = end.toLocaleDateString('id-ID', options);
    
    return `${startFormatted} - ${endFormatted}`;
  } catch (error) {
    return dateRange;
  }
};

  // Calculate data when component mounts - FIXED: pindah setelah function didefinisikan
  useEffect(() => {
    console.log('🚀 useEffect running...');
    console.log('📦 dateRange:', dateRange);
    console.log('💰 itemPrice:', itemPrice);
    
    const days = calculateDays(dateRange as string);
    const totalPrice = itemPrice as string;
    
    console.log('🎯 Final calculation - Days:', days, 'Total Price:', totalPrice);
    
    setCalculatedData({
      days,
      totalPrice
    });
  }, [dateRange, itemPrice]);

  // Handle upload bukti bayar
  const handleUpload = () => {
    setUploadedFile('bukti_bayar.jpg');
    Alert.alert('Sukses', 'File berhasil diupload');
  };

  // Handle submit bukti bayar
  const handleSubmit = () => {
    if (!uploadedFile) {
      Alert.alert('Peringatan', 'Harap upload bukti pembayaran terlebih dahulu');
      return;
    }
    Alert.alert('Sukses', 'Bukti pembayaran berhasil dikirim');
    router.back();
  };

  // Tampilkan konten berdasarkan status persetujuan
  const renderContentByStatus = () => {
    switch (status_persetujuan) {
      case 'Disetujui':
        return (
          <>
            {/* Transfer Payment Section - Hanya untuk status Disetujui */}
            <View style={styles.transferSection}>
              <Text style={styles.transferTitle}>Transfer Pembayaran</Text>
              <Text style={styles.transferAccount}>Rekening 0917 7840 530230</Text>
              <Text style={styles.transferBank}>Bank BCA - PT. S`Trux Indonesia</Text>
              
              <View style={styles.amountBox}>
                <Text style={styles.amountLabel}>Transfer Sejumlah:</Text>
                <Text style={styles.amountValue}>{formatCurrency(itemPrice)}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.uploadBox}
                activeOpacity={0.7}
                onPress={handleUpload}
              >
                <Ionicons name="cloud-upload-outline" size={28} color="#9CA3AF" />
                <Text style={styles.uploadText}>
                  {uploadedFile ? 'File terupload' : 'Upload bukti bayar'}
                </Text>
                {uploadedFile && (
                  <Text style={styles.uploadSuccess}>✓</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Submit Button - Hanya untuk status Disetujui */}
            <TouchableOpacity 
              style={styles.submitButton}
              activeOpacity={0.8}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Kirim Bukti Bayar</Text>
            </TouchableOpacity>
          </>
        );

      case 'Menunggu':
        return (
          <View style={styles.statusInfo}>
            <Ionicons name="time-outline" size={48} color="#F59E0B" />
            <Text style={styles.statusTitle}>Menunggu Persetujuan</Text>
            <Text style={styles.statusMessage}>
              Pesanan Anda sedang menunggu persetujuan dari admin. 
              Anda akan dapat melakukan pembayaran setelah pesanan disetujui.
            </Text>
          </View>
        );

      case 'Ditolak':
        return (
          <View style={styles.statusInfo}>
            <Ionicons name="close-circle-outline" size={48} color="#DC2626" />
            <Text style={styles.statusTitle}>Pesanan Ditolak</Text>
            <Text style={styles.statusMessage}>
              {alasan_penolakan || 'Pesanan Anda tidak dapat diproses.'}
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.retryButtonText}>Kembali</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return (
          <View style={styles.statusInfo}>
            <Text style={styles.statusMessage}>
              Status pesanan tidak dikenali.
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header dengan Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Detail Pesanan</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Main Card Container */}
        <View style={styles.mainCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {status_persetujuan === 'Disetujui' 
                ? 'Bayar Pesanan Anda' 
                : `Status: ${status}`}
            </Text>
            <Text style={styles.headerSubtitle}>
              {status_persetujuan === 'Disetujui'
                ? 'Bayarlah sesuai nominal dan kirimkan bukti'
                : `ID Pesanan: STS-${id_sewa}`}
            </Text>
          </View>

          {/* Status Badge */}
          <View style={[
            styles.statusBadge,
            status_persetujuan === 'Disetujui' && styles.statusApproved,
            status_persetujuan === 'Menunggu' && styles.statusPending,
            status_persetujuan === 'Ditolak' && styles.statusRejected,
          ]}>
            <Text style={styles.statusBadgeText}>
              {status_persetujuan === 'Disetujui' ? 'DISETUJUI' :
               status_persetujuan === 'Menunggu' ? 'MENUNGGU' : 'DITOLAK'}
            </Text>
          </View>

          {/* Contract Card - Tampilkan untuk semua status */}
          <View style={styles.contractCard}>
            <Ionicons name="document-text-outline" size={40} color="#FFFFFF" />
            <Text style={styles.contractTitle}>Kontrak Penyewaan</Text>
            <Text style={styles.contractSubtitle}>& Terms STSLegalson</Text>
          </View>

          {/* Equipment Info - Tampilkan untuk semua status */}
          <View style={styles.equipmentCard}>
            <Image
              source={{ uri: itemImage as string }}
              style={styles.equipmentImage}
              defaultSource={{ uri: 'https://via.placeholder.com/60' }}
            />
            <View style={styles.equipmentInfo}>
              <Text style={styles.equipmentName}>{itemName as string}</Text>
              <Text style={styles.equipmentPrice}>
                {formatCurrency(itemPrice)}
              </Text>
              <Text style={styles.projectName}>Proyek: {projectName as string}</Text>
            </View>
          </View>

          {/* Order Summary - Tampilkan untuk semua status */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Ringkasan Pesanan</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Periode sewa</Text>
              <Text style={styles.summaryValue}>
                {formatDateRangeForDisplay(dateRange as string)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Lama sewa</Text>
              <Text style={styles.summaryValue}>{calculatedData.days} Hari</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Biaya</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(itemPrice)}
              </Text>
            </View>
          </View>

          {/* Konten dinamis berdasarkan status */}
          {renderContentByStatus()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles tetap sama...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 10,
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 6,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusApproved: {
    backgroundColor: '#10B981',
  },
  statusPending: {
    backgroundColor: '#F59E0B',
  },
  statusRejected: {
    backgroundColor: '#DC2626',
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contractCard: {
    backgroundColor: '#FCD34D',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    fontWeight: '500',
    marginBottom: 4,
  },
  projectName: {
    fontSize: 11,
    color: '#6B7280',
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#F59E0B',
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
  transferSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  transferTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  transferAccount: {
    fontSize: 14,
    color: '#F59E0B',
    marginBottom: 4,
    fontWeight: '600',
  },
  transferBank: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
  },
  amountBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  amountLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  uploadBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  uploadText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  uploadSuccess: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#FCD34D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#78350F',
  },
  statusInfo: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#FCD34D',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#78350F',
  },
});

export default NotificationDetail;