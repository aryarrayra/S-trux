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

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

// ====================== MAIN SCREEN ======================

export default function AdminDashboardScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activityHistory, setActivityHistory] = useState<ActivityHistory[] | null>(null);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<MaintenanceSchedule[] | null>(null);
  const [currentDate, setCurrentDate] = useState({ full: '', time: '' });
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = 'http://localhost:8000/api';

  useEffect(() => {
    const now = new Date();
    const formatDate = {
      full: now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
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

  const fetchMaintenance = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard/maintenance`);
      const json: ApiResponse<any[]> = await res.json();

      if (json.success && json.data) {
        setMaintenanceSchedule(
          json.data.map(item => ({
            id: item.id,
            name: item.alat_berat_name || item.name || 'Unknown',
            task: item.task || 'Unknown Task',
            alat_berat_name: item.alat_berat_name || 'Unknown',
            alat_berat_jenis: item.alat_berat_jenis || 'Unknown',
            date: item.due_date,
            due_date: item.due_date,
            status: item.status,
            priority: item.priority || 'medium',
            biaya: item.biaya || 0,
          }))
        );
      }
    } catch {
      setMaintenanceSchedule(null);
    }
  };

  const fetchAll = async () => {
    setIsLoading(true);
    await Promise.all([fetchStats(), fetchActivities(), fetchMaintenance()]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll().finally(() => setRefreshing(false));
  };

  // ================== FIX HERE: Map ActivityHistory → Activity ==================
  const formattedActivities: Activity[] | null = activityHistory
    ? activityHistory.map(item => ({
      title: item.action || item.type,
      company: item.user_name || 'Unknown User',
      time: new Date(item.timestamp).toLocaleString('id-ID'),
    }))
    : null;

  const statCardsData = stats ? [
    { icon: 'users', value: stats.total_users?.toString(), label: 'Total Pengguna', color: '#10B981' },
    { icon: 'tool', value: stats.total_alat_berat?.toString(), label: 'Alat Berat', color: '#3B82F6' },
    { icon: 'user-check', value: stats.total_petugas?.toString(), label: 'Total Petugas', color: '#8B5CF6' },
    { icon: 'calendar', value: stats.active_penyewaan?.toString(), label: 'Sedang Disewa', color: '#F59E0B' },
  ] : [];

  return (
    <View style={styles.container}>
      {isDesktop && <Sidebar />}

      <ScrollView style={styles.mainContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Dashboard Admin</Text>
            <Text style={styles.pageSubtitle}>Selamat datang kembali!</Text>
          </View>
          <View>
            <Text style={styles.dateText}>{currentDate.full}</Text>
            <Text style={styles.dateText}>{currentDate.time}</Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <>
            {/* Stats */}
            <View style={styles.statsGrid}>
              {statCardsData.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </View>

            {/* Activities */}
            {formattedActivities && (
              <ActivityCard title="Aktivitas Terbaru" history={formattedActivities} />
            )}

            {/* Maintenance */}
            {maintenanceSchedule && (
              <MaintenanceCard title="Jadwal Maintenance" schedule={maintenanceSchedule} />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ====================== STYLES ======================

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.white },
  mainContent: { flex: 1, backgroundColor: COLORS.white, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  pageTitle: { fontSize: 28, fontFamily: 'Poppins_600SemiBold', color: '#F59E0B' },
  pageSubtitle: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#666' },
  dateText: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: COLORS.darkGray },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20, marginTop: 10 },
});
