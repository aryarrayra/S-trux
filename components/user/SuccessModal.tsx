import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { COLORS } from '@/components/user/commonComponents';

interface SuccessModalProps {
  visible: boolean;
  equipmentName: string;
  uploadedDocuments: string[];
  onConfirm: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  equipmentName,
  uploadedDocuments,
  onConfirm,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onConfirm}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.successModal}>
          <View style={styles.successIconContainer}>
            <CheckCircle size={64} color={COLORS.orange} />
          </View>

          <Text style={styles.successTitle}>
            Pengajuan Berhasil!
          </Text>

          <Text style={styles.successMessage}>
            Pengajuan sewa {equipmentName} berhasil dikirim. 
            Silakan tunggu konfirmasi dari admin.
            {uploadedDocuments.length > 0 && (
              ` Dokumen yang diunggah: ${uploadedDocuments.join(', ')}`
            )}
          </Text>

          <TouchableOpacity
            style={styles.successButton}
            onPress={onConfirm}
          >
            <Text style={styles.successButtonText}>Kembali ke Katalog</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModal: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: COLORS.orange,
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  successButton: {
    backgroundColor: COLORS.yellow,
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 12,
    minWidth: 120,
  },
  successButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'center',
  },
};