import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Platform,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '@/constants/Colors';
import Sidebar from '@/components/admin/SideBar';
import StatCard from '@/components/admin/StatCard';
import ActivityCard from '@/components/admin/ActivityCard';
import MaintenanceCard from '@/components/admin/MaintenanceCard';

// Types untuk data dari API
type DashboardStats = {
  total_users: number;
  total_alat_berat: number;
  total_petugas: number;
  active_penyewaan: number;
  pending_approvals: number;
  total_revenue: number;
  monthly_revenue: number;
  new_users_this_month: number;
  pending_maintenance: number;
  completed_maintenance: number;
  alat_by_status: {
    [key: string]: number;
  };
};

type ActivityHistory = {
  id: number;
  type: string;
  user_name: string;
  action: string;
  description: string;
  timestamp: string;
  status: string;
  icon: string;
};

type MaintenanceSchedule = {
  id: number;
  task: string;
  alat_berat_name: string;
  alat_berat_jenis: string;
  due_date: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  biaya: number;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export default function AdminDashboardScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  
  // State untuk data yang berhasil di-load
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activityHistory, setActivityHistory] = useState<ActivityHistory[] | null>(null);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<MaintenanceSchedule[] | null>(null);
  const [currentDate, setCurrentDate] = useState({ full: '', time: '' });
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = 'http://localhost:8000/api';

  // Format date
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
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Fetch stats data - CORE DATA
  const fetchStats = async (): Promise<boolean> => {
    try {
      console.log('📊 Fetching stats...');
      const response = await fetch(`${API_BASE}/admin/dashboard/stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data: ApiResponse<DashboardStats> = await response.json();
      
      if (data.success && data.data) {
        setStats(data.data);
        console.log('✅ Stats loaded successfully');
        return true;
      } else {
        throw new Error(data.message || 'Invalid stats data');
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      setStats(null);
      return false;
    }
  };

  // Fetch activities data - OPTIONAL
  const fetchActivities = async (): Promise<boolean> => {
    try {
      console.log('📝 Fetching activities...');
      const response = await fetch(`${API_BASE}/admin/dashboard/activities`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data: ApiResponse<ActivityHistory[]> = await response.json();
      
      if (data.success && data.data) {
        setActivityHistory(data.data);
        console.log('✅ Activities loaded successfully');
        return true;
      } else {
        throw new Error(data.message || 'Invalid activities data');
      }
    } catch (error) {
      console.error('❌ Error fetching activities:', error);
      setActivityHistory(null);
      return false;
    }
  };

  // Fetch maintenance data - OPTIONAL
  const fetchMaintenance = async (): Promise<boolean> => {
    try {
      console.log('🔧 Fetching maintenance...');
      const response = await fetch(`${API_BASE}/admin/dashboard/maintenance`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data: ApiResponse<MaintenanceSchedule[]> = await response.json();
      
      if (data.success && data.data) {
        setMaintenanceSchedule(data.data);
        console.log('✅ Maintenance loaded successfully');
        return true;
      } else {
        throw new Error(data.message || 'Invalid maintenance data');
      }
    } catch (error) {
      console.error('❌ Error fetching maintenance:', error);
      setMaintenanceSchedule(null);
      return false;
    }
  };

  // Fetch semua data yang available
  const fetchAvailableData = async () => {
    console.log('🚀 Starting to fetch available data...');
    setIsLoading(true);
    
    // Fetch stats dulu (wajib)
    const statsSuccess = await fetchStats();
    
    // Jika stats berhasil, fetch data lainnya
    if (statsSuccess) {
      console.log('✅ Stats success, fetching additional data...');
      await Promise.all([
        fetchActivities(),
        fetchMaintenance(),
      ]);
    } else {
      console.log('❌ Stats failed, skipping additional data');
      // Coba fetch activities/maintenance saja jika stats gagal
      await Promise.all([
        fetchActivities(),
        fetchMaintenance(),
      ]);
    }
    
    console.log('🎉 Available data fetch completed');
    console.log('📊 Data status:', {
      stats: !!stats,
      activities: !!activityHistory,
      maintenance: !!maintenanceSchedule
    });
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAvailableData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAvailableData().finally(() => setRefreshing(false));
  };

  // Data untuk stat cards - hanya jika stats available
  const statCardsData = stats ? [
    {
      icon: 'users',
      value: stats.total_users?.toString() || '0',
      label: 'Total Pengguna',
      color: '#10B981'
    },
    {
      icon: 'tool',
      value: stats.total_alat_berat?.toString() || '0',
      label: 'Alat Berat',
      color: '#3B82F6'
    },
    {
      icon: 'user-check',
      value: stats.total_petugas?.toString() || '0',
      label: 'Total Petugas',
      color: '#8B5CF6'
    },
    {
      icon: 'calendar',
      value: stats.active_penyewaan?.toString() || '0',
      label: 'Sedang Disewa',
      color: '#F59E0B'
    },
    {
      icon: 'alert-circle',
      value: stats.pending_approvals?.toString() || '0',
      label: 'Menunggu Persetujuan',
      color: '#EF4444'
    },
    {
      icon: 'dollar-sign',
      value: `Rp ${stats.total_revenue?.toLocaleString('id-ID') || '0'}`,
      label: 'Total Pendapatan',
      color: '#059669'
    }
  ] : [];

  const Header = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.pageTitle}>Dashboard Admin</Text>
        <Text style={styles.pageSubtitle}>
          Selamat datang kembali, mari mulai pekerjaan hari ini!
        </Text>
      </View>
      <View style={styles.dateTimeContainer}>
        <Text style={styles.dateText}>{currentDate.full}</Text>
        <Text style={styles.timeText}>{currentDate.time}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const LoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Memuat data dashboard...</Text>
    </View>
  );

  const NoDataState = () => (
    <View style={styles.noDataContainer}>
      <Text style={styles.noDataTitle}>Data Tidak Tersedia</Text>
      <Text style={styles.noDataText}>
        Tidak dapat memuat data dashboard. Pastikan server berjalan dengan baik.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchAvailableData}>
        <Text style={styles.retryButtonText}>Coba Lagi</Text>
      </TouchableOpacity>
    </View>
  );

  const DataStatusInfo = () => (
    <View style={styles.dataStatusContainer}>
      <Text style={styles.dataStatusTitle}>Status Data:</Text>
      <View style={styles.dataStatusList}>
        <Text style={styles.dataStatusItem}>
          📊 Statistik: {stats ? '✅ Tersedia' : '❌ Tidak tersedia'}
        </Text>
        <Text style={styles.dataStatusItem}>
          📝 Aktivitas: {activityHistory ? '✅ Tersedia' : '❌ Tidak tersedia'}
        </Text>
        <Text style={styles.dataStatusItem}>
          🔧 Maintenance: {maintenanceSchedule ? '✅ Tersedia' : '❌ Tidak tersedia'}
        </Text>
      </View>
    </View>
  );

  const MainContent = () => (
    <ScrollView 
      style={styles.mainContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Header />
      
      {isLoading ? (
        <LoadingState />
      ) : !stats && !activityHistory && !maintenanceSchedule ? (
        <NoDataState />
      ) : (
        <>
          {/* Stats Section - hanya jika stats available */}
          {stats && (
            <>
              <View style={styles.statsGrid}>
                {statCardsData.map((stat, index) => (
                  <StatCard
                    key={index}
                    icon={stat.icon}
                    value={stat.value}
                    label={stat.label}
                    color={stat.color}
                  />
                ))}
              </View>
              
              {/* Quick Info dari Stats */}
              <View style={styles.quickInfoContainer}>
                <Text style={styles.sectionTitle}>Informasi Cepat</Text>
                <View style={styles.quickInfoGrid}>
                  <View style={styles.quickInfoItem}>
                    <Text style={styles.quickInfoValue}>
                      {stats.new_users_this_month || 0}
                    </Text>
                    <Text style={styles.quickInfoLabel}>Pengguna Baru Bulan Ini</Text>
                  </View>
                  <View style={styles.quickInfoItem}>
                    <Text style={styles.quickInfoValue}>
                      Rp {stats.monthly_revenue?.toLocaleString('id-ID') || '0'}
                    </Text>
                    <Text style={styles.quickInfoLabel}>Pendapatan Bulan Ini</Text>
                  </View>
                  <View style={styles.quickInfoItem}>
                    <Text style={styles.quickInfoValue}>
                      {stats.pending_maintenance || 0}
                    </Text>
                    <Text style={styles.quickInfoLabel}>Maintenance Tertunda</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Main Panels - hanya jika data available */}
          <View style={styles.panelsContainer}>
            {/* Activities Panel - hanya jika activities available */}
            {activityHistory && (
              <ActivityCard 
                history={activityHistory} 
                title="Aktivitas Terbaru"
              />
            )}
            
            {/* Maintenance Panel - hanya jika maintenance available */}
            {maintenanceSchedule && (
              <MaintenanceCard 
                schedule={maintenanceSchedule}
                title="Jadwal Maintenance"
              />
            )}
          </View>

          {/* Data Status Info - untuk debugging */}
          <DataStatusInfo />
        </>
      )}
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
    flexDirection: 'row',
    backgroundColor: COLORS.white,
  },
  mainContent: {
    flex: 1,
    padding: 30,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  pageTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 32,
    color: '#F59E0B',
    marginBottom: 5,
    letterSpacing: 0.2,
  },
  pageSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#666',
  },
  dateTimeContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.primary,
  },
  timeText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: COLORS.darkGray,
  },
  refreshButton: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  panelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: COLORS.primary,
    marginTop: 10,
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    margin: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  noDataTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#92400E',
    marginBottom: 8,
  },
  noDataText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.white,
  },
  quickInfoContainer: {
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: COLORS.black,
    marginBottom: 15,
  },
  quickInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  quickInfoItem: {
    flex: 1,
    minWidth: 150,
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickInfoValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: COLORS.primary,
    marginBottom: 5,
  },
  quickInfoLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  dataStatusContainer: {
    backgroundColor: '#F3F4F6',
    padding: 15,
    margin: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6B7280',
  },
  dataStatusTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  dataStatusList: {
    gap: 4,
  },
  dataStatusItem: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#6B7280',
  },
});