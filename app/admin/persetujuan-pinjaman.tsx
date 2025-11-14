import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Linking, ActivityIndicator } from 'react-native';
import { ExternalLink, Search, X, Check, FileText, Download, User, Package, Calendar } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import SideBar from '@/components/admin/SideBar';
import { Stack } from 'expo-router';

// Base URL API - menggunakan localhost
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Interface for LoanRequest
interface LoanRequest {
  id: string;
  description: string;
  status: string;
  originalData: any;
  pelanggan: any;
  alat: any;
  dokumen: any[];
  pembayaran: any[];
}

export default function PersetujuanPinjaman() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReasonModalVisible, setRejectReasonModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<LoanRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data dari API local
  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      console.log('Fetching data from:', `http://127.0.0.1:8000/api/penyewaan/persetujuan/pending`);

      const response = await fetch(`http://127.0.0.1:8000/api/penyewaan/persetujuan/pending`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (result.success) {
        const formattedData: LoanRequest[] = result.data.map((item: any) => ({
          id: `ST${String(item.id_sewa).padStart(3, '0')}`,
          description: `Penyewaan ${item.alat?.nama_alat || 'Alat'} - ${item.pelanggan?.nama_pelanggan || 'Pelanggan'}`,
          status: mapApprovalStatus(item.status_persetujuan),
          originalData: item,
          pelanggan: item.pelanggan,
          alat: item.alat,
          dokumen: item.dokumen || [],
          pembayaran: item.pembayaran || []
        }));
        setLoanRequests(formattedData);
        console.log('Formatted data:', formattedData.length, 'items');
      } else {
        Alert.alert('Error', result.message || 'Gagal memuat data');
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Gagal fetch data persetujuan:', err);
      Alert.alert(
        'Error',
        `Tidak dapat terhubung ke server: ${err.message}\n\nPastikan server berjalan di http://127.0.0.1:8000`
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Approve penyewaan
  const handleConfirmVerify = async () => {
    if (!selectedRequest) return;

    // Tutup modal konfirmasi dulu
    setVerifyModalVisible(false);

    try {
      setRefreshing(true);
      const response = await fetch(`${API_BASE_URL}/penyewaan/${selectedRequest.originalData.id_sewa}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status_persetujuan: 'Disetujui'
        })
      });

      const result = await response.json();
      console.log('Approve response:', result);

      if (result.success) {
        await fetchPendingApprovals();
        setModalVisible(false);
        Alert.alert('Sukses', 'Penyewaan berhasil disetujui');
      } else {
        Alert.alert('Error', result.message || 'Gagal menyetujui penyewaan');
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Gagal approve penyewaan:', err);
      Alert.alert('Error', 'Terjadi error saat menyetujui penyewaan');
    } finally {
      setRefreshing(false);
    }
  };

  // Handler untuk klik OK pada modal konfirmasi tolak
  const handleConfirmReject = () => {
    if (!selectedRequest) return;

    // Tutup modal konfirmasi tolak
    setRejectModalVisible(false);

    // Buka modal untuk input alasan penolakan
    setRejectReasonModalVisible(true);
  };

  // Submit reject dengan alasan
  const handleSubmitReject = async () => {
    if (!selectedRequest) return;

    if (!rejectReason || rejectReason.trim() === '') {
      Alert.alert('Error', 'Alasan penolakan harus diisi');
      return;
    }

    // Tutup modal input alasan terlebih dahulu
    setRejectReasonModalVisible(false);
    setModalVisible(false);

    // Simpan alasan ke variable sementara
    const alasanPenolakan = rejectReason.trim();
    // Reset form
    setRejectReason('');

    try {
      setRefreshing(true);
      const response = await fetch(`${API_BASE_URL}/penyewaan/${selectedRequest.originalData.id_sewa}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status_persetujuan: 'Ditolak',
          alasan_penolakan: alasanPenolakan
        })
      });

      const result = await response.json();
      console.log('Reject response:', result);

      if (result.success) {
        await fetchPendingApprovals();
        Alert.alert('Sukses', 'Penyewaan berhasil ditolak');
      } else {
        Alert.alert('Error', result.message || 'Gagal menolak penyewaan');
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Gagal reject penyewaan:', err);
      Alert.alert('Error', 'Terjadi error saat menolak penyewaan');
    } finally {
      setRefreshing(false);
    }
  };

  // Cancel reject
  const handleCancelReject = () => {
    setRejectReasonModalVisible(false);
    setRejectReason('');
    setModalVisible(false);
  };

  // Download dokumen
  const handleDownloadPDF = async (dokumen: any) => {
    try {
      const url = `${API_BASE_URL}/dokumen-pinjaman/download/${dokumen.id_dokumen}`;
      console.log('Download URL:', url);

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Tidak dapat membuka PDF viewer');
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Gagal download PDF:', err);
      Alert.alert('Error', 'Gagal membuka dokumen');
    }
  };

  const handleOpenDocument = (request: LoanRequest) => {
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

  const handleCloseConfirm = () => {
    setVerifyModalVisible(false);
    setRejectModalVisible(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPendingApprovals();
  };

  // Helper functions
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
    request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.pelanggan?.nama_pelanggan?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disetujui': return '#10B981';
      case 'Ditolak': return '#EF4444';
      case 'Belum diverifikasi': return '#F59E0B';
      default: return '#10B981';
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case 'Belum diverifikasi': return '#FEF3C7';
      case 'Disetujui': return '#D1FAE5';
      case 'Ditolak': return '#FEE2E2';
      default: return '#F3F4F6';
    }
  };

  const mapApprovalStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'Menunggu': 'Belum diverifikasi',
      'Disetujui': 'Disetujui',
      'Ditolak': 'Ditolak'
    };
    return statusMap[status] || 'Belum diverifikasi';
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  // Modal dengan data real
  const DocumentModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detail Penyewaan {selectedRequest?.id}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X color="#fff" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Info Pelanggan */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <User size={18} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Data Pelanggan</Text>
              </View>
              <View style={styles.infoGrid}>
                <Text style={styles.infoLabel}>Nama:</Text>
                <Text style={styles.infoValue}>{selectedRequest?.pelanggan?.nama_pelanggan || 'Tidak ada data'}</Text>

                <Text style={styles.infoLabel}>KTP:</Text>
                <Text style={styles.infoValue}>{selectedRequest?.pelanggan?.no_ktp || '-'}</Text>

                <Text style={styles.infoLabel}>Telp:</Text>
                <Text style={styles.infoValue}>{selectedRequest?.pelanggan?.no_telp || '-'}</Text>

                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{selectedRequest?.pelanggan?.email || '-'}</Text>
              </View>
            </View>

            {/* Info Alat */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Package size={18} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Data Alat Berat</Text>
              </View>
              <View style={styles.infoGrid}>
                <Text style={styles.infoLabel}>Alat:</Text>
                <Text style={styles.infoValue}>{selectedRequest?.alat?.nama_alat || 'Tidak ada data'}</Text>

                <Text style={styles.infoLabel}>Jenis:</Text>
                <Text style={styles.infoValue}>{selectedRequest?.alat?.jenis || '-'}</Text>

                <Text style={styles.infoLabel}>Kapasitas:</Text>
                <Text style={styles.infoValue}>{selectedRequest?.alat?.kapasitas || '-'}</Text>

                <Text style={styles.infoLabel}>Harga/hari:</Text>
                <Text style={styles.infoValue}>{formatCurrency(selectedRequest?.alat?.harga_sewa_per_hari || 0)}</Text>
              </View>
            </View>

            {/* Info Penyewaan */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={18} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Detail Penyewaan</Text>
              </View>
              <View style={styles.infoGrid}>
                <Text style={styles.infoLabel}>Tanggal Sewa:</Text>
                <Text style={styles.infoValue}>{selectedRequest?.originalData?.tanggal_sewa || '-'}</Text>

                <Text style={styles.infoLabel}>Tanggal Kembali:</Text>
                <Text style={styles.infoValue}>{selectedRequest?.originalData?.tanggal_kembali || '-'}</Text>

                <Text style={styles.infoLabel}>Durasi:</Text>
                <Text style={styles.infoValue}>
                  {calculateDuration(selectedRequest?.originalData?.tanggal_sewa, selectedRequest?.originalData?.tanggal_kembali)} hari
                </Text>

                <Text style={styles.infoLabel}>Total Harga:</Text>
                <Text style={[styles.infoValue, styles.totalPrice]}>
                  {formatCurrency(selectedRequest?.originalData?.total_harga || 0)}
                </Text>
              </View>
            </View>

            {/* Dokumen */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FileText size={18} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Dokumen Pendukung</Text>
              </View>

              {selectedRequest?.dokumen?.length === 0 ? (
                <Text style={styles.noDocumentText}>Belum ada dokumen</Text>
              ) : (
                selectedRequest?.dokumen?.map((dokumen: any) => (
                  <TouchableOpacity
                    key={dokumen.id_dokumen}
                    style={styles.documentItem}
                    onPress={() => handleDownloadPDF(dokumen)}
                  >
                    <FileText color="#3B82F6" size={20} />
                    <View style={styles.documentInfo}>
                      <Text style={styles.documentName}>{dokumen.nama_dokumen}</Text>
                      <Text style={styles.documentType}>{dokumen.tipe_dokumen}</Text>
                    </View>
                    <Download color="#6B7280" size={20} />
                  </TouchableOpacity>
                ))
              )}
            </View>
          </ScrollView>

          {selectedRequest?.status === 'Belum diverifikasi' && (
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.verifikasiButton}
                onPress={handleVerifikasi}
                disabled={refreshing}
              >
                {refreshing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.verifikasiButtonText}>Setujui</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tolakButton}
                onPress={handleTolak}
                disabled={refreshing}
              >
                {refreshing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.tolakButtonText}>Tolak</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <SideBar />

        <View style={styles.mainContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.pageTitle}>Persetujuan Penyewaan</Text>
              <Text style={styles.pageSubtitle}>Verifikasi Dokumen Permohonan Peminjaman</Text>
              <Text style={styles.apiInfo}>API: {API_BASE_URL}</Text>
            </View>
            <View style={styles.dateTimeContainer}>
              <Text style={styles.dateText}>{currentDate.full}</Text>
              <Text style={styles.timeText}>{currentDate.time}</Text>
              <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
                <Text style={styles.refreshText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Search color="#999" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari berdasarkan ID, nama pelanggan, atau alat..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F59E0B" />
              <Text style={styles.loadingText}>Memuat data persetujuan...</Text>
            </View>
          )}

          {!loading && loanRequests.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Tidak ada data persetujuan</Text>
              <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
                <Text style={styles.retryText}>Coba Lagi</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && loanRequests.length > 0 && (
            <ScrollView style={styles.tableContainer}>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <View style={[styles.tableHeaderCell, { flex: 2 }]}>
                    <Text style={styles.tableHeaderText}>Penyewaan Tercatat</Text>
                  </View>
                  <View style={[styles.tableHeaderCell, styles.tableHeaderCellBorder, { flex: 1 }]}>
                    <Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Status</Text>
                  </View>
                  <View style={[styles.tableHeaderCell, styles.tableHeaderCellBorder, { flex: 0.5 }]}>
                    <Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Detail</Text>
                  </View>
                </View>

                {filteredRequests.map((request, index) => (
                  <View key={index} style={styles.tableRow}>
                    <View style={[styles.tableCell, { flex: 2, backgroundColor: '#F5EFE7' }]}>
                      <Text style={styles.requestId}>{request.id}</Text>
                      <Text style={styles.requestDescription}>
                        {request.pelanggan?.nama_pelanggan || 'Unknown'} - {request.alat?.nama_alat || 'Unknown'}
                      </Text>
                      <Text style={styles.requestDate}>
                        {request.originalData?.tanggal_sewa} • {formatCurrency(request.originalData?.total_harga || 0)}
                      </Text>
                    </View>

                    <View style={[styles.tableCell, styles.tableCellBorder, { flex: 1, backgroundColor: '#F5EFE7' }]}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusBackgroundColor(request.status) }]}>
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
          )}
        </View>

        <DocumentModal />

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
                <Text style={[styles.confirmSubtitle, { color: '#10B981' }]}>Anda Menyetujui Penyewaan Ini</Text>
                <Text style={styles.confirmText}>
                  Dengan ini anda menyetujui penyewaan alat berat dan dokumen pendukung yang telah diberikan
                </Text>
              </View>
              <TouchableOpacity style={styles.okButton} onPress={handleConfirmVerify} disabled={refreshing}>
                {refreshing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.okButtonText}>OK</Text>
                )}
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
                <Text style={styles.confirmTitle}>Tolak</Text>
              </View>
              <View style={styles.confirmIconContainer}>
                <View style={[styles.confirmIcon, { backgroundColor: '#EF4444' }]}>
                  <X color="white" size={40} />
                </View>
              </View>
              <View style={styles.confirmBody}>
                <Text style={[styles.confirmSubtitle, { color: '#EF4444' }]}>Anda Menolak Penyewaan</Text>
                <Text style={styles.confirmText}>
                  Penyewaan ini akan ditolak dan pelanggan akan mendapatkan notifikasi
                </Text>
              </View>
              <TouchableOpacity style={styles.okButton} onPress={handleConfirmReject} disabled={refreshing}>
                {refreshing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.okButtonText}>OK</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Reject Reason Input Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={rejectReasonModalVisible}
          onRequestClose={handleCancelReject}
        >
          <View style={styles.confirmOverlay}>
            <View style={[styles.confirmContent, { backgroundColor: '#FFFFFF', paddingBottom: 20, maxWidth: 400 }]}>
              <View style={[styles.confirmHeader, { backgroundColor: '#EF4444', borderTopLeftRadius: 16, borderTopRightRadius: 16 }]}>
                <Text style={[styles.confirmTitle, { color: '#FFFFFF' }]}>Alasan Penolakan</Text>
              </View>
              <View style={styles.confirmBody}>
                <Text style={[styles.confirmText, { marginBottom: 16 }]}>
                  Masukkan alasan penolakan penyewaan:
                </Text>
                <TextInput
                  style={styles.reasonInput}
                  placeholder="Tulis alasan penolakan di sini..."
                  placeholderTextColor="#999"
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              <View style={styles.reasonButtonContainer}>
                <TouchableOpacity
                  style={[styles.reasonButton, styles.cancelButton]}
                  onPress={handleCancelReject}
                  disabled={refreshing}
                >
                  <Text style={styles.cancelButtonText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.reasonButton, styles.submitButton]}
                  onPress={handleSubmitReject}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit</Text>
                  )}
                </TouchableOpacity>
              </View>
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
  apiInfo: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#666',
    marginTop: 2,
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
  refreshButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F59E0B',
    borderRadius: 6,
  },
  refreshText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: 'white',
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
  },
  retryText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: 'white',
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
    backgroundColor: '#E8D5C4',
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
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#000000',
    fontWeight: '700',
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
  requestDate: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#6B7280',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  statusBadge: {
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
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#6B7280',
    width: '30%',
    marginBottom: 8,
  },
  infoValue: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#374151',
    width: '70%',
    marginBottom: 8,
  },
  totalPrice: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#059669',
    fontSize: 14,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12
  },
  documentName: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#1E293B'
  },
  documentType: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  noDocumentText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20
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
  reasonInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    backgroundColor: '#F9F9F9',
  },
  reasonButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  reasonButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#9CA3AF',
  },
  cancelButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.white,
  },
  submitButton: {
    backgroundColor: '#EF4444',
  },
  submitButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.white,
  },
});