'use client'

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Text, useTheme } from 'react-native-paper';
import { usePathname, useRouter } from "expo-router";
import { drawerScreens, getDrawerIcon } from "@/navigation/drawer.config";
import { Ionicons } from "@expo/vector-icons";
import {useAuthStore, User} from "@/store/authStore";

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
    const theme = useTheme();
    const { user, logout } = useAuthStore();
    const pathname = usePathname();
    const router = useRouter();

    const { main, settings } = getSortedScreens(user);
    console.log(main, settings)

    return (
        <DrawerContentScrollView
            {...props}
            style={[styles.container, { backgroundColor: theme.colors.elevation.level1 }]}
        >
            {/* User Profile Section */}
            <View style={[styles.userCard, { backgroundColor: theme.colors.elevation.level2 }]}>
                <View style={styles.userAvatarContainer}>
                    <Ionicons name="person-outline" size={50} color={theme.colors.primary} />
                    <View style={styles.userStatus} />
                </View>
                <View style={styles.userInfo}>
                    <Text variant="titleMedium" style={styles.userName}>{user?.email}</Text>
                    <Text variant="bodySmall" style={styles.userRole}>
                        {user?.role === 'admin' ? 'Администратор' : 'Бариста'}
                    </Text>
                </View>
            </View>

            {/* Main Navigation */}
            <View style={styles.navigationSection}>
                <Text style={[styles.sectionHeader, { color: theme.colors.outline }]}>Навигация</Text>
                {main.map((screen) => (
                    <DrawerItem
                        key={screen?.key}
                        label={screen?.label}
                        icon={({ color, size }) => {
                            const IconComponent = getDrawerIcon(screen?.key);
                            return (
                                <View style={[
                                    styles.iconContainer,
                                    pathname === `/${screen?.key}` && { backgroundColor: theme.colors.primaryContainer }
                                ]}>
                                    <IconComponent color={color} size={size} />
                                </View>
                            );
                        }}
                        focused={pathname === `/${screen?.key}`}
                        onPress={() => router.push(`/${screen?.key}`)}
                        activeTintColor={theme.colors.primary}
                        inactiveTintColor={theme.colors.onSurface}
                        style={styles.drawerItem}
                        labelStyle={styles.drawerItemLabel}
                    />
                ))}
            </View>

            {/* Settings Section */}
            {settings.length > 0 && (
                <View style={styles.navigationSection}>
                    <Text style={[styles.sectionHeader, { color: theme.colors.outline }]}>Настройки</Text>
                    {settings.map((screen) => (
                        <DrawerItem
                            key={screen?.key}
                            label={screen?.label}
                            icon={({ color, size }) => {
                                const IconComponent = getDrawerIcon(screen?.key);
                                return (
                                    <View style={[
                                        styles.iconContainer,
                                        pathname === `/${screen?.key}` && { backgroundColor: theme.colors.primaryContainer }
                                    ]}>
                                        <IconComponent color={color} size={size} />
                                    </View>
                                );
                            }}
                            focused={pathname === `/${screen?.key}`}
                            onPress={() => router.push(`/${screen?.key}`)}
                            activeTintColor={theme.colors.primary}
                            inactiveTintColor={theme.colors.onSurface}
                            style={styles.drawerItem}
                            labelStyle={styles.drawerItemLabel}
                        />
                    ))}
                </View>
            )}

            {/* Logout Button */}
            <TouchableOpacity
                onPress={logout}
                style={[styles.logoutButton, { backgroundColor: theme.colors.errorContainer }]}
            >
                <Ionicons name="log-out" size={24} color={theme.colors.error} />
                <Text style={[styles.logoutText, { color: theme.colors.error }]}>Выйти</Text>
            </TouchableOpacity>
        </DrawerContentScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
    userCard: {
        padding: 16,
        marginHorizontal: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    userAvatarContainer: {
        position: 'relative',
        alignItems: 'center',
        marginBottom: 12,
    },
    userStatus: {
        position: 'absolute',
        right: '35%',
        bottom: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: 'white',
    },
    userInfo: {
        alignItems: 'center',
    },
    userName: {
        fontWeight: '600',
        marginBottom: 4,
    },
    userRole: {
        opacity: 0.7,
    },
    navigationSection: {
        marginBottom: 24,
    },
    sectionHeader: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    drawerItem: {
        borderRadius: 12,
        marginHorizontal: 8,
        marginVertical: 2,
    },
    drawerItemLabel: {
        fontWeight: '500',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 16,
        borderRadius: 12,
        marginTop: 'auto',
    },
    logoutText: {
        marginLeft: 12,
        fontWeight: '600',
    },
});



const getSortedScreens = (user: User | null) => {
    console.log('user', user)
    if (user?.role === 'admin') {
        return {
            main: [
                drawerScreens.find((screen) => screen.key === 'reports')!,
                drawerScreens.find((screen) => screen.key === 'inventory')!,
                drawerScreens.find((screen) => screen.key === 'cashier')!,
            ],
            settings: [
                drawerScreens.find((screen) => screen.key === 'dishes')!,
                drawerScreens.find((screen) => screen.key === 'discounts')!,
                drawerScreens.find((screen) => screen.key === 'ingredients')!,
                drawerScreens.find((screen) => screen.key === 'cooperators')!,
                drawerScreens.find((screen) => screen.key === 'settings')!,
            ],
        };
    }
    if (user?.role === 'barista') {
        return {
            main: [
                drawerScreens.find((screen) => screen.key === 'orders')!,
                drawerScreens.find((screen) => screen.key === 'cashier')!,
            ],
            settings: [
                drawerScreens.find((screen) => screen.key === 'settings')!,],
        };
    }
    return {
        main: [
            drawerScreens.find((screen) => screen.key === 'orders')!,
            drawerScreens.find((screen) => screen.key === 'cashier')!,
        ],
        settings: [
            drawerScreens.find((screen) => screen.key === 'settings')!,],
    };
};
