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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { API_BASE_URL } from '@/constants/ApiConfig';

const NotificationDetail = () => {
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const params = useLocalSearchParams();

  // ✅ DEBUG DETAIL SEMUA PARAMS
  console.log('🔍 === ALL PARAMS RECEIVED ===', params);
  console.log('🔍 itemPrice raw:', params.itemPrice);
  console.log('🔍 itemPrice type:', typeof params.itemPrice);

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
    alasan_penolakan = '',
  } = params;

  // ✅ FUNGSI SANGAT SEDERHANA - HANYA UNTUK DISPLAY
  const displayPrice = (price: any) => {
    console.log('💰 DISPLAY PRICE INPUT:', price);
    
    // Jika sudah string, tampilkan langsung
    if (typeof price === 'string') {
      console.log('💰 DISPLAY AS STRING:', price);
      return price;
    }
    
    // Jika number, format
    if (typeof price === 'number') {
      const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(price);
      console.log('💰 DISPLAY AS NUMBER:', formatted);
      return formatted;
    }
    
    console.log('💰 DISPLAY FALLBACK: Rp 0');
    return 'Rp 0';
  };

  // ✅ FUNGSI PARSING YANG DI-SKIP - LANGSUNG RETURN NILAI ASLI
  const parsePriceForSubmit = (price: any): number => {
    console.log('🎯 PARSE FOR SUBMIT INPUT:', price);
    
    if (!price) return 0;
    
    // ✅ LANGSUNG RETURN NILAI ASLI - TIDAK ADA PARSING
    // Jika sudah number, return langsung
    if (typeof price === 'number') {
      console.log('🎯 ALREADY NUMBER (DIRECT RETURN):', price);
      return price;
    }
    
    // ✅ JIKA STRING, COBA KONVERSI KE NUMBER TANPA HAPUS CHARACTER
    if (typeof price === 'string') {
      // Coba parse sebagai float dulu (untuk handle decimal)
      const parsedFloat = parseFloat(price);
      console.log('🎯 PARSED AS FLOAT:', parsedFloat);
      
      if (!isNaN(parsedFloat)) {
        return parsedFloat;
      }
      
      // Fallback: coba parse sebagai int
      const parsedInt = parseInt(price, 10);
      console.log('🎯 PARSED AS INT:', parsedInt);
      
      return isNaN(parsedInt) ? 0 : parsedInt;
    }
    
    return 0;
  };

  // Hitung jumlah hari (sederhana)
const calculateDays = (dateRange: string) => {
  try {
    console.log('📅 CALCULATE DAYS INPUT:', dateRange);
    
    if (!dateRange || dateRange === 'undefined - undefined' || dateRange === 'null - null') {
      console.log('❌ Invalid date range');
      return 1;
    }
    
    let startStr, endStr;
    if (dateRange.includes(' - ')) {
      [startStr, endStr] = dateRange.split(' - ');
    } else {
      console.log('❌ No date separator found');
      return 1;
    }
    
    console.log('📅 Start:', startStr, 'End:', endStr);
    
    // Parsing tanggal yang lebih robust
    const parseDate = (dateStr: string) => {
      // Handle berbagai format
      const cleanStr = dateStr.trim();
      
      // Format: "20 Nov 2025"
      const months: { [key: string]: number } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Des': 11,
        'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
        'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
      };
      
      const parts = cleanStr.split(' ');
      console.log('📅 Date parts:', parts);
      
      if (parts.length >= 3) {
        const day = parseInt(parts[0]);
        const month = months[parts[1]];
        const year = parseInt(parts[2]);
        
        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
          const date = new Date(year, month, day);
          console.log('📅 Parsed date:', date);
          return date;
        }
      }
      
      // Fallback: coba parse sebagai Date object
      const fallbackDate = new Date(cleanStr);
      console.log('📅 Fallback date:', fallbackDate);
      return fallbackDate;
    };
    
    const startDate = parseDate(startStr);
    const endDate = parseDate(endStr);
    
    console.log('📅 Start date:', startDate, 'Valid:', !isNaN(startDate.getTime()));
    console.log('📅 End date:', endDate, 'Valid:', !isNaN(endDate.getTime()));
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.log('❌ Invalid dates');
      return 1;
    }
    
    // Hitung selisih hari (end - start) + 1 untuk include both dates
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalDays = diffDays + 1; // +1 untuk include start date
    
    console.log('📅 Calculated days:', totalDays, '(diff:', diffDays, ')');
    
    return totalDays > 0 ? totalDays : 1;
    
  } catch (error) {
    console.error('❌ Error calculating days:', error);
    return 1;
  }
};

  // Format date range
  const formatDateRangeForDisplay = (dateRange: string) => {
    if (!dateRange || dateRange === 'undefined - undefined') {
      return 'Tanggal tidak tersedia';
    }
    return dateRange;
  };

  // Upload functions (tetap sama)
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin diperlukan', 'Izin akses gallery diperlukan untuk upload bukti bayar');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        let base64Data = asset.base64;
        if (!base64Data && asset.uri) {
          base64Data = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }

        const fileData = {
          uri: asset.uri,
          base64: base64Data,
          name: `bukti_bayar_${Date.now()}.jpg`,
          type: 'image/jpeg',
          size: asset.fileSize || 0,
        };

        setUploadedFile(fileData);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memilih gambar');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin diperlukan', 'Izin akses kamera diperlukan untuk mengambil foto');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        let base64Data = asset.base64;
        if (!base64Data && asset.uri) {
          base64Data = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }

        const fileData = {
          uri: asset.uri,
          base64: base64Data,
          name: `bukti_bayar_${Date.now()}.jpg`,
          type: 'image/jpeg',
          size: asset.fileSize || 0,
        };

        setUploadedFile(fileData);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal mengambil foto');
    }
  };

  const handleUploadOption = () => {
    Alert.alert(
      'Pilih Sumber',
      'Pilih sumber untuk bukti pembayaran',
      [
        { text: 'Ambil Foto', onPress: takePhoto },
        { text: 'Pilih dari Gallery', onPress: pickImage },
        { text: 'Batal', style: 'cancel' },
      ]
    );
  };

  // ✅ FUNGSI SUBMIT YANG SEDERHANA - TANPA PARSING BERLEBIHAN
  const handleSubmitPayment = async () => {
    if (!uploadedFile) {
      Alert.alert('Peringatan', 'Harap upload bukti pembayaran terlebih dahulu');
      return;
    }

    try {
      setIsSubmitting(true);

      // ✅ LANGSUNG GUNAKAN NILAI ASLI - MINIMAL PARSING
      const jumlahBayar = parsePriceForSubmit(itemPrice);
      
      console.log('🎯 FINAL SUBMIT AMOUNT:', {
        original: itemPrice,
        parsed: jumlahBayar,
        'Expected': 'Should be around 14-15 juta'
      });

      // Validasi
      if (isNaN(jumlahBayar) || jumlahBayar <= 0) {
        throw new Error('Jumlah pembayaran tidak valid');
      }

      const paymentData = {
        id_sewa: parseInt(id_sewa as string),
        tanggal_bayar: new Date().toISOString().split('T')[0],
        jumlah_bayar: jumlahBayar,
        metode: 'Transfer',
        status_pembayaran: 'Lunas',
        bukti_bayar: uploadedFile.base64,
        nama_bukti: uploadedFile.name,
      };

      console.log('📤 PAYMENT DATA:', paymentData);

      const response = await fetch(`${API_BASE_URL}/pembayaran`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      const responseText = await response.text();
      console.log('📥 SERVER RESPONSE:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Response tidak valid dari server');
      }

      if (response.ok && responseData.success) {
        Alert.alert(
          'Sukses!', 
          'Bukti pembayaran berhasil dikirim dan menunggu verifikasi admin.',
          [{ text: 'OK', onPress: () => router.replace('/user/(tabs)/notification') }]
        );
      } else {
        throw new Error(responseData.message || 'Gagal mengirim bukti pembayaran');
      }

    } catch (error: any) {
      console.error('❌ Submit error:', error);
      Alert.alert('Error', error.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate days
  const days = calculateDays(dateRange as string);

  // Tampilkan konten berdasarkan status persetujuan
  const renderContentByStatus = () => {
    switch (status_persetujuan) {
      case 'Disetujui':
        return (
          <>
            {/* Transfer Payment Section */}
            <View style={styles.transferSection}>
              <Text style={styles.transferTitle}>Transfer Pembayaran</Text>
              
              <View style={styles.accountInfo}>
                <Text style={styles.accountLabel}>Rekening Tujuan:</Text>
                <Text style={styles.accountNumber}>0917 7845 9827 30230</Text>
                <Text style={styles.accountBank}>Bank BCA - PT. S`Trux Indonesia</Text>
              </View>
              
              <View style={styles.amountBox}>
                <Text style={styles.amountLabel}>Transfer Sejumlah:</Text>
                <Text style={styles.amountValue}>
                  {displayPrice(itemPrice)}
                </Text>
                {/* ✅ DEBUG INFO - BISA DIHAPUS SETELAH TESTING */}
                <Text style={styles.debugText}>
                  Debug: {itemPrice} → {parsePriceForSubmit(itemPrice)}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.uploadBox, uploadedFile && styles.uploadBoxSuccess]}
                onPress={handleUploadOption}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="large" color="#F59E0B" />
                ) : (
                  <>
                    <Ionicons 
                      name={uploadedFile ? "checkmark-circle" : "cloud-upload-outline"} 
                      size={28} 
                      color={uploadedFile ? "#10B981" : "#9CA3AF"} 
                    />
                    <Text style={[styles.uploadText, uploadedFile && styles.uploadTextSuccess]}>
                      {uploadedFile ? 'Bukti terupload' : 'Upload bukti bayar'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {uploadedFile && (
                <View style={styles.previewContainer}>
                  <Image 
                    source={{ uri: `data:image/jpeg;base64,${uploadedFile.base64}` }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, (!uploadedFile || isSubmitting) && styles.submitButtonDisabled]}
              onPress={handleSubmitPayment}
              disabled={!uploadedFile || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#78350F" />
              ) : (
                <Text style={styles.submitButtonText}>Kirim Bukti Bayar</Text>
              )}
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
              <Text style={styles.infoText}>
                Bukti pembayaran akan diverifikasi oleh admin dalam 1x24 jam
              </Text>
            </View>
          </>
        );

      case 'Menunggu':
        return (
          <View style={styles.statusInfo}>
            <Ionicons name="time-outline" size={48} color="#F59E0B" />
            <Text style={styles.statusTitle}>Menunggu Persetujuan</Text>
            <Text style={styles.statusMessage}>
              Pesanan Anda sedang menunggu persetujuan dari admin.
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
            <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
              <Text style={styles.retryButtonText}>Kembali</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return (
          <View style={styles.statusInfo}>
            <Text style={styles.statusMessage}>Status pesanan tidak dikenali.</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Detail Pesanan</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.mainCard}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {status_persetujuan === 'Disetujui' ? 'Bayar Pesanan Anda' : `Status: ${status}`}
            </Text>
            <Text style={styles.headerSubtitle}>
              {status_persetujuan === 'Disetujui' ? 'Lakukan transfer dan upload bukti bayar' : `ID Pesanan: STS-${id_sewa}`}
            </Text>
          </View>

          <View style={[styles.statusBadge,
            status_persetujuan === 'Disetujui' && styles.statusApproved,
            status_persetujuan === 'Menunggu' && styles.statusPending,
            status_persetujuan === 'Ditolak' && styles.statusRejected,
          ]}>
            <Text style={styles.statusBadgeText}>
              {status_persetujuan === 'Disetujui' ? 'DISETUJUI' :
               status_persetujuan === 'Menunggu' ? 'MENUNGGU' : 'DITOLAK'}
            </Text>
          </View>

          <View style={styles.equipmentCard}>
            <Image
              source={{ uri: itemImage as string }}
              style={styles.equipmentImage}
              defaultSource={{ uri: 'https://via.placeholder.com/60' }}
            />
            <View style={styles.equipmentInfo}>
              <Text style={styles.equipmentName}>{itemName as string}</Text>
              <Text style={styles.equipmentPrice}>
                {displayPrice(itemPrice)}
              </Text>
              <Text style={styles.projectName}>Proyek: {projectName as string}</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Ringkasan Pesanan</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Periode sewa</Text>
              <Text style={styles.summaryValue}>{formatDateRangeForDisplay(dateRange as string)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Lama sewa</Text>
              <Text style={styles.summaryValue}>{days} Hari</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Biaya</Text>
              <Text style={styles.summaryValue}>
                {displayPrice(itemPrice)}
              </Text>
            </View>
          </View>

          {renderContentByStatus()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles (tetap sama)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  headerContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  backButton: { padding: 8 },
  headerText: { fontSize: 16, fontWeight: 'bold', color: '#000000' },
  placeholder: { width: 40 },
  scrollView: { flex: 1 },
  mainCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, margin: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1,
    shadowRadius: 12, elevation: 8,
  },
  header: { marginBottom: 16, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#F59E0B', marginBottom: 6 },
  headerSubtitle: { fontSize: 12, color: '#9CA3AF' },
  statusBadge: { alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
  statusApproved: { backgroundColor: '#10B981' },
  statusPending: { backgroundColor: '#F59E0B' },
  statusRejected: { backgroundColor: '#DC2626' },
  statusBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  equipmentCard: {
    backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, flexDirection: 'row',
    alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0',
  },
  equipmentImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#E5E7EB', marginRight: 12 },
  equipmentInfo: { flex: 1 },
  equipmentName: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
  equipmentPrice: { fontSize: 12, color: '#F59E0B', fontWeight: '500', marginBottom: 4 },
  projectName: { fontSize: 11, color: '#6B7280' },
  summaryCard: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  summaryLabel: { fontSize: 13, color: '#6B7280' },
  summaryValue: { fontSize: 13, color: '#F59E0B', fontWeight: '500' },
  transferSection: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  transferTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  accountInfo: { marginBottom: 16 },
  accountLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  accountNumber: { fontSize: 16, fontWeight: 'bold', color: '#111827', letterSpacing: 1, marginBottom: 2 },
  accountBank: { fontSize: 12, color: '#6B7280' },
  amountBox: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FCD34D' },
  amountLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  amountValue: { fontSize: 16, fontWeight: 'bold', color: '#DC2626' },
  debugText: { fontSize: 10, color: '#666', marginTop: 4, fontStyle: 'italic' },
  uploadBox: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 30, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed', marginBottom: 12,
  },
  uploadBoxSuccess: { borderColor: '#10B981', borderStyle: 'solid', backgroundColor: '#F0FDF4' },
  uploadText: { fontSize: 14, color: '#9CA3AF', marginTop: 8 },
  uploadTextSuccess: { color: '#10B981', fontWeight: '500' },
  previewContainer: { alignItems: 'center', marginTop: 12 },
  previewImage: { width: 120, height: 120, borderRadius: 8, borderWidth: 2, borderColor: '#E5E7EB' },
  submitButton: {
    backgroundColor: '#FCD34D', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 12,
  },
  submitButtonDisabled: { backgroundColor: '#E5E7EB', opacity: 0.6 },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: '#78350F' },
  infoBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7',
    borderRadius: 8, padding: 12, marginBottom: 20,
  },
  infoText: { fontSize: 12, color: '#92400E', marginLeft: 8, flex: 1 },
  statusInfo: {
    alignItems: 'center', padding: 20, backgroundColor: '#F8FAFC',
    borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20,
  },
  statusTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginTop: 12, marginBottom: 8 },
  statusMessage: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  retryButton: { backgroundColor: '#FCD34D', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, marginTop: 16 },
  retryButtonText: { fontSize: 14, fontWeight: '600', color: '#78350F' },
});

export default NotificationDetail;