import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { COLORS } from '@/components/user/commonComponents';

// SuccessModal.tsx - Update untuk tampilkan data dari submission
interface SuccessModalProps {
  visible: boolean;
  equipmentName: string;
  uploadedDocuments: any[];
  submissionResult?: any;
  onConfirm: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  equipmentName,
  uploadedDocuments,
  submissionResult,
  onConfirm
}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.successModal}>
          <View style={styles.successIconContainer}>
            <CheckCircle size={64} color={COLORS.green} />
          </View>
          
          <Text style={styles.successTitle}>Penyewaan Berhasil Diajukan!</Text>
          
          {/* ✅ TAMPILKAN DATA DARI DATABASE JIKA ADA */}
          {submissionResult && (
            <View style={styles.submissionInfo}>
              <Text style={styles.infoText}>
                ID Sewa: <Text style={styles.infoValue}>{submissionResult.id_sewa || 'N/A'}</Text>
              </Text>
              <Text style={styles.infoText}>
                Status: <Text style={styles.infoValue}>{submissionResult.status_persetujuan || 'Menunggu'}</Text>
              </Text>
              <Text style={styles.infoText}>
                Tanggal Pengajuan: <Text style={styles.infoValue}>
                  {submissionResult.created_at 
                    ? new Date(submissionResult.created_at).toLocaleDateString('id-ID')
                    : new Date().toLocaleDateString('id-ID')
                  }
                </Text>
              </Text>
            </View>
          )}
          
          <Text style={styles.successMessage}>
            Penyewaan {equipmentName} berhasil diajukan dan sedang menunggu persetujuan.
          </Text>
          
          {uploadedDocuments.length > 0 && (
            <Text style={styles.documentsText}>
              {uploadedDocuments.length} dokumen berhasil diupload
            </Text>
          )}
          
          <TouchableOpacity style={styles.successButton} onPress={onConfirm}>
            <Text style={styles.successButtonText}>Kembali ke Katalog</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 16,
  },
  submissionInfo: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  infoText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textGray,
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: 'Poppins_600SemiBold',
    color: COLORS.black,
  },
  documentsText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.green,
    marginBottom: 16,
    textAlign: 'center',
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
});