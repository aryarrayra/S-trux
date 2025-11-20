import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { FileText, Download, Upload } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS } from '../user/commonComponents';
import { API_BASE_URL } from '@/constants/ApiConfig';
import { 
  convertToBackendDate, 
  formatDate, 
  calculateDuration 
} from '@/utils/dateUtils'; // Sesuaikan path

export interface UploadedFile {
  id?: number;
  name: string;
  uri: string;
  size: number;
  type: string; // Ganti mimeType jadi type
  base64: string; // ✅ INI YANG PENTING!
  lastModified: number;
  mimeType?: string; // Keep for backward compatibility
}

// ✅ FUNGSI API
const createPenyewaan = async (dataSewa) => {
  // ✅ TAMBAHKAN FUNGSI INI DI DALAM createPenyewaan
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

const getPenyewaanByPelanggan = async (idPelanggan) => {
  try {
    const response = await fetch(`${API_BASE_URL}/penyewaan/pelanggan/${idPelanggan}`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching penyewaan:', error);
    throw error;
  }
};

// Summary Card Component
export const SummaryCard = ({ 
  startDate, 
  endDate, 
  duration, 
  projectName, 
  projectLocation, 
  latitude, 
  longitude, 
  totalCost,
  equipmentName,
  dailyRate 
}: any) => (
  <View style={documentStyles.summaryCard}>
    <Text style={documentStyles.summaryCardTitle}>Ringkasan Sewa</Text>

    <View style={documentStyles.summaryRow}>
      <Text style={documentStyles.summaryLabel}>Alat Berat</Text>
      <Text style={documentStyles.summaryValue}>{equipmentName}</Text>
    </View>

    <View style={documentStyles.summaryRow}>
      <Text style={documentStyles.summaryLabel}>Harga per Hari</Text>
      <Text style={documentStyles.summaryValue}>Rp {dailyRate?.toLocaleString('id-ID')}</Text>
    </View>

    <View style={documentStyles.summaryRow}>
      <Text style={documentStyles.summaryLabel}>Tanggal Mulai</Text>
      <Text style={documentStyles.summaryValue}>{startDate}</Text>
    </View>

    <View style={documentStyles.summaryRow}>
      <Text style={documentStyles.summaryLabel}>Tanggal Selesai</Text>
      <Text style={documentStyles.summaryValue}>{endDate}</Text>
    </View>

    <View style={documentStyles.summaryRow}>
      <Text style={documentStyles.summaryLabel}>Durasi</Text>
      <Text style={documentStyles.summaryValue}>{duration} hari</Text>
    </View>

    <View style={documentStyles.summaryRow}>
      <Text style={documentStyles.summaryLabel}>Nama Proyek</Text>
      <Text style={documentStyles.summaryValue}>{projectName}</Text>
    </View>

    <View style={documentStyles.summaryRow}>
      <Text style={documentStyles.summaryLabel}>Lokasi</Text>
      <View style={documentStyles.locationSummary}>
        <Text style={documentStyles.summaryValue}>{projectLocation}</Text>
        {latitude && longitude && (
          <Text style={documentStyles.coordinatesSummary}>
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </Text>
        )}
      </View>
    </View>

    <View style={[documentStyles.summaryRow, { marginTop: 8 }]}>
      <Text style={documentStyles.totalLabel}>Total Biaya</Text>
      <Text style={documentStyles.totalValue}>Rp {totalCost?.toLocaleString('id-ID')}</Text>
    </View>
  </View>
);

// Project Details Card Component
export const ProjectDetailsCard = ({ projectName, projectLocation, projectDescription, latitude, longitude }: any) => (
  <View style={documentStyles.detailsCard}>
    <Text style={documentStyles.detailsCardTitle}>Detail Proyek</Text>

    <View style={documentStyles.detailItem}>
      <Text style={documentStyles.detailLabel}>Nama Proyek</Text>
      <Text style={documentStyles.detailValue}>{projectName}</Text>
    </View>

    <View style={documentStyles.detailItem}>
      <Text style={documentStyles.detailLabel}>Lokasi Proyek</Text>
      <View style={documentStyles.locationDetail}>
        <Text style={documentStyles.detailValue}>{projectLocation}</Text>
        {latitude && longitude && (
          <Text style={documentStyles.coordinatesDetail}>
            Koordinat: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </Text>
        )}
      </View>
    </View>

    {projectDescription ? (
      <View style={documentStyles.detailItem}>
        <Text style={documentStyles.detailLabel}>Deskripsi Proyek</Text>
        <Text style={documentStyles.detailValue}>{projectDescription}</Text>
      </View>
    ) : null}
  </View>
);

// Document Download Card Component - HANYA DOWNLOAD
export const DocumentDownloadCard = ({ 
  startDate, 
  endDate, 
  duration, 
  totalCost,
  projectName,
  projectLocation,
  equipmentName,
  dailyRate
}: any) => {
  
  const generateTemplateContent = () => {
    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
    });

    return `SURAT PERNYATAAN DAN KONTRAK SEWA ALAT BERAT

Tanggal: ${currentDate}

DATA PENYEWA:
Nama        : __________________________
Alamat      : __________________________
No. KTP     : __________________________
No. Telepon : __________________________

DATA ALAT BERAT:
Jenis Alat  : ${equipmentName || "__________________________"}
Merk/Type   : __________________________
Kapasitas   : __________________________

DATA SEWA:
Tanggal Mulai      : ${startDate || "__________________________"}
Tanggal Selesai    : ${endDate || "__________________________"}
Durasi Sewa        : ${duration || "______"} hari
Lokasi Proyek      : ${projectLocation || "__________________________"}
Nama Proyek        : ${projectName || "__________________________"}
Harga Sewa per Hari: Rp ${dailyRate?.toLocaleString('id-ID') || "______________________"}
Total Biaya Sewa   : Rp ${totalCost?.toLocaleString('id-ID') || "______________________"}

SURAT PERNYATAAN:
Saya yang bertanda tangan di atas menyatakan:
1. Bersedia mematuhi semua peraturan penggunaan alat berat
2. Bertanggung jawab penuh atas kondisi alat selama masa sewa
3. Akan mengganti kerugian jika terjadi kerusakan akibat kelalaian
4. Menggunakan alat hanya untuk keperluan proyek yang telah disebutkan

KETENTUAN KONTRAK:
1. Penyewa wajib menjaga dan merawat alat dengan baik
2. Dilarang memindahkan alat tanpa izin tertulis
3. Biaya perbaikan akibat kelalaian ditanggung penyewa
4. Kontrak ini berlaku sampai tanggal yang telah ditentukan

TANDA TANGAN:

Penyewa,                            Penyedia,

(__________________________)        (__________________________)

Catatan: Isi data yang masih kosong (____________) kemudian print dan tanda tangani dokumen ini.
`;
  };

  const downloadTemplate = async () => {
    try {
      console.log('Starting template download...');
      
      const filename = `Surat_Pernyataan_Kontrak_${(projectName || 'Sewa').replace(/\s+/g, '_')}.docx`;
      
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      
      if (!permissions.granted) {
        Alert.alert('Error', 'Izin akses storage ditolak');
        return;
      }

      const content = generateTemplateContent();
      
      const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        filename,
        'application/msword'
      );
      
      await FileSystem.writeAsStringAsync(fileUri, content);
      
      console.log('Template file created:', fileUri);

      Alert.alert(
        'Berhasil', 
        `File berhasil disimpan: ${filename}`,
        [{ text: 'OK' }]
      );

    } catch (error: any) {
      console.error('Error downloading template:', error);
      Alert.alert('Error', `Gagal mengunduh dokumen: ${error.message}`);
    }
  };

  return (
    <View style={documentStyles.documentCard}>
      <Text style={documentStyles.documentCardTitle}>Download Dokumen</Text>
      <Text style={documentStyles.documentCardSubtitle}>Download template, isi data penyewa, print dan tanda tangani</Text>

      <TouchableOpacity 
        style={documentStyles.downloadButton}
        onPress={downloadTemplate}
      >
        <FileText color={COLORS.black} size={20} />
        <View style={documentStyles.downloadTextContainer}>
          <Text style={documentStyles.downloadTitle}>Surat Pernyataan & Kontrak Sewa</Text>
          <Text style={documentStyles.downloadSubtitle}>DOC - Download template untuk diisi</Text>
        </View>
        <Download color={COLORS.black} size={20} />
      </TouchableOpacity>

      <Text style={documentStyles.downloadNote}>
        * Download template, isi data penyewa, print, tanda tangani, lalu upload untuk mengajukan penyewaan
      </Text>
    </View>
  );
};

// Document Upload Card Component - DENGAN SUBMIT INTEGRASI
// DocumentUploadCard Component - HANYA UPLOAD DOKUMEN
export const DocumentUploadCard = ({ 
  onUpload,
  uploadedDocuments = []
}: { 
  onUpload?: (files: any[]) => void;
  uploadedDocuments?: any[];
}) => {
  
  const pickDocument = async () => {
    try {
      console.log('📁 Starting document pick...');
      
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png'
        ],
        multiple: false,
        copyToCacheDirectory: true
      });

      if (result.canceled) {
        console.log('Document picking canceled');
        return;
      }

      const pickedFile = result.assets[0];
      console.log('📄 Picked document:', {
        name: pickedFile.name,
        uri: pickedFile.uri,
        size: pickedFile.size,
        mimeType: pickedFile.mimeType
      });

      // ✅ GENERATE BASE64 DARI FILE
      console.log('🔄 Generating base64 from file...');
      
      try {
        // Baca file sebagai base64
        const fileInfo = await FileSystem.getInfoAsync(pickedFile.uri);
        console.log('📊 File info:', fileInfo);

        if (!fileInfo.exists) {
          throw new Error('File tidak ditemukan');
        }

        const base64Data = await FileSystem.readAsStringAsync(pickedFile.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        console.log('✅ Base64 generated successfully, length:', base64Data.length);
        console.log('🔍 Base64 preview:', base64Data.substring(0, 100) + '...');

        const fileWithBase64 = {
          id: Date.now(),
          name: pickedFile.name || 'Unknown File',
          uri: pickedFile.uri,
          size: pickedFile.size || 0,
          type: pickedFile.mimeType || 'application/octet-stream',
          base64: base64Data, // ✅ INI YANG PENTING!
          lastModified: pickedFile.lastModified || Date.now()
        };

        console.log('📦 File data with base64:', {
          name: fileWithBase64.name,
          type: fileWithBase64.type,
          hasBase64: !!fileWithBase64.base64,
          base64Length: fileWithBase64.base64?.length
        });

        // ✅ KIRIM KE PARENT DENGAN BASE64
        if (onUpload) {
          onUpload([fileWithBase64]);
        }

        Alert.alert(
          'Berhasil!', 
          'Dokumen berhasil diupload dengan base64 data.',
          [{ text: 'OK' }]
        );

      } catch (base64Error) {
        console.error('❌ Error generating base64:', base64Error);
        
        // Fallback: kirim tanpa base64
        const fileWithoutBase64 = {
          id: Date.now(),
          name: pickedFile.name || 'Unknown File',
          uri: pickedFile.uri,
          size: pickedFile.size || 0,
          type: pickedFile.mimeType || 'application/octet-stream',
          base64: '', // Kosong jika gagal
          lastModified: pickedFile.lastModified || Date.now()
        };

        if (onUpload) {
          onUpload([fileWithoutBase64]);
        }

        Alert.alert(
          'Warning', 
          'Dokumen diupload tapi tanpa base64 data. Silakan coba upload lagi.',
          [{ text: 'OK' }]
        );
      }

    } catch (error: any) {
      console.error('❌ Error picking document:', error);
      Alert.alert('Error', `Gagal mengupload file: ${error.message}`);
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.toLowerCase().endsWith('.pdf')) return '📄';
    if (fileName.toLowerCase().endsWith('.doc') || fileName.toLowerCase().endsWith('.docx')) return '📝';
    if (fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg') || fileName.toLowerCase().endsWith('.png')) return '🖼️';
    return '📎';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <View style={documentStyles.documentCard}>
      <Text style={documentStyles.documentCardTitle}>Upload Dokumen</Text>
      <Text style={documentStyles.documentCardSubtitle}>
        Upload dokumen yang sudah diisi dan ditandatangani
      </Text>

      <TouchableOpacity style={documentStyles.uploadButton} onPress={pickDocument}>
        <Upload color={COLORS.black} size={24} />
        <Text style={documentStyles.uploadText}>Upload Dokumen</Text>
        <Text style={documentStyles.uploadSubtext}>
          DOC, DOCX, PDF, JPG, PNG - Maks. 10MB
        </Text>
      </TouchableOpacity>

      {uploadedDocuments && uploadedDocuments.length > 0 && (
        <View style={documentStyles.uploadedFiles}>
          <Text style={documentStyles.uploadedTitle}>Dokumen Terupload:</Text>
          {uploadedDocuments.map((file, index) => (
            <View key={index} style={documentStyles.uploadedFileItem}>
              <Text style={documentStyles.uploadedFileIcon}>
                {getFileIcon(file.name)}
              </Text>
              <View style={documentStyles.uploadedFileInfo}>
                <Text style={documentStyles.uploadedFileName} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text style={documentStyles.uploadedFileDetails}>
                  {formatFileSize(file.size)} • {file.base64 ? '✅ Base64' : '❌ No Base64'}
                </Text>
              </View>
              <Text style={[
                documentStyles.uploadedFileStatus,
                { color: file.base64 ? COLORS.green : COLORS.red }
              ]}>
                {file.base64 ? '✓' : '⚠'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* ✅ DEBUG INFO */}
      {uploadedDocuments && uploadedDocuments.length > 0 && (
        <View style={{ marginTop: 12, padding: 8, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.textGray }}>
            🔍 Debug: {uploadedDocuments.length} file(s), Base64: {uploadedDocuments.filter(f => f.base64).length} success
          </Text>
        </View>
      )}
    </View>
  );
};

// ✅ COMPONENT UNTUK LIHAT HISTORY PENYEWAAN
export const HistoryPenyewaanCard = ({ idPelanggan }: { idPelanggan: number }) => {
  const [history, setHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getPenyewaanByPelanggan(idPelanggan);
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
      Alert.alert('Error', 'Gagal mengambil history penyewaan');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (idPelanggan) {
      fetchHistory();
    }
  }, [idPelanggan]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Disetujui': return COLORS.green;
      case 'Ditolak': return COLORS.red;
      case 'Menunggu': return COLORS.orange;
      default: return COLORS.textGray;
    }
  };

  return (
    <View style={documentStyles.documentCard}>
      <Text style={documentStyles.documentCardTitle}>History Penyewaan</Text>
      
      {loading ? (
        <Text style={documentStyles.documentCardSubtitle}>Loading...</Text>
      ) : history.length > 0 ? (
        history.map((sewa) => (
          <View key={sewa.id_sewa} style={documentStyles.historyItem}>
            <Text style={documentStyles.historyProject}>{sewa.nama_proyek}</Text>
            <Text style={documentStyles.historyLocation}>{sewa.lokasi_proyek}</Text>
            <View style={documentStyles.historyRow}>
              <Text style={documentStyles.historyDate}>
                {sewa.tanggal_sewa} - {sewa.tanggal_kembali}
              </Text>
              <Text style={[
                documentStyles.historyStatus,
                { color: getStatusColor(sewa.status_persetujuan) }
              ]}>
                {sewa.status_persetujuan}
              </Text>
            </View>
            {sewa.alasan_penolakan && (
              <Text style={documentStyles.historyReason}>
                Alasan: {sewa.alasan_penolakan}
              </Text>
            )}
          </View>
        ))
      ) : (
        <Text style={documentStyles.documentCardSubtitle}>Belum ada history penyewaan</Text>
      )}
      
      <TouchableOpacity 
        style={documentStyles.refreshButton}
        onPress={fetchHistory}
      >
        <Text style={documentStyles.refreshText}>Refresh Data</Text>
      </TouchableOpacity>
    </View>
  );
};

export const documentStyles = {
  section: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryCardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  summaryLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.textGray,
    flex: 1,
  },
  summaryValue: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.black,
    flex: 1,
    textAlign: 'right',
  },
  locationSummary: {
    flex: 1,
    alignItems: 'flex-end',
  },
  coordinatesSummary: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 4,
  },
  totalLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.black,
  },
  totalValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.orange,
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsCardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 16,
  },
  detailItem: {
    marginBottom: 14,
  },
  detailLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 6,
  },
  detailValue: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.black,
  },
  locationDetail: {
    marginTop: 6,
  },
  coordinatesDetail: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 4,
  },
  documentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  documentCardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 6,
  },
  documentCardSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 16,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  downloadTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  downloadTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.black,
  },
  downloadSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 4,
  },
  uploadButton: {
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    borderRadius: 8,
    padding: 24,
    borderWidth: 2,
    borderColor: COLORS.orange,
    borderStyle: 'dashed',
  },
  uploadText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: COLORS.black,
    marginTop: 12,
  },
  uploadSubtext: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 6,
  },
  uploadedFiles: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  uploadedTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 12,
  },
  uploadedFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  uploadedFileIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  uploadedFileInfo: {
    flex: 1,
  },
  uploadedFileName: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.black,
  },
  uploadedFileDetails: {
    fontFamily: 'Poppins_300Light',
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 4,
  },
  uploadedFileStatus: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.green,
    marginLeft: 8,
  },
  downloadNote: {
    fontFamily: 'Poppins_300Light',
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  historyItem: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  historyProject: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.black,
  },
  historyLocation: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 4,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  historyDate: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textGray,
  },
  historyStatus: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
  },
  historyReason: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: COLORS.red,
    marginTop: 4,
    fontStyle: 'italic',
  },
  refreshButton: {
    backgroundColor: COLORS.orange,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  refreshText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.white,
  },
};