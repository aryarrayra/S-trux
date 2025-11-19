import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HistoryDetailScreen = ({ navigation }) => {
  const terms = [
    {
      text: 'Penyewa wajib menggunakan alat berat sesuai dengan spesifikasi dan tuntunynya'
    },
    {
      text: 'Penyewa dilarang mengubah struktur atau penyewa menjadi tanggung jawab penyewa'
    },
    {
      text: 'Alat berat harus dikembalikan dalam kondisi yang sama seperti saat diterima'
    },
    {
      text: 'Pembayaran dilakukan sebelum alat berat digunakan tanggung jawab'
    },
    {
      text: 'Penyewa bertanggung jawab atas keselamatan operator dan pekerja'
    },
    {
      text: 'Penyewa wajib melakukan maintenance rutin sesuai jadwal operasi'
    },
    {
      text: 'Biaya bahan bakar dan pelumas ditanggung oleh penyewa selama masa sewa, termasuk biaya operator jika diperlukan seperti Pembaatan & Pengembalian'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#F59E0B" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Persetujuan Kontrak</Text>
          <Text style={styles.headerSubtitle}>Status: Menunggu</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Contract Card */}
        <View style={styles.contractCard}>
          <Ionicons name="document-text-outline" size={56} color="#FFFFFF" />
          <Text style={styles.contractTitle}>Kontrak Penyewaan</Text>
          <Text style={styles.contractSubtitle}>& Terms STSLegalson</Text>
        </View>

        {/* Equipment Info */}
        <View style={styles.equipmentCard}>
          <Image
            source={{ uri: 'https://via.placeholder.com/60' }}
            style={styles.equipmentImage}
          />
          <View style={styles.equipmentInfo}>
            <Text style={styles.equipmentName}>Excavator Caterpillar 320XD</Text>
            <Text style={styles.equipmentPrice}>Rp 800.000/hari</Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Ringkasan Pesanan</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Periode sewa</Text>
            <Text style={styles.summaryValue}>9 Hari</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Harga Sewa Per hari</Text>
            <Text style={styles.summaryValue}>Rp 800.000</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Biaya</Text>
            <Text style={styles.totalValue}>Rp 13.600.000</Text>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsCard}>
          <Text style={styles.termsTitle}>Syarat dan ketentuan</Text>
          
          <View style={styles.termsList}>
            <Text style={styles.termsSubtitle}>Ketentuan Sewa</Text>
            {terms.map((term, index) => (
              <View key={index} style={styles.termItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.termText}>{term.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  contractCard: {
    backgroundColor: '#FCD34D',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  termsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  termsList: {
    gap: 12,
  },
  termsSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#111827',
    marginRight: 8,
    marginTop: 2,
  },
  termText: {
    flex: 1,
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
});

export default HistoryDetailScreen;