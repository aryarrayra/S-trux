import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Redirect berdasarkan platform
  if (Platform.OS === 'web') {
    return <AdminLayout />;
  } else {
    return <UserLayout />;
  }
}

// Layout untuk Admin (Web)
function AdminLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Flow Admin: index → login → dashboard */}
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="admin/dashboard" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

// Layout untuk User (Mobile)
function UserLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Flow User: splash → login → dashboard */}
        <Stack.Screen name="splash" />
        <Stack.Screen name="user/login" />
        <Stack.Screen name="user/(tabs)/dashboarduser" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}