import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FileText, Download, Upload } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { COLORS } from '../user/commonComponents';

interface DocumentData {
  nama: string;
  alamat: string;
  noKtp: string;
  projectName: string;
  projectLocation: string;
  startDate: string;
  endDate: string;
  duration: number;
  totalCost: number;
  equipmentName: string;
  dailyRate: number;
}

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
      <Text style={documentStyles.summaryValue}>Rp {dailyRate.toLocaleString('id-ID')}</Text>
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
      <Text style={documentStyles.totalValue}>Rp {totalCost.toLocaleString('id-ID')}</Text>
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

// Document Download Card Component
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
  
  const generateWordContent = (type: 'pernyataan' | 'kontrak', data: DocumentData): string => {
    const currentDate = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (type === 'pernyataan') {
      return `SURAT PERNYATAAN

Yang bertanda tangan di bawah ini:
Nama : ${data.nama}
Alamat : ${data.alamat}
No. KTP : ${data.noKtp}

Dengan ini menyatakan bahwa saya bersedia menggunakan, menjaga, dan mematuhi seluruh ketentuan terkait penyewaan alat berat "${data.equipmentName}" yang saya gunakan. Segala bentuk kerusakan atau penyalahgunaan selama masa sewa menjadi tanggung jawab saya sepenuhnya.

Demikian surat pernyataan ini dibuat dengan sebenarnya untuk digunakan sebagaimana mestinya.

Tanda Tangan,


${data.nama}
`;
    } else {
      return `SURAT KONTRAK SEWA

Pada hari ini, ${currentDate}, telah dibuat perjanjian sewa-menyewa antara:

PIHAK PERTAMA (PENYEDIA):
Nama : PT. Alat Berat Indonesia
Alamat : Jl. Industri Raya No. 123, Jakarta
No. Telepon : (021) 1234-5678

PIHAK KEDUA (PENYEWA):
Nama : ${data.nama}
Alamat : ${data.alamat}
No. KTP : ${data.noKtp}

Dengan ini, kedua belah pihak sepakat atas perjanjian sewa alat berat dengan ketentuan berikut:

1. Nama Alat : ${data.equipmentName}
2. Masa Sewa : ${data.duration} hari (${data.startDate} hingga ${data.endDate})
3. Biaya Sewa : Rp ${data.totalCost.toLocaleString('id-ID')} (Rp ${data.dailyRate.toLocaleString('id-ID')} x ${data.duration} hari)
4. Lokasi Proyek : ${data.projectLocation}
5. Nama Proyek : ${data.projectName}
6. Tanggung Jawab Penggunaan : Pihak Kedua bertanggung jawab penuh atas penggunaan dan kondisi alat.
7. Ketentuan Tambahan : Alat digunakan untuk proyek "${data.projectName}" di ${data.projectLocation}. Segala kerusakan akibat kelalaian operator menjadi tanggung jawab penyewa.

Perjanjian ini berlaku sejak tanggal ditandatangani oleh kedua pihak.

Pihak Pertama,                               Pihak Kedua,


(__________________________)               (${data.nama})
`;
    }
  };

  const downloadDocument = async (type: 'pernyataan' | 'kontrak') => {
    try {
      const documentData: DocumentData = {
        nama: "John Doe",
        alamat: "Jl. Contoh No. 123, Jakarta", 
        noKtp: "12.3456.789012.3456",
        projectName: projectName,
        projectLocation: projectLocation,
        startDate: startDate,
        endDate: endDate,
        duration: duration,
        totalCost: totalCost,
        equipmentName: equipmentName,
        dailyRate: dailyRate
      };

      const content = generateWordContent(type, documentData);
      const filename = type === 'pernyataan' 
        ? `Surat_Pernyataan_${projectName.replace(/\s+/g, '_')}.doc` 
        : `Surat_Kontrak_Sewa_${projectName.replace(/\s+/g, '_')}.doc`;

      const fileUri = FileSystem.documentDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/msword',
          dialogTitle: `Download ${filename}`,
          UTI: 'com.microsoft.word.doc'
        });
      } else {
        alert(`File berhasil dibuat: ${filename}`);
      }

    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error downloading document. Silakan coba lagi.');
    }
  };

  return (
    <View style={documentStyles.documentCard}>
      <Text style={documentStyles.documentCardTitle}>Dokumen untuk Diunduh</Text>
      <Text style={documentStyles.documentCardSubtitle}>Unduh dan isi dokumen di bawah ini</Text>

      <TouchableOpacity 
        style={documentStyles.downloadButton}
        onPress={() => downloadDocument('pernyataan')}
      >
        <FileText color={COLORS.black} size={20} />
        <View style={documentStyles.downloadTextContainer}>
          <Text style={documentStyles.downloadTitle}>Surat Pernyataan</Text>
          <Text style={documentStyles.downloadSubtitle}>DOC - 2 KB</Text>
        </View>
        <Download color={COLORS.black} size={20} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={documentStyles.downloadButton}
        onPress={() => downloadDocument('kontrak')}
      >
        <FileText color={COLORS.black} size={20} />
        <View style={documentStyles.downloadTextContainer}>
          <Text style={documentStyles.downloadTitle}>Surat Kontrak Sewa</Text>
          <Text style={documentStyles.downloadSubtitle}>DOC - 3 KB</Text>
        </View>
        <Download color={COLORS.black} size={20} />
      </TouchableOpacity>

      <Text style={documentStyles.downloadNote}>
        * Dokumen akan disimpan dalam format .doc yang dapat dibuka di Microsoft Word
      </Text>
    </View>
  );
};

// Document Upload Card Component
export const DocumentUploadCard = ({ 
  onUpload,
  uploadedDocuments = [] 
}: { 
  onUpload?: (files: string[]) => void;
  uploadedDocuments?: string[];
}) => {
  const handleUpload = () => {
    // Simulasi upload dokumen
    const uploadedFiles = [
      'Surat_Pernyataan.doc',
      'Surat_Kontrak_Sewa.doc'
    ];
    onUpload?.(uploadedFiles);
  };

  return (
    <View style={documentStyles.documentCard}>
      <Text style={documentStyles.documentCardTitle}>Unggah Dokumen</Text>
      <Text style={documentStyles.documentCardSubtitle}>Unggah dokumen yang telah diisi dan ditandatangani</Text>

      <TouchableOpacity style={documentStyles.uploadButton} onPress={handleUpload}>
        <Upload color={COLORS.black} size={24} />
        <Text style={documentStyles.uploadText}>Unggah Dokumen</Text>
        <Text style={documentStyles.uploadSubtext}>DOC, PDF, JPG, PNG (Max. 5MB)</Text>
      </TouchableOpacity>

      {uploadedDocuments.length > 0 && (
        <View style={documentStyles.uploadedFiles}>
          <Text style={documentStyles.uploadedTitle}>Dokumen Terunggah:</Text>
          {uploadedDocuments.map((file, index) => (
            <Text key={index} style={documentStyles.uploadedFile}>
              ✓ {file}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

export const documentStyles = {
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textGray,
    flex: 1,
  },
  summaryValue: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
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
    fontSize: 10,
    color: COLORS.textGray,
    marginTop: 2,
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
  locationDetail: {
    marginTop: 4,
  },
  coordinatesDetail: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.textGray,
    marginTop: 2,
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
  uploadedFiles: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  uploadedTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.black,
    marginBottom: 8,
  },
  uploadedFile: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: COLORS.textGray,
    marginBottom: 4,
  },
  downloadNote: {
    fontFamily: 'Poppins_300Light',
    fontSize: 10,
    color: COLORS.textGray,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
};