import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/Colors';

interface StatCardProps {
  icon: React.ElementType;
  value: string;
  label: string;
}

const StatCard = ({ icon: Icon, value, label }: StatCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Icon color={COLORS.sidebarBg} size={30} />
      </View>
      <Text style={styles.valueText}>{value}</Text>
      <Text style={styles.labelText}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 24,
    width: 216,
    height: 216,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 49,
    height: 47,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  valueText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 28,
    color: COLORS.primary,
    lineHeight: 40,
  },
  labelText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.lightGray,
    marginTop: 5,
  },
});

export default StatCard;
