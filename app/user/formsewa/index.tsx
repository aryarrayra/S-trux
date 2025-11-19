import React, { useState } from 'react';
import { SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';

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

// ✅ FUNGSI API CREATE PENYEWAAN
const createPenyewaan = async (dataSewa) => {
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
      status_sewa: 'Menunggu Persetujuan'
    };

    console.log('📤 Payload yang dikirim ke backend:', payload);

    const response = await fetch(`${API_BASE_URL}/penyewaan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();
    console.log('📥 Response dari server:', responseData);
    
    if (!response.ok) {
      if (responseData.errors) {
        const errorMessages = Object.values(responseData.errors).flat().join(', ');
        throw new Error(`Validasi gagal: ${errorMessages}`);
      }
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    if (responseData.success) {
      return responseData.data;
    } else {
      throw new Error(responseData.message || 'Terjadi kesalahan tidak diketahui');
    }
  } catch (error) {
    console.error('❌ Error creating penyewaan:', error);
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
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ STATE UNTUK LOADING

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

  // ✅ FUNGSI UNTUK MENDAPATKAN DATA SEWA YANG SUDAH DIKONVERSI
  const getSewaDataForBackend = () => {
    return {
      idPelanggan: 1, // Ganti dengan ID user dari auth context
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
  };

  // ✅ VALIDASI STEP
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return true;
      
      case 2:
        if (!projectLocation || projectLocation.trim() === '') {
          Alert.alert(
            'Lokasi Belum Dipilih', 
            'Silakan pilih lokasi proyek terlebih dahulu.',
            [{ text: 'OK' }]
          );
          return false;
        }
        if (!projectName || projectName.trim() === '') {
          Alert.alert(
            'Nama Proyek Belum Diisi', 
            'Silakan isi nama proyek terlebih dahulu.',
            [{ text: 'OK' }]
          );
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

  const handleDocumentUpload = (files: any[]) => {
    setUploadedDocuments(files);
  };

  // ✅ HANDLE SUBMIT PENYEWAAN DARI TOMBOL FOOTER
  const handleSubmitPenyewaan = async () => {
    try {
      // ✅ TAMPILKAN LOADING
      setIsSubmitting(true);

      // ✅ VALIDASI FINAL SEBELUM SUBMIT
      if (!projectLocation || projectLocation.trim() === '') {
        Alert.alert(
          'Lokasi Belum Dipilih', 
          'Silakan pilih lokasi proyek terlebih dahulu sebelum mengajukan penyewaan.',
          [{ text: 'OK' }]
        );
        setIsSubmitting(false);
        return;
      }

      if (uploadedDocuments.length === 0) {
        Alert.alert(
          'Dokumen Belum Diupload', 
          'Silakan upload dokumen terlebih dahulu sebelum mengajukan penyewaan.',
          [{ text: 'OK' }]
        );
        setIsSubmitting(false);
        return;
      }

      console.log('🚀 Memulai submit penyewaan...');
      console.log('📊 Data yang akan dikirim:', getSewaDataForBackend());

      // Submit data penyewaan ke API
      const penyewaanResult = await createPenyewaan(getSewaDataForBackend());
      console.log('✅ Penyewaan berhasil:', penyewaanResult);

      // ✅ SET STATE UNTUK MODAL
      setSubmissionResult(penyewaanResult);
      setShowSuccessModal(true);

    } catch (error: any) {
      console.error('❌ Gagal submit penyewaan:', error);
      
      let errorMessage = error.message || 'Terjadi kesalahan tidak diketahui';
      
      if (errorMessage.includes('Validasi gagal')) {
        errorMessage = errorMessage.replace('Validasi gagal: ', '');
        Alert.alert(
          'Validasi Gagal', 
          `Data yang dimasukkan tidak valid:\n\n${errorMessage}`
        );
      } else {
        Alert.alert(
          'Gagal Mengajukan Penyewaan', 
          `${errorMessage}\n\nSilakan periksa data dan coba lagi.`
        );
      }
    } finally {
      // ✅ HILANGKAN LOADING
      setIsSubmitting(false);
    }
  };

  // ✅ HANDLE TOMBOL FOOTER (NEXT/SUBMIT)
  const handleFooterAction = () => {
    if (currentStep < 3) {
      handleNextStep(); // Lanjut ke step berikutnya
    } else {
      handleSubmitPenyewaan(); // Submit penyewaan di step 3
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
            // ✅ KIRIM DATA YANG SUDAH DIKONVERSI
            sewaData={getSewaDataForBackend()}
            
            // Props untuk UI/tampilan
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
            // ❌ HAPUS onSubmitSuccess karena sekarang submit dari footer
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