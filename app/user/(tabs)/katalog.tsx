import React, { useState } from 'react';
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
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../../constants/Colors';

// Product interface and data
export interface Product {
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

export const products: Product[] = [
  {
    id: '1',
    name: 'Excavator Caterpillar 3200D',
    image: 'https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/bfea/564f/04fbd48ded688b16d060f50826d834a8?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qoWqP35~z1Moit1wyhoaXC9dMb7wCHPojQy~l3uuG3Vv32CrSn-ckTaSlAQZIHz6DFi9a8L~L~I0EqqP~OcmUSPgLgqanCQEXIcMoGXW8~cWZpQ1VmtsoPUqHBcgKHLoqTbwYqvbvPyn0WWnMamIvkikbcsXixjIJaUfGIMb8V5-sBDCXMNnyT3eDgLODT5ESYcqcQ1JRIzQRklBtjZxA9oGjcmSshLfiEUkgCjJuZEBWWFPk3FK4jW~eZIub475KF2dM6zSCZ-gv7g~JDJRSmRHf2IPv8KoVZNPFtj18Ox1O30zITQnyGP2jlbdRP1d1NGWV9-25Udfr~miS6D9mQ__',
    rating: 4.4,
    location: 'Jakarta',
    price: 'RP. 800.000/hari',
    isFavorite: true,
    isAvailable: true,
    category: 'Excavator',
  },
  {
    id: '2',
    name: 'Excavator Hitachiin HZ8900',
    image: 'https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/bfea/564f/04fbd48ded688b16d060f50826d834a8?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qoWqP35~z1Moit1wyhoaXC9dMb7wCHPojQy~l3uuG3Vv32CrSn-ckTaSlAQZIHz6DFi9a8L~L~I0EqqP~OcmUSPgLgqanCQEXIcMoGXW8~cWZpQ1VmtsoPUqHBcgKHLoqTbwYqvbvPyn0WWnMamIvkikbcsXixjIJaUfGIMb8V5-sBDCXMNnyT3eDgLODT5ESYcqcQ1JRIzQRklBtjZxA9oGjcmSshLfiEUkgCjJuZEBWWFPk3FK4jW~eZIub475KF2dM6zSCZ-gv7g~JDJRSmRHf2IPv8KoVZNPFtj18Ox1O30zITQnyGP2jlbdRP1d1NGWV9-25Udfr~miS6D9mQ__',
    rating: 4.0,
    location: 'Jakarta',
    price: 'RP. 780.000/hari',
    isFavorite: false,
    isAvailable: true,
    category: 'Excavator',
  },
  {
    id: '3',
    name: 'Dump Truck Hino D7000',
    image: 'https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/bfea/564f/04fbd48ded688b16d060f50826d834a8?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qoWqP35~z1Moit1wyhoaXC9dMb7wCHPojQy~l3uuG3Vv32CrSn-ckTaSlAQZIHz6DFi9a8L~L~I0EqqP~OcmUSPgLgqanCQEXIcMoGXW8~cWZpQ1VmtsoPUqHBcgKHLoqTbwYqvbvPyn0WWnMamIvkikbcsXixjIJaUfGIMb8V5-sBDCXMNnyT3eDgLODT5ESYcqcQ1JRIzQRklBtjZxA9oGjcmSshLfiEUkgCjJuZEBWWFPk3FK4jW~eZIub475KF2dM6zSCZ-gv7g~JDJRSmRHf2IPv8KoVZNPFtj18Ox1O30zITQnyGP2jlbdRP1d1NGWV9-25Udfr~miS6D9mQ__',
    rating: 4.4,
    location: 'Jakarta',
    price: 'RP. 500.000/hari',
    isFavorite: false,
    isAvailable: true,
    category: 'Truck',
  },
  {
    id: '4',
    name: 'Tower Crane Liebherr',
    image: 'https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/bfea/564f/04fbd48ded688b16d060f50826d834a8?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qoWqP35~z1Moit1wyhoaXC9dMb7wCHPojQy~l3uuG3Vv32CrSn-ckTaSlAQZIHz6DFi9a8L~L~I0EqqP~OcmUSPgLgqanCQEXIcMoGXW8~cWZpQ1VmtsoPUqHBcgKHLoqTbwYqvbvPyn0WWnMamIvkikbcsXixjIJaUfGIMb8V5-sBDCXMNnyT3eDgLODT5ESYcqcQ1JRIzQRklBtjZxA9oGjcmSshLfiEUkgCjJuZEBWWFPk3FK4jW~eZIub475KF2dM6zSCZ-gv7g~JDJRSmRHf2IPv8KoVZNPFtj18Ox1O30zITQnyGP2jlbdRP1d1NGWV9-25Udfr~miS6D9mQ__',
    rating: 4.0,
    location: 'Jakarta',
    price: 'RP. 1.500.000/hari',
    isFavorite: false,
    isAvailable: false,
    category: 'Crane',
  },
  {
    id: '5',
    name: 'Bulldozer Komatsu',
    image: 'https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/bfea/564f/04fbd48ded688b16d060f50826d834a8?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qoWqP35~z1Moit1wyhoaXC9dMb7wCHPojQy~l3uuG3Vv32CrSn-ckTaSlAQZIHz6DFi9a8L~L~I0EqqP~OcmUSPgLgqanCQEXIcMoGXW8~cWZpQ1VmtsoPUqHBcgKHLoqTbwYqvbvPyn0WWnMamIvkikbcsXixjIJaUfGIMb8V5-sBDCXMNnyT3eDgLODT5ESYcqcQ1JRIzQRklBtjZxA9oGjcmSshLfiEUkgCjJuZEBWWFPk3FK4jW~eZIub475KF2dM6zSCZ-gv7g~JDJRSmRHf2IPv8KoVZNPFtj18Ox1O30zITQnyGP2jlbdRP1d1NGWV9-25Udfr~miS6D9mQ__',
    rating: 4.7,
    location: 'Jakarta',
    price: 'RP. 780.000/hari',
    isFavorite: false,
    isAvailable: true,
    category: 'Bulldozer',
  },
  {
    id: '6',
    name: 'Bulldozer LiuGong',
    image: 'https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/bfea/564f/04fbd48ded688b16d060f50826d834a8?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qoWqP35~z1Moit1wyhoaXC9dMb7wCHPojQy~l3uuG3Vv32CrSn-ckTaSlAQZIHz6DFi9a8L~L~I0EqqP~OcmUSPgLgqanCQEXIcMoGXW8~cWZpQ1VmtsoPUqHBcgKHLoqTbwYqvbvPyn0WWnMamIvkikbcsXixjIJaUfGIMb8V5-sBDCXMNnyT3eDgLODT5ESYcqcQ1JRIzQRklBtjZxA9oGjcmSshLfiEUkgCjJuZEBWWFPk3FK4jW~eZIub475KF2dM6zSCZ-gv7g~JDJRSmRHf2IPv8KoVZNPFtj18Ox1O30zITQnyGP2jlbdRP1d1NGWV9-25Udfr~miS6D9mQ__',
    rating: 4.9,
    location: 'Jakarta',
    price: 'RP. 1.600.000/hari',
    isFavorite: false,
    isAvailable: true,
    category: 'Bulldozer',
  },
];

// Product Card Component
const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 24;

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, onToggleFavorite }) => {
  const handlePress = () => {
    if (product.isAvailable) {
      onPress(product);
    }
  };

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    onToggleFavorite(product.id);
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
        <Image source={{ uri: product.image }} style={styles.image} />
        
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{product.category}</Text>
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
          {product.name}
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
  const [productList, setProductList] = useState<Product[]>(products);

  // Extract unique categories
  const categories = Array.from(new Set(products.map(product => product.category)));

  // Toggle favorite status
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
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
    const matchesFavorites = !showFavoritesOnly || product.isFavorite;
    
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const handleProductPress = (product: Product) => {
    if (product.isAvailable) {
      router.push({
        pathname: '/user/formsewa',
        params: {
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          productPrice: product.price,
        }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        backgroundColor={COLORS.background} 
        barStyle="dark-content" 
        translucent={false}
      />
      
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
            placeholder="cari kebutuhan anda..."
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
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          Menampilkan {filteredProducts.length} produk
          {selectedCategory !== 'Semua' && ` dalam kategori ${selectedCategory}`}
          {showFavoritesOnly && ' favorit'}
        </Text>
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
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="magnify" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Tidak ada produk yang ditemukan</Text>
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
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  resultsText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
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
  
  // Product Card Styles - IMPROVED
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
    height: 32, // Untuk 2 baris
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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