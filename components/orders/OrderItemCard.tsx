import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';

interface OrderItemCardProps {
    item: OrderItem;
    onRemove: () => void;
    onQuantityChange: (quantity: number) => void;
}

export const OrderItemCard: React.FC<OrderItemCardProps> = ({ item, onRemove, onQuantityChange }) => {
    return (
        <Card style={styles.container}>
            <Card.Content style={styles.cardContent}  >
                <View style={styles.content}>
                    <View style={styles.mainInfo}>
                        <Text variant="titleMedium">{item.name}</Text>
                        <Text variant="bodyMedium">₽{item.price * item.quantity}</Text>
                    </View>
                    <View style={styles.quantityControl}>
                        <IconButton
                            icon="minus"
                            size={20}
                            onPress={() => onQuantityChange(Math.max(0, item.quantity - 1))}
                        />
                        <Text>{item.quantity}</Text>
                        <IconButton
                            icon="plus"
                            size={20}
                            onPress={() => onQuantityChange(item.quantity + 1)}
                        />
                    </View>
                    <IconButton
                        icon="close"
                        size={20}
                        onPress={onRemove}
                        style={styles.removeButton}
                    />
                </View>

                {item.addons && item.addons.length > 0 && (
                    <View style={styles.addons}>
                        {item.addons.map((addon, index) => (
                            <Text variant="labelSmall" key={index}>+ {addon.name} ₽{addon.price}</Text>
                        ))}
                    </View>
                )}

            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
    },
    cardContent: {
        flexDirection: 'column',
    },
    mainInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    addons: {
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    removeButton: {
    },
});

