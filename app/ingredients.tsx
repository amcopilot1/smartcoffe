import React, { useCallback, useEffect } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Card, FAB, IconButton, Modal, Searchbar, Text, useTheme } from 'react-native-paper'
import {Ingredient, useIngredientsStore} from '@/store/ingredientsStore'
import { AddEditIngredientItemForm } from '@/components/ingredients/AddEditIngredientItemForm'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown, Layout } from 'react-native-reanimated'
import { useSegments } from 'expo-router'

const convertToIncomingUnit = (usage: number, conversionFactor: number) => usage / conversionFactor

const formatUnitValue = (value: number) => {
    return Math.round(value * 100) / 100
}

export default function IngredientsScreen()  {
    const theme = useTheme()
    const segments = useSegments()
    const isIngredientsPage = segments[0] === 'ingredients'

    const {
        items,
        loading,
        searchQuery,
        setSearchQuery,
        subscribeToIngredients,
        deleteIngredient,
    } = useIngredientsStore()

    const [selectedItem, setSelectedItem] = React.useState<Ingredient | null>(null)
    const [modalVisible, setModalVisible] = React.useState(false)
    const [fabOpen, setFabOpen] = React.useState(false)

    useEffect(() => {
        const unsubscribe = subscribeToIngredients()
        return () => unsubscribe()
    }, [])

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((item1, item2) => item1.name.localeCompare(item2.name))

    const handleAddEditItem = () => {
        setSelectedItem(null)
        setModalVisible(true)
    }

    const handleEditItem = (item: Ingredient) => {
        setSelectedItem(item)
        setModalVisible(true)
    }

    const closeModal = useCallback(() => {
        setModalVisible(false)
        setSelectedItem(null)
    }, [])

    const renderStatusIndicator = (stock: number, minStock?: number) => {
        const isLow = minStock ? stock < minStock : stock < 10
        return (
            <View
                style={[
                    styles.statusIndicator,
                    { backgroundColor: isLow ? theme.colors.error : theme.colors.primary },
                ]}
            >
                <Text style={styles.statusText}>{isLow ? 'Мало' : 'ОК'}</Text>
            </View>
        )
    }

    const renderIngredientCard = (item: Ingredient) => {
        const usageInIncomingUnits = convertToIncomingUnit(item.usage, item.conversionFactor)

        return (
            <Animated.View
                key={item.id}
                entering={FadeInDown}
                layout={Layout.springify()}
            >
                <Card style={styles.card}>
                    <Card.Content style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemDetails}>
                                    {item.price} ₽ за 1 {item.incomingUnit}
                                </Text>
                            </View>
                            {renderStatusIndicator(item.stock, item.minStock)}
                        </View>
                        <View style={styles.cardFooter}>
                            <View style={styles.statsContainer}>
                                <View style={styles.stat}>
                                    <Ionicons name="cube-outline" size={20} color={theme.colors.primary} />
                                    <Text style={styles.statText}>
                                        {formatUnitValue(item.stock)} {item.incomingUnit}
                                    </Text>
                                </View>
                                {item.usage > 0 && <View style={styles.stat}>
                                    <Ionicons name="trending-up-outline" size={20} color={theme.colors.primary}/>
                                    <Text style={styles.statText}>
                                        {formatUnitValue(item.usage)} {item.usageUnit}/мес
                                        {' '}
                                        <Text style={styles.secondaryText}>
                                            ({formatUnitValue(usageInIncomingUnits)} {item.incomingUnit})
                                        </Text>
                                    </Text>
                                </View>}
                            </View>
                            <View style={styles.actions}>
                                <IconButton icon="pencil-outline" size={20} onPress={() => handleEditItem(item)} />
                                <IconButton
                                    icon="delete-outline"
                                    size={20}
                                    iconColor={theme.colors.error}
                                    onPress={() => deleteIngredient(item.id)}
                                />
                            </View>
                        </View>
                    </Card.Content>
                </Card>
            </Animated.View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={[styles.header, {
                backgroundColor: theme.colors.background
            }]}>
                <Searchbar
                    placeholder="Поиск ингредиентов"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchbar}
                />
                <Text style={styles.subtitle}>{filteredItems.length} позиций</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.grid}>
                    {loading ? (
                        <Text>Загрузка...</Text>
                    ) : (
                        filteredItems.map(renderIngredientCard)
                    )}
                </View>
            </ScrollView>

            <FAB.Group
                visible={isIngredientsPage}
                open={fabOpen}
                icon={fabOpen ? 'close' : 'plus'}
                actions={[
                    {
                        icon: 'plus',
                        label: 'Добавить ингредиент',
                        onPress: handleAddEditItem,
                        style: {
                            backgroundColor: theme.colors.primary,
                        },
                        color: theme.colors.inversePrimary,
                    },
                    {
                        icon: 'file-excel',
                        label: 'Экспорт в Excel',
                        onPress: () => console.log('Export to Excel'),
                    },
                    {
                        icon: 'chart-bar',
                        label: 'Аналитика',
                        onPress: () => console.log('Show Analytics'),
                    },
                ]}
                onStateChange={({ open }) => setFabOpen(open)}
                fabStyle={{
                    backgroundColor: theme.colors.primary,
                }}
                color={theme.colors.inversePrimary}
            />

            <Modal visible={modalVisible} onDismiss={closeModal}
                   contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.background }]}
            >
                <AddEditIngredientItemForm item={selectedItem} onCancel={closeModal} />
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
    },
    searchbar: {
        marginBottom: 12,
        elevation: 0,
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.7,
    },
    content: {
        flex: 1,
    },
    grid: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
        borderRadius: 16,
        elevation: 2,
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemDetails: {
        fontSize: 14,
        opacity: 0.7,
    },
    statusIndicator: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 14,
        opacity: 0.7,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    secondaryText: {
        fontSize: 12,
        opacity: 0.5,
    },
    modalContainer: {
        maxHeight: '90%',
        maxWidth: '90%',
        marginHorizontal: 'auto',
        borderRadius: 16,
    },
})
