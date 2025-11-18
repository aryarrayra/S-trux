import React, { useState } from 'react';
import { SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
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

export default function SewaFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  console.log('📦 Received params:', params); // Debug params

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  // Equipment data from catalog - dengan fallback yang lebih baik
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
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);

  // Calculations
  const duration = calculateDuration(startDate, endDate);
  const totalCost = selectedItem.dailyRate * duration;

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

  // HAPUS simulated location dan biarkan Step2 yang handle real location
  const handleGetCurrentLocation = () => {
    // Function ini sekarang hanya untuk trigger state change
    // Real location handling dilakukan di Step2DetailProyek
    setUseCurrentLocation(true);
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowSuccessModal(true);
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleDocumentUpload = (files: string[]) => {
    setUploadedDocuments(files);
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

  const isStep3Complete = currentStep === 3 && uploadedDocuments.length > 0;

  return (
    <SafeAreaView style={[
      { flex: 1, backgroundColor: COLORS.background },
      Platform.OS === 'android' && { paddingTop: StatusBar.currentHeight + 10 } // TAMBAH EXTRA PADDING
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
            paddingTop: Platform.OS === 'android' ? 10 : 0 // TAMBAH PADDING TOP
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
          onNext={handleNextStep}
          isNextDisabled={currentStep === 3 && !isStep3Complete}
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
        onConfirm={handleSuccessConfirm}
      />
    </SafeAreaView>
  );
}