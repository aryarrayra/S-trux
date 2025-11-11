import React from 'react';
import { Tabs, Link } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';

const TabBarIcon = ({ name, color, label, isFocused }) => {
    let icon;
    const iconColor = isFocused ? '#F39F29' : '#978D8D';
    const textColor = isFocused ? '#F39F29' : '#978D8D';
  
    switch (label) {
      case 'Katalog':
        icon = <MaterialIcons name="search" size={24} color={iconColor} />;
        break;
      case 'Favorit':
        icon = <MaterialIcons name="favorite-outline" size={24} color={iconColor} />;
        break;
      case 'Beranda':
        icon = <MaterialIcons name="home" size={24} color={iconColor} />;
        break;
      case 'Riwayat':
        icon = <MaterialIcons name="history" size={24} color={iconColor} />;
        break;
      case 'Profile':
        icon = <MaterialCommunityIcons name="account-outline" size={24} color={iconColor} />;
        break;
      default:
        icon = null;
    }
  
    return (
      <View style={styles.tabIconContainer}>
        {isFocused && <View style={styles.activeTabIndicator} />}
        {icon}
        <Text style={[styles.tabLabel, { color: textColor }]}>{label}</Text>
      </View>
    );
};

function CustomTabBar({ state, descriptors, navigation }) {
    return (
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;
  
          const isFocused = state.index === index;
  
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
  
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };
  
          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };
  
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{ flex: 1 }}
            >
              <TabBarIcon name={label} color="#000" label={label} isFocused={isFocused} />
            </TouchableOpacity>
          );
        })}
      </View>
    );
}
  

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="katalog" options={{ tabBarLabel: 'Katalog' }} />
      <Tabs.Screen name="favorit" options={{ tabBarLabel: 'Favorit' }} />
      <Tabs.Screen name="dashboard" options={{ tabBarLabel: 'Beranda' }} />
      <Tabs.Screen name="riwayat" options={{ tabBarLabel: 'Riwayat' }} />
      <Tabs.Screen name="profile" options={{ tabBarLabel: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
    tabBarContainer: {
      flexDirection: 'row',
      height: 60,
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: 'rgba(0, 0, 0, 0.1)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
      paddingBottom: 5,
    },
    tabIconContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeTabIndicator: {
      position: 'absolute',
      top: 4,
      width: 35,
      height: 35,
      borderRadius: 5,
      backgroundColor: 'rgba(151, 141, 141, 0.2)',
    },
    tabLabel: {
      fontFamily: 'Poppins-Regular',
      fontSize: 8,
      marginTop: 2,
    },
});
