import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    ScrollView, 
    Image, 
    TouchableOpacity, 
    Alert, 
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    StatusBar 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface StatCardProps {
    icon: React.ReactNode;
    count: string | number;
    label: string;
}

interface ActiveRentalCardProps {
    id_sewa: number;
    image: string;
    title: string;
    project: string;
    date: string;
    progress: string;
    status_sewa: string;
}

interface RecentActivityItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    time: string;
    status: 'approved' | 'rejected' | 'pending';
}

interface UserProfile {
    name: string;
    avatarUrl: string;
    activeRentals: number;
}

interface RentalStats {
    total: number;
    ongoing: number;
    completed: number;
}

interface Penyewaan {
    id_sewa: number;
    id_pelanggan: number;
    id_alat: number;
    tanggal_sewa: string;
    tanggal_kembali: string | null;
    total_harga: number;
    status_sewa: string;
    status_persetujuan: string;
    alasan_penolakan: string | null;
    nama_proyek: string | null;
    lokasi_proyek: string | null;
    deskripsi_proyek: string | null;
    latitude: number | null;
    longitude: number | null;
    dokumen_data: string | null;
    created_at: string;
    updated_at: string;
    alat?: {
        id_alat: number;
        nama_alat: string;
        gambar: string;
    };
    pelanggan?: {
        id_pelanggan: number;
        nama_pelanggan: string;
        foto_profil?: string;
    };
}

interface Pelanggan {
    id_pelanggan: number;
    id_user: number;
    nama_pelanggan: string;
    foto_profil?: string;
    // tambahan field lainnya
}

// ============================================================================
// CONSTANTS & API CONFIG
// ============================================================================

const COLORS = {
    background: '#F4F4F4',
    white: '#FFFFFF',
    black: '#000000',
    textGray: '#978D8D',
    darkGray: '#4B4B4B',
    mediumGray: '#323232',
    orange: '#F39F29',
    yellow: '#FDCB41',
    green: '#03CF00',
    red: '#CF0000',
    lightOrange: 'rgba(243, 159, 41, 0.1)',
    lightGreen: 'rgba(3, 207, 0, 0.1)',
    lightRed: 'rgba(207, 0, 0, 0.1)',
};

const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'https://strux-api.loca.lt/api';

// ============================================================================
// API SERVICE FUNCTIONS - DIPERBAIKI UNTUK AMBIL PELANGGAN YANG BENAR
// ============================================================================

class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async handleResponse(response: Response) {
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error Response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    }

    // FUNGSI BARU: Ambil data pelanggan berdasarkan user ID
    async getPelangganByUserId(): Promise<Pelanggan | null> {
        try {
            console.log('👤 [DASHBOARD] Getting pelanggan data by user ID...');
            
            // 1. Dapatkan user ID dari user yang login
            const userData = await AsyncStorage.getItem('userData');
            
            if (!userData) {
                console.log('❌ [DASHBOARD] No user data found in storage');
                return null;
            }

            const user = JSON.parse(userData);
            console.log('📋 [DASHBOARD] User data:', user);

            // Cari user ID dari berbagai kemungkinan field
            let userId: number | null = null;

            if (user.id) {
                userId = parseInt(user.id);
            } else if (user.user_id) {
                userId = parseInt(user.user_id);
            } else if (user.user && user.user.id) {
                userId = parseInt(user.user.id);
            }

            console.log('🔑 [DASHBOARD] Found user ID:', userId);

            if (!userId) {
                console.log('❌ [DASHBOARD] No user ID found');
                return null;
            }

            // 2. Panggil API untuk mendapatkan data pelanggan berdasarkan user ID
            console.log(`🌐 [DASHBOARD] Fetching pelanggan data for user ID: ${userId}`);
            
            // Coba endpoint yang berbeda
            const endpoints = [
                `${this.baseUrl}/pelanggan/by-user/${userId}`,
                `${this.baseUrl}/pelanggan/user/${userId}`,
                `${this.baseUrl}/pelanggan?user_id=${userId}`
            ];

            let pelangganData = null;

            for (const endpoint of endpoints) {
                try {
                    console.log(`🔄 [DASHBOARD] Trying endpoint: ${endpoint}`);
                    const response = await fetch(endpoint, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const result = await response.json();
                        console.log('✅ [DASHBOARD] Pelanggan API response:', result);

                        // Handle different response structures
                        if (result.data) {
                            pelangganData = Array.isArray(result.data) ? result.data[0] : result.data;
                        } else if (Array.isArray(result) && result.length > 0) {
                            pelangganData = result[0];
                        } else if (result.id_pelanggan) {
                            pelangganData = result;
                        }

                        if (pelangganData) {
                            console.log('🎯 [DASHBOARD] Found pelanggan data:', pelangganData);
                            break;
                        }
                    }
                } catch (error) {
                    console.log(`❌ [DASHBOARD] Endpoint failed: ${endpoint}`, error);
                    continue;
                }
            }

            if (!pelangganData) {
                console.log('❌ [DASHBOARD] No pelanggan data found for user ID:', userId);
                return null;
            }

            return pelangganData;

        } catch (error) {
            console.error('❌ [DASHBOARD] Error getting pelanggan data:', error);
            return null;
        }
    }

    // Fungsi untuk mendapatkan ID pelanggan (menggunakan fungsi di atas)
    async getPelangganId(): Promise<number | null> {
        try {
            const pelangganData = await this.getPelangganByUserId();
            
            if (pelangganData && pelangganData.id_pelanggan) {
                console.log('🎯 [DASHBOARD] Final pelanggan ID:', pelangganData.id_pelanggan);
                return pelangganData.id_pelanggan;
            }
            
            return null;
        } catch (error) {
            console.error('❌ [DASHBOARD] Error getting pelanggan ID:', error);
            return null;
        }
    }

    async getUserProfile(): Promise<{ name: string; avatarUrl: string }> {
        try {
            // Sekarang ambil dari data pelanggan, bukan user
            const pelangganData = await this.getPelangganByUserId();
            
            if (pelangganData) {
                return {
                    name: pelangganData.nama_pelanggan || 'Pengguna',
                    avatarUrl: pelangganData.foto_profil || 'https://via.placeholder.com/59x59?text=User'
                };
            }

            // Fallback ke user data jika pelanggan data tidak ditemukan
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                return {
                    name: user.nama || user.name || 'Pengguna',
                    avatarUrl: user.foto_profil || user.avatar || 'https://via.placeholder.com/59x59?text=User'
                };
            }

            return {
                name: 'Pengguna',
                avatarUrl: 'https://via.placeholder.com/59x59?text=User'
            };

        } catch (error) {
            console.error('❌ Error getting user profile:', error);
            return {
                name: 'Pengguna',
                avatarUrl: 'https://via.placeholder.com/59x59?text=User'
            };
        }
    }

    async getPenyewaanByPelanggan(pelangganId: number): Promise<Penyewaan[]> {
        try {
            console.log(`🔍 [DASHBOARD] Fetching penyewaan for pelanggan ID: ${pelangganId}`);
            
            const response = await fetch(`${this.baseUrl}/penyewaan/pelanggan/${pelangganId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            const result = await this.handleResponse(response);
            console.log('📊 [DASHBOARD] Penyewaan API response:', result);
            
            if (result.data !== undefined) {
                return result.data || [];
            } else if (Array.isArray(result)) {
                return result;
            } else {
                console.warn('⚠️ [DASHBOARD] Unexpected response structure:', result);
                return [];
            }
            
        } catch (error) {
            console.error('❌ [DASHBOARD] Error fetching penyewaan:', error);
            throw error;
        }
    }

    async testConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });
            
            return response.ok;
        } catch (error) {
            console.error('❌ API connection test failed:', error);
            return false;
        }
    }
}

const apiService = new ApiService(API_BASE_URL);

// ============================================================================
// UTILITY FUNCTIONS (sama seperti sebelumnya)
// ============================================================================

const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch (error) {
        return 'Tanggal tidak valid';
    }
};

const getRentalProgress = (status: string, startDate: string, endDate: string): string => {
    switch (status) {
        case 'Menunggu Persetujuan':
            return '0%';
        case 'Dalam Pengantaran':
            return '25%';
        case 'Berjalan':
            try {
                const start = new Date(startDate).getTime();
                const end = new Date(endDate).getTime();
                const now = new Date().getTime();
                
                if (now < start) return '25%';
                if (now > end) return '100%';
                
                const total = end - start;
                const elapsed = now - start;
                const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
                return `${Math.round(progress)}%`;
            } catch (error) {
                return '50%';
            }
        case 'Selesai':
            return '100%';
        case 'Dibatalkan':
            return '0%';
        default:
            return '0%';
    }
};

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'Menunggu Persetujuan':
            return COLORS.orange;
        case 'Dalam Pengantaran':
            return COLORS.yellow;
        case 'Berjalan':
            return COLORS.green;
        case 'Selesai':
            return COLORS.green;
        case 'Dibatalkan':
            return COLORS.red;
        default:
            return COLORS.textGray;
    }
};

const getStatusBackgroundColor = (status: string): string => {
    switch (status) {
        case 'Menunggu Persetujuan':
            return COLORS.lightOrange;
        case 'Dalam Pengantaran':
            return 'rgba(253, 203, 65, 0.1)';
        case 'Berjalan':
            return COLORS.lightGreen;
        case 'Selesai':
            return COLORS.lightGreen;
        case 'Dibatalkan':
            return COLORS.lightRed;
        default:
            return '#F4F4F4';
    }
};

// ============================================================================
// SUBCOMPONENTS (sama seperti sebelumnya)
// ============================================================================

const StatCard: React.FC<StatCardProps> = ({ icon, count, label }) => (
    <View style={styles.statCard}>
        <View style={styles.statIcon}>{icon}</View>
        <Text style={styles.statCount}>{count}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const ActiveRentalCard: React.FC<ActiveRentalCardProps> = ({
    id_sewa,
    image,
    title,
    project,
    date,
    progress,
    status_sewa
}) => (
    <TouchableOpacity style={styles.rentalCard} onPress={() => console.log('Navigate to rental detail:', id_sewa)}>
        <Image source={{ uri: image }} style={styles.rentalImage} />
        <View style={styles.rentalInfo}>
            <Text style={styles.rentalTitle} numberOfLines={1}>{title}</Text>
            <Text style={styles.rentalProject} numberOfLines={1}>{project}</Text>
            <Text style={styles.rentalDate}>{date}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusBackgroundColor(status_sewa) }]}>
                <Text style={[styles.statusText, { color: getStatusColor(status_sewa) }]}>
                    {status_sewa}
                </Text>
            </View>
        </View>
        <View style={styles.progressContainer}>
            <Text style={styles.rentalProgress}>{progress}</Text>
        </View>
    </TouchableOpacity>
);

const RecentActivityItem: React.FC<RecentActivityItemProps> = ({
    icon,
    title,
    subtitle,
    time,
    status
}) => (
    <View style={styles.activityItem}>
        <View style={[styles.activityIconContainer, 
            status === 'approved' ? styles.approvedBg : 
            status === 'rejected' ? styles.rejectedBg : styles.pendingBg]}>
            {icon}
        </View>
        <View style={styles.activityTextContainer}>
            <Text style={styles.activityTitle} numberOfLines={2}>{title}</Text>
            <Text style={styles.activitySubtitle} numberOfLines={1}>{subtitle}</Text>
            <Text style={styles.activityTime}>{time}</Text>
        </View>
    </View>
);

const WelcomeCard: React.FC<{ user: UserProfile }> = ({ user }) => (
    <View style={styles.welcomeCard}>
        <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeGreeting}>Selamat Datang,</Text>
            <Text style={styles.welcomeName}>{user.name}</Text>
            <Text style={styles.welcomeMessage}>
                Anda memiliki {user.activeRentals} sewa aktif, mohon jaga alat berat dengan baik
            </Text>
        </View>
        <Image source={{ uri: user.avatarUrl }} style={styles.profilePic} />
    </View>
);

const StatsSection: React.FC<{ stats: RentalStats; loading?: boolean }> = ({ stats, loading = false }) => (
    <View style={styles.statsContainer}>
        {loading ? (
            <>
                <View style={[styles.statCard, styles.loadingCard]}>
                    <ActivityIndicator size="small" color={COLORS.orange} />
                </View>
                <View style={[styles.statCard, styles.loadingCard]}>
                    <ActivityIndicator size="small" color={COLORS.orange} />
                </View>
                <View style={[styles.statCard, styles.loadingCard]}>
                    <ActivityIndicator size="small" color={COLORS.orange} />
                </View>
            </>
        ) : (
            <>
                <StatCard icon={<Text style={styles.iconText}>📦</Text>} count={stats.total} label="Total Sewa" />
                <StatCard icon={<Text style={styles.iconText}>⏱️</Text>} count={stats.ongoing} label="Berlangsung" />
                <StatCard icon={<Text style={styles.iconText}>✅</Text>} count={stats.completed} label="Selesai" />
            </>
        )}
    </View>
);

const SectionHeader: React.FC<{
    title: string;
    onSeeAll?: () => void;
    showSeeAll?: boolean;
}> = ({ title, onSeeAll, showSeeAll = false }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showSeeAll && (
            <TouchableOpacity style={styles.seeAllButton} onPress={onSeeAll}>
                <Text style={styles.seeAllText}>Lihat Semua</Text>
                <Text style={styles.seeAllText}>›</Text>
            </TouchableOpacity>
        )}
    </View>
);

// ============================================================================
// MAIN COMPONENT - DIPERBAIKI
// ============================================================================

export default function DashboardScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userData, setUserData] = useState<UserProfile>({
        name: 'Loading...',
        avatarUrl: 'https://via.placeholder.com/59x59?text=User',
        activeRentals: 0
    });
    const [rentalStats, setRentalStats] = useState<RentalStats>({
        total: 0,
        ongoing: 0,
        completed: 0
    });
    const [activeRentals, setActiveRentals] = useState<ActiveRentalCardProps[]>([]);
    const [recentActivities, setRecentActivities] = useState<RecentActivityItemProps[]>([]);
    const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const [pelangganId, setPelangganId] = useState<number | null>(null);
    const [userId, setUserId] = useState<number | null>(null);

    const fetchDashboardData = async (useMockData = false) => {
        try {
            setLoading(true);
            console.log('🔄 [DASHBOARD] Starting to fetch dashboard data...');
            
            // 1. Dapatkan data pelanggan berdasarkan user ID
            const pelangganData = await apiService.getPelangganByUserId();
            
            if (!pelangganData && !useMockData) {
                Alert.alert(
                    'Error', 
                    'Tidak dapat menemukan data pelanggan. Silakan login ulang.',
                    [
                        { text: 'Gunakan Data Demo', onPress: () => fetchDashboardData(true) }
                    ]
                );
                return;
            }

            const currentPelangganId = pelangganData?.id_pelanggan || null;
            setPelangganId(currentPelangganId);

            // Simpan user ID untuk debug
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                setUserId(user.id || user.user_id || null);
            }

            console.log(`🎯 [DASHBOARD] Using pelanggan ID: ${currentPelangganId}`);

            let penyewaanData: Penyewaan[] = [];

            if (useMockData) {
                console.log('📦 [DASHBOARD] Using MOCK DATA');
                await new Promise(resolve => setTimeout(resolve, 1000));
                // Filter mock data berdasarkan pelanggan ID yang benar
                penyewaanData = [];
                setApiStatus('offline');
            } else {
                console.log('🌐 [DASHBOARD] Using REAL API');
                const isApiOnline = await apiService.testConnection();
                setApiStatus(isApiOnline ? 'online' : 'offline');
                
                if (isApiOnline && currentPelangganId) {
                    penyewaanData = await apiService.getPenyewaanByPelanggan(currentPelangganId);
                } else {
                    throw new Error('API tidak dapat diakses');
                }
            }

            console.log('📊 [DASHBOARD] Processed data count:', penyewaanData.length);
            
            // Process stats
            const total = penyewaanData.length;
            const ongoing = penyewaanData.filter(sewa => 
                ['Menunggu Persetujuan', 'Dalam Pengantaran', 'Berjalan'].includes(sewa.status_sewa)
            ).length;
            const completed = penyewaanData.filter(sewa => 
                ['Selesai', 'Dibatalkan'].includes(sewa.status_sewa)
            ).length;

            setRentalStats({ total, ongoing, completed });

            // Process active rentals
            const ongoingRentals = penyewaanData
                .filter(sewa => ['Menunggu Persetujuan', 'Dalam Pengantaran', 'Berjalan'].includes(sewa.status_sewa))
                .slice(0, 2)
                .map(sewa => ({
                    id_sewa: sewa.id_sewa,
                    image: sewa.alat?.gambar || 'https://via.placeholder.com/85x85?text=Alat+Berat',
                    title: sewa.alat?.nama_alat || 'Alat Berat',
                    project: sewa.nama_proyek || 'Proyek Tanpa Nama',
                    date: `${formatDate(sewa.tanggal_sewa)} - ${sewa.tanggal_kembali ? formatDate(sewa.tanggal_kembali) : 'Belum ditentukan'}`,
                    progress: getRentalProgress(sewa.status_sewa, sewa.tanggal_sewa, sewa.tanggal_kembali || sewa.tanggal_sewa),
                    status_sewa: sewa.status_sewa
                }));

            setActiveRentals(ongoingRentals);

            // Update user data
            const userProfile = await apiService.getUserProfile();
            setUserData({
                ...userProfile,
                activeRentals: ongoing
            });

            // Process recent activities
            const activities = penyewaanData.slice(0, 2).map(sewa => {
                const isApproved = sewa.status_persetujuan === 'Disetujui';
                const isRejected = sewa.status_persetujuan === 'Ditolak';
                
                let icon, title, status: 'approved' | 'rejected' | 'pending';
                
                if (isApproved) {
                    icon = <Text style={styles.iconText}>✅</Text>;
                    title = 'Pengajuan Sewa Disetujui';
                    status = 'approved';
                } else if (isRejected) {
                    icon = <Text style={styles.iconText}>❌</Text>;
                    title = `Pengajuan Sewa Ditolak${sewa.alasan_penolakan ? ` (${sewa.alasan_penolakan})` : ''}`;
                    status = 'rejected';
                } else {
                    icon = <Text style={styles.iconText}>⏱️</Text>;
                    title = 'Pengajuan Sewa Menunggu Persetujuan';
                    status = 'pending';
                }
                
                return {
                    icon,
                    title,
                    subtitle: sewa.alat?.nama_alat || 'Alat Berat',
                    time: formatDate(sewa.updated_at),
                    status
                };
            });

            setRecentActivities(activities);
            console.log('✅ [DASHBOARD] Dashboard data processed successfully');

        } catch (error: any) {
            console.error('❌ [DASHBOARD] Error in fetchDashboardData:', error);
            
            if (!useMockData) {
                console.log('🔄 [DASHBOARD] Retrying with mock data...');
                fetchDashboardData(true);
            } else {
                Alert.alert(
                    'Error', 
                    error.message || 'Gagal memuat data dashboard',
                    [
                        { text: 'Coba Lagi', onPress: () => fetchDashboardData(false) },
                        { text: 'Gunakan Data Demo', onPress: () => fetchDashboardData(true) }
                    ]
                );
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData(false);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDashboardData(false);
    };

    const handleSeeAllRentals = () => {
        console.log('Navigate to all rentals');
    };

    // Debug function untuk melihat data
    const debugData = async () => {
        console.log('👤 [DASHBOARD DEBUG] Checking all data...');
        
        const userData = await AsyncStorage.getItem('userData');
        console.log('📋 Raw user data:', userData);
        
        const pelangganData = await apiService.getPelangganByUserId();
        console.log('🎯 Pelanggan data:', pelangganData);
        
        Alert.alert(
            'Debug Info',
            `User ID: ${userId}\nPelanggan ID: ${pelangganId}\nTotal Data: ${rentalStats.total}`
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar 
                backgroundColor={COLORS.white} 
                barStyle="dark-content" 
                translucent={false}
            />
            
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Image
                        source={{ uri: 'https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/33f0/c75a/47eabbba22aaa62621dea29c2361007f?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=C~CJj6a0StCy0Ead0mPL-37afjxjtLddDumGkAQbUiiHuyQnxzir20YVScZPsEq7Q2hjbmeCwnOf14o6Qw886~LeBgdAjlRb8Z~rvEZbGHBtaidb0Zu14IU0Q6adYpRLDpU~rnI55tQlku13uH6-fJ3qStNV9rkD5ZypQV~7qKZ7K3dOAGlGzyHWpy3VStskVffrkg5r8qX7BRJXGpEcls4KHnjhOToZd8I-azwef3TMuCyN9uij2xV2y3KlXmoix6wfAhOJHHYZKvqQ3RmBHPJiagXyen7VkHgEGFHHfzI~bYcJmMUp5dKiEg0RCDJ95VrPtDzJV9Jvt6RMn1kKag__' }}
                        style={styles.logo}
                    />
                    <Text style={styles.logoText}>S`Trux</Text>
                </View>
                <View style={styles.headerRight}>
                    {apiStatus !== 'checking' && (
                        <View style={[
                            styles.apiStatus, 
                            apiStatus === 'online' ? styles.apiOnline : styles.apiOffline
                        ]}>
                            <Text style={styles.apiStatusText}>
                                {apiStatus === 'online' ? '🟢' : '🔴'}
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity onPress={debugData} style={styles.debugButton}>
                        <Text style={styles.debugButtonText}>🐛</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[COLORS.orange]}
                        tintColor={COLORS.orange}
                    />
                }
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.content}>
                    {/* Welcome Card */}
                    <WelcomeCard user={userData} />

                    {/* Debug Info */}
                    {(userId || pelangganId) && (
                        <View style={styles.debugInfo}>
                            <Text style={styles.debugInfoText}>
                                User ID: {userId} | Pelanggan ID: {pelangganId || 'Tidak ditemukan'}
                            </Text>
                        </View>
                    )}

                    {/* Stats Section */}
                    <View style={styles.statsSection}>
                        <Text style={styles.sectionTitle}>Statistik Sewa</Text>
                        <StatsSection stats={rentalStats} loading={loading} />
                    </View>

                    {/* Active Rentals Section */}
                    <View style={styles.section}>
                        <SectionHeader
                            title="Penyewaan Aktif"
                            showSeeAll={activeRentals.length > 0}
                            onSeeAll={handleSeeAllRentals}
                        />

                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={COLORS.orange} />
                                <Text style={styles.loadingText}>Memuat data penyewaan...</Text>
                            </View>
                        ) : activeRentals.length > 0 ? (
                            activeRentals.map((rental) => (
                                <ActiveRentalCard key={rental.id_sewa} {...rental} />
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>Tidak ada penyewaan aktif</Text>
                                <Text style={styles.emptyStateSubtext}>
                                    {pelangganId 
                                        ? `Belum ada transaksi untuk pelanggan ID: ${pelangganId}`
                                        : 'Tidak dapat menemukan data pelanggan'
                                    }
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Recent Activity Section */}
                    <View style={styles.section}>
                        <SectionHeader title="Aktivitas Terbaru" />

                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={COLORS.orange} />
                                <Text style={styles.loadingText}>Memuat aktivitas...</Text>
                            </View>
                        ) : recentActivities.length > 0 ? (
                            recentActivities.map((activity, index) => (
                                <RecentActivityItem key={index} {...activity} />
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>Tidak ada aktivitas terbaru</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.bottomSpacer} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ============================================================================
// STYLES (sama seperti sebelumnya dengan beberapa tambahan)
// ============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logo: {
        width: 34,
        height: 35,
        resizeMode: 'contain',
    },
    logoText: {
        fontWeight: '600',
        fontSize: 18,
        color: COLORS.black,
        marginLeft: 8,
    },
    apiStatus: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    apiOnline: {
        backgroundColor: COLORS.lightGreen,
    },
    apiOffline: {
        backgroundColor: COLORS.lightOrange,
    },
    apiStatusText: {
        fontWeight: '500',
        fontSize: 12,
    },
    debugButton: {
        width: 32,
        height: 32,
        backgroundColor: COLORS.lightOrange,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    debugButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    debugInfo: {
        backgroundColor: COLORS.lightOrange,
        padding: 8,
        borderRadius: 8,
        marginBottom: 16,
    },
    debugInfoText: {
        fontSize: 10,
        color: COLORS.darkGray,
        textAlign: 'center',
        fontWeight: '500',
    },
    section: {
        marginBottom: 24,
    },
    statsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontWeight: '600',
        fontSize: 16,
        color: COLORS.black,
        marginBottom: 12,
    },
    welcomeCard: {
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: COLORS.orange,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    welcomeTextContainer: {
        flex: 1,
        marginRight: 16,
    },
    welcomeGreeting: {
        fontWeight: '400',
        fontSize: 14,
        color: COLORS.darkGray,
        marginBottom: 4,
    },
    welcomeName: {
        fontWeight: '600',
        fontSize: 18,
        color: COLORS.white,
        marginBottom: 8,
    },
    welcomeMessage: {
        fontWeight: '400',
        fontSize: 12,
        color: COLORS.darkGray,
        lineHeight: 16,
    },
    profilePic: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    statCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        alignItems: 'flex-start',
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statIcon: {
        marginBottom: 8,
    },
    iconText: {
        fontSize: 20,
    },
    statCount: {
        fontWeight: '700',
        fontSize: 20,
        color: COLORS.mediumGray,
        marginBottom: 4,
    },
    statLabel: {
        fontWeight: '400',
        fontSize: 12,
        color: COLORS.textGray,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAllText: {
        fontWeight: '400',
        fontSize: 12,
        color: COLORS.orange,
        marginRight: 4,
    },
    rentalCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    rentalImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
    },
    rentalInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },
    rentalTitle: {
        fontWeight: '600',
        fontSize: 14,
        color: COLORS.black,
        marginBottom: 4,
    },
    rentalProject: {
        fontWeight: '400',
        fontSize: 12,
        color: COLORS.black,
        marginBottom: 2,
    },
    rentalDate: {
        fontWeight: '400',
        fontSize: 11,
        color: COLORS.textGray,
        marginBottom: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontWeight: '500',
        fontSize: 10,
    },
    progressContainer: {
        alignItems: 'center',
    },
    rentalProgress: {
        fontWeight: '600',
        fontSize: 12,
        color: COLORS.orange,
    },
    activityItem: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    activityIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    approvedBg: {
        backgroundColor: COLORS.lightGreen,
    },
    rejectedBg: {
        backgroundColor: COLORS.lightRed,
    },
    pendingBg: {
        backgroundColor: COLORS.lightOrange,
    },
    activityTextContainer: {
        flex: 1,
    },
    activityTitle: {
        fontWeight: '600',
        fontSize: 13,
        color: COLORS.black,
        marginBottom: 2,
    },
    activitySubtitle: {
        fontWeight: '400',
        fontSize: 12,
        color: COLORS.black,
        marginBottom: 2,
    },
    activityTime: {
        fontWeight: '400',
        fontSize: 11,
        color: COLORS.textGray,
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        fontWeight: '400',
        fontSize: 14,
        color: COLORS.textGray,
        marginTop: 12,
    },
    loadingCard: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 100,
    },
    emptyState: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        marginBottom: 12,
    },
    emptyStateText: {
        fontWeight: '400',
        fontSize: 14,
        color: COLORS.textGray,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateSubtext: {
        fontWeight: '400',
        fontSize: 12,
        color: COLORS.textGray,
        textAlign: 'center',
    },
    bottomSpacer: {
        height: 20,
    },
});