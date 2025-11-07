import React, { useState, useEffect } from 'react';
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
  const [currentDate, setCurrentDate] = useState({ full: '', time: '' });

  useEffect(() => {
    const getCurrentDate = () => {
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const now = new Date();
      const dayName = days[now.getDay()];
      const date = now.getDate();
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      return {
        full: `${dayName}, ${date} ${month} ${year}`,
        time: `${hours}:${minutes} WIB`
      };
    };

    setCurrentDate(getCurrentDate());
    const interval = setInterval(() => {
      setCurrentDate(getCurrentDate());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const Header = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Dashboard Admin</Text>
        <Text style={styles.headerSubtitle}>
          Selamat datang kembali, mari mulai pekerjaan hari ini!
        </Text>
      </View>
      <Text style={styles.dateText}>
        {currentDate.full}{'\n'}{currentDate.time}
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