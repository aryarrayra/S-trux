import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const TabBarIcon = ({ label, isFocused }) => {
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
            {icon}
            <Text style={[styles.tabLabel, { color: textColor }]}>{label}</Text>
            {isFocused && <View style={styles.activeTabIndicator} />}
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
                        style={[
                            styles.tabItem,
                            label === 'Beranda' && styles.centeredTab
                        ]}
                    >
                        <TabBarIcon label={label} isFocused={isFocused} />
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
                tabBarStyle: { display: 'none' } // Hide default tab bar
            }}
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tabs.Screen
                name="katalog"
                options={{
                    tabBarLabel: 'Katalog',
                }}
            />
            <Tabs.Screen
                name="favorit"
                options={{
                    tabBarLabel: 'Favorit',
                }}
            />
            <Tabs.Screen
                name="dashboarduser"
                options={{
                    tabBarLabel: 'Beranda',
                }}
            />
            <Tabs.Screen
                name="riwayat"
                options={{
                    tabBarLabel: 'Riwayat',
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarLabel: 'Profile',
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBarContainer: {
        flexDirection: 'row',
        height: 70,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        paddingHorizontal: 10,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    centeredTab: {
        // Beranda akan tetap di tengah dengan layout yang sama
    },
    tabIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        paddingHorizontal: 8,
    },
    activeTabIndicator: {
        position: 'absolute',
        top: -8,
        width: 50,
        height: 3,
        backgroundColor: '#F39F29',
        borderRadius: 2,
    },
    tabLabel: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
        marginTop: 4,
    },
});