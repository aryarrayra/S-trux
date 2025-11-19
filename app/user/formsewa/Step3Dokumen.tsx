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
          onUpload={onDocumentUpload}
          uploadedDocuments={uploadedDocuments}
          // ✅ TAMBAHKAN PROPS UNTUK SUBMIT
          sewaData={sewaData}
        />
      </View>
    </ScrollView>
  );
};

export default Step3Dokumen;