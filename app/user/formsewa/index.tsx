import React, { useState } from 'react';
import { SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import components
import { 
  Header, 
  ProgressBar, 
  ItemCard, 
  Footer,
  COLORS 
} from '@/components/user/commonComponents';
import { Step1PeriodeSewa } from './Step1PeriodeSewa';
import { Step2DetailProyek } from './Step2DetailProyek';
import { Step3Dokumen } from './Step3Dokumen';
import { MapModal } from '@/components/user/MapModal';
import { SuccessModal } from '@/components/user/SuccessModal';

// Import utility functions
import { formatDate, calculateDuration } from '@/utils/dateUtils';
import { API_BASE_URL } from '@/constants/ApiConfig';

// ✅ FUNGSI UNTUK UPLOAD FILE SEBENARNYA KE SERVER
// Di fungsi uploadFilesToServer - sesuaikan dengan ENUM database
const uploadFilesToServer = async (idSewa: number, documents: any[]) => {
  console.log('📁 [UPLOAD] Mulai upload file ke server...', { idSewa, documentCount: documents.length });
  
  const uploadedFiles = [];

  for (const [index, doc] of documents.entries()) {
    try {
      console.log(`📤 [UPLOAD ${index + 1}] Processing:`, {
        name: doc.name,
        type: doc.type,
        size: doc.size,
        hasBase64: !!doc.base64,
        base64Length: doc.base64?.length
      });

      // ✅ VALIDASI BASE64
      if (!doc.base64 || doc.base64.trim() === '') {
        console.error(`❌ [UPLOAD ${index + 1}] File ${doc.name} TIDAK memiliki base64 data`);
        uploadedFiles.push({
          id: Date.now(),
          nama: doc.name,
          status: 'failed',
          error: 'File tidak memiliki data base64'
        });
        continue;
      }

      // Bersihkan base64
      let cleanBase64 = doc.base64;
      if (doc.base64.includes('base64,')) {
        cleanBase64 = doc.base64.split('base64,')[1];
      }

      // ✅ SESUAIKAN DENGAN ENUM DATABASE
      const getDatabaseDocumentType = (fileName: string, mimeType: string): string => {
        const fileNameLower = fileName.toLowerCase();
        
        // Cek berdasarkan nama file
        if (fileNameLower.includes('surat') || fileNameLower.includes('pernyataan') || 
            fileNameLower.includes('kontrak') || fileNameLower.includes('sewa')) {
          return 'Surat_Pinjaman';
        }
        if (fileNameLower.includes('ktp')) {
          return 'KTP';
        }
        if (fileNameLower.includes('siup')) {
          return 'SIUP';
        }
        if (fileNameLower.includes('npwp')) {
          return 'NPWP';
        }
        
        // Cek berdasarkan MIME type
        if (mimeType.includes('pdf') || 
            mimeType.includes('msword') || 
            mimeType.includes('wordprocessingml')) {
          return 'Surat_Pinjaman'; // Dokumen dianggap sebagai surat pinjaman
        }
        if (mimeType.includes('image')) {
          return 'Lainnya'; // Gambar dianggap sebagai lainnya
        }
        
        // Default
        return 'Lainnya';
      };

      const dbDocType = getDatabaseDocumentType(doc.name, doc.type);
      console.log(`🔧 [UPLOAD ${index + 1}] Document type mapping: ${doc.type} -> ${dbDocType}`);

      // ✅ BUAT PAYLOAD DENGAN TIPE DOKUMEN YANG SESUAI ENUM
      const dokumenPayload = {
        id_sewa: idSewa,
        dokumen: [
          {
            nama_dokumen: doc.name,
            tipe_dokumen: dbDocType, // ✅ HARUS SESUAI ENUM: Surat_Pinjaman, KTP, SIUP, NPWP, Lainnya
            file_base64: cleanBase64,
            file_name: doc.name,
            file_size: doc.size || 0
          }
        ]
      };

      console.log(`🚀 [UPLOAD ${index + 1}] Uploading to server...`, {
        nama_dokumen: doc.name,
        tipe_dokumen: dbDocType,
        file_size: doc.size
      });

      const response = await fetch(`${API_BASE_URL}/penyewaan/${idSewa}/upload-dokumen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dokumenPayload),
        timeout: 30000
      });

      const responseText = await response.text();
      console.log(`📥 [UPLOAD ${index + 1}] Response:`, responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.warn(`⚠️ [UPLOAD ${index + 1}] Response bukan JSON:`, responseText);
        responseData = { success: false, message: 'Invalid response' };
      }

      if (response.ok && responseData.success) {
        console.log(`✅ [UPLOAD ${index + 1}] ${doc.name} uploaded successfully`);
        uploadedFiles.push({
          id: responseData.data?.dokumen_ids?.[0] || Date.now(),
          nama: doc.name,
          status: 'uploaded',
          server_id: responseData.data?.dokumen_ids?.[0]
        });
      } else {
        console.warn(`❌ [UPLOAD ${index + 1}] ${doc.name} upload failed:`, responseData.message);
        
        const errorDetail = responseData.errors || responseData.message || 'Unknown error';
        console.log(`🔍 [UPLOAD ${index + 1}] Error details:`, errorDetail);
        
        uploadedFiles.push({
          id: Date.now(),
          nama: doc.name,
          status: 'failed',
          error: errorDetail
        });
      }

    } catch (error) {
      console.error(`❌ [UPLOAD ${index + 1}] Error uploading ${doc.name}:`, error);
      uploadedFiles.push({
        id: Date.now(),
        nama: doc.name,
        status: 'error',
        error: error.message
      });
    }
  }

  console.log('📊 [UPLOAD] Upload summary:', {
    total: documents.length,
    success: uploadedFiles.filter(f => f.status === 'uploaded').length,
    failed: uploadedFiles.filter(f => f.status !== 'uploaded').length
  });

  return uploadedFiles;
};

// ✅ FUNGSI CREATE PENYEWAAN DENGAN UPLOAD FILE REAL
const createPenyewaanWithRealUpload = async (dataSewa: any, documents: any[]) => {
  console.log('🟡 [REAL UPLOAD] Membuat penyewaan dengan upload file sebenarnya...');

  // ✅ FUNGSI KONVERSI TANGGAL
  const convertToBackendDate = (dateString: string): string => {
    if (!dateString) return '';
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('⚠️ Format tanggal tidak dikenali:', dateString);
      return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  try {
    // 1. BUAT DATA PENYEWAAN DULU (TANPA DOKUMEN_DATA)
    const payloadPenyewaan = {
      id_pelanggan: dataSewa.idPelanggan,
      id_alat: dataSewa.idAlat,
      tanggal_sewa: convertToBackendDate(dataSewa.tanggalSewa),
      tanggal_kembali: convertToBackendDate(dataSewa.tanggalKembali),
      total_harga: parseFloat(dataSewa.totalHarga),
      nama_proyek: dataSewa.namaProyek || '',
      lokasi_proyek: dataSewa.lokasiProyek || '',
      deskripsi_proyek: dataSewa.deskripsiProyek || '',
      latitude: dataSewa.latitude ? parseFloat(dataSewa.latitude) : null,
      longitude: dataSewa.longitude ? parseFloat(dataSewa.longitude) : null,
      status_persetujuan: 'Menunggu',
      status_sewa: 'Menunggu Persetujuan',
      dokumen_data: JSON.stringify([]) // Kosongkan dulu
    };

    console.log('📤 [1] Creating penyewaan...');
    
    const responsePenyewaan = await fetch(`${API_BASE_URL}/penyewaan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadPenyewaan)
    });

    const responseTextPenyewaan = await responsePenyewaan.text();
    console.log('📥 [1] Response penyewaan:', responseTextPenyewaan);

    let responseDataPenyewaan;
    try {
      responseDataPenyewaan = JSON.parse(responseTextPenyewaan);
    } catch (e) {
      throw new Error('Response dari server tidak valid');
    }

    if (!responsePenyewaan.ok) {
      throw new Error(responseDataPenyewaan.message || 'Gagal membuat penyewaan');
    }

    const idSewa = responseDataPenyewaan.data.id_sewa;
    console.log('✅ [1] Create penyewaan BERHASIL dengan ID:', idSewa);

    // 2. UPLOAD FILE SEBENARNYA KE SERVER
    let uploadedDocuments = [];
    if (documents.length > 0) {
      console.log('📁 [2] Mulai upload file sebenarnya...');
      uploadedDocuments = await uploadFilesToServer(idSewa, documents);
    }

    // 3. RETURN RESULT
    const successCount = uploadedDocuments.filter(f => f.status === 'uploaded').length;
    
    return {
      id_sewa: idSewa,
      penyewaan: responseDataPenyewaan.data,
      dokumen_uploaded: uploadedDocuments,
      message: `Penyewaan berhasil diajukan! ${successCount}/${documents.length} file berhasil diupload.` +
        (successCount < documents.length ? ' Beberapa file gagal diupload.' : '')
    };

  } catch (error) {
    console.error('❌ [REAL UPLOAD] Error:', error);
    throw error;
  }
};

// ✅ FUNGSI FALLBACK: JIKA UPLOAD FILE GAGAL
const createPenyewaanSimple = async (dataSewa: any, documents: any[] = []) => {
  console.log('🟡 [SIMPLE] Menggunakan approach sederhana...');

  const convertToBackendDate = (dateString: string): string => {
    if (!dateString) return '';
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('⚠️ Format tanggal tidak dikenali:', dateString);
      return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  try {
    // Siapkan data dokumen untuk kolom dokumen_data
    const dokumenData = documents.map((doc, index) => ({
      id: index + 1,
      nama: doc.name,
      tipe: doc.type || 'Lainnya',
      size: doc.size || 0,
      uploaded_at: new Date().toISOString(),
      status: 'metadata_only',
      catatan: 'File perlu diupload manual oleh admin'
    }));

    const payload = {
      id_pelanggan: dataSewa.idPelanggan,
      id_alat: dataSewa.idAlat,
      tanggal_sewa: convertToBackendDate(dataSewa.tanggalSewa),
      tanggal_kembali: convertToBackendDate(dataSewa.tanggalKembali),
      total_harga: parseFloat(dataSewa.totalHarga),
      nama_proyek: dataSewa.namaProyek || '',
      lokasi_proyek: dataSewa.lokasiProyek || '',
      deskripsi_proyek: dataSewa.deskripsiProyek || '',
      latitude: dataSewa.latitude ? parseFloat(dataSewa.latitude) : null,
      longitude: dataSewa.longitude ? parseFloat(dataSewa.longitude) : null,
      status_persetujuan: 'Menunggu',
      status_sewa: 'Menunggu Persetujuan',
      dokumen_data: JSON.stringify(dokumenData)
    };

    console.log('📤 [SIMPLE] Payload dengan dokumen metadata:', payload);

    const response = await fetch(`${API_BASE_URL}/penyewaan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('📥 [SIMPLE] Response:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      throw new Error('Response dari server tidak valid');
    }

    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }

    if (!responseData.success) {
      throw new Error(responseData.message || 'Terjadi kesalahan tidak diketahui');
    }

    return {
      id_sewa: responseData.data.id_sewa,
      penyewaan: responseData.data,
      dokumen_uploaded: dokumenData,
      message: 'Penyewaan berhasil diajukan! Dokumen tersimpan sebagai metadata. Admin perlu mengupload file manual.'
    };

  } catch (error) {
    console.error('❌ [SIMPLE] Error:', error);
    throw error;
  }
};

export default function SewaFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  console.log('📦 Received params:', params);

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Equipment data from catalog
  const [selectedItem] = useState({
    id: params.productId as string || '1',
    name: params.productName as string || 'Excavator Caterpillar 3200D',
    price: params.productPrice as string || 'Rp 800.000/hari',
    image: params.productImage as string || 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Excavator',
    dailyRate: parseInt(params.dailyRate as string) || parseInt(params.hargaSewa as string) || 800000,
    category: params.productCategory as string || 'Excavator',
    kapasitas: params.kapasitas as string || '',
    deskripsi: params.deskripsi as string || ''
  });

  // Step 1 state
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date;
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Step 2 state
  const [projectName, setProjectName] = useState('Penggalian Gorong Gorong');
  const [projectLocation, setProjectLocation] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState<string>('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  // Step 3 state
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);

  // Calculations
  const duration = calculateDuration(startDate, endDate);
  const totalCost = selectedItem.dailyRate * duration;

  // ✅ FUNGSI FORMAT BACKEND
  const formatDateForBackend = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ✅ FUNGSI UNTUK MENDAPATKAN DATA SEWA
  const getSewaDataForBackend = async () => {
    try {
      const pelangganDataStr = await AsyncStorage.getItem('pelangganData');
      console.log('📦 Data pelanggan dari storage:', pelangganDataStr);
      
      let idPelanggan = 1;
      
      if (pelangganDataStr) {
        const pelangganData = JSON.parse(pelangganDataStr);
        idPelanggan = pelangganData.id_pelanggan || pelangganData.id || 1;
        console.log('✅ ID Pelanggan ditemukan:', idPelanggan);
      } else {
        console.log('⚠️ Data pelanggan tidak ditemukan, menggunakan fallback');
      }
      
      return {
        idPelanggan: idPelanggan,
        idAlat: parseInt(selectedItem.id),
        tanggalSewa: formatDateForBackend(startDate),
        tanggalKembali: formatDateForBackend(endDate),
        totalHarga: totalCost,
        namaProyek: projectName,
        lokasiProyek: projectLocation,
        deskripsiProyek: projectDescription,
        latitude: latitude,
        longitude: longitude
      };
    } catch (error) {
      console.error('❌ Error mengambil data pelanggan:', error);
      return {
        idPelanggan: 1,
        idAlat: parseInt(selectedItem.id),
        tanggalSewa: formatDateForBackend(startDate),
        tanggalKembali: formatDateForBackend(endDate),
        totalHarga: totalCost,
        namaProyek: projectName,
        lokasiProyek: projectLocation,
        deskripsiProyek: projectDescription,
        latitude: latitude,
        longitude: longitude
      };
    }
  };

  // ✅ VALIDASI STEP
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return true;
      
      case 2:
        if (!projectLocation || projectLocation.trim() === '') {
          Alert.alert('Lokasi Belum Dipilih', 'Silakan pilih lokasi proyek terlebih dahulu.');
          return false;
        }
        if (!projectName || projectName.trim() === '') {
          Alert.alert('Nama Proyek Belum Diisi', 'Silakan isi nama proyek terlebih dahulu.');
          return false;
        }
        return true;
      
      case 3:
        return true;
      
      default:
        return true;
    }
  };

  // Event handlers
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 2);

      if (selectedDate >= minDate) {
        setStartDate(selectedDate);
        if (endDate < selectedDate) {
          const newEndDate = new Date(selectedDate);
          newEndDate.setDate(newEndDate.getDate() + 1);
          setEndDate(newEndDate);
        }
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate && selectedDate > startDate) {
      setEndDate(selectedDate);
    }
  };

  const handleLocationSelect = (location: any) => {
    console.log('📍 Location selected:', location);
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    setAddress(location.address);
    setProjectLocation(location.name);
    setUseCurrentLocation(false);
  };

  const handleGetCurrentLocation = () => {
    setUseCurrentLocation(true);
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      if (validateStep(currentStep)) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  // ✅ HANDLE DOCUMENT UPLOAD DENGAN DEBUG
  const handleDocumentUpload = (files: any[]) => {
    console.log('📁 PARENT: Files received from Step3Dokumen:', files.length, 'files');
    
    // ✅ DEBUG DETAIL: CEK STRUKTUR SETIAP FILE
    files.forEach((file, index) => {
      console.log(`📄 File ${index + 1} DETAIL:`, {
        name: file.name,
        type: file.type,
        hasBase64: !!file.base64,
        base64Preview: file.base64 ? file.base64.substring(0, 50) + '...' : 'NO BASE64',
        base64Length: file.base64?.length,
        size: file.size,
        keys: Object.keys(file)
      });
    });

    setUploadedDocuments(files);
  };

  // ✅ HANDLE SUBMIT FINAL
  const handleSubmitPenyewaanFinal = async () => {
    try {
      console.log('🚀 ===== MULAI PROSES PENYEWAAN =====');
      setIsSubmitting(true);

      // Validasi
      if (!projectLocation || projectLocation.trim() === '') {
        Alert.alert('Lokasi Belum Dipilih', 'Silakan pilih lokasi proyek terlebih dahulu.');
        setIsSubmitting(false);
        return;
      }

      if (uploadedDocuments.length === 0) {
        Alert.alert('Dokumen Belum Diupload', 'Silakan upload dokumen terlebih dahulu.');
        setIsSubmitting(false);
        return;
      }

      console.log('🔍 DEBUG uploadedDocuments sebelum submit:', uploadedDocuments);
      
      // 1. Dapatkan data sewa
      const sewaData = await getSewaDataForBackend();
      console.log('👤 Data sewa:', sewaData);

      // 2. ✅ COBA UPLOAD FILE SEBENARNYA DULU
      let result;
      try {
        console.log('📝 Mencoba upload file sebenarnya...');
        result = await createPenyewaanWithRealUpload(sewaData, uploadedDocuments);
      } catch (error) {
        console.log('🔄 Fallback: menggunakan approach sederhana...');
        result = await createPenyewaanSimple(sewaData, uploadedDocuments);
      }
      
      console.log('🎉 PROSES BERHASIL!');
      
      setSubmissionResult({
        penyewaan: result.penyewaan,
        dokumen: result.dokumen_uploaded,
        message: result.message
      });
      
      setShowSuccessModal(true);

    } catch (error: any) {
      console.error('❌ Gagal submit penyewaan:', error);
      
      let errorMessage = 'Terjadi kesalahan tidak diketahui';
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Gagal Mengajukan Penyewaan', errorMessage);
    } finally {
      console.log('🏁 Proses selesai');
      setIsSubmitting(false);
    }
  };

  // ✅ HANDLE TOMBOL FOOTER (NEXT/SUBMIT)
  const handleFooterAction = async () => {
    if (currentStep < 3) {
      handleNextStep();
    } else {
      await handleSubmitPenyewaanFinal();
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    router.push('/user/(tabs)/katalog');
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1PeriodeSewa
            startDate={startDate}
            endDate={endDate}
            showStartPicker={showStartPicker}
            showEndPicker={showEndPicker}
            duration={duration}
            dailyRate={selectedItem.dailyRate}
            totalCost={totalCost}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            onShowStartPicker={() => setShowStartPicker(true)}
            onShowEndPicker={() => setShowEndPicker(true)}
            formatDate={formatDate}
          />
        );

      case 2:
        return (
          <Step2DetailProyek
            projectName={projectName}
            projectLocation={projectLocation}
            projectDescription={projectDescription}
            latitude={latitude}
            longitude={longitude}
            address={address}
            useCurrentLocation={useCurrentLocation}
            onProjectNameChange={setProjectName}
            onProjectDescriptionChange={setProjectDescription}
            onGetCurrentLocation={handleGetCurrentLocation}
            onShowMapModal={() => setShowMapModal(true)}
            onLocationSelect={handleLocationSelect}
          />
        );

      case 3:
        return (
          <Step3Dokumen
            sewaData={getSewaDataForBackend()}
            startDate={formatDate(startDate)}
            endDate={formatDate(endDate)}
            duration={duration}
            projectName={projectName}
            projectLocation={projectLocation}
            projectDescription={projectDescription}
            latitude={latitude}
            longitude={longitude}
            totalCost={totalCost}
            equipmentName={selectedItem.name}
            dailyRate={selectedItem.dailyRate}
            uploadedDocuments={uploadedDocuments}
            onDocumentUpload={handleDocumentUpload}
          />
        );

      default:
        return null;
    }
  };

  // ✅ CONDITION UNTUK TOMBOL NEXT DI STEP 3
  const isStep3Complete = uploadedDocuments.length > 0;

  return (
    <SafeAreaView style={[
      { flex: 1, backgroundColor: COLORS.background },
      Platform.OS === 'android' && { paddingTop: StatusBar.currentHeight + 10 }
    ]}>
      <StatusBar 
        backgroundColor={COLORS.background} 
        barStyle="dark-content" 
        translucent={false}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ 
            paddingBottom: 120,
            paddingTop: Platform.OS === 'android' ? 10 : 0
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Header currentStep={currentStep} onBack={handleBackStep} />
          <ProgressBar currentStep={currentStep} totalSteps={3} />
          
          <ItemCard
            imageUrl={selectedItem.image}
            name={selectedItem.name}
            price={`Rp ${selectedItem.dailyRate.toLocaleString('id-ID')}/hari`}
          />

          {renderStepContent()}
        </ScrollView>

        <Footer
          currentStep={currentStep}
          onBack={handleBackStep}
          onNext={handleFooterAction}
          isNextDisabled={(currentStep === 3 && !isStep3Complete) || isSubmitting}
          isLoading={isSubmitting}
        />
      </KeyboardAvoidingView>

      <MapModal
        visible={showMapModal}
        onClose={() => setShowMapModal(false)}
        onLocationSelect={handleLocationSelect}
      />

      <SuccessModal
        visible={showSuccessModal}
        equipmentName={selectedItem.name}
        uploadedDocuments={uploadedDocuments}
        submissionResult={submissionResult}
        onConfirm={handleSuccessConfirm}
      />
    </SafeAreaView>
  );
}