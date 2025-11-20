import React from 'react';
import { View, ScrollView } from 'react-native';
import { 
  SummaryCard, 
  ProjectDetailsCard, 
  DocumentDownloadCard,
  DocumentUploadCard,
  documentStyles,
  UploadedFile 
} from '@/components/user/DocumentComponents';

interface Step3Props {
  startDate: string;
  endDate: string;
  duration: number;
  projectName: string;
  projectLocation: string;
  projectDescription: string;
  latitude: number | null;
  longitude: number | null;
  totalCost: number;
  equipmentName: string;
  dailyRate: number;
  uploadedDocuments: UploadedFile[];
  onDocumentUpload: (files: UploadedFile[]) => void;
  idPelanggan?: number;
  idAlat?: number;
}

export const Step3Dokumen: React.FC<Step3Props> = ({
  startDate,
  endDate,
  duration,
  projectName,
  projectLocation,
  projectDescription,
  latitude,
  longitude,
  totalCost,
  equipmentName,
  dailyRate,
  uploadedDocuments = [],
  onDocumentUpload,
  idPelanggan = 1,
  idAlat = 1,
}) => {

  // ✅ DATA UNTUK SUBMIT KE API
  const sewaData = {
    idPelanggan: idPelanggan,
    idAlat: idAlat,
    tanggalSewa: startDate,
    tanggalKembali: endDate,
    totalHarga: totalCost,
    namaProyek: projectName,
    lokasiProyek: projectLocation,
    deskripsiProyek: projectDescription,
    latitude: latitude,
    longitude: longitude
  };

  // ✅ HANDLE UPLOAD DARI CHILD COMPONENT
const handleDocumentUpload = (files: any[]) => {
  console.log('📁 Step3Dokumen: Received files from DocumentUploadCard:', files.length);
  
  // ✅ VALIDASI DAN LOG DETAIL
  const validatedFiles = files.map((file, index) => {
    console.log(`🔍 File ${index + 1}:`, {
      name: file.name,
      type: file.type,
      hasBase64: !!file.base64,
      base64Length: file.base64?.length,
      base64Preview: file.base64 ? file.base64.substring(0, 50) + '...' : 'NO BASE64'
    });

    return {
      id: file.id || Date.now() + index,
      name: file.name || `document_${index + 1}`,
      type: file.type || 'application/octet-stream',
      base64: file.base64 || '', // Pastikan selalu ada property base64
      size: file.size || 0,
      uri: file.uri,
      lastModified: file.lastModified || Date.now()
    };
  });

  const filesWithBase64 = validatedFiles.filter(f => f.base64 && f.base64.length > 0);
  console.log(`✅ Validated: ${filesWithBase64.length}/${validatedFiles.length} files have base64 data`);

  // Kirim ke parent component
  onDocumentUpload(validatedFiles);
};

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={documentStyles.section}>
        <SummaryCard
          startDate={startDate}
          endDate={endDate}
          duration={duration}
          projectName={projectName}
          projectLocation={projectLocation}
          latitude={latitude}
          longitude={longitude}
          totalCost={totalCost}
          equipmentName={equipmentName}
          dailyRate={dailyRate}
        />
      </View>

      <View style={documentStyles.section}>
        <ProjectDetailsCard
          projectName={projectName}
          projectLocation={projectLocation}
          projectDescription={projectDescription}
          latitude={latitude}
          longitude={longitude}
        />
      </View>

      <View style={documentStyles.section}>
        <DocumentDownloadCard 
          startDate={startDate}
          endDate={endDate}
          duration={duration}
          totalCost={totalCost}
          projectName={projectName}
          projectLocation={projectLocation}
          equipmentName={equipmentName}
          dailyRate={dailyRate}
        />
      </View>

      <View style={documentStyles.section}>
        <DocumentUploadCard 
          onUpload={handleDocumentUpload} // ✅ GUNAKAN HANDLER YANG SUDAH DIPERBAIKI
          uploadedDocuments={uploadedDocuments}
          sewaData={sewaData}
        />
      </View>
    </ScrollView>
  );
};

export default Step3Dokumen;