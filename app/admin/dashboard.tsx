import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { COLORS } from '@/constants/Colors';
import Sidebar from '@/components/admin/SideBar';
import StatCard from '@/components/admin/StatCard';
import ActivityCard from '@/components/admin/ActivityCard';
import MaintenanceCard from '@/components/admin/MaintenanceCard';

// ====================== TYPES ======================

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

type Activity = {
  title: string;
  company: string;
  time: string;
};

type MaintenanceSchedule = {
  id: number;
  name: string;
  task: string;
  alat_berat_name: string;
  alat_berat_jenis: string;
  date: string;
  due_date: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  biaya: number;
};

type AlatBerat = {
  id_alat: number;
  name_alat: string;
  jenis: string;
  kapasitas: string;
  harga_sewa_per_hari: string;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

// ====================== MAIN SCREEN ======================

export default function AdminDashboardScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768;
  const screenWidth = Dimensions.get('window').width;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activityHistory, setActivityHistory] = useState<ActivityHistory[] | null>(null);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<MaintenanceSchedule[] | null>(null);
  const [alatBeratList, setAlatBeratList] = useState<AlatBerat[]>([]);
  const [currentDate, setCurrentDate] = useState({ full: '', time: '' });
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = 'http://localhost:8000/api';

  useEffect(() => {
    const now = new Date();
    const formatDate = {
      full: now.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      time: now.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }) + ' WIB'
    };
    setCurrentDate(formatDate);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard/stats`);
      const json: ApiResponse<DashboardStats> = await res.json();
      if (json.success && json.data) setStats(json.data);
    } catch {
      setStats(null);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard/activities`);
      const json: ApiResponse<ActivityHistory[]> = await res.json();
      if (json.success && json.data) setActivityHistory(json.data);
    } catch {
      setActivityHistory(null);
    }
  };

  const fetchAlatBerat = async () => {
    try {
      console.log('🔄 Fetching alat berat data...');
      const res = await fetch(`${API_BASE}/alat-berat`);
      const json: ApiResponse<AlatBerat[]> = await res.json();
      
      if (json.success && json.data) {
        console.log('✅ Alat berat data loaded:', json.data.length, 'items');
        setAlatBeratList(json.data);
      } else {
        console.log('❌ No alat berat data found');
        setAlatBeratList([]);
      }
    } catch (error) {
      console.error('❌ Error fetching alat berat:', error);
      setAlatBeratList([]);
    }
  };

  const fetchMaintenance = async () => {
    try {
      console.log('🔄 Fetching maintenance data...');
      const res = await fetch(`${API_BASE}/perawatan-alat`);
      const json: ApiResponse<any[]> = await res.json();

      console.log('🔧 Raw maintenance response:', json);

      if (json.success && json.data && Array.isArray(json.data)) {
        console.log('🔧 Processing maintenance data with alat berat mapping...');
        
        // Map data maintenance dengan mencari nama alat dari alatBeratList
        const formattedMaintenance: MaintenanceSchedule[] = json.data.map((item, index) => {
          console.log(`🔧 Mapping maintenance item ${index}:`, item);
          
          // Cari alat berat berdasarkan id_alat
          const alatBerat = alatBeratList.find(alat => alat.id_alat === item.id_alat);
          console.log(`🔧 Found alat berat for id_alat ${item.id_alat}:`, alatBerat);
          
          const alatName = alatBerat ? alatBerat.nama_alat : `Alat #${item.id_alat}`;
          const alatJenis = alatBerat ? alatBerat.jenis : 'Heavy Equipment';
          
          // Gunakan keterangan sebagai task
          const task = item.keterangan || 'Maintenance Rutin';
          
          // Format tanggal
          const dueDate = item.tanggal_perawatan || new Date().toISOString();
          
          // Status
          const status = item.status || 'Dijadwalkan';
          
          // Biaya
          const biaya = parseFloat(item.biaya_perawatan) || 0;
          
          // Tentukan priority berdasarkan status
          let priority: 'low' | 'medium' | 'high' = 'medium';
          if (status.toLowerCase().includes('urgent') || biaya > 5000000) {
            priority = 'high';
          } else if (status.toLowerCase().includes('routine') || biaya < 1000000) {
            priority = 'low';
          }

          const formattedItem = {
            id: item.id_perawatan || item.id || index,
            name: alatName,
            task: task,
            alat_berat_name: alatName,
            alat_berat_jenis: alatJenis,
            date: dueDate,
            due_date: dueDate,
            status: status,
            priority: priority,
            biaya: biaya
          };

          console.log(`✅ Final formatted maintenance item ${index}:`, formattedItem);
          return formattedItem;
        });

        console.log('✅ FINAL FORMATTED MAINTENANCE DATA:', formattedMaintenance);
        setMaintenanceSchedule(formattedMaintenance);
        
      } else {
        console.log('❌ No valid maintenance data found');
        setMaintenanceSchedule([]);
      }
    } catch (error) {
      console.error('❌ Error fetching maintenance:', error);
      setMaintenanceSchedule([]);
    }
  };

  const fetchAll = async () => {
    setIsLoading(true);
    console.log('🎯 Starting to fetch all dashboard data...');
    
    try {
      // Pertama fetch alat berat, lalu maintenance yang butuh data alat berat
      await fetchStats();
      await fetchActivities();
      await fetchAlatBerat();
      await fetchMaintenance();
      
      console.log('✅ All data fetched successfully');
    } catch (error) {
      console.error('❌ Error in fetchAll:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Re-fetch maintenance ketika alatBeratList berubah
  useEffect(() => {
    if (alatBeratList.length > 0) {
      console.log('🔄 Alat berat list updated, re-fetching maintenance...');
      fetchMaintenance();
    }
  }, [alatBeratList]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll().finally(() => setRefreshing(false));
  };

  // Format activities
  const formattedActivities: Activity[] | null = activityHistory
    ? activityHistory.map(item => ({
      title: item.action || item.type,
      company: item.user_name || 'Unknown User',
      time: new Date(item.timestamp).toLocaleString('id-ID'),
    }))
    : null;

  // Stat cards data
  const statCardsData = stats ? [
    { 
      icon: 'users', 
      value: stats.total_users?.toString() || '0', 
      label: 'Total Pengguna', 
      color: '#10B981',
      bgColor: '#ECFDF5'
    },
    { 
      icon: 'tool', 
      value: stats.total_alat_berat?.toString() || '0', 
      label: 'Alat Berat', 
      color: '#3B82F6',
      bgColor: '#EFF6FF'
    },
    { 
      icon: 'user-check', 
      value: stats.total_petugas?.toString() || '0', 
      label: 'Total Petugas', 
      color: '#8B5CF6',
      bgColor: '#F5F3FF'
    },
    { 
      icon: 'calendar', 
      value: stats.active_penyewaan?.toString() || '0', 
      label: 'Sedang Disewa', 
      color: '#F59E0B',
      bgColor: '#FFFBEB'
    },
    { 
      icon: 'clock', 
      value: stats.pending_approvals?.toString() || '0', 
      label: 'Menunggu Persetujuan', 
      color: '#EF4444',
      bgColor: '#FEF2F2'
    },
    { 
      icon: 'dollar-sign', 
      value: `Rp ${stats.monthly_revenue?.toLocaleString('id-ID') || '0'}`, 
      label: 'Pendapatan Bulan Ini', 
      color: '#059669',
      bgColor: '#ECFDF5'
    },
  ] : [];

  // Calculate grid columns based on screen size
  const getGridColumns = () => {
    if (screenWidth >= 1024) return 3;
    if (screenWidth >= 768) return 2;
    return 1;
  };

  const gridColumns = getGridColumns();

  return (
    <View style={styles.container}>
      {isDesktop && <Sidebar />}

      <ScrollView 
        style={styles.mainContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.pageTitle}>Dashboard Admin</Text>
            <Text style={styles.pageSubtitle}>
              Selamat datang kembali! Ini adalah ringkasan aktivitas sistem Anda.
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{currentDate.full}</Text>
              <Text style={styles.timeText}>{currentDate.time}</Text>
            </View>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Memuat data dashboard...</Text>
            <Text style={styles.loadingSubtext}>
              Alat berat: {alatBeratList.length} items loaded
            </Text>
          </View>
        ) : (
          <>
            {/* Debug Info */}
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>
                Alat Berat: {alatBeratList.length} items | 
                Maintenance: {maintenanceSchedule ? maintenanceSchedule.length : 0} items
              </Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Ringkasan Statistik</Text>
                <Text style={styles.sectionSubtitle}>
                  Overview keseluruhan sistem
                </Text>
              </View>
              
              <View style={[
                styles.statsGrid,
                { 
                  flexDirection: gridColumns === 1 ? 'column' : 'row',
                  flexWrap: gridColumns === 1 ? 'nowrap' : 'wrap'
                }
              ]}>
                {statCardsData.map((stat, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.statItem,
                      { 
                        width: gridColumns === 1 ? '100%' : 
                              gridColumns === 2 ? '48%' : '31%'
                      }
                    ]}
                  >
                    <StatCard {...stat} />
                  </View>
                ))}
              </View>
            </View>

            {/* Charts and Activities Row */}
            <View style={styles.contentRow}>
              {/* Activities Section */}
              <View style={styles.activitiesSection}>
                {formattedActivities && (
                  <ActivityCard 
                    title="Aktivitas Terbaru" 
                    history={formattedActivities} 
                  />
                )}
              </View>

              {/* Maintenance Section */}
              <View style={styles.maintenanceSection}>
                {maintenanceSchedule && maintenanceSchedule.length > 0 ? (
                  <MaintenanceCard 
                    title="Jadwal Maintenance" 
                    schedule={maintenanceSchedule} 
                  />
                ) : (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>Tidak ada jadwal maintenance</Text>
                    <Text style={styles.emptyText}>
                      {alatBeratList.length > 0 
                        ? 'Tidak ada data maintenance yang aktif.'
                        : 'Sedang memuat data alat berat...'
                      }
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Additional Stats Row */}
            {stats && (
              <View style={styles.additionalStats}>
                <View style={styles.additionalStatCard}>
                  <Text style={styles.additionalStatValue}>
                    {stats.pending_maintenance || 0}
                  </Text>
                  <Text style={styles.additionalStatLabel}>
                    Maintenance Tertunda
                  </Text>
                </View>
                <View style={styles.additionalStatCard}>
                  <Text style={styles.additionalStatValue}>
                    {stats.completed_maintenance || 0}
                  </Text>
                  <Text style={styles.additionalStatLabel}>
                    Maintenance Selesai
                  </Text>
                </View>
                <View style={styles.additionalStatCard}>
                  <Text style={styles.additionalStatValue}>
                    {stats.new_users_this_month || 0}
                  </Text>
                  <Text style={styles.additionalStatLabel}>
                    Pengguna Baru (Bulan Ini)
                  </Text>
                </View>
              </View>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && !stats && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Tidak ada data</Text>
            <Text style={styles.emptyStateText}>
              Data dashboard tidak dapat dimuat. Silakan refresh atau periksa koneksi Anda.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchAll}>
              <Text style={styles.retryButtonText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ====================== STYLES ======================

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    flexDirection: 'row', 
    backgroundColor: '#F8FAFC' 
  },
  mainContent: { 
    flex: 1, 
    backgroundColor: '#F8FAFC', 
    paddingHorizontal: 16,
    paddingVertical: 20 
  },
  
  // Header Styles
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 8 
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  pageTitle: { 
    fontSize: 28, 
    fontFamily: 'Poppins_700Bold', 
    color: '#1E293B',
    marginBottom: 4 
  },
  pageSubtitle: { 
    fontSize: 14, 
    fontFamily: 'Poppins_400Regular', 
    color: '#64748B',
    lineHeight: 20 
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateText: { 
    fontFamily: 'Poppins_500Medium', 
    fontSize: 14, 
    color: '#475569',
    marginBottom: 2 
  },
  timeText: { 
    fontFamily: 'Poppins_600SemiBold', 
    fontSize: 14, 
    color: '#F59E0B' 
  },

  // Debug Info
  debugInfo: {
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 6,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#1E40AF',
  },

  // Section Styles
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#64748B',
  },

  // Stats Grid
  statsGrid: {
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    marginBottom: 12,
  },

  // Content Row
  contentRow: {
    flexDirection: Dimensions.get('window').width >= 768 ? 'row' : 'column',
    gap: 16,
    marginBottom: 24,
  },
  activitiesSection: {
    flex: Dimensions.get('window').width >= 768 ? 1 : 0,
    minHeight: 400,
  },
  maintenanceSection: {
    flex: Dimensions.get('window').width >= 768 ? 1 : 0,
    minHeight: 400,
  },

  // Additional Stats
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  additionalStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  additionalStatValue: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  additionalStatLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#64748B',
    textAlign: 'center',
  },

  // Loading State
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#64748B',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#94A3B8',
  },

  // Empty Card
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F1F5F9',
    borderStyle: 'dashed',
    minHeight: 200,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 8,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
});