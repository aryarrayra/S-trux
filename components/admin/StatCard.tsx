import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { 
  Users, 
  Calendar, 
  AlertCircle, 
  DollarSign, 
  UserCheck,
  Wrench // Ganti Tool dengan Wrench
} from 'lucide-react-native';

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  color?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  value, 
  label, 
  color = COLORS.primary,
  loading = false 
}) => {
  const getIcon = () => {
    const iconProps = { color: color, size: 24 };
    
    switch (icon) {
      case 'users':
        return <Users {...iconProps} />;
      case 'tool':
        return <Wrench {...iconProps} />; // Ganti Tool dengan Wrench
      case 'calendar':
        return <Calendar {...iconProps} />;
      case 'alert-circle':
        return <AlertCircle {...iconProps} />;
      case 'dollar-sign':
        return <DollarSign {...iconProps} />;
      case 'user-check':
        return <UserCheck {...iconProps} />;
      default:
        return <Users {...iconProps} />;
    }
  };

  if (loading) {
    return (
      <View style={[styles.card, styles.loadingCard]}>
        <ActivityIndicator size="small" color={color} />
        <Text style={styles.loadingText}>Memuat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>{getIcon()}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 200,
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconContainer: {
    width: 49,
    height: 47,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  value: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    color: COLORS.black,
    marginBottom: 5,
  },
  label: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.historyText,
  },
  loadingCard: {
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
  loadingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 8,
  },
});

export default StatCard;