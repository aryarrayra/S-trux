import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { History } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';

type Activity = {
  title: string;
  company: string;
  time: string;
};

interface ActivityCardProps {
  history: Activity[];
  title?: string; // 🔥 Tambahkan title props
}

const ActivityCard = ({ history, title = "Histori Aktivitas" }: ActivityCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <History color={COLORS.sidebarBg} size={24} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text> {/* 🔥 Gunakan title */}
      </View>
      <View style={styles.activityList}>
        {history.map((item, index) => (
          <View key={index} style={styles.activityItem}>
            <Text style={styles.activityTitle}>{item.title}</Text>
            <Text style={styles.activityCompany}>{item.company}</Text>
            <Text style={styles.activityTime}>{item.time}</Text>
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
  activityList: {
    gap: 20,
  },
  activityItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingBottom: 15,
  },
  activityTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: COLORS.historyText,
  },
  activityCompany: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 3,
  },
  activityTime: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});

export default ActivityCard;
