import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Card, FAB, IconButton, Modal, Portal, Searchbar, SegmentedButtons, Text, useTheme, Chip, Divider } from 'react-native-paper'
import { useSegments } from 'expo-router'
import { Category, Dish, useDishesStore } from '@/store/dishesStore'
import { useIngredientsStore } from "@/store/ingredientsStore";
import { DishFormModal } from "@/components/dishes/dish-form-modal";
import { CategoryFormModal } from "@/components/dishes/category-form-modal";
import {BookOpen, Coffee, Droplet, Package} from "lucide-react";

export default function DishesScreen() {
    const theme = useTheme()
    const segments = useSegments()
    const isDishesPage = segments[0] === 'dishes'

    const {
        dishes,
        categories,
        loading,
        activeTab,
        searchQuery,
        setSearchQuery,
        setActiveTab,
        subscribeToDishes,
        subscribeToCategories,
        addDish,
        updateDish,
        deleteDish,
        addCategory,
        updateCategory,
        deleteCategory,
    } = useDishesStore()

    const { items: ingredients, subscribeToIngredients } = useIngredientsStore()

    useEffect(() => {
        const unsubscribe = subscribeToIngredients()
        return () => unsubscribe()
    }, [])

    const [selectedItem, setSelectedItem] = useState<Dish | Category | null>(null)
    const [dishModalVisible, setDishModalVisible] = useState(false)
    const [categoryModalVisible, setCategoryModalVisible] = useState(false)
    const [fabOpen, setFabOpen] = useState(false)

    useEffect(() => {
        const unsubscribeDishes = subscribeToDishes()
        const unsubscribeCategories = subscribeToCategories()
        return () => {
            unsubscribeDishes()
            unsubscribeCategories()
        }
    }, [])

    const filteredItems = activeTab === 0
        ? dishes.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : categories.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const handleAdd = (type: 'dish' | 'category') => {
        setSelectedItem(null)
        if (type === 'dish') {
            setDishModalVisible(true)
        } else {
            setCategoryModalVisible(true)
        }
    }

    const handleEdit = (item: Dish | Category, type: 'dish' | 'category') => {
        console.log('item', item, type)
        setSelectedItem(item)
        if (type === 'dish') {
            setDishModalVisible(true)
        } else {
            setCategoryModalVisible(true)
        }
    }

    const closeCategoryModal = () => {
        setCategoryModalVisible(false)
        setSelectedItem(null)
    }

    const closeDishModal = () => {
        setDishModalVisible(false)
        setSelectedItem(null)
    }

    const renderDishCard = (dish: Dish) => {
        const category = categories.find(c => c.id === dish.categoryId)

        return (
            <Card style={styles.compactCard} key={dish.id} elevation={1}>
                <Card.Content>
                    {/* Заголовок и категория */}
                    <View style={styles.row}>
                        <View style={styles.infoContainer}>
                            <Text style={styles.dishName}>{dish.name}</Text>
                            <Text style={styles.category}>{category?.name}</Text>
                        </View>
                        <View style={styles.prices}>
                            {dish.sizeVariants.map((variant, index) => (
                                <Text key={index} style={styles.price}>
                                    {variant.size}: {(parseFloat(variant.price) || 0).toFixed(2)} ₽
                                </Text>
                            ))}
                        </View>
                    </View>

                    <View style={styles.ingredientsContainer}>
                        <View>
                            {/* Состав */}
                            <View style={styles.ingredientsRow}>
                                <View style={styles.ingredients}>
                                    <BookOpen size={16} style={styles.icon} />
                                    {dish.mainIngredients.slice(0, 2).map((item) => {
                                        const ingredient = ingredients.find((i) => i.id === item.id);
                                        return (
                                            <Text key={item.id} style={styles.ingredientText}>
                                                {ingredient?.name} ({item.quantity} {ingredient?.usageUnit})
                                            </Text>
                                        );
                                    })}
                                    {dish.mainIngredients.length > 2 && (
                                        <Text style={styles.more}>+ ещё {dish.mainIngredients.length - 2}</Text>
                                    )}
                                </View>
                            </View>

                            {/* Сиропы */}
                            {dish?.syrups && dish?.syrups?.length > 0 && (
                                <View style={styles.ingredientsRow}>
                                    <Droplet size={16} style={styles.icon} />
                                    {dish.syrups.map((item) => {
                                        const ingredient = ingredients.find((i) => i.id === item.id);
                                        return (
                                            <Text key={item.id} style={styles.ingredientText}>
                                                {ingredient?.name} ({item.quantity} {ingredient?.usageUnit})
                                            </Text>
                                        );
                                    })}
                                </View>
                            )}

                            {/* Альтернативное молоко */}
                            {dish?.alternativeMilks && dish?.alternativeMilks?.length > 0 && (
                                <View style={styles.ingredientsRow}>
                                    <Package size={16} style={styles.icon} />
                                    {dish.alternativeMilks.map((item) => {
                                        const ingredient = ingredients.find((i) => i.id === item.id);
                                        return (
                                            <Text key={item.id} style={styles.ingredientText}>
                                                {ingredient?.name} ({item.quantity} {ingredient?.usageUnit})
                                            </Text>
                                        );
                                    })}
                                </View>
                            )}
                        </View>

                        {/* Действия */}
                        <View style={styles.actions}>
                            <IconButton
                                icon="pencil-outline"
                                size={20}
                                onPress={() => handleEdit(dish, "dish")}
                            />
                            <IconButton
                                icon="delete-outline"
                                size={20}
                                iconColor={theme.colors.error}
                                onPress={() => deleteDish(dish.id)}
                            />
                        </View>
                    </View>
                </Card.Content>
            </Card>
        )
    }

    const renderCategoryCard = (category: Category) => {
        return (
            <Card style={styles.compactCard} key={category.id} elevation={1}>
                <Card.Content>
                    <View style={styles.row}>
                        <Text style={styles.dishName}>{category.name}</Text>
                        <View style={styles.actions}>
                            <IconButton icon="pencil-outline" size={20} onPress={() => handleEdit(category, 'category')}/>
                            <IconButton
                                icon="delete-outline"
                                size={20}
                                iconColor={theme.colors.error}
                                onPress={() => deleteCategory(category.id)}
                            />
                        </View>
                    </View>
                </Card.Content>
            </Card>
        )
    }

    return (
        <View style={styles.container}>
            <View style={[styles.header, {backgroundColor: theme.colors.background}]}>
                <Searchbar
                    placeholder={activeTab === 0 ? "Поиск блюд" : "Поиск категорий"}
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchbar}
                />
                <SegmentedButtons
                    value={activeTab.toString()}
                    onValueChange={(value) => setActiveTab(parseInt(value))}
                    buttons={[
                        {value: '0', label: 'Блюда'},
                        {value: '1', label: 'Категории'},
                    ]}
                    style={styles.tabs}
                />
                <Text style={styles.subtitle}>
                    {activeTab === 0 ? `${filteredItems.length} блюд` : `${filteredItems.length} категорий`}
                </Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.grid}>
                    {loading ? (
                        <Text>Загрузка...</Text>
                    ) : (
                        filteredItems.map((item) =>
                            activeTab === 0
                                ? renderDishCard(item as Dish)
                                : renderCategoryCard(item as Category)
                        )
                    )}
                </View>
            </ScrollView>

            <Portal>
                <FAB.Group
                    visible={isDishesPage}
                    open={fabOpen}
                    icon={fabOpen ? 'close' : 'plus'}
                    actions={[
                        {
                            icon: 'food',
                            label: 'Добавить блюдо',
                            onPress: () => handleAdd('dish'),
                            style: {backgroundColor: theme.colors.primary},
                        },
                        {
                            icon: 'format-list-bulleted',
                            label: 'Добавить категорию',
                            onPress: () => handleAdd('category'),
                        },
                    ]}
                    onStateChange={({open}) => setFabOpen(open)}
                    fabStyle={{backgroundColor: theme.colors.primary}}
                />
            </Portal>

            <DishFormModal
                visible={dishModalVisible}
                onDismiss={closeDishModal}
                initialData={selectedItem as Dish}
                categories={categories}
                ingredients={ingredients}
                onSubmit={(data) =>
                    selectedItem
                        ? updateDish(selectedItem.id, data)
                        : addDish(data)
                }
            />

            <CategoryFormModal
                visible={categoryModalVisible}
                onDismiss={closeCategoryModal}
                initialData={selectedItem as Category}
                onSubmit={(data) =>
                    selectedItem
                        ? updateCategory(selectedItem.id, data)
                        : addCategory(data)
                }
            />
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
    tabs: {
        marginBottom: 12,
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
    },
    itemName: {
        fontSize: 18,
        fontWeight: '600',
    },
    categoryChip: {
        alignSelf: 'flex-start',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    divider: {
        marginVertical: 16,
    },
    ingredientsContainer: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',

    },
    ingredientChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    unavailableChip: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#ffcccb',
    },
    unavailableText: {
        color: '#d32f2f',
    },
    compactCard: {
        padding: 8,
        borderRadius: 8,
        elevation: 2,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoContainer: {
        flex: 1,
    },
    dishName: {
        fontSize: 16,
        fontWeight: '600',
    },
    category: {
        fontSize: 12,
        color: '#888',
    },
    prices: {
        flex: 1,
        alignItems: 'flex-end',
    },
    price: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
    },
    ingredientChip: {
        marginRight: 4,
        marginBottom: 4,
    },
    more: {
        fontSize: 12,
        color: '#888',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
    },
    ingredientsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    icon: {
        marginRight: 8,
        color: "#888",
    },
    ingredients: {
        flexDirection: "row",
        flexWrap: "wrap",
        flex: 1,
        marginTop: 8,
    },
    ingredientText: {
        fontSize: 12,
        marginRight: 8,
        color: "#333",
    },
})
