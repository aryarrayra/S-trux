import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Calendar, Download, Upload, FileText } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

const COLORS = {
  background: '#F4F4F4',
  white: '#FFFFFF',
  black: '#000000',
  textGray: '#978D8D',
  primary: '#29F3C0',
  inactiveGray: '#D9D9D9',
  orange: '#F39F29',
  yellow: '#FDCB41',
  lightGray: '#E5E5E5',
  disabledYellow: '#FDEBB8',
  disabledText: '#B8B8B8',
};

const ProgressBar = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <View style={styles.progressBarContainer}>
    {Array.from({ length: totalSteps }).map((_, index) => (
      <View
        key={index}
        style={[
          styles.progressBarStep,
          { backgroundColor: index < currentStep ? COLORS.primary : COLORS.inactiveGray },
        ]}
      />
    ))}
  </View>
);

const DateInput = ({ 
  label, 
  value, 
  onPress 
}: { 
  label: string; 
  value: string;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress}>
    <View style={styles.dateInputContainer}>
      <Text style={styles.dateInputLabel}>{label}</Text>
      <View style={styles.dateInputField}>
        <Calendar color={COLORS.black} size={20} style={{ marginRight: 10 }} />
        <Text style={styles.dateInputText}>{value}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const ProjectInput = ({ 
  label, 
  defaultValue = '',
  placeholder = '',
  multiline = false,
  numberOfLines = 1,
  value,
  onChangeText
}: { 
  label: string;
  defaultValue?: string;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  value?: string;
  onChangeText?: (text: string) => void;
}) => (
  <View style={styles.projectInputContainer}>
    <Text style={styles.projectInputLabel}>{label}</Text>
    <TextInput
      style={[
        styles.projectInputField,
        multiline && styles.multilineInput,
      ]}
      defaultValue={defaultValue}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textGray}
      multiline={multiline}
      numberOfLines={numberOfLines}
      value={value}
      onChangeText={onChangeText}
    />
  </View>
);

const ItemCard = ({ 
  imageUrl, 
  name, 
  price 
}: { 
  imageUrl: string; 
  name: string; 
  price: string;
}) => (
  <View style={styles.itemCard}>
    <Image source={{ uri: imageUrl }} style={styles.itemImage} />
    <View style={styles.itemDetails}>
      <Text style={styles.itemName}>{name}</Text>
      <Text style={styles.itemPrice}>{price}</Text>
    </View>
  </View>
);

const SummaryCard = ({ startDate, endDate, duration, projectName, projectLocation }: any) => (
  <View style={styles.summaryCard}>
    <Text style={styles.summaryCardTitle}>Ringkasan Sewa</Text>
    
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Tanggal Mulai</Text>
      <Text style={styles.summaryValue}>{startDate}</Text>
    </View>
    
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Tanggal Selesai</Text>
      <Text style={styles.summaryValue}>{endDate}</Text>
    </View>
    
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Durasi</Text>
      <Text style={styles.summaryValue}>{duration} hari</Text>
    </View>
    
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Nama Proyek</Text>
      <Text style={styles.summaryValue}>{projectName}</Text>
    </View>
    
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Lokasi</Text>
      <Text style={styles.summaryValue}>{projectLocation}</Text>
    </View>
    
    <View style={[styles.summaryRow, { marginTop: 8 }]}>
      <Text style={styles.totalLabel}>Total Biaya</Text>
      <Text style={styles.totalValue}>Rp {800000 * duration}</Text>
    </View>
  </View>
);

const ProjectDetailsCard = ({ projectName, projectLocation, projectDescription }: any) => (
  <View style={styles.detailsCard}>
    <Text style={styles.detailsCardTitle}>Detail Proyek</Text>
    
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>Nama Proyek</Text>
      <Text style={styles.detailValue}>{projectName}</Text>
    </View>
    
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>Lokasi Proyek</Text>
      <Text style={styles.detailValue}>{projectLocation}</Text>
    </View>
    
    {projectDescription ? (
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Deskripsi Proyek</Text>
        <Text style={styles.detailValue}>{projectDescription}</Text>
      </View>
    ) : null}
  </View>
);

const DocumentDownloadCard = () => (
  <View style={styles.documentCard}>
    <Text style={styles.documentCardTitle}>Dokumen untuk Diunduh</Text>
    <Text style={styles.documentCardSubtitle}>Unduh dan isi dokumen di bawah ini</Text>
    
    <TouchableOpacity style={styles.downloadButton}>
      <FileText color={COLORS.black} size={20} />
      <View style={styles.downloadTextContainer}>
        <Text style={styles.downloadTitle}>Surat Pernyataan</Text>
        <Text style={styles.downloadSubtitle}>PDF - 245 KB</Text>
      </View>
      <Download color={COLORS.black} size={20} />
    </TouchableOpacity>
    
    <TouchableOpacity style={styles.downloadButton}>
      <FileText color={COLORS.black} size={20} />
      <View style={styles.downloadTextContainer}>
        <Text style={styles.downloadTitle}>Surat Kontrak Sewa</Text>
        <Text style={styles.downloadSubtitle}>PDF - 345 KB</Text>
      </View>
      <Download color={COLORS.black} size={20} />
    </TouchableOpacity>
  </View>
);

const DocumentUploadCard = ({ onUpload }: { onUpload?: () => void }) => (
  <View style={styles.documentCard}>
    <Text style={styles.documentCardTitle}>Unggah Dokumen</Text>
    <Text style={styles.documentCardSubtitle}>Unggah dokumen yang telah diisi</Text>
    
    <TouchableOpacity style={styles.uploadButton} onPress={onUpload}>
      <Upload color={COLORS.black} size={24} />
      <Text style={styles.uploadText}>Unggah Dokumen</Text>
      <Text style={styles.uploadSubtext}>PDF, JPG, PNG (Max. 5MB)</Text>
    </TouchableOpacity>
  </View>
);

// Fungsi untuk memformat tanggal
const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('id-ID', options);
};

// Fungsi untuk menghitung durasi dalam hari
const calculateDuration = (startDate: Date, endDate: Date) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / oneDay));
  return diffDays;
};

export default function SewaFormScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  
  // State untuk step 1 (Periode Sewa)
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

  // State untuk step 2 (Detail Proyek)
  const [projectName, setProjectName] = useState('Penggalian Gorong Gorong');
  const [projectLocation, setProjectLocation] = useState('Jalan Bambu Hitam, jakarta timur');
  const [projectDescription, setProjectDescription] = useState('');

  // State untuk step 3 (Dokumen)
  const [documentsUploaded, setDocumentsUploaded] = useState(false);

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
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
    setShowEndPicker(false);
    if (selectedDate && selectedDate > startDate) {
      setEndDate(selectedDate);
    }
  };

  const duration = calculateDuration(startDate, endDate);

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form
      console.log('Form submitted');
      router.push('/success'); // Navigate to success screen
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleDocumentUpload = () => {
    // Simulate document upload
    setDocumentsUploaded(true);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <View style={styles.periodeSewaContainer}>
              <Text style={styles.periodeSewaTitle}>Periode Sewa</Text>
              <Text style={styles.periodeSewaInfo}>
                Anda hanya dapat memesan alat berat 2 hari sesudah hari ini
              </Text>
            </View>

            <DateInput 
              label="Tanggal Mulai" 
              value={formatDate(startDate)} 
              onPress={() => setShowStartPicker(true)}
            />
            
            <DateInput 
              label="Tanggal Selesai" 
              value={formatDate(endDate)} 
              onPress={() => setShowEndPicker(true)}
            />

            <View style={styles.durationContainer}>
              <Text style={styles.durationText}>Durasi Sewa {duration} hari</Text>
            </View>

            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={handleStartDateChange}
                minimumDate={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)}
              />
            )}

            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={handleEndDateChange}
                minimumDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)}
              />
            )}
          </>
        );

      case 2:
        return (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Detail Proyek</Text>
            <ProjectInput
              label="Nama Proyek"
              value={projectName}
              onChangeText={setProjectName}
            />
            <ProjectInput
              label="Lokasi Proyek"
              value={projectLocation}
              onChangeText={setProjectLocation}
            />
            <ProjectInput
              label="Deskripsi Proyek"
              placeholder="jelaskan kebutuhan dan penggunaan alat berat"
              multiline
              numberOfLines={4}
              value={projectDescription}
              onChangeText={setProjectDescription}
            />
          </View>
        );

      case 3:
        return (
          <>
            <View style={styles.section}>
              <SummaryCard 
                startDate={formatDate(startDate)}
                endDate={formatDate(endDate)}
                duration={duration}
                projectName={projectName}
                projectLocation={projectLocation}
              />
            </View>
            
            <View style={styles.section}>
              <ProjectDetailsCard 
                projectName={projectName}
                projectLocation={projectLocation}
                projectDescription={projectDescription}
              />
            </View>
            
            <View style={styles.section}>
              <DocumentDownloadCard />
            </View>
            
            <View style={styles.section}>
              <DocumentUploadCard onUpload={handleDocumentUpload} />
            </View>
          </>
        );

      default:
        return null;
    }
  };

  const isStep3Complete = currentStep === 3 && documentsUploaded;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackStep}>
              <ChevronLeft color={COLORS.black} size={28} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Pengajuan Sewa</Text>
              <Text style={styles.headerSubtitle}>Langkah {currentStep} dari 3</Text>
            </View>
          </View>

          <ProgressBar currentStep={currentStep} totalSteps={3} />

          <ItemCard
            imageUrl="https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/bfea/564f/04fbd48ded688b16d060f50826d834a8?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qoWqP35~z1Moit1wyhoaXC9dMb7wCHPojQy~l3uuG3Vv32CrSn-ckTaSlAQZIHz6DFi9a8L~L~I0EqqP~OcmUSPgLgqanCQEXIcMoGXW8~cWZpQ1VmtsoPUqHBcgKHLoqTbwYqvbvPyn0WWnMamIvkikbcsXixjIJaUfGIMb8V5-sBDCXMNnyT3eDgLODT5ESYcqcQ1JRIzQRklBtjZxA9oGjcmSshLfiEUkgCjJuZEBWWFPk3FK4jW~eZIub475KF2dM6zSCZ-gv7g~JDJRSmRHf2IPv8KoVZNPFtj18Ox1O30zITQnyGP2jlbdRP1d1NGWV9-25Udfr~miS6D9mQ__"
            name="Excavator Caterpillar 3200D"
            price="Rp 800.000/hari"
          />

          {renderStepContent()}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[
              styles.backButton, 
              currentStep === 1 && styles.singleButton
            ]} 
            onPress={handleBackStep}
          >
            <Text style={styles.buttonText}>
              {currentStep === 1 ? 'Kembali' : 'Kembali'}
            </Text>
          </TouchableOpacity>
          
          {currentStep > 1 && (
            <TouchableOpacity 
              style={[
                styles.nextButton,
                currentStep === 3 && !isStep3Complete && styles.nextButtonDisabled
              ]} 
              onPress={handleNextStep}
              disabled={currentStep === 3 && !isStep3Complete}
            >
              <Text style={[
                styles.buttonText,
                currentStep === 3 && !isStep3Complete && styles.nextButtonTextDisabled
              ]}>
                {currentStep === 3 ? 'Ajukan Sewa' : 'Selanjutnya'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitleContainer: {
    marginLeft: 18,
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.black,
  },
  headerSubtitle: {
    fontFamily: 'Poppins_300Light',
    fontSize: 12,
    color: COLORS.textGray,
  },
  progressBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 34,
  },
  progressBarStep: {
    flex: 1,
    height: 4,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginHorizontal: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  itemDetails: {
    marginLeft: 12,
    flex: 1,
  },
  itemName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.black,
  },
  itemPrice: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.orange,
    marginTop: 4,
  },
  periodeSewaContainer: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 10,
  },
  periodeSewaTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.black,
  },
  periodeSewaInfo: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.black,
    marginTop: 4,
    lineHeight: 18,
  },
  dateInputContainer: {
    marginHorizontal: 31,
    marginVertical: 12,
  },
  dateInputLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.black,
    marginBottom: 4,
  },
  dateInputField: {
    backgroundColor: COLORS.yellow,
    borderRadius: 5,
    paddingHorizontal: 11,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  dateInputText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.black,
  },
  durationContainer: {
    marginHorizontal: 50,
    marginTop: 38,
    padding: 8,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: COLORS.yellow,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  durationText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: COLORS.orange,
  },
  detailsContainer: {
    marginTop: 38,
  },
  detailsTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.black,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  projectInputContainer: {
    marginHorizontal: 20,
    marginVertical: 8,
  },
  projectInputLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.black,
    marginBottom: 4,
  },
  projectInputField: {
    backgroundColor: COLORS.white,
    borderRadius: 5,
    paddingHorizontal: 11,
    paddingVertical: 10,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  section: {
    marginTop: 34,
    marginHorizontal: 31,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  summaryCardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textGray,
  },
  summaryValue: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.black,
  },
  totalLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.black,
  },
  totalValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.orange,
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  detailsCardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 12,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textGray,
    marginBottom: 4,
  },
  detailValue: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.black,
  },
  documentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  documentCardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 4,
  },
  documentCardSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textGray,
    marginBottom: 16,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
    padding: 12,
    marginBottom: 8,
  },
  downloadTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  downloadTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.black,
  },
  downloadSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.textGray,
    marginTop: 2,
  },
  uploadButton: {
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    borderRadius: 5,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.orange,
    borderStyle: 'dashed',
  },
  uploadText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.black,
    marginTop: 8,
  },
  uploadSubtext: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.textGray,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
    backgroundColor: COLORS.background,
  },
  backButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
  },
  singleButton: {
    marginRight: 0,
  },
  nextButton: {
    backgroundColor: COLORS.yellow,
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 10,
  },
  nextButtonDisabled: {
    backgroundColor: COLORS.disabledYellow,
  },
  buttonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.black,
  },
  nextButtonTextDisabled: {
    color: COLORS.disabledText,
  },
});