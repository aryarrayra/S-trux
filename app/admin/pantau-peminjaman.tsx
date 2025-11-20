import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  ActivityIndicator, 
  Alert,
  RefreshControl,
  Dimensions 
} from 'react-native';
import { MapPin, Search, X, Clock, Calendar, AlertCircle, Navigation, Users } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import SideBar from '@/components/admin/SideBar';
import { Stack } from 'expo-router';

// Interface untuk data penyewaan
interface Penyewaan {
  id_sewa: number;
  alat?: {
    nama_alat: string;
  };
  pelanggan?: {
    nama: string;
  };
  tanggal_sewa: string;
  tanggal_kembali: string | null;
  lokasi_proyek: string;
  nama_proyek: string;
  deskripsi_proyek: string;
  status_sewa: string;
  status_persetujuan: string;
  latitude?: number;
  longitude?: number;
}

// Interface untuk data yang ditransformasi
interface TransformedLoan {
  id_sewa: number;
  id: string;
  equipment: string;
  type: string;
  borrower: string;
  unit: string;
  latitude: number;
  longitude: number;
  lokasi_proyek: string;
  startDate: string;
  endDate: string;
  duration: string;
  condition: string;
  nama_proyek: string;
  deskripsi_proyek: string;
  status_sewa: string;
  status_persetujuan: string;
  originalData: Penyewaan;
}

// Fungsi Fetch Langsung ke API
const fetchAllPenyewaanFromAPI = async (): Promise<Penyewaan[]> => {
  try {
    console.log('🌐 [API] Fetching all penyewaan from API...');
    
    const response = await fetch('http://127.0.0.1:8000/api/penyewaan', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('📡 [API] Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ [API] Data received successfully');
    
    // Handle berbagai kemungkinan struktur response
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.data)) {
        return data.data;
      } else if (Array.isArray(data.penyewaan)) {
        return data.penyewaan;
      } else if (Array.isArray(data.result)) {
        return data.result;
      } else {
        console.log('⚠️ [API] Data is object but no array found, returning empty array');
        return [];
      }
    } else {
      console.log('⚠️ [API] Data is not array or object, returning empty array');
      return [];
    }
    
  } catch (error) {
    console.error('❌ [API] Fetch error:', error);
    throw error;
  }
};

const fetchActivePenyewaanFromAPI = async (): Promise<Penyewaan[]> => {
  try {
    console.log('🌐 [API] Fetching active penyewaan from API...');
    
    const allData = await fetchAllPenyewaanFromAPI();
    
    if (!Array.isArray(allData)) {
      console.log('⚠️ [API] allData is not array:', allData);
      return [];
    }
    
    const activeData = allData.filter(item => item.status_sewa === 'Berjalan');
    
    console.log('✅ [API] Active data filtered:', activeData.length);
    return activeData;
  } catch (error) {
    console.error('❌ [API] Active fetch error:', error);
    throw error;
  }
};

// Warna untuk setiap jenis alat berat
const getEquipmentColor = (equipmentType: string): string => {
  const colorMap: { [key: string]: string } = {
    'excavator': '#F59E0B',
    'bulldozer': '#EF4444',
    'crane': '#10B981',
    'loader': '#3B82F6',
    'dumper': '#8B5CF6',
    'grader': '#F97316',
    'compactor': '#06B6D4',
    'mixer': '#84CC16',
    'forklift': '#F43F5E',
    'default': '#6B7280'
  };

  const type = equipmentType.toLowerCase();
  for (const [key, color] of Object.entries(colorMap)) {
    if (type.includes(key)) {
      return color;
    }
  }
  return colorMap.default;
};

// Komponen Peta Leaflet untuk Web
const LeafletMap = ({ 
  loans, 
  onMarkerClick 
}: { 
  loans: TransformedLoan[], 
  onMarkerClick: (loan: TransformedLoan) => void 
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const { width } = Dimensions.get('window');

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  const validLoans = loans.filter(loan => 
    loan.latitude && loan.longitude && 
    !isNaN(loan.latitude) && !isNaN(loan.longitude)
  );

  if (validLoans.length === 0) {
    return (
      <View style={styles.mapFallback}>
        <View style={styles.noLocations}>
          <MapPin size={48} color="#ccc" />
          <Text style={styles.noLocationsText}>Tidak ada data lokasi</Text>
          <Text style={styles.noLocationsSubtext}>
            Data koordinat latitude dan longitude tidak tersedia
          </Text>
        </View>
      </View>
    );
  }

  // Calculate map center from valid loans
  const centerLat = validLoans.reduce((sum, loan) => sum + loan.latitude, 0) / validLoans.length;
  const centerLng = validLoans.reduce((sum, loan) => sum + loan.longitude, 0) / validLoans.length;

  return (
    <View style={styles.leafletMapContainer}>
      {/* Leaflet Map Container */}
      <View style={styles.leafletMap}>
        {mapLoaded && (
          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Lokasi Alat Berat</title>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                <style>
                  body { margin: 0; padding: 0; }
                  #map { height: 100vh; width: 100%; }
                  .custom-marker {
                    border: 3px solid #FFFFFF;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  }
                  .leaflet-popup-content {
                    font-family: Arial, sans-serif;
                    min-width: 200px;
                  }
                  .popup-title {
                    font-weight: bold;
                    color: #F59E0B;
                    margin-bottom: 8px;
                    font-size: 14px;
                  }
                  .popup-info {
                    font-size: 12px;
                    color: #666;
                    margin-bottom: 4px;
                  }
                  .popup-status {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: bold;
                    margin-top: 4px;
                  }
                  .status-active { background: #4CAF50; color: white; }
                  .status-pending { background: #FF9800; color: white; }
                </style>
              </head>
              <body>
                <div id="map"></div>
                <script>
                  // Initialize map
                  const map = L.map('map').setView([${centerLat}, ${centerLng}], 12);

                  // Add tile layer
                  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 18
                  }).addTo(map);

                  // Add markers for each loan
                  const loans = ${JSON.stringify(validLoans.map(loan => ({
                    id: loan.id,
                    equipment: loan.equipment,
                    type: loan.type,
                    borrower: loan.borrower,
                    lokasi_proyek: loan.lokasi_proyek,
                    nama_proyek: loan.nama_proyek,
                    status_sewa: loan.status_sewa,
                    status_persetujuan: loan.status_persetujuan,
                    latitude: loan.latitude,
                    longitude: loan.longitude,
                    color: getEquipmentColor(loan.type)
                  })))};

                  loans.forEach((loan, index) => {
                    // Create custom marker dengan warna berdasarkan jenis alat
                    const customIcon = L.divIcon({
                      className: 'custom-marker-icon',
                      html: \`<div class="custom-marker" style="background: \${loan.color}">\${index + 1}</div>\`,
                      iconSize: [30, 30],
                      iconAnchor: [15, 15]
                    });

                    // Create marker
                    const marker = L.marker([loan.latitude, loan.longitude], {
                      icon: customIcon
                    }).addTo(map);

                    // Create popup content
                    const popupContent = \`
                      <div>
                        <div class="popup-title">\${loan.equipment}</div>
                        <div class="popup-info"><strong>Jenis:</strong> \${loan.type}</div>
                        <div class="popup-info"><strong>Peminjam:</strong> \${loan.borrower}</div>
                        <div class="popup-info"><strong>Lokasi:</strong> \${loan.lokasi_proyek}</div>
                        <div class="popup-info"><strong>Proyek:</strong> \${loan.nama_proyek}</div>
                        <div class="popup-info"><strong>Koordinat:</strong> \${loan.latitude.toFixed(4)}, \${loan.longitude.toFixed(4)}</div>
                        <div class="popup-status \${loan.status_sewa === 'Berjalan' ? 'status-active' : 'status-pending'}">
                          \${loan.status_sewa}
                        </div>
                      </div>
                    \`;

                    // Bind popup
                    marker.bindPopup(popupContent);

                    // Add click event to marker
                    marker.on('click', function() {
                      // Send message to parent when marker is clicked
                      window.parent.postMessage({
                        type: 'MARKER_CLICK',
                        loanId: loan.id,
                        loanData: loan
                      }, '*');
                    });
                  });

                  // Fit map to show all markers
                  if (loans.length > 0) {
                    const group = new L.featureGroup(loans.map(loan => 
                      L.marker([loan.latitude, loan.longitude])
                    ));
                    map.fitBounds(group.getBounds().pad(0.1));
                  }

                  // Handle messages from parent
                  window.addEventListener('message', function(event) {
                    if (event.data.type === 'FIT_BOUNDS') {
                      if (loans.length > 0) {
                        const group = new L.featureGroup(loans.map(loan => 
                          L.marker([loan.latitude, loan.longitude])
                        ));
                        map.fitBounds(group.getBounds().pad(0.1));
                      }
                    }
                  });
                </script>
              </body>
              </html>
            `}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '12px'
            }}
            onLoad={() => console.log('🗺️ Leaflet map loaded')}
          />
        )}
      </View>

      {/* Map Legend */}
      <View style={styles.mapLegend}>
        <Text style={styles.legendTitle}>Legenda Jenis Alat Berat</Text>
        {Array.from(new Set(validLoans.map(loan => loan.type))).map((type, index) => (
          <View key={type} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: getEquipmentColor(type) }]} />
            <Text style={styles.legendText}>{type}</Text>
          </View>
        ))}
        <View style={styles.legendDivider} />
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Status: Berjalan</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
          <Text style={styles.legendText}>Status: Menunggu</Text>
        </View>
      </View>
    </View>
  );
};

export default function PantauPeminjaman() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLoans, setActiveLoans] = useState<TransformedLoan[]>([]);
  const [allLoans, setAllLoans] = useState<TransformedLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<TransformedLoan | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [viewMode, setViewMode] = useState<'active' | 'all'>('active');
  const [apiError, setApiError] = useState<string | null>(null);

  // Fungsi untuk format tanggal
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Tanggal tidak tersedia';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Tanggal tidak valid';
    }
  };

  // Fungsi hitung durasi
  const hitungDurasi = (tanggalMulai: string, tanggalSelesai: string | null): string => {
    if (!tanggalSelesai) return 'Berlangsung';
    
    try {
      const start = new Date(tanggalMulai);
      const end = new Date(tanggalSelesai);
      
      if (end < start) return 'Tanggal tidak valid';
      
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} hari`;
    } catch (error) {
      return 'Durasi tidak diketahui';
    }
  };

  // Transform data dari API ke format frontend
  const transformLoanData = (apiData: Penyewaan[]): TransformedLoan[] => {
    console.log('🔄 Transforming API data for admin:', apiData.length, 'items');
    
    if (!Array.isArray(apiData) || apiData.length === 0) {
      return [];
    }
    
    return apiData.map((item, index) => {
      const baseLat = -6.2088 + (index * 0.001);
      const baseLng = 106.8456 + (index * 0.001);
      
      const latitude = item.latitude && !isNaN(Number(item.latitude)) ? Number(item.latitude) : baseLat;
      const longitude = item.longitude && !isNaN(Number(item.longitude)) ? Number(item.longitude) : baseLng;
      
      const transformed: TransformedLoan = {
        id_sewa: item.id_sewa,
        id: `PJ${item.id_sewa.toString().padStart(3, '0')}`,
        equipment: item.alat?.nama_alat || 'Alat Berat',
        type: item.alat?.nama_alat?.split(' ')[0] || 'Heavy Equipment',
        borrower: item.pelanggan?.nama || 'Nama Peminjam',
        unit: item.pelanggan?.nama || 'PT. Tidak Diketahui',
        latitude: latitude,
        longitude: longitude,
        lokasi_proyek: item.lokasi_proyek || 'Lokasi proyek tidak tersedia',
        startDate: formatDate(item.tanggal_sewa),
        endDate: item.tanggal_kembali ? formatDate(item.tanggal_kembali) : 'Belum ditentukan',
        duration: hitungDurasi(item.tanggal_sewa, item.tanggal_kembali),
        condition: 'Baik',
        nama_proyek: item.nama_proyek || 'Proyek Konstruksi',
        deskripsi_proyek: item.deskripsi_proyek || 'Deskripsi proyek tidak tersedia',
        status_sewa: item.status_sewa,
        status_persetujuan: item.status_persetujuan,
        originalData: item
      };

      return transformed;
    });
  };

  // Fetch data untuk ADMIN
  const fetchAdminData = async (isRefreshing = false) => {
    try {
      console.log('🔍 [ADMIN] ===== START FETCH =====');
      setApiError(null);
      
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('🎯 [ADMIN] View Mode:', viewMode);
      
      let apiData: Penyewaan[] = [];
      
      try {
        if (viewMode === 'active') {
          console.log('🎯 [ADMIN] Calling fetchActivePenyewaanFromAPI...');
          apiData = await fetchActivePenyewaanFromAPI();
        } else {
          console.log('📊 [ADMIN] Calling fetchAllPenyewaanFromAPI...');
          apiData = await fetchAllPenyewaanFromAPI();
        }
        
        console.log('📦 [ADMIN] Raw API data length:', apiData.length);
        
        if (!Array.isArray(apiData)) {
          console.log('⚠️ [ADMIN] API data is not array, converting to empty array');
          apiData = [];
        }
        
        if (apiData.length === 0) {
          setDebugInfo('Tidak ada data yang ditemukan di API');
        } else {
          setDebugInfo(`Berhasil memuat ${apiData.length} data dari API`);
        }
        
      } catch (apiError: any) {
        console.error('❌ [ADMIN] API Error:', apiError);
        setApiError(`Gagal terhubung ke API: ${apiError.message}`);
        setDebugInfo(`Error: ${apiError.message}`);
        apiData = [];
      }

      console.log('🔄 [ADMIN] Transforming data...');
      const transformedData = transformLoanData(apiData);
      console.log('🎯 [ADMIN] Transformed data length:', transformedData.length);
      
      if (viewMode === 'active') {
        setActiveLoans(transformedData);
        console.log('✅ [ADMIN] Active loans set:', transformedData.length);
      } else {
        setAllLoans(transformedData);
        console.log('✅ [ADMIN] All loans set:', transformedData.length);
      }
      
      console.log('🔍 [ADMIN] ===== END FETCH =====');
      
    } catch (error) {
      console.error('💥 [ADMIN] Fetch error:', error);
      setApiError('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Toggle view mode
  const toggleViewMode = () => {
    const newMode = viewMode === 'active' ? 'all' : 'active';
    setViewMode(newMode);
    console.log('🔄 [ADMIN] Switching to mode:', newMode);
  };

  // Refresh control
  const onRefresh = () => {
    fetchAdminData(true);
  };

  useEffect(() => {
    fetchAdminData();
  }, [viewMode]);

  // Tentukan data yang akan ditampilkan berdasarkan mode
  const displayData = viewMode === 'active' ? activeLoans : allLoans;

  // Filter data berdasarkan search query
  const filteredLoans = displayData.filter(loan =>
    loan.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loan.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loan.borrower.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loan.lokasi_proyek.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loan.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loan.nama_proyek.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loan.status_sewa.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loan.status_persetujuan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDetail = (loan: TransformedLoan) => {
    setSelectedLoan(loan);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedLoan(null);
  };

  const getCurrentDate = () => {
    const now = new Date();
    return {
      full: now.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: now.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit'
      })
    };
  };

  const currentDate = getCurrentDate();

  if (loading && !refreshing) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          <SideBar />
          <View style={styles.mainContent}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Memuat data peminjaman...</Text>
              <Text style={styles.debugText}>Menghubungi ke API...</Text>
            </View>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <SideBar />

        <View style={styles.mainContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.pageTitle}>Pantau Peminjaman</Text>
              <Text style={styles.pageSubtitle}>
                {viewMode === 'active' ? 'Lokasi Alat Berat Peminjaman Aktif' : 'Semua Data Peminjaman'}
              </Text>
              <Text style={styles.apiIndicator}>🌐 REAL API DATA</Text>
            </View>
            <View style={styles.dateTimeContainer}>
              <Text style={styles.headerDateText}>{currentDate.full}</Text>
              <Text style={styles.timeText}>{currentDate.time}</Text>
              
              <TouchableOpacity 
                style={styles.viewModeButton} 
                onPress={toggleViewMode}
              >
                <Users size={16} color="#FFF" />
                <Text style={styles.viewModeButtonText}>
                  {viewMode === 'active' ? 'Aktif' : 'Semua'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.refreshButton} onPress={() => fetchAdminData()}>
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Search color="#999" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari berdasarkan ID, peralatan, peminjam, lokasi, atau status..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {viewMode === 'active' ? activeLoans.length : allLoans.length}
              </Text>
              <Text style={styles.statLabel}>
                {viewMode === 'active' ? 'Total Aktif' : 'Total Semua'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {displayData.filter(loan => loan.latitude && loan.longitude).length}
              </Text>
              <Text style={styles.statLabel}>Lokasi Terpantau</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{filteredLoans.length}</Text>
              <Text style={styles.statLabel}>Hasil Pencarian</Text>
            </View>
          </View>

          {/* Error Message */}
          {apiError && (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color="#F44336" />
              <Text style={styles.errorText}>{apiError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => fetchAdminData()}>
                <Text style={styles.retryButtonText}>Coba Lagi</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Map Section - Hanya tampil untuk data aktif dengan koordinat */}
          {(viewMode === 'active' && activeLoans.length > 0) && (
            <View style={styles.mapSection}>
              <Text style={styles.mapSectionTitle}>🗺️ Peta Lokasi Alat Berat Aktif</Text>
              <LeafletMap
                loans={filteredLoans}
                onMarkerClick={handleOpenDetail}
              />
            </View>
          )}

          {/* Main Content dengan Scroll */}
          <View style={styles.mainScrollContainer}>
            <ScrollView 
              style={styles.mainScrollView}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={styles.scrollContent}
            >
              {/* Loans List */}
              <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>
                      {viewMode === 'active' ? 'Daftar Peminjaman Aktif' : 'Semua Data Peminjaman'}
                    </Text>
                    <Text style={styles.modeIndicator}>
                      Mode: {viewMode === 'active' ? 'Hanya Aktif' : 'Semua Status'} • {filteredLoans.length} items
                    </Text>
                  </View>
                </View>
                
                <View style={styles.listScrollContainer}>
                  {filteredLoans.length > 0 ? (
                    filteredLoans.map((loan) => (
                      <TouchableOpacity
                        key={loan.id_sewa}
                        style={styles.loanItem}
                        onPress={() => handleOpenDetail(loan)}
                      >
                        <View style={styles.loanHeader}>
                          <Text style={styles.loanId}>{loan.id}</Text>
                          <View style={[
                            styles.loanStatus,
                            { backgroundColor: getEquipmentColor(loan.type) }
                          ]}>
                            <MapPin size={14} color="#FFF" />
                            <Text style={styles.statusText}>{loan.type}</Text>
                          </View>
                        </View>
                        <Text style={styles.equipmentText}>{loan.equipment}</Text>
                        <Text style={styles.borrowerText}>{loan.borrower} • {loan.unit}</Text>
                        <Text style={styles.locationText}>{loan.lokasi_proyek}</Text>
                        
                        {loan.latitude && loan.longitude && (
                          <View style={styles.coordinateInfo}>
                            <Text style={styles.coordinateText}>
                              📍 {loan.latitude.toFixed(4)}, {loan.longitude.toFixed(4)}
                            </Text>
                          </View>
                        )}
                        
                        <View style={styles.projectInfo}>
                          <Text style={styles.projectName}>{loan.nama_proyek}</Text>
                        </View>
                        
                        <View style={styles.loanFooter}>
                          <View style={styles.dateInfo}>
                            <Calendar size={14} color="#666" />
                            <Text style={styles.dateText}>{loan.startDate} - {loan.endDate}</Text>
                          </View>
                          <View style={styles.durationInfo}>
                            <Clock size={14} color="#666" />
                            <Text style={styles.durationText}>{loan.duration}</Text>
                          </View>
                        </View>
                        
                        <View style={styles.approvalInfo}>
                          <Text style={[
                            styles.approvalText,
                            loan.status_persetujuan === 'Disetujui' ? styles.approvalApproved :
                            loan.status_persetujuan === 'Ditolak' ? styles.approvalRejected :
                            styles.approvalPending
                          ]}>
                            Status Persetujuan: {loan.status_persetujuan}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <AlertCircle size={48} color="#ccc" />
                      <Text style={styles.emptyText}>
                        {searchQuery ? 'Tidak ada hasil pencarian' : `Tidak ada data ${viewMode === 'active' ? 'peminjaman aktif' : 'peminjaman'}`}
                      </Text>
                      <Text style={styles.emptySubtext}>
                        {searchQuery ? 'Coba ubah kata kunci pencarian' : 'Tidak ada data yang ditemukan di API'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Detail Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.detailModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedLoan?.equipment}</Text>
                <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                  <X size={24} color="#FF0000" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitleModal}>Informasi Sewa</Text>
                  <View style={styles.fieldsContainer}>
                    <View style={styles.fieldRow}>
                      <View style={styles.fieldWrapper}>
                        <Text style={styles.fieldLabel}>ID Peminjaman</Text>
                        <View style={styles.fieldInputBox}>
                          <Text style={styles.fieldValue}>{selectedLoan?.id}</Text>
                        </View>
                      </View>
                      <View style={styles.fieldWrapper}>
                        <Text style={styles.fieldLabel}>Status Sewa</Text>
                        <View style={[
                          styles.fieldInputBox,
                          selectedLoan?.status_sewa === 'Berjalan' ? styles.statusBoxActive : 
                          selectedLoan?.status_sewa === 'Selesai' ? styles.statusBoxCompleted :
                          selectedLoan?.status_sewa === 'Dibatalkan' ? styles.statusBoxCancelled :
                          styles.statusBoxPending
                        ]}>
                          <Text style={styles.fieldValue}>{selectedLoan?.status_sewa}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.fieldRow}>
                      <View style={styles.fieldWrapper}>
                        <Text style={styles.fieldLabel}>Status Persetujuan</Text>
                        <View style={[
                          styles.fieldInputBox,
                          selectedLoan?.status_persetujuan === 'Disetujui' ? styles.statusBoxApproved :
                          selectedLoan?.status_persetujuan === 'Ditolak' ? styles.statusBoxRejected :
                          styles.statusBoxWaiting
                        ]}>
                          <Text style={styles.fieldValue}>{selectedLoan?.status_persetujuan}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.fieldRow}>
                      <View style={styles.fieldWrapper}>
                        <Text style={styles.fieldLabel}>Nama Penyewa</Text>
                        <View style={styles.fieldInputBox}>
                          <Text style={styles.fieldValue}>{selectedLoan?.borrower}</Text>
                        </View>
                      </View>
                      <View style={styles.fieldWrapper}>
                        <Text style={styles.fieldLabel}>Unit</Text>
                        <View style={styles.fieldInputBox}>
                          <Text style={styles.fieldValue}>{selectedLoan?.unit}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.fieldRow}>
                      <View style={styles.fieldWrapper}>
                        <Text style={styles.fieldLabel}>Tanggal Mulai</Text>
                        <View style={styles.fieldInputBox}>
                          <Text style={styles.fieldValue}>{selectedLoan?.startDate}</Text>
                        </View>
                      </View>
                      <View style={styles.fieldWrapper}>
                        <Text style={styles.fieldLabel}>Tanggal Selesai</Text>
                        <View style={styles.fieldInputBox}>
                          <Text style={styles.fieldValue}>{selectedLoan?.endDate}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.fieldWrapper}>
                      <Text style={styles.fieldLabel}>Durasi</Text>
                      <View style={styles.fieldInputBox}>
                        <Text style={styles.fieldValue}>{selectedLoan?.duration}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitleModal}>Informasi Proyek</Text>
                  <View style={styles.fieldsContainer}>
                    <View style={styles.fieldWrapper}>
                      <Text style={styles.fieldLabel}>Nama Proyek</Text>
                      <View style={styles.fieldInputBox}>
                        <Text style={styles.fieldValue}>{selectedLoan?.nama_proyek}</Text>
                      </View>
                    </View>
                    <View style={styles.fieldWrapper}>
                      <Text style={styles.fieldLabel}>Lokasi Proyek</Text>
                      <View style={styles.fieldInputBox}>
                        <Text style={styles.fieldValue}>{selectedLoan?.lokasi_proyek}</Text>
                      </View>
                    </View>
                    <View style={styles.fieldWrapper}>
                      <Text style={styles.fieldLabel}>Koordinat GPS</Text>
                      <View style={styles.fieldInputBox}>
                        <Text style={styles.fieldValue}>
                          {selectedLoan?.latitude?.toFixed(6)}, {selectedLoan?.longitude?.toFixed(6)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.fieldWrapper}>
                      <Text style={styles.fieldLabel}>Deskripsi Proyek</Text>
                      <View style={[styles.fieldInputBox, styles.multilineBox]}>
                        <Text style={styles.fieldValue}>{selectedLoan?.deskripsi_proyek}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitleModal}>Informasi Unit</Text>
                  <View style={styles.fieldsContainer}>
                    <View style={styles.fieldRow}>
                      <View style={styles.fieldWrapper}>
                        <Text style={styles.fieldLabel}>Jenis Alat</Text>
                        <View style={[styles.fieldInputBox, { borderLeftColor: getEquipmentColor(selectedLoan?.type || ''), borderLeftWidth: 4 }]}>
                          <Text style={styles.fieldValue}>{selectedLoan?.type}</Text>
                        </View>
                      </View>
                      <View style={styles.fieldWrapper}>
                        <Text style={styles.fieldLabel}>Nama Alat</Text>
                        <View style={styles.fieldInputBox}>
                          <Text style={styles.fieldValue}>{selectedLoan?.equipment}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.fieldWrapper}>
                      <Text style={styles.fieldLabel}>Kondisi</Text>
                      <View style={styles.fieldInputBox}>
                        <Text style={styles.fieldValue}>{selectedLoan?.condition}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </>
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
    padding: 20,
    backgroundColor: COLORS.white,
  },
  mainScrollContainer: {
    flex: 1,
    marginTop: 10,
  },
  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  apiIndicator: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 4,
  },
  dateTimeContainer: {
    alignItems: 'flex-end',
  },
  headerDateText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    gap: 4,
  },
  viewModeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  refreshButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.darkGray,
    marginLeft: 12,
    marginRight: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#F5EFE7',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    flex: 1,
    color: '#D32F2F',
    fontSize: 14,
    marginLeft: 8,
  },
  retryButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  mapSection: {
    height: 500,
    marginBottom: 20,
  },
  mapSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  leafletMapContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  leafletMap: {
    flex: 3,
    height: '100%',
  },
  mapFallback: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noLocations: {
    padding: 40,
    alignItems: 'center',
  },
  noLocationsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 8,
  },
  noLocationsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  mapLegend: {
    width: 220,
    backgroundColor: 'white',
    padding: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  legendDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  modeIndicator: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listScrollContainer: {
    flex: 1,
  },
  loanItem: {
    backgroundColor: '#F5EFE7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  loanId: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.darkGray,
  },
  loanStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#FFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  equipmentText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  borrowerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  coordinateInfo: {
    marginBottom: 8,
  },
  coordinateText: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
  },
  projectInfo: {
    marginBottom: 8,
  },
  projectName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  loanFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  durationText: {
    fontSize: 12,
    color: '#666',
  },
  approvalInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  approvalText: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    textAlign: 'center',
  },
  approvalApproved: {
    backgroundColor: '#E8F5E8',
    color: '#4CAF50',
  },
  approvalRejected: {
    backgroundColor: '#FFEBEE',
    color: '#F44336',
  },
  approvalPending: {
    backgroundColor: '#FFF3E0',
    color: '#FF9800',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 12,
  },
  debugText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    fontFamily: 'monospace',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: '95%',
    maxWidth: 900,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F59E0B',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F59E0B',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitleModal: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 16,
  },
  fieldsContainer: {},
  fieldRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  fieldWrapper: {
    flex: 1,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
    fontWeight: '500',
  },
  fieldInputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    padding: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  multilineBox: {
    minHeight: 80,
  },
  statusBoxActive: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  statusBoxPending: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  statusBoxCompleted: {
    backgroundColor: '#F5F5F5',
    borderColor: '#9E9E9E',
  },
  statusBoxCancelled: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  statusBoxApproved: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  statusBoxRejected: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  statusBoxWaiting: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  fieldValue: {
    fontSize: 14,
    color: '#000',
  },
});