import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FileCog } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';

type Schedule = {
  name: string;
  date: string;
  task: string;
};

interface MaintenanceCardProps {
  schedule: Schedule[];
  title?: string; // 🔥 Tambahkan Title Props
}

const MaintenanceCard = ({ schedule, title = "Jadwal Maintenance" }: MaintenanceCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <FileCog color={COLORS.sidebarBg} size={24} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text> {/* 🔥 Gunakan title */}
      </View>
      <View style={styles.scheduleList}>
        {schedule.map((item, index) => (
          <View key={index} style={styles.scheduleItem}>
            <View>
              <Text style={styles.scheduleName}>{item.name}</Text>
              <Text style={styles.scheduleDate}>{item.date}</Text>
            </View>
            <TouchableOpacity style={styles.taskButton}>
              <Text style={styles.taskButtonText}>{item.task}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 300,
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 25,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },
  iconContainer: {
    width: 49,
    height: 47,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: COLORS.black,
  },
  scheduleList: {
    gap: 20,
  },
  scheduleItem: {
    backgroundColor: COLORS.maintenanceCardBg,
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: COLORS.primary,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: COLORS.black,
  },
  scheduleDate: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  taskButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  taskButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: COLORS.white,
  },
});

export default MaintenanceCard;
