import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';

interface MenuItemProps {
    item: MenuItem;
    onPress: (item: MenuItem) => void;
    isTablet: boolean;
}

export default function MenuItem({ item, onPress, isTablet }: MenuItemProps) {
    const theme = useTheme();

    return (
        <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 300 }}
        >
            <Card
                style={[styles.card, { width: isTablet ? 240 : 180 }]}
                onPress={() => onPress(item)}
            >
                <TouchableRipple onPress={() => onPress(item)}>
                    <Card.Content style={styles.content}>
                        <View style={styles.header}>
                            <Text style={styles.name}>{item.name}</Text>
                            {item.customizable && (
                                <Ionicons name="options-outline" size={18} color={theme.colors.primary} />
                            )}
                        </View>
                        <View style={styles.footer}>
                            <Text style={[styles.price, { color: theme.colors.primary }]}>
                                ₽{item.price}
                            </Text>
                            {item.popular && (
                                <View style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}>
                                    <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                                        Популярное
                                    </Text>
                                </View>
                            )}
                        </View>
                    </Card.Content>
                </TouchableRipple>
            </Card>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    card: {
        margin: 8,
        borderRadius: 16,
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 18,
        fontWeight: '700',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
});

