import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Button, Card, Chip, Text, IconButton, useTheme, Portal, ActivityIndicator } from 'react-native-paper';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { MenuCategory } from '@/components/orders/MenuCategory';
import { OrderItemCard } from '@/components/orders/OrderItemCard';
import { CustomizationBottomSheet } from '@/components/orders/CustomizationBottomSheet';
import { PaymentModal } from '@/components/orders/PaymentModal';
import MenuItem from '@/components/orders/MenuItem';



export default  function OrdersScreen() {
    const theme = useTheme();
    const { width } = Dimensions.get('window');
    const isTablet = width >= 768;
    const { user } = useApp();

    const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('Все');
    const [currentItem, setCurrentItem] = useState<MenuItemType | null>(null);
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [selectedVolume, setSelectedVolume] = useState(250);
    const [selectedDiscount, setSelectedDiscount] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { orderItems, addToOrder, removeFromOrder, updateOrderItem, clearOrder } = useOrderContext();

    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const scrollY = useSharedValue(0);

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const items = await menuService.getMenuItems();
                setMenuItems(items);
            } catch (err) {
                setError('Failed to fetch menu items');
                // showToast('Error fetching menu items', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems();
    }, []);

    const categories = useMemo(() => {
        return ['Все', ...new Set(menuItems.map(item => item.category))];
    }, [menuItems]);

    const filteredItems = useMemo(() => {
        return activeCategory === 'Все'
            ? menuItems
            : menuItems.filter(item => item.category === activeCategory);
    }, [activeCategory, menuItems]);

    const total = useMemo(() => {
        return orderItems.reduce((sum, item) => {
            const itemTotal = item.price * item.quantity;
            const addonsTotal = item.customizations?.extras?.reduce((acc, addon) => {
                const addonItem = menuItems.find(mi => mi.id === addon);
                return acc + (addonItem?.price || 0);
            }, 0) || 0;
            return sum + (itemTotal + (addonsTotal * item.quantity));
        }, 0);
    }, [orderItems, menuItems]);

    const handleAddItem = useCallback((item: MenuItemType) => {
        if (item.customizable) {
            setCurrentItem(item);
            setSelectedAddons([]);
            setSelectedVolume(250);
            setSelectedDiscount(null);
            bottomSheetRef.current?.present();
        } else {
            addToOrder({
                id: item.id,
                menuItemId: item.id,
                name: item.name,
                price: item.price,
                quantity: 1
            });
        }
    }, [addToOrder]);

    const handleConfirmAddons = useCallback(() => {
        if (currentItem) {
            const basePrice = currentItem.price;
            const volumePrice = selectedVolume === 400 ? 50 : 0;
            const addonsPrice = selectedAddons.reduce((sum, addonId) => {
                const addon = menuItems.find(item => item.id === addonId);
                return sum + (addon?.price || 0);
            }, 0);
            const finalPrice = basePrice + volumePrice + addonsPrice;

            addToOrder({
                id: currentItem.id,
                menuItemId: currentItem.id,
                name: currentItem.name,
                quantity: 1,
                price: finalPrice,
                customizations: {
                    size: selectedVolume.toString(),
                    extras: selectedAddons
                }
            });
            bottomSheetRef.current?.close();
        }
    }, [currentItem, selectedAddons, selectedVolume, selectedDiscount, addToOrder, menuItems]);

    const handlePayment = useCallback(async (method: 'cash' | 'card') => {
        try {
            setLoading(true);
            const activeSession = await cashierService.getActiveSession();
            if (!activeSession) {
                throw new Error('No active cashier session');
            }

            const order: Omit<Order, 'id' | 'createdAt'> = {
                items: orderItems,
                total,
                status: 'completed',
                paymentMethod: method,
                userId: user!.id,
                userName: user!.name
            };

            await orderService.createOrder(order);
            await cashierService.addTransaction(activeSession.id, {
                type: 'sale',
                amount: total,
                description: `Order payment - ${method}`,
                userId: user!.id
            });

            clearOrder();
            setIsPaymentModalVisible(false);
            // showToast('Order completed successfully', 'success');
        } catch (err) {
            // showToast('Failed to process payment', 'error');
        } finally {
            setLoading(false);
        }
    }, [total, clearOrder, orderItems, user]);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const headerStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, 50],
            [1, 0.9],
            Extrapolate.CLAMP
        );
        return { opacity };
    });

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text>{error}</Text>
                <Button onPress={() => window.location.reload()}>Retry</Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.menuSection}>
                    <Animated.View style={[styles.header, headerStyle]}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoriesContent}
                        >
                            {categories.map((category) => (
                                <Chip
                                    key={category}
                                    selected={activeCategory === category}
                                    onPress={() => setActiveCategory(category)}
                                    style={styles.categoryChip}
                                    showSelectedCheck
                                >
                                    {category}
                                </Chip>
                            ))}
                        </ScrollView>
                    </Animated.View>

                    <Animated.ScrollView
                        onScroll={scrollHandler}
                        scrollEventThrottle={16}
                        style={styles.menuList}
                    >
                        {activeCategory === 'Все' ? (
                            categories.slice(1).map((category) => (
                                <MenuCategory key={category} title={category}>
                                    <View style={styles.menuGrid}>
                                        {menuItems
                                            .filter(item => item.category === category)
                                            .map(item => (
                                                <MenuItem
                                                    key={item.id}
                                                    item={item}
                                                    onPress={handleAddItem}
                                                    isTablet={isTablet}
                                                />
                                            ))}
                                    </View>
                                </MenuCategory>
                            ))
                        ) : (
                            <MenuCategory title={activeCategory}>
                                <View style={styles.menuGrid}>
                                    {filteredItems.map(item => (
                                        <MenuItem
                                            key={item.id}
                                            item={item}
                                            onPress={handleAddItem}
                                            isTablet={isTablet}
                                        />
                                    ))}
                                </View>
                            </MenuCategory>
                        )}
                    </Animated.ScrollView>
                </View>

                <View style={styles.orderSection}>
                    <Card style={styles.orderCard}>
                        <Card.Content>
                            <View style={styles.orderHeader}>
                                <Text variant="titleLarge">Текущий заказ</Text>
                                <IconButton
                                    icon="delete-sweep"
                                    mode="contained"
                                    onPress={clearOrder}
                                    disabled={orderItems.length === 0}
                                />
                            </View>

                            {orderItems.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyStateText}>
                                        В заказе пока пусто
                                    </Text>
                                </View>
                            ) : (
                                <ScrollView style={styles.orderList}>
                                    {orderItems.map((item, index) => (
                                        <OrderItemCard
                                            key={`${item.id}-${index}`}
                                            item={item}
                                            onRemove={() => removeFromOrder(item.id)}
                                            onQuantityChange={(quantity) =>
                                                updateOrderItem(item.id, { ...item, quantity })
                                            }
                                        />
                                    ))}
                                </ScrollView>
                            )}

                            <View style={styles.totalSection}>
                                <View style={styles.totalRow}>
                                    <Text variant="titleMedium">Итого</Text>
                                    <MotiView
                                        from={{ scale: 1 }}
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ type: 'spring', duration: 100 }}
                                    >
                                        <Text variant="headlineMedium">
                                            ₽{total.toLocaleString()}
                                        </Text>
                                    </MotiView>
                                </View>

                                <Button
                                    mode="contained"
                                    onPress={() => setIsPaymentModalVisible(true)}
                                    disabled={orderItems.length === 0}
                                    style={styles.paymentButton}
                                >
                                    Оплатить
                                </Button>
                            </View>
                        </Card.Content>
                    </Card>
                </View>
            </View>

            <CustomizationBottomSheet
                ref={bottomSheetRef}
                currentItem={currentItem}
                selectedAddons={selectedAddons}
                selectedVolume={selectedVolume}
                selectedDiscount={selectedDiscount}
                onAddonSelect={setSelectedAddons}
                onVolumeSelect={setSelectedVolume}
                onDiscountSelect={setSelectedDiscount}
                onConfirm={handleConfirmAddons}
                onClose={() => bottomSheetRef.current?.close()}
            />

            <PaymentModal
                visible={isPaymentModalVisible}
                onDismiss={() => setIsPaymentModalVisible(false)}
                onPaymentComplete={handlePayment}
                total={total}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
    },
    menuSection: {
        flex: 2,
    },
    orderSection: {
        width: 400,
        padding: 16,
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(0,0,0,0.05)',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 16,
    },
    categoriesContent: {
        paddingRight: 16,
    },
    categoryChip: {
        marginRight: 8,
    },
    menuList: {
        flex: 1,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 8,
    },
    orderCard: {
        flex: 1,
        borderRadius: 16,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyStateText: {
        fontSize: 16,
        opacity: 0.7,
    },
    orderList: {
        flex: 1,
        marginBottom: 16,
    },
    totalSection: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 16,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    paymentButton: {
        borderRadius: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

