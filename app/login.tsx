import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
  Platform,
  SafeAreaView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Lock } from 'lucide-react-native';
import { Link } from 'expo-router';

const COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  darkBrown: '#262011',
  darkGray: '#0F0E0E',
  lightGray: '#E8E8E8',
  primary: '#F39F29',
  primaryTransparent: 'rgba(243, 159, 41, 0.2)',
  line: '#978D8D',
  shadow: 'rgba(243, 159, 41, 0.25)',
  buttonShadow: '#FDCB41',
};

const FormComponent = () => (
  <View style={styles.formContainer}>
    <View style={styles.formCard}>
      <View style={styles.logoContainer}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>ST</Text>
        </View>
        <Text style={styles.logoBrand}>S`Trux</Text>
      </View>

      <View style={styles.separator} />

      <Text style={styles.formTitle}>Masukkan Identitas Akun Anda</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Username</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            placeholderTextColor="#777"
            autoCapitalize="none"
            autoComplete="username"
          />
          <User color={COLORS.primary} size={20} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#777"
            secureTextEntry
            autoComplete="current-password"
          />
          <Lock color={COLORS.primary} size={20} />
        </View>
      </View>

      <Link href="/admin/dashboard" asChild>
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </Link>
    </View>
  </View>
);

interface BrandingComponentProps {
  isDesktop: boolean;
}

const BrandingComponent = ({ isDesktop }: BrandingComponentProps) => (
  <View style={[styles.brandingContainer, !isDesktop && { paddingTop: 40 }]}>
    <View>
      <Text style={[styles.brandingTitle, !isDesktop && styles.mobileBrandingTitle]}>
        Sistem Penyewaan {'\n'}
        <Text style={{ color: COLORS.primary }}>Alat Berat</Text>
      </Text>
      <Text style={[styles.brandingSubtitle, !isDesktop && { textAlign: 'center' }]}>
        SOLUSI PENYEWAAN ALAT BERAT PREMIUM UNTUK PROYEK ANDA
      </Text>
    </View>
    <Image
      source={{
        uri: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/573c/f841/5960ca53b5fafb38315e4a83831f8165?Expires=1762732800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=Yb0DnLtkQV6CLk7EtX9Z9ewqzaWGeFxwoUpYkU~fSe~e1t80FJBtUvhSdRcQAyfsEpa4a4QxRqQqUeoXP-njGyFEhzZCrn88AM8rx5deLw1wE4LuAWde7Wrn9MlaEJdzCDRuZXnhAh691e0dQxfSypUL7ZKDsEN6O2E8ewt8oXHiU3pqocp5hOjZykqG338fjRh2Qys2hSXBg4Ny-JhVvlHphOPl9yhGPsWmT3Rc52cKggYvWIFEPl~cf-bQ77iLjpomLg0vSMIdv3v8-ecgNtdod96MUAbNNORCDxlOP3ekVRCgbbzNMYiEUQmX54lJMww0A9oDDpZaCIsGdscRhg__',
      }}
      style={styles.excavatorImage}
      resizeMode="contain"
    />
  </View>
);

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 992;

  return (
    <LinearGradient colors={[COLORS.darkBrown, COLORS.darkGray]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.outerFrame}>
            <View style={[styles.mainContainer, isDesktop && styles.desktopContainer]}>
              <FormComponent />
              {isDesktop && <BrandingComponent isDesktop={isDesktop} />}
            </View>
          </View>
          {!isDesktop && <BrandingComponent isDesktop={isDesktop} />}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  outerFrame: {
    flex: 1,
    margin: Platform.OS === 'web' ? 40 : 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 25,
    justifyContent: 'center',
    minHeight: 650,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  desktopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: Platform.OS === 'web' ? 40 : 30,
    ...Platform.select({
      web: {
        boxShadow: `0px 0px 26px ${COLORS.shadow}`,
      },
      native: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 26,
        elevation: 10,
      },
    }),
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBox: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: COLORS.darkGray,
  },
  logoBrand: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: COLORS.darkGray,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.line,
    marginVertical: 20,
  },
  formTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: COLORS.darkGray,
    marginBottom: 6,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryTransparent,
    borderWidth: 0.3,
    borderColor: COLORS.primary,
    borderRadius: 7,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: 44,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 20,
    ...Platform.select({
      web: {
        boxShadow: `0px 0px 5px ${COLORS.buttonShadow}`,
      },
      native: {
        shadowColor: COLORS.buttonShadow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 5,
        elevation: 5,
      },
    }),
    alignSelf: 'center',
    width: 144,
  },
  loginButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: COLORS.white,
  },
  brandingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  brandingTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 48,
    color: COLORS.white,
    textAlign: 'left',
    lineHeight: 72,
  },
  mobileBrandingTitle: {
    fontSize: 36,
    textAlign: 'center',
    lineHeight: 54,
  },
  brandingSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.white,
    textAlign: 'left',
    marginTop: 16,
    opacity: 0.8,
    maxWidth: 450,
  },
  excavatorImage: {
    width: '100%',
    maxWidth: 498,
    height: 350,
    marginTop: 40,
  },
});
