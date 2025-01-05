import FontAwesome from '@expo/vector-icons/FontAwesome';
import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {useFonts} from 'expo-font';
import {Drawer} from 'expo-router/drawer';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';
import {ProtectedRoute} from '@/components/auth/protected-route';
import CustomDrawerContent from '@/components/drawer/custom-drawer-content';
import {useAuthStore} from '@/store/authStore';
import {PaperProvider} from "react-native-paper";
import {darkTheme, lightTheme} from '@/theme/theme';
import {useSettingsStore} from "@/store/settingsStore";

export {
    ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
    initialRouteName: '/',
};

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
    const {user, isLoading} = useAuthStore();
    const {darkMode} = useSettingsStore();

    if (isLoading) {
        return null;
    }

    if (!user) {
        return (
            <ThemeProvider value={darkMode ? DarkTheme : DefaultTheme}>
                <PaperProvider theme={darkMode ? darkTheme : lightTheme}>
                <Stack>
                    <Stack.Screen
                        name="login"
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="register"
                        options={{
                            headerShown: false,
                        }}
                    />
                </Stack>
                </PaperProvider>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider value={darkMode ? DarkTheme : DefaultTheme}>
            <PaperProvider theme={darkMode ? darkTheme : lightTheme}>
                <Drawer
                    screenOptions={{
                        headerShown: true,
                        drawerType: 'front',
                    }}
                    drawerContent={(props) => <CustomDrawerContent {...props} />}
                >
                    <Drawer.Screen
                        name="orders"
                        options={{
                            drawerLabel: 'Заказы',
                            title: 'Заказы',
                            drawerItemStyle: {display: user.role === 'barista' ? 'flex' : 'none'},
                        }}
                    />
                    <Drawer.Screen
                        name="cashier"
                        options={{
                            drawerLabel: 'Касса',
                            title: 'Касса',
                        }}
                    />
                    <Drawer.Screen
                        name="inventory"
                        options={{
                            drawerLabel: 'Инвентаризация',
                            title: 'Инвентаризация',
                            drawerItemStyle: {display: user.role === 'admin' ? 'flex' : 'none'},
                        }}
                    />
                    <Drawer.Screen
                        name="ingredients"
                        options={{
                            drawerLabel: 'Ингредиенты',
                            title: 'Ингредиенты',
                            drawerItemStyle: {display: user.role === 'admin' ? 'flex' : 'none'},
                        }}
                    />
                    <Drawer.Screen
                        name="reports"
                        options={{
                            drawerLabel: 'Отчеты',
                            title: 'Отчеты',
                            drawerItemStyle: {display: user.role === 'admin' ? 'flex' : 'none'},
                        }}
                    />
                    <Drawer.Screen
                        name="discounts"
                        options={{
                            drawerLabel: 'Акции',
                            title: 'Акции',
                            drawerItemStyle: {display: user.role === 'admin' ? 'flex' : 'none'},
                        }}
                    />
                    <Drawer.Screen
                        name="dishes"
                        options={{
                            drawerLabel: 'Блюда',
                            title: 'Блюда',
                            drawerItemStyle: {display: user.role === 'admin' ? 'flex' : 'none'},
                        }}
                    />
                    <Drawer.Screen
                        name="cooperators"
                        options={{
                            drawerLabel: 'Сотрудники',
                            title: 'Сотрудники',
                            drawerItemStyle: {display: user.role === 'admin' ? 'flex' : 'none'},
                        }}
                    />
                    <Drawer.Screen
                        name="settings"
                        options={{
                            drawerLabel: 'Настройки',
                            title: 'Настройки',
                        }}
                    />

                    <Drawer.Screen
                        name="index"
                        options={{
                            drawerItemStyle: {display: 'none'},
                        }}
                    />
                    <Drawer.Screen
                        name="register"
                        options={{
                            drawerItemStyle: {display: 'none'},
                        }}
                    />
                    <Drawer.Screen
                        name="login"
                        options={{
                            drawerItemStyle: {display: 'none'},
                        }}
                    />
                    <Drawer.Screen
                        name="+not-found"
                        options={{
                            title: 'Страница не найдена',
                            drawerItemStyle: {display: 'none'},
                        }}
                    />


                </Drawer>
            </PaperProvider>
        </ThemeProvider>
    );
}

export default function RootLayout() {
    const [loaded, error] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        ...FontAwesome.font,
    });

    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <>
            <RootLayoutNav/>
            <ProtectedRoute/>
        </>
    );
}

