import React from 'react';
import { View, Text, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DateInput } from '@/components/user/commonComponents';

interface Step1Props {
  startDate: Date;
  endDate: Date;
  showStartPicker: boolean;
  showEndPicker: boolean;
  duration: number;
  dailyRate: number;
  totalCost: number;
  onStartDateChange: (event: any, selectedDate?: Date) => void;
  onEndDateChange: (event: any, selectedDate?: Date) => void;
  onShowStartPicker: () => void;
  onShowEndPicker: () => void;
  formatDate: (date: Date) => string;
}

export const Step1PeriodeSewa: React.FC<Step1Props> = ({
  startDate,
  endDate,
  showStartPicker,
  showEndPicker,
  duration,
  dailyRate,
  totalCost,
  onStartDateChange,
  onEndDateChange,
  onShowStartPicker,
  onShowEndPicker,
  formatDate,
}) => {
  return (
    <>
      <View style={styles.periodeSewaContainer}>
        <Text style={styles.periodeSewaTitle}>Periode Sewa</Text>
        <Text style={styles.periodeSewaInfo}>
          Anda hanya dapat memesan alat berat 2 hari sesudah hari ini
        </Text>
      </View>

      <DateInput
        label="Tanggal Mulai"
        value={formatDate(startDate)}
        onPress={onShowStartPicker}
      />

      <DateInput
        label="Tanggal Selesai"
        value={formatDate(endDate)}
        onPress={onShowEndPicker}
      />

      <View style={styles.durationContainer}>
        <Text style={styles.durationText}>
          Durasi Sewa {duration} hari × Rp {dailyRate.toLocaleString('id-ID')}/hari
        </Text>
        <Text style={styles.totalPreview}>
          Total: Rp {totalCost.toLocaleString('id-ID')}
        </Text>
      </View>

      {(showStartPicker || Platform.OS === 'ios') && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onStartDateChange}
          minimumDate={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)}
        />
      )}

      {(showEndPicker || Platform.OS === 'ios') && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onEndDateChange}
          minimumDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)}
        />
      )}
    </>
  );
};

const styles = {
  periodeSewaContainer: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 10,
  },
  periodeSewaTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#000000',
  },
  periodeSewaInfo: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#000000',
    marginTop: 4,
    lineHeight: 18,
  },
  durationContainer: {
    marginHorizontal: 50,
    marginTop: 38,
    padding: 8,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '#FDCB41',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  durationText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#F39F29',
  },
  totalPreview: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#F39F29',
    marginTop: 4,
  },
};