import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../../constants/Colors';
import {API_BASE_URL} from '../../../constants/ApiConfig';

// Product interface berdasarkan struktur AlatBerat
export interface Product {
  id_alat: string;
  nama_alat: string;
  foto: string;
  harga_sewa_per_hari: number;
  status: string;
  jenis: string;
  kapasitas?: string;
  deskripsi?: string;
  // Fields untuk kompatibilitas dengan UI existing
  id: string;
  name: string;
  image: string;
  rating: number;
  location: string;
  price: string;
  isFavorite: boolean;
  isAvailable: boolean;
  category: string;
}

// API Response Type
interface ApiResponse {
  success: boolean;
  data: any[];
  message?: string;
}

// API Base URL - sesuaikan dengan IP Laravel Anda

// Product Card Component
const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 24;

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, onToggleFavorite }) => {
  const [imageError, setImageError] = useState(false);

  const handlePress = () => {
    if (product.isAvailable) {
      onPress(product);
    }
  };

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    onToggleFavorite(product.id);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <TouchableOpacity 
      style={[
        styles.card,
        !product.isAvailable && styles.disabledCard
      ]} 
      onPress={handlePress}
      disabled={!product.isAvailable}
      activeOpacity={product.isAvailable ? 0.7 : 1}
    >
      {/* Image Section */}
      <View style={styles.imageContainer}>
        {!imageError && product.foto ? (
          <Image 
            source={{ uri: product.foto }} 
            style={styles.image}
            onError={handleImageError}
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <MaterialCommunityIcons 
              name="tools" 
              size={32} 
              color={COLORS.textSecondary} 
            />
            <Text style={styles.placeholderText}>Alat Berat</Text>
          </View>
        )}
        
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{product.jenis}</Text>
        </View>
        
        {/* Favorite Button */}
        <TouchableOpacity 
          style={styles.favoriteContainer}
          onPress={handleFavoritePress}
        >
          <MaterialCommunityIcons
            name={product.isFavorite ? "heart" : "heart-outline"}
            size={16}
            color={product.isFavorite ? COLORS.danger : COLORS.white}
          />
        </TouchableOpacity>
        
        {/* Unavailable Overlay */}
        {!product.isAvailable && (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>Tidak Tersedia</Text>
          </View>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
        {/* Product Name */}
        <Text style={styles.name} numberOfLines={2}>
          {product.nama_alat}
        </Text>
        
        {/* Rating and Location */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <MaterialIcons name="star" size={10} color={COLORS.primaryLight} />
            <Text style={styles.detailText}>{product.rating}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="location-on" size={10} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{product.location}</Text>
          </View>
        </View>
        
        {/* Kapasitas jika ada */}
        {product.kapasitas && (
          <Text style={styles.kapasitasText}>Kapasitas: {product.kapasitas}</Text>
        )}
        
        {/* Divider */}
        <View style={styles.divider} />
        
        {/* Price Section */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Mulai dari</Text>
          <Text style={styles.price}>{product.price}</Text>
        </View>
        
        {/* Rent Button - Only show for available products */}
        {product.isAvailable && (
          <TouchableOpacity 
            style={styles.rentButton}
            onPress={(e) => {
              e.stopPropagation();
              onPress(product);
            }}
          >
            <Text style={styles.rentButtonText}>Sewa Sekarang</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Category Filter Component
const CategoryFilter = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: { 
  categories: string[]; 
  selectedCategory: string; 
  onSelectCategory: (category: string) => void;
}) => (
  <View style={styles.categoryContainer}>
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === 'Semua' && styles.categoryButtonActive
      ]}
      onPress={() => onSelectCategory('Semua')}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === 'Semua' && styles.categoryButtonTextActive
      ]}>
        Semua
      </Text>
    </TouchableOpacity>
    
    {categories.map((category) => (
      <TouchableOpacity
        key={category}
        style={[
          styles.categoryButton,
          selectedCategory === category && styles.categoryButtonActive
        ]}
        onPress={() => onSelectCategory(category)}
      >
        <Text style={[
          styles.categoryButtonText,
          selectedCategory === category && styles.categoryButtonTextActive
        ]}>
          {category}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

// Main Katalog Screen
export default function KatalogScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Extract unique categories dari product list
  const categories = Array.from(new Set(productList
    .map(product => product.jenis)
    .filter(Boolean)
  ));

  // Transform data dari API ke format yang diharapkan UI
  const transformProductData = (apiData: any[]): Product[] => {
    return apiData.map(item => ({
      // Data dari API
      id_alat: item.id_alat?.toString() || item.id?.toString() || Math.random().toString(),
      nama_alat: item.nama_alat || item.name || 'Nama Alat',
      foto: item.foto || item.image || '',
      harga_sewa_per_hari: item.harga_sewa_per_hari || 0,
      status: item.status || 'Tersedia',
      jenis: item.jenis || item.category || 'Umum',
      kapasitas: item.kapasitas,
      deskripsi: item.deskripsi,
      
      // Fields untuk kompatibilitas UI
      id: item.id_alat?.toString() || item.id?.toString() || Math.random().toString(),
      name: item.nama_alat || item.name || 'Nama Alat',
      image: item.foto || item.image || '',
      rating: 4.5, // Default rating
      location: 'Jakarta', // Default location
      price: `Rp ${Number(item.harga_sewa_per_hari || 0).toLocaleString('id-ID')}/hari`,
      isFavorite: false, // Default not favorite
      isAvailable: item.status === 'Tersedia',
      category: item.jenis || item.category || 'Umum'
    }));
  };

  // Fetch products dari API AlatBerat
  const fetchProducts = async () => {
    try {
      console.log('🔄 Fetching alat berat from:', `${API_BASE_URL}/alat-berat`);
      
      const response = await fetch(`${API_BASE_URL}/alat-berat`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      console.log('✅ Alat berat fetched successfully:', result.data?.length);

      if (result.success && result.data) {
        const transformedData = transformProductData(result.data);
        setProductList(transformedData);
      } else {
        Alert.alert('Error', result.message || 'Gagal memuat data alat berat');
        // Fallback ke data dummy
        setProductList(getDummyProducts());
      }
    } catch (error: any) {
      console.error('❌ Error fetching alat berat:', error);
      Alert.alert(
        'Koneksi Gagal', 
        'Tidak dapat terhubung ke server. Pastikan server Laravel berjalan.'
      );
      
      // Fallback ke data dummy jika fetch gagal
      setProductList(getDummyProducts());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Data dummy sebagai fallback
  const getDummyProducts = (): Product[] => [
    {
      id_alat: '1',
      nama_alat: 'Excavator Caterpillar 3200D',
      foto: 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Excavator',
      harga_sewa_per_hari: 800000,
      status: 'Tersedia',
      jenis: 'Excavator',
      kapasitas: '2.5 Ton',
      deskripsi: 'Excavator dengan kapasitas besar untuk proyek konstruksi',
      id: '1',
      name: 'Excavator Caterpillar 3200D',
      image: 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Excavator',
      rating: 4.4,
      location: 'Jakarta',
      price: 'Rp 800.000/hari',
      isFavorite: true,
      isAvailable: true,
      category: 'Excavator',
    },
    {
      id_alat: '2',
      nama_alat: 'Dump Truck Hino D7000',
      foto: 'https://via.placeholder.com/300x200/7ED321/FFFFFF?text=Dump+Truck',
      harga_sewa_per_hari: 500000,
      status: 'Tersedia',
      jenis: 'Truck',
      kapasitas: '10 Ton',
      deskripsi: 'Dump truck untuk angkut material berat',
      id: '2',
      name: 'Dump Truck Hino D7000',
      image: 'https://via.placeholder.com/300x200/7ED321/FFFFFF?text=Dump+Truck',
      rating: 4.2,
      location: 'Bekasi',
      price: 'Rp 500.000/hari',
      isFavorite: false,
      isAvailable: true,
      category: 'Truck',
    },
    {
      id_alat: '3',
      nama_alat: 'Bulldozer Komatsu D65',
      foto: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Bulldozer',
      harga_sewa_per_hari: 1200000,
      status: 'Disewa',
      jenis: 'Bulldozer',
      kapasitas: '15 Ton',
      deskripsi: 'Bulldozer untuk pekerjaan tanah',
      id: '3',
      name: 'Bulldozer Komatsu D65',
      image: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Bulldozer',
      rating: 4.7,
      location: 'Tangerang',
      price: 'Rp 1.200.000/hari',
      isFavorite: false,
      isAvailable: false,
      category: 'Bulldozer',
    },
    {
      id_alat: '4',
      nama_alat: 'Crane Liebherr LTM 1100',
      foto: 'https://via.placeholder.com/300x200/9B59B6/FFFFFF?text=Crane',
      harga_sewa_per_hari: 2500000,
      status: 'Tersedia',
      jenis: 'Crane',
      kapasitas: '100 Ton',
      deskripsi: 'Crane mobile untuk angkat beban berat',
      id: '4',
      name: 'Crane Liebherr LTM 1100',
      image: 'https://via.placeholder.com/300x200/9B59B6/FFFFFF?text=Crane',
      rating: 4.8,
      location: 'Jakarta',
      price: 'Rp 2.500.000/hari',
      isFavorite: true,
      isAvailable: true,
      category: 'Crane',
    },
  ];

  // Load data saat component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Pull to refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  // Toggle favorite status (local only untuk sekarang)
  const handleToggleFavorite = (productId: string) => {
    setProductList(prevProducts => 
      prevProducts.map(product => 
        product.id === productId 
          ? { ...product, isFavorite: !product.isFavorite }
          : product
      )
    );
  };

  // Filter products based on search, category, and favorites
  const filteredProducts = productList.filter(product => {
    const matchesSearch = product.nama_alat.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || product.jenis === selectedCategory;
    const matchesFavorites = !showFavoritesOnly || product.isFavorite;
    
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const handleProductPress = (product: Product) => {
    if (product.isAvailable) {
      router.push({
        pathname: '/user/formsewa',
        params: {
          productId: product.id_alat,
          productName: product.nama_alat,
          productImage: product.foto,
          productPrice: product.price,
          productCategory: product.jenis,
          hargaSewa: product.harga_sewa_per_hari.toString(),
          kapasitas: product.kapasitas || '',
          deskripsi: product.deskripsi || '',
        }
      });
    } else {
      Alert.alert(
        'Tidak Tersedia',
        `Alat berat ${product.nama_alat} sedang tidak tersedia untuk disewa.`
      );
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat alat berat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        backgroundColor={COLORS.background} 
        barStyle="dark-content" 
        translucent={false}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>ST</Text>
        </View>
        <Text style={styles.brandName}>S`Trux</Text>
      </View>

      {/* Search and Filter Section */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <MaterialIcons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            placeholder="cari alat berat..."
            placeholderTextColor={COLORS.textSecondary}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={[
            styles.filterButton,
            showFavoritesOnly && styles.filterButtonActive
          ]}
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <MaterialCommunityIcons 
            name={showFavoritesOnly ? "heart" : "heart-outline"} 
            size={20} 
            color={showFavoritesOnly ? COLORS.danger : COLORS.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          Menampilkan {filteredProducts.length} alat berat
          {selectedCategory !== 'Semua' && ` dalam kategori ${selectedCategory}`}
          {showFavoritesOnly && ' favorit'}
        </Text>
        
        {/* Refresh Button */}
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <MaterialIcons name="refresh" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => (
          <ProductCard 
            product={item} 
            onPress={handleProductPress}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        keyExtractor={(item) => item.id_alat}
        numColumns={2}
        contentContainerStyle={[
          styles.listContainer,
          filteredProducts.length === 0 && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="magnify" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>
              {loading ? 'Memuat...' : 'Tidak ada alat berat yang ditemukan'}
            </Text>
            {!loading && (
              <TouchableOpacity onPress={fetchProducts} style={styles.retryButton}>
                <Text style={styles.retryText}>Coba Lagi</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  logoContainer: {
    width: 34,
    height: 35,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  logoText: {
    color: COLORS.white,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
  },
  brandName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 12,
    alignItems: 'center',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.text,
  },
  filterButton: {
    marginLeft: 12,
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filterButtonActive: {
    backgroundColor: '#FFE8E8',
    borderColor: COLORS.danger,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.text,
  },
  categoryButtonTextActive: {
    color: COLORS.white,
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  resultsText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  refreshButton: {
    padding: 4,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  
  // Product Card Styles
  card: {
    width: cardWidth,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    margin: 6,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  disabledCard: {
    opacity: 0.6,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.lightGray,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  placeholderText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  categoryText: {
    color: COLORS.text,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 8,
    lineHeight: 10,
  },
  favoriteContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableText: {
    color: COLORS.white,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    textAlign: 'center',
  },
  infoContainer: {
    padding: 12,
    flex: 1,
  },
  name: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 16,
    marginBottom: 8,
    height: 32,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.textSecondary,
    marginLeft: 4,
    lineHeight: 12,
  },
  kapasitasText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    opacity: 0.3,
    marginVertical: 6,
  },
  priceContainer: {
    marginBottom: 8,
  },
  priceLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  price: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: COLORS.primary,
    lineHeight: 16,
  },
  rentButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 'auto',
  },
  rentButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: COLORS.white,
    lineHeight: 14,
  },
});