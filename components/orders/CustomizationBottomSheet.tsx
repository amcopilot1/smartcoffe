import React, {forwardRef, useCallback} from 'react';
import {Dimensions, ScrollView, StyleSheet, View} from 'react-native';
import {Button, Card, Chip, IconButton, Text, useTheme} from 'react-native-paper';
import {BottomSheetBackdrop, BottomSheetModal, BottomSheetView} from '@gorhom/bottom-sheet';
import {addons, discounts} from '@/data/menuData';
import {MaterialCommunityIcons} from '@expo/vector-icons';

interface CustomizationBottomSheetProps {
    currentItem: MenuItem | null;
    selectedAddons: Addon[];
    selectedVolume: number;
    selectedDiscount: Discount | null;
    onAddonSelect: (addons: Addon[]) => void;
    onVolumeSelect: (volume: number) => void;
    onDiscountSelect: (discount: Discount | null) => void;
    onConfirm: () => void;
    onClose: () => void;
}

export const CustomizationBottomSheet = forwardRef<BottomSheetModal, CustomizationBottomSheetProps>(
    ({
         currentItem,
         selectedAddons,
         selectedVolume,
         selectedDiscount,
         onAddonSelect,
         onVolumeSelect,
         onDiscountSelect,
         onConfirm,
         onClose
     }, ref) => {
        const {colors} = useTheme();
        const windowWidth = Dimensions.get('window').width;

        const handleAddonSelect = useCallback((addon: Addon) => {
            if (addon.type === 'milk') {
                const newSelectedAddons = selectedAddons.filter(a => a.type !== 'milk');
                onAddonSelect([...newSelectedAddons, addon]);
            } else {
                const newSelectedAddons = selectedAddons.some(a => a.id === addon.id)
                    ? selectedAddons.filter(a => a.id !== addon.id)
                    : [...selectedAddons, addon];
                onAddonSelect(newSelectedAddons);
            }
        }, [selectedAddons, onAddonSelect]);

        const renderCustomizationCard = (title: string, icon: string, content: React.ReactNode) => (
            <Card style={styles.customizationCard}>
                <Card.Title
                    title={title}
                    left={(props) => <MaterialCommunityIcons name={icon} size={24} color={colors.primary} {...props} />}
                />
                <Card.Content>{content}</Card.Content>
            </Card>
        );

        const calculateTotal = () => {
            const basePrice = currentItem?.price || 0;
            const volumePrice = selectedVolume === 400 ? 50 : 0;
            const addonsPrice = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
            const discountAmount = selectedDiscount?.amount || 0;
            return basePrice + volumePrice + addonsPrice - discountAmount;
        };

        return (
            <BottomSheetModal
                ref={ref}
                backdropComponent={(props) => (
                    <BottomSheetBackdrop {...props} disappearsOnIndex={-1}/>
                )}
                backgroundStyle={{
                    backgroundColor: colors.background,
                }}
                handleIndicatorStyle={{
                    backgroundColor: colors.onSurface,
                }}
            >
                <BottomSheetView style={styles.container}>
                    {currentItem && (
                        <>
                            <View style={styles.header}>
                                <Text variant="headlineSmall" style={styles.title}>{currentItem.name}</Text>
                                <IconButton icon="close" onPress={onClose}/>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}
                                        style={styles.customizationCards}>
                                {renderCustomizationCard("Объем", "cup", (
                                    <View style={styles.volumeButtons}>
                                        {[250, 400].map(volume => (
                                            <Chip
                                                key={volume} onPress={() => onVolumeSelect(volume)}
                                                selected={selectedVolume === volume}
                                                style={styles.volumeChip}
                                            >
                                                {volume} мл {volume === 400 ? '(+₽50)' : ''}
                                            </Chip>
                                        ))}
                                    </View>
                                ))}
                                {renderCustomizationCard("Сиропы", "bottle-tonic-skull", (
                                    <View style={styles.addonsGrid}>
                                        {addons
                                            .filter(addon => addon.type === 'syrup')
                                            .map(addon => (
                                                <Chip
                                                    key={addon.id}
                                                    onPress={() => handleAddonSelect(addon)}
                                                    selected={selectedAddons.some(a => a.id === addon.id)}
                                                    style={styles.addonChip}
                                                >
                                                    {addon.name} (+₽{addon.price})
                                                </Chip>
                                            ))
                                        }
                                    </View>
                                ))}
                                {renderCustomizationCard("Молоко", "cow", (
                                    <View style={styles.addonsGrid}>
                                        {addons
                                            .filter(addon => addon.type === 'milk')
                                            .map(addon => (
                                                <Chip
                                                    key={addon.id} onPress={() => handleAddonSelect(addon)}
                                                    selected={selectedAddons.some(a => a.id === addon.id)}
                                                    style={styles.addonChip}
                                                >
                                                    {addon.name} (+₽{addon.price})
                                                </Chip>
                                            ))
                                        }
                                    </View>
                                ))}
                                {renderCustomizationCard("Крепость", "coffee", (
                                    <Chip
                                        onPress={() => handleAddonSelect(addons.find(a => a.type === 'extra_shot')!)}
                                        selected={selectedAddons.some(a => a.type === 'extra_shot')}
                                        style={styles.addonChip}
                                    >
                                        Дополнительный шот (+₽50)
                                    </Chip>
                                ))}
                                {renderCustomizationCard("Скидка", "sale", (
                                    <View style={styles.discountButtons}>
                                        <Chip
                                            onPress={() => onDiscountSelect(null)}
                                            selected={!selectedDiscount}
                                            style={styles.discountChip}
                                        >
                                            Без скидки
                                        </Chip>
                                        {discounts.map(discount => (
                                            <Chip
                                                key={discount.id} onPress={() => onDiscountSelect(discount)}
                                                selected={selectedDiscount?.id === discount.id}
                                                style={styles.discountChip}
                                            >
                                                {discount.name} (-₽{discount.amount})
                                            </Chip>
                                        ))}
                                    </View>
                                ))}
                            </ScrollView>
                            <View style={styles.footer}>
                                <View style={styles.totalContainer}>
                                    <Text variant="titleMedium" style={styles.totalLabel}>
                                        Итого:
                                    </Text>
                                    <Text variant="headlineSmall" style={styles.totalPrice}>
                                        ₽{calculateTotal().toFixed(2)}
                                    </Text>
                                </View>
                                <Button
                                    mode="contained"
                                    onPress={onConfirm}
                                    style={styles.confirmButton}
                                    labelStyle={styles.confirmButtonLabel}
                                >
                                    Добавить в заказ
                                </Button>
                            </View>
                        </>
                    )}
                </BottomSheetView>
            </BottomSheetModal>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        flex: 1,
    },
    customizationCards: {
        flexGrow: 0,
    },
    customizationCard: {
        width: 300,
        marginRight: 16,
    },
    volumeButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    volumeChip: {
        marginHorizontal: 4,
    },
    addonsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    addonChip: {
        margin: 4,
    },
    discountButtons: {
        flexDirection: 'column',
    },
    discountChip: {
        marginVertical: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
        marginTop: 16,
    },
    totalContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    totalLabel: {
        marginRight: 8,
    },
    totalPrice: {
        fontWeight: 'bold',
    },
    confirmButton: {
        paddingHorizontal: 24,
    },
    confirmButtonLabel: {
        fontSize: 16,
    },
});
