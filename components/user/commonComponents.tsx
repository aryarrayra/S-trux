import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
    TextInput,
    Platform,
} from 'react-native';
import { Calendar, MapPin, FileText, Download, Upload, ChevronLeft } from 'lucide-react-native';


export const COLORS = {
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

export const ProgressBar = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
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

export const DateInput = ({
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

export const LocationInput = ({
  label,
  value,
  onPress,
  latitude,
  longitude,
  address
}: {
  label: string;
  value: string;
  onPress: () => void;
  latitude?: number;
  longitude?: number;
  address?: string;
}) => (
  <TouchableOpacity onPress={onPress}>
    <View style={styles.locationInputContainer}>
      <Text style={styles.locationInputLabel}>{label}</Text>
      <View style={styles.locationInputField}>
        <MapPin color={COLORS.black} size={20} style={{ marginRight: 10 }} />
        <View style={styles.locationTextContainer}>
          <Text style={styles.locationInputText}>
            {address || value || 'Pilih lokasi di peta'}
          </Text>
          {latitude && longitude && (
            <Text style={styles.coordinatesText}>
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </Text>
          )}
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export const ProjectInput = ({
  label,
  placeholder = '',
  multiline = false,
  numberOfLines = 1,
  value,
  onChangeText
}: {
  label: string;
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
      placeholder={placeholder}
      placeholderTextColor={COLORS.textGray}
      multiline={multiline}
      numberOfLines={numberOfLines}
      value={value}
      onChangeText={onChangeText}
    />
  </View>
);

export const ItemCard = ({
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

export const Header = ({ 
  currentStep, 
  onBack 
}: { 
  currentStep: number; 
  onBack: () => void;
}) => (
  <View style={[styles.header, Platform.OS === 'android' && { marginTop: 30 }]}>
    <TouchableOpacity onPress={onBack} style={styles.backButtonHeader}>
      <ChevronLeft color={COLORS.black} size={28} />
    </TouchableOpacity>
    <View style={styles.headerTitleContainer}>
      <Text style={styles.headerTitle}>Pengajuan Sewa</Text>
      <Text style={styles.headerSubtitle}>Langkah {currentStep} dari 3</Text>
    </View>
  </View>
);

export const Footer = ({
  currentStep,
  onBack,
  onNext,
  isNextDisabled = false
}: {
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
}) => (
  <View style={styles.footer}>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <Text style={styles.buttonText}>
        {currentStep === 1 ? 'Kembali' : 'Kembali'}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[
        styles.nextButton,
        isNextDisabled && styles.nextButtonDisabled
      ]}
      onPress={onNext}
      disabled={isNextDisabled}
    >
      <Text style={[
        styles.buttonText,
        isNextDisabled && styles.nextButtonTextDisabled
      ]}>
        {currentStep === 3 ? 'Ajukan Sewa' : 'Selanjutnya'}
      </Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButtonHeader: {
    padding: 4,
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

  // Progress Bar
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

  // Item Card
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

  // Form Inputs
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

  locationInputContainer: {
    marginHorizontal: 31,
    marginVertical: 12,
  },
  locationInputLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.black,
    marginBottom: 4,
  },
  locationInputField: {
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
  locationTextContainer: {
    flex: 1,
  },
  locationInputText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.black,
  },
  coordinatesText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.textGray,
    marginTop: 2,
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

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingTop: 10,
    backgroundColor: COLORS.background,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  backButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  nextButton: {
    backgroundColor: COLORS.yellow,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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