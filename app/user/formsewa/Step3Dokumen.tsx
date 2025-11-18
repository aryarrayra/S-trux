import React from 'react';
import { View } from 'react-native';
import { 
  SummaryCard, 
  ProjectDetailsCard, 
  DocumentDownloadCard, 
  DocumentUploadCard,
  documentStyles 
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
  uploadedDocuments: string[];
  onDocumentUpload: (files: string[]) => void;
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
  uploadedDocuments,
  onDocumentUpload,
}) => {
  return (
    <>
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
        />
      </View>
    </>
  );
};