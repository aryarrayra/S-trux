import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { COLORS } from '../../constants/Colors';
import { router } from 'expo-router';

export default function TermsConditionsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Syarat & Ketentuan</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.card}>
            <Text style={styles.title}>Syarat dan Ketentuan Penggunaan S`Trux</Text>
            <Text style={styles.lastUpdated}>Terakhir diperbarui: 1 Desember 2024</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Penerimaan Syarat</Text>
              <Text style={styles.sectionText}>
                Dengan mengakses dan menggunakan aplikasi S`Trux, Anda setuju untuk terikat oleh syarat dan ketentuan yang diatur di bawah ini. Jika Anda tidak setuju dengan syarat dan ketentuan ini, harap jangan menggunakan aplikasi kami.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Definisi</Text>
              <Text style={styles.sectionText}>
                <Text style={styles.bold}>• Kami</Text> merujuk pada PT S`Trux Indonesia{'\n'}
                <Text style={styles.bold}>• Aplikasi</Text> merujuk pada aplikasi mobile S`Trux{'\n'}
                <Text style={styles.bold}>• Pengguna</Text> merujuk pada individu yang menggunakan aplikasi{'\n'}
                <Text style={styles.bold}>• Layanan</Text> merujuk pada layanan penyewaan truk yang disediakan
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Pendaftaran Akun</Text>
              <Text style={styles.sectionText}>
                • Anda harus berusia minimal 21 tahun untuk mendaftar{'\n'}
                • Informasi yang diberikan harus akurat dan lengkap{'\n'}
                • Anda bertanggung jawab atas kerahasiaan akun Anda{'\n'}
                • Setiap aktivitas yang dilakukan melalui akun Anda menjadi tanggung jawab Anda
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Layanan Penyewaan</Text>
              <Text style={styles.sectionText}>
                • Harga sewaktu-waktu dapat berubah tanpa pemberitahuan{'\n'}
                • Pembatalan pesanan dapat dikenakan biaya{'\n'}
                • Durasi sewa dihitung berdasarkan waktu pemesanan{'\n'}
                • Kerusakan kendaraan menjadi tanggung jawab penyewa
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Pembayaran</Text>
              <Text style={styles.sectionText}>
                • Pembayaran dilakukan secara digital melalui aplikasi{'\n'}
                • Metode pembayaran yang tersedia dapat berubah{'\n'}
                • Setiap transaksi bersifat final dan tidak dapat dibatalkan{'\n'}
                • Pajak dan biaya tambahan akan dikenakan sesuai ketentuan
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Batasan Tanggung Jawab</Text>
              <Text style={styles.sectionText}>
                Kami tidak bertanggung jawab atas:{'\n'}
                • Keterlambatan yang disebabkan oleh kondisi lalu lintas{'\n'}
                • Kerusakan barang yang diangkut{'\n'}
                • Kehilangan barang selama pengiriman{'\n'}
                • Force majeure dan kejadian di luar kendali kami
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Hak Kekayaan Intelektual</Text>
              <Text style={styles.sectionText}>
                Seluruh konten, fitur, dan fungsi dalam aplikasi ini adalah milik PT S`Trux Indonesia dan dilindungi oleh hukum hak cipta, merek dagang, dan hukum lainnya.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Perubahan Syarat</Text>
              <Text style={styles.sectionText}>
                Kami berhak mengubah syarat dan ketentuan ini kapan saja. Perubahan akan efektif setelah diposting di aplikasi. Penggunaan berkelanjutan setelah perubahan berarti Anda menerima syarat yang baru.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. Hukum yang Berlaku</Text>
              <Text style={styles.sectionText}>
                Syarat dan ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. Setiap sengketa akan diselesaikan melalui pengadilan yang berwenang di Jakarta.
              </Text>
            </View>

            <View style={styles.contactSection}>
              <Text style={styles.contactTitle}>Hubungi Kami</Text>
              <Text style={styles.contactText}>
                Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi:{'\n\n'}
                Email: support@strux.id{'\n'}
                Telepon: (021) 1234-5678{'\n'}
                Alamat: Jl. Contoh No. 123, Jakarta Selatan
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.black,
  },
  headerRight: {
    width: 34,
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    padding: 20,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 10,
  },
  lastUpdated: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.lightGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 8,
  },
  sectionText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.black,
    lineHeight: 18,
  },
  bold: {
    fontFamily: 'Poppins_600SemiBold',
  },
  contactSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  contactTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 8,
  },
  contactText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.black,
    lineHeight: 18,
  },
});