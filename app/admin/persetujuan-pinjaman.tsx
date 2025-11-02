import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { ExternalLink, Search, X, Check, X as CloseIcon } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import SideBar from '@/components/admin/SideBar';
import { Stack } from 'expo-router';

// Mock data
const INITIAL_LOAN_REQUESTS = [
  {
    id: 'ST000-29022025-1812',
    description: 'surat pinjaman excavator excavator cat 320DD',
    status: 'Disetujui',
  },
  {
    id: 'ST000-29022025-1813',
    description: 'surat pinjaman excavator excavator cat 320DD',
    status: 'Ditolak',
  },
  {
    id: 'ST000-29022025-1812',
    description: 'surat pinjaman excavator excavator cat 320DD',
    status: 'Belum diverifikasi',
  },
  {
    id: 'ST000-29022025-1814',
    description: 'surat pinjaman excavator excavator cat 320DD',
    status: 'Ditolak',
  },
  {
    id: 'ST000-29022025-1915',
    description: 'surat pinjaman excavator excavator cat 320DD',
    status: 'Disetujui',
  },
  {
    id: 'ST000-29022025-1916',
    description: 'surat pinjaman excavator excavator cat 320DD',
    status: 'Disetujui',
  },
  {
    id: 'ST000-29022025-1912',
    description: 'surat pinjaman excavator excavator cat 320DD',
    status: 'Disetujui',
  },
  {
    id: 'ST000-29022025-1912',
    description: 'surat pinjaman excavator excavator cat 320DD',
    status: 'Disetujui',
  },
  {
    id: 'ST000-29022025-1912',
    description: 'surat pinjaman excavator excavator cat 320DD',
    status: 'Disetujui',
  },
  {
    id: 'ST000-29022025-1913',
    description: 'surat pinjaman excavator excavator cat 320DD',
    status: 'Disetujui',
  },
];

export default function PersetujuanPinjaman() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loanRequests, setLoanRequests] = useState(INITIAL_LOAN_REQUESTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const getCurrentDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const now = new Date();
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return {
      full: `${dayName}, ${date} ${month} ${year}`,
      time: `${hours}:${minutes} WIB`
    };
  };

  const currentDate = getCurrentDate();

  const filteredRequests = loanRequests.filter(request =>
    request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disetujui':
        return '#B8956A';
      case 'Ditolak':
        return '#B8A496';
      case 'Belum diverifikasi':
        return '#F59E0B';
      default:
        return '#B8956A';
    }
  };

  const handleOpenDocument = (request: any) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const handleVerifikasi = () => {
    setModalVisible(false);
    setVerifyModalVisible(true);
  };

  const handleTolak = () => {
    setModalVisible(false);
    setRejectModalVisible(true);
  };

  const handleConfirmVerify = () => {
    setLoanRequests(prev => prev.map(req =>
      req.id === selectedRequest.id ? { ...req, status: 'Disetujui' } : req
    ));
    console.log('Dokumen diverifikasi:', selectedRequest?.id);
    setVerifyModalVisible(false);
  };

  const handleConfirmReject = () => {
    setLoanRequests(prev => prev.map(req =>
      req.id === selectedRequest.id ? { ...req, status: 'Ditolak' } : req
    ));
    console.log('Dokumen ditolak:', selectedRequest?.id);
    setRejectModalVisible(false);
  };

  const handleCloseConfirm = () => {
    setVerifyModalVisible(false);
    setRejectModalVisible(false);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <SideBar />

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.pageTitle}>Persetujuan Pinjaman</Text>
              <Text style={styles.pageSubtitle}>Kelola Dokumen Persetujuan Pinjaman Alat Berat</Text>
            </View>
            <View style={styles.dateTimeContainer}>
              <Text style={styles.dateText}>{currentDate.full}</Text>
              <Text style={styles.timeText}>{currentDate.time}</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search color="#999" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari berdasarkan ID atau deskripsi..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>

          {/* Table */}
          <ScrollView style={styles.tableContainer}>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <View style={[styles.tableHeaderCell, { flex: 2 }]}>
                  <Text style={styles.tableHeaderText}>Surat Pinjaman Tercatat</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.tableHeaderCellBorder, { flex: 1 }]}>
                  <Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Status</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.tableHeaderCellBorder, { flex: 0.5 }]}>
                  <Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Lihat Dokumen</Text>
                </View>
              </View>

              {/* Table Body */}
              {filteredRequests.map((request, index) => (
                <View key={index} style={styles.tableRow}>
                  <View style={[styles.tableCell, { flex: 2, backgroundColor: '#F5EFE7' }]}>
                    <Text style={styles.requestId}>{request.id}</Text>
                    <Text style={styles.requestDescription}>{request.description}</Text>
                  </View>

                  <View style={[styles.tableCell, styles.tableCellBorder, { flex: 1, backgroundColor: '#F5EFE7' }]}>
                    <View style={styles.statusBadge}>
                      <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                        {request.status}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.tableCell, styles.tableCellBorder, { flex: 0.5, backgroundColor: '#F5EFE7' }]}>
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => handleOpenDocument(request)}
                    >
                      <ExternalLink color={COLORS.white} size={18} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Document Modal Popup */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Header Modal */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedRequest?.id}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X color="#666" size={24} />
                </TouchableOpacity>
              </View>

              {/* Content Modal */}
              <ScrollView style={styles.modalBody}>
                <Text style={styles.modalSectionTitle}>Penjelasan Makna Dua Kalimat Syahadat.</Text>

                <Text style={styles.modalText}>
                  Syahadatain merupakan bagian pertama dalam lima rukun Islam. Syahadatain adalah
                  pondasi awal dan hal yang paling pokok. Syarat diterimanya semua amalan dalam rukun
                  islam yang lainnya seperti Sholat, puasa, zakat dan Haji adalah kita harus sudah
                  bersyahadat. Dan Syahadatain adalah gerbang awal seseorang masuk ke dalam Agama Islam.
                </Text>

                <Text style={styles.modalText}>
                  Dan Syahadatain adalah pengakuan keimanan kepada Allah dan Muhammad sebagai
                  utusan Allah. Syahadat diucapkan dengan kalimat "Ashaduala ilaha illallah, wa
                  ashaduanna muhammadurrasulullah" yang artinya "Aku bersaksi bahwa tidak ada Tuhan
                  selain Allah SWT, dan aku bersaksi bahwa Nabi Muhammad SAW adalah utusan Allah".
                </Text>

                <Text style={styles.modalText}>
                  Konsekwensi dari pengucapan Syahadatain ini adalah kita beribadah dengan tujuan
                  mengharap ridho Alloh dengan rangkaian Ibadah sesuai mengikuti apa-apa yang sudah
                  dijelaskan dan dicontohkan oleh Rosululloh Muhammad Shallallahu 'Alaihi Wa Sallam.
                </Text>

                <Text style={styles.modalSectionTitle}>Penjelasan Tatacara Bersuci</Text>

                <Text style={styles.modalText}>
                  Bersuci merupakan syarat mutlak bagi seorang Muslim dalam melaksanakan proses
                  ibadah kepada Allah SWT...
                </Text>
              </ScrollView>

              {/* Footer Modal - Buttons */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.verifikasiButton}
                  onPress={handleVerifikasi}
                >
                  <Text style={styles.verifikasiButtonText}>Verifikasi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tolakButton}
                  onPress={handleTolak}
                >
                  <Text style={styles.tolakButtonText}>Tolak</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Verify Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={verifyModalVisible}
          onRequestClose={handleCloseConfirm}
        >
          <View style={styles.confirmOverlay}>
            <View style={[styles.confirmContent, { backgroundColor: '#F0FFF4' }]}>
              <View style={styles.confirmHeader}>
                <Text style={styles.confirmTitle}>Verifikasi</Text>
              </View>
              <View style={styles.confirmIconContainer}>
                <View style={[styles.confirmIcon, { backgroundColor: '#10B981' }]}>
                  <Check color="white" size={40} />
                </View>
              </View>
              <View style={styles.confirmBody}>
                <Text style={[styles.confirmSubtitle, { color: '#10B981' }]}>Anda Menyetujui Dokumen Ini</Text>
                <Text style={styles.confirmText}>
                  Dengan ini anda menyetujui surat peminjaman alat berat kepala unit yang telah diberikan terawat dan dalam kondisi prima
                </Text>
              </View>
              <TouchableOpacity style={styles.okButton} onPress={handleConfirmVerify}>
                <Text style={styles.okButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Reject Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={rejectModalVisible}
          onRequestClose={handleCloseConfirm}
        >
          <View style={styles.confirmOverlay}>
            <View style={[styles.confirmContent, { backgroundColor: '#FFF5F5' }]}>
              <View style={styles.confirmHeader}>
                <Text style={styles.confirmTitle}>Reject</Text>
              </View>
              <View style={styles.confirmIconContainer}>
                <View style={[styles.confirmIcon, { backgroundColor: '#EF4444' }]}>
                  <CloseIcon color="white" size={40} />
                </View>
              </View>
              <View style={styles.confirmBody}>
                <Text style={[styles.confirmSubtitle, { color: '#EF4444' }]}>Anda Menolak Dokumen</Text>
                <Text style={styles.confirmText}>
                  Atas penolakan ini anda mengetahui bahwa ada kesalahan dalam pengisian dokumen baik yang relevan sampai jaminan
                </Text>
              </View>
              <TouchableOpacity style={styles.okButton} onPress={handleConfirmReject}>
                <Text style={styles.okButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
  },
  mainContent: {
    flex: 1,
    padding: 30,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  pageTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 32,
    color: '#F59E0B',
    marginBottom: 5,
    letterSpacing: 0.2,
  },
  pageSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#666',
  },
  dateTimeContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.primary,
  },
  timeText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: COLORS.darkGray,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  tableContainer: {
    flex: 1,
  },
  table: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5EFE7',
    borderBottomWidth: 2,
    borderBottomColor: '#D4A574',
  },
  tableHeaderCell: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  tableHeaderCellBorder: {
    borderLeftWidth: 2,
    borderLeftColor: '#D4A574',
  },
  tableHeaderText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#D4A574',
  },
  tableCell: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableCellBorder: {
    borderLeftWidth: 2,
    borderLeftColor: '#D4A574',
  },
  requestId: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: COLORS.darkGray,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  requestDescription: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#666',
    alignSelf: 'flex-start',
  },
  statusBadge: {
    backgroundColor: '#E8D7C3',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
  },
  statusText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
  },
  viewButton: {
    backgroundColor: '#FDB022',
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    width: '80%',
    maxWidth: 800,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#5A5A5A',
  },
  modalTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: COLORS.white,
  },
  modalBody: {
    padding: 30,
    maxHeight: 400,
  },
  modalSectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 15,
    marginTop: 10,
  },
  modalText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#333',
    lineHeight: 24,
    textAlign: 'justify',
    marginBottom: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#5A5A5A',
  },
  verifikasiButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 150,
    alignItems: 'center',
  },
  verifikasiButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.white,
  },
  tolakButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 150,
    alignItems: 'center',
  },
  tolakButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.white,
  },
  // Confirmation Modal Styles
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmContent: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 350,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmHeader: {
    marginBottom: 16,
  },
  confirmTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#333',
  },
  confirmIconContainer: {
    marginBottom: 20,
  },
  confirmIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBody: {
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmSubtitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  okButton: {
    backgroundColor: '#FDB022',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  okButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.white,
  },
});