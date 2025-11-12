import React from 'react';
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
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
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
  },
];

// Product Card Component
const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 30;

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <View style={styles.favoriteContainer}>
        <MaterialCommunityIcons
          name="heart"
          size={18}
          color={product.isFavorite ? COLORS.danger : COLORS.white}
        />
      </View>
      {!product.isAvailable && (
        <View style={styles.unavailableBadge}>
          <Text style={styles.unavailableText}>Tidak Tersedia</Text>
        </View>
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <View style={styles.detailRow}>
          <MaterialIcons name="star" size={12} color={COLORS.primaryLight} />
          <Text style={styles.detailText}>{product.rating}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="location-on" size={12} color={COLORS.text} />
          <Text style={styles.detailText}>{product.location}</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.priceLabel}>Mulai dari</Text>
        <Text style={styles.price}>{product.price}</Text>
      </View>
    </View>
  );
};

// Main Katalog Screen
export default function KatalogScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>ST</Text>
        </View>
        <Text style={styles.brandName}>S`Trux</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <MaterialIcons name="search" size={20} color={COLORS.textSecondary} style={{marginLeft: 10}} />
          <TextInput
            placeholder="cari kebutuhan anda..."
            placeholderTextColor={COLORS.textSecondary}
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialCommunityIcons name="filter-variant" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
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
    marginLeft: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 15,
    alignItems: 'center',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.searchBar,
    borderRadius: 13,
    height: 38,
    borderWidth: 0.5,
    borderColor: COLORS.textSecondary,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.text,
  },
  filterButton: {
    marginLeft: 10,
    width: 38,
    height: 38,
    borderRadius: 5,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.primary,
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  // Product Card Styles
  card: {
    width: cardWidth,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    margin: 10,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 95,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  favoriteContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 50,
    padding: 4,
  },
  unavailableBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.danger,
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unavailableText: {
    color: COLORS.white,
    fontFamily: 'Poppins_500Medium',
    fontSize: 7,
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: COLORS.text,
    marginBottom: 8,
    height: 24, // for 2 lines
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 8,
    color: COLORS.text,
    marginLeft: 3,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.shadow,
    marginVertical: 12,
  },
  priceLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 8,
    color: COLORS.text,
    marginBottom: 4,
  },
  price: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: COLORS.primary,
  },
});