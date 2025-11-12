import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Star, MapPin } from 'lucide-react-native';
import { COLORS } from '../../../constants/Colors';

export default function FavoritesScreen() {
  return (
    <SafeAreaView style={styles.container}>
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

        <View style={styles.titleContainer}>
          <View>
            <Text style={styles.title}>Favorit Saya</Text>
            <Text style={styles.subtitle}>1 alat berat disimpan</Text>
          </View>
          <TouchableOpacity>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryGradientEnd]}
              style={styles.favButton}>
              <Heart size={20} color={COLORS.white} fill={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Merged FavoriteCard */}
        <View style={styles.card}>
          <Image
            source={{
              uri: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/bfea/564f/04fbd48ded688b16d060f50826d834a8?Expires=1763942400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qoWqP35~z1Moit1wyhoaXC9dMb7wCHPojQy~l3uuG3Vv32CrSn-ckTaSlAQZIHz6DFi9a8L~L~I0EqqP~OcmUSPgLgqanCQEXIcMoGXW8~cWZpQ1VmtsoPUqHBcgKHLoqTbwYqvbvPyn0WWnMamIvkikbcsXixjIJaUfGIMb8V5-sBDCXMNnyT3eDgLODT5ESYcqcQ1JRIzQRklBtjZxA9oGjcmSshLfiEUkgCjJuZEBWWFPk3FK4jW~eZIub475KF2dM6zSCZ-gv7g~JDJRSmRHf2IPv8KoVZNPFtj18Ox1O30zITQnyGP2jlbdRP1d1NGWV9-25Udfr~miS6D9mQ__',
            }}
            style={styles.cardImage}
          />
          <View style={styles.details}>
            <Text style={styles.cardTitle}>Excavator Caterpillar 3200D</Text>
            <View style={styles.infoRow}>
              <Star size={14} color={COLORS.primaryGradientEnd} fill={COLORS.primaryGradientEnd} />
              <Text style={styles.infoText}>4.4</Text>
            </View>
            <View style={styles.infoRow}>
              <MapPin size={14} color={COLORS.black} />
              <Text style={styles.infoText}>Jakarta</Text>
            </View>
            <View style={styles.footer}>
              <Text style={styles.price}>RP. 800.000/hari</Text>
              <TouchableOpacity>
                <LinearGradient
                  colors={[COLORS.primaryGradientEnd, COLORS.primary]}
                  style={styles.button}>
                  <Text style={styles.buttonText}>sewa</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
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
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 26,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: COLORS.black,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.black,
    marginTop: 2,
  },
  favButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Merged Card Styles
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginHorizontal: 20,
    flexDirection: 'row',
    padding: 12,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cardImage: {
    width: 83,
    height: 83,
    borderRadius: 5,
  },
  details: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.black,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    fontFamily: 'Poppins_300Light',
    fontSize: 10,
    color: COLORS.black,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: COLORS.primary,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 3,
  },
  buttonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: COLORS.white,
  },
});