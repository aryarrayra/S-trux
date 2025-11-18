import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Camera,
  Edit,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  FileText,
  ChevronRight,
  LogOut,
} from 'lucide-react-native';
import { COLORS } from '../../../constants/Colors';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconContainer}>
      <Icon size={18} color={COLORS.white} />
    </View>
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  </View>
);

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const [pelangganData, setPelangganData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileInfo, setProfileInfo] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      loadProfileData();
    }, [])
  );

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      
      const storedUserData = await AsyncStorage.getItem('userData');
      const storedPelangganData = await AsyncStorage.getItem('pelangganData');

      let user = null;
      let pelanggan = null;

      if (storedUserData) {
        user = JSON.parse(storedUserData);
        setUserData(user);
      }

      if (storedPelangganData) {
        pelanggan = JSON.parse(storedPelangganData);
        setPelangganData(pelanggan);
      }

      const updatedProfileInfo = [
        {
          icon: User,
          label: 'Nama Lengkap',
          value: pelanggan?.nama_pelanggan || user?.name || 'Tidak ada data',
        },
        {
          icon: Mail,
          label: 'Email',
          value: user?.email || pelanggan?.email || 'Tidak ada data',
        },
        {
          icon: Phone,
          label: 'Nomor Telepon',
          value: pelanggan?.no_telp || 'Tidak ada data',
        },
        {
          icon: Building2,
          label: 'Perusahaan',
          value: pelanggan?.company_name || 'Tidak ada data',
        },
        {
          icon: MapPin,
          label: 'Alamat',
          value: pelanggan?.alamat || 'Tidak ada data',
        },
      ];
      
      setProfileInfo(updatedProfileInfo);
      
    } catch (error) {
      setProfileInfo(getMockProfileInfo());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockProfileInfo = () => [
    {
      icon: User,
      label: 'Nama Lengkap',
      value: 'Data tidak tersedia',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'Data tidak tersedia',
    },
    {
      icon: Phone,
      label: 'Nomor Telepon',
      value: 'Data tidak tersedia',
    },
    {
      icon: Building2,
      label: 'Perusahaan',
      value: 'Data tidak tersedia',
    },
    {
      icon: MapPin,
      label: 'Alamat',
      value: 'Data tidak tersedia',
    },
  ];

  const handleEditProfile = () => {
    router.push('/user/editprofile');
  };

  const handleTermsAndConditions = () => {
    router.push('/user/termsandconditions');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['userToken', 'userData', 'pelangganData']);
              router.replace('/user/login');
            } catch (error) {
              router.replace('/user/login');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat data profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={{
                uri: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/33f0/c75a/47eabbba22aaa62621dea29c2361007f?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=C~CJj6a0StCy0Ead0mPL-37afjxjtLddDumGkAQbUiiHuyQnxzir20YVScZPsEq7Q2hjbmeCwnOf14o6Qw886~LeBgdAjlRb8Z~rvEZbGHBtaidb0Zu14IU0Q6adYpRLDpU~rnI55tQlku13uH6-fJ3qStNV9rkD5ZypQV~7qKZ7K3dOAGlGzyHWpy3VStskVffrkg5r8qX7BRJXGpEcls4KHnjhOToZd8I-azwef3TMuCyN9uij2xV2y3KlXmoix6wfAhOJHHYZKvqQ3RmBHPJiagXyen7VkHgEGFHHfzI~bYcJmMUp5dKiEg0RCDJ95VrPtDzJV9Jvt6RMn1kKag__',
              }}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>S`Trux</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.profileHeaderCard}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryGradientEnd]}
              style={styles.gradientHeader}
            />
            <View style={styles.profileDetails}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{
                    uri: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/be7e/389b/c8db882c474b7f5585b46df9d5a35c58?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=M8MJocKl7g96LpvLhk9FLDvA-Bx-rvNA~qqSAsKl5BgaNJw~XZcx4QCOKynIpqGW4f7W7khBssKh5IarPhhOAD-B1xOvM1TzAyGUVBx5JEb7Cc4KPs5el6Oe7pQ-ZjYug0iTASZ0od-zzOI3QZx8rUxhveD0nMCk8YArotnEo2~HZ0ZBFElajYjTPHPcNpPDRZ1BEwCCTp7dkJ4u5h4Z-W4OtfTxaFRf7RNCE2f6I7cWQEaQGbLEF6tMD7apOMlM4Z8HaNKt-28-X1ZamgTO7L9EhPf9USUSpQyg7JAMaqSoQlM05vbpDQF4FtRPDpzZbgljPiizIrVy49OI6CtSJg__',
                  }}
                  style={styles.avatar}
                />
                <TouchableOpacity style={styles.cameraButton}>
                  <Camera size={11} color={COLORS.black} />
                </TouchableOpacity>
              </View>
              <Text style={styles.profileName}>
                {pelangganData?.nama_pelanggan || userData?.name || 'Pengguna'}
              </Text>
              <Text style={styles.profileEmail}>
                {userData?.email || pelangganData?.email || 'email@example.com'}
              </Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {pelangganData?.total_sewa || '0'}
                  </Text>
                  <Text style={styles.statLabel}>total sewa</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: COLORS.historyCompleted }]}>
                    {pelangganData?.poin || '0'}
                  </Text>
                  <Text style={styles.statLabel}>poin</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Informasi profil</Text>
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={handleEditProfile}
              >
                <Edit size={16} color={COLORS.primary} />
                <Text style={styles.editText}>edit</Text>
              </TouchableOpacity>
            </View>
            {profileInfo.map((item, index) => (
              <InfoRow 
                key={index} 
                icon={item.icon} 
                label={item.label} 
                value={item.value} 
              />
            ))}
          </View>

          <TouchableOpacity style={styles.card} onPress={handleTermsAndConditions}>
            <View style={styles.tncRow}>
              <View style={styles.infoIconContainer}>
                <FileText size={24} color={COLORS.white} />
              </View>
              <View style={styles.tncTextContainer}>
                <Text style={styles.tncTitle}>Syarat & ketentuan</Text>
                <Text style={styles.tncSubtitle}>Baca ketentuan peminjaman</Text>
              </View>
              <ChevronRight size={27} color={COLORS.inactive} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={14} color={COLORS.historyCancelled} />
            <Text style={styles.logoutText}>Keluar</Text>
          </TouchableOpacity>

          <Text style={styles.appVersion}>S`Trux Mobile App V1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.black,
    marginTop: 10,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 34,
    height: 35,
  },
  logoText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: COLORS.black,
    marginLeft: 5,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 10,
  },
  profileHeaderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    paddingBottom: 20,
    marginBottom: 25,
  },
  gradientHeader: {
    height: 130,
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  profileDetails: {
    alignItems: 'center',
    marginTop: -50,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#29F3C0',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.white,
    width: 23,
    height: 23,
    borderRadius: 11.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.3,
    borderColor: COLORS.black,
  },
  profileName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.black,
    marginTop: 9,
  },
  profileEmail: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.black,
    marginTop: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 28,
    color: COLORS.primary,
  },
  statLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.black,
    marginTop: -5,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    padding: 17,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.black,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 3,
    backgroundColor: COLORS.buttonYellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.black,
  },
  infoValue: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.black,
  },
  tncRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tncTextContainer: {
    flex: 1,
    marginLeft: 5,
  },
  tncTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: COLORS.black,
  },
  tncSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.black,
  },
  logoutButton: {
    backgroundColor: COLORS.cancelledButtonBg,
    borderColor: COLORS.historyCancelled,
    borderWidth: 0.5,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 20,
  },
  logoutText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: COLORS.historyCancelled,
    marginLeft: 10,
  },
  appVersion: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 20,
  },
});