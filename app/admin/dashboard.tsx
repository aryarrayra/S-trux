import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { COLORS } from '@/constants/Colors';
import { ADMIN_STATS, ACTIVITY_HISTORY, MAINTENANCE_SCHEDULE } from '@/constants/adminData';
import Sidebar from '@/components/admin/SideBar';
import StatCard from '@/components/admin/StatCard';
import ActivityCard from '@/components/admin/ActivityCard';
import MaintenanceCard from '@/components/admin/MaintenanceCard';

export default function AdminDashboardScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const Header = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Dashboard Admin</Text>
        <Text style={styles.headerSubtitle}>
          Selamat datang kembali, mari mulai pekerjaan hari ini!
        </Text>
      </View>
      <Text style={styles.dateText}>
        Rabu, 29 Oktober 2025{'\n'}18.08 WIB
      </Text>
    </View>
  );

  const MainContent = () => (
    <ScrollView style={styles.mainContent}>
      <Header />
      <View style={styles.statsGrid}>
        {ADMIN_STATS.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
          />
        ))}
      </View>
      <View style={styles.panelsContainer}>
        <ActivityCard history={ACTIVITY_HISTORY} />
        <MaintenanceCard schedule={MAINTENANCE_SCHEDULE} />
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {isDesktop && <Sidebar />}
      <MainContent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dashboardBg,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 30,
    flexWrap: 'wrap',
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 32,
    color: COLORS.black,
  },
  headerSubtitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: COLORS.black,
    marginTop: 8,
  },
  dateText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: COLORS.black,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 30,
  },
  panelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    padding: 30,
    paddingTop: 20,
  },
});
