import React from 'react';
import { ScrollView, StyleSheet, View, Linking } from 'react-native';
import { useTheme, Card, Switch, Button, Text, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '@/store/settingsStore';
import { useToastStore } from '@/store/toastStore';
import { Bell, Moon, Key, Book, MessageCircle, HelpCircle } from 'lucide-react';

export default function SettingsScreen() {
    const theme = useTheme();
    const { notifications, darkMode, toggleNotifications, toggleDarkMode } = useSettingsStore();
    const showToast = useToastStore((state) => state.showToast);

    const handleChangePassword = () => {
        // Implement password change logic
        showToast('Функция смены пароля будет доступна в следующем обновлении', 'info');
    };

    const handleOpenDocumentation = () => {
        Linking.openURL('https://your-documentation-url.com').catch(() => {
            showToast('Не удалось открыть документацию', 'error');
        });
    };

    const handleContactSupport = () => {
        Linking.openURL('mailto:support@your-cafe.com').catch(() => {
            showToast('Не удалось открыть почтовый клиент', 'error');
        });
    };

    const handleOpenFAQ = () => {
        Linking.openURL('https://your-faq-url.com').catch(() => {
            showToast('Не удалось открыть FAQ', 'error');
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <Text style={styles.title}>Настройки</Text>

                {/* Профиль и доступ */}
                <Card style={styles.section}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Профиль и доступ</Text>
                        <View style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Bell size={24} color={theme.colors.primary} />
                                <Text>Уведомления</Text>
                            </View>
                            <Switch value={notifications} onValueChange={toggleNotifications} />
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Key size={24} color={theme.colors.primary} />
                                <Text>Изменить пароль</Text>
                            </View>
                            <Button mode="text" onPress={handleChangePassword}>
                                Изменить
                            </Button>
                        </View>
                    </Card.Content>
                </Card>

                {/* Интерфейс и внешний вид */}
                <Card style={styles.section}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Интерфейс и внешний вид</Text>
                        <View style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Moon size={24} color={theme.colors.primary} />
                                <Text>Тёмная тема</Text>
                            </View>
                            <Switch value={darkMode} onValueChange={toggleDarkMode} />
                        </View>
                    </Card.Content>
                </Card>

                {/* Поддержка и помощь */}
                <Card style={styles.section}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Поддержка и помощь</Text>
                        <View style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Book size={24} color={theme.colors.primary} />
                                <Text>Документация</Text>
                            </View>
                            <Button mode="text" onPress={handleOpenDocumentation}>
                                Открыть
                            </Button>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <MessageCircle size={24} color={theme.colors.primary} />
                                <Text>Связаться с поддержкой</Text>
                            </View>
                            <Button mode="text" onPress={handleContactSupport}>
                                Написать
                            </Button>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <HelpCircle size={24} color={theme.colors.primary} />
                                <Text>Часто задаваемые вопросы</Text>
                            </View>
                            <Button mode="text" onPress={handleOpenFAQ}>
                                Открыть
                            </Button>
                        </View>
                    </Card.Content>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        margin: 16,
    },
    section: {
        margin: 16,
        marginTop: 0,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    divider: {
        marginVertical: 8,
    },
});

