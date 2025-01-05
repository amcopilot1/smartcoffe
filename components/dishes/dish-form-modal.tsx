import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Card, Chip, IconButton, Modal, Portal, Switch, Text, TextInput, useTheme, Divider, Menu } from 'react-native-paper';
import { Category, Dish, DishFormData, SizeVariant, IngredientWithQuantity } from "@/store/dishesStore";
import { Ingredient } from "@/store/ingredientsStore";
import { ArrowLeft, Search, Plus, Edit2 } from 'lucide-react';

interface DishFormModalProps {
    visible: boolean;
    onDismiss: () => void;
    initialData?: Dish | null;
    categories: Category[];
    ingredients: Ingredient[];
    onSubmit: (data: Omit<Dish, 'id'>) => Promise<void>;
}

type SelectorType = 'category' | 'main' | 'syrups' | 'milk' | null;

export const DishFormModal: React.FC<DishFormModalProps> = ({
                                                                visible,
                                                                onDismiss,
                                                                initialData,
                                                                categories,
                                                                ingredients,
                                                                onSubmit,
                                                            }) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [activeSelectorType, setActiveSelectorType] = useState<SelectorType>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
    const [ingredientQuantity, setIngredientQuantity] = useState('');
    const [editingIngredient, setEditingIngredient] = useState<{ id: string; type: 'mainIngredients' | 'syrups' | 'alternativeMilks' } | null>(null);

    const [formData, setFormData] = useState<DishFormData>(() => ({
        name: initialData?.name || '',
        categoryId: initialData?.categoryId || categories[0]?.id || '',
        available: initialData?.available ?? true,
        mainIngredients: initialData?.mainIngredients || [],
        syrups: initialData?.syrups || [],
        alternativeMilks: initialData?.alternativeMilks || [],
        sizeVariants: initialData?.sizeVariants || [{ size: '', price: 0 }],
        price: initialData?.price || 0,
    }));

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                categoryId: initialData.categoryId,
                available: initialData.available,
                mainIngredients: initialData.mainIngredients,
                syrups: initialData.syrups || [],
                alternativeMilks: initialData.alternativeMilks || [],
                sizeVariants: initialData.sizeVariants,
                price: initialData.price,
            });
        } else {
            setFormData({
                name: '',
                categoryId: categories[0]?.id || '',
                available: true,
                mainIngredients: [],
                syrups: [],
                alternativeMilks: [],
                sizeVariants: [{ size: '', price: 0 }],
                price: 0,
            });
        }
    }, [initialData, categories]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await onSubmit({
                ...formData,
                order: initialData?.order || Date.now(),
            });
            onDismiss();
        } catch (error) {
            console.error('Error submitting dish:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddIngredient = () => {
        if (selectedIngredient && ingredientQuantity) {
            const newIngredient: IngredientWithQuantity = {
                id: selectedIngredient.id,
                quantity: parseFloat(ingredientQuantity),
            };
            setFormData(prev => ({
                ...prev,
                [activeSelectorType === 'main' ? 'mainIngredients' :
                    activeSelectorType === 'syrups' ? 'syrups' : 'alternativeMilks']:
                    [...prev[activeSelectorType === 'main' ? 'mainIngredients' :
                        activeSelectorType === 'syrups' ? 'syrups' : 'alternativeMilks'], newIngredient]
            }));
            setSelectedIngredient(null);
            setIngredientQuantity('');
        }
    };

    const handleRemoveIngredient = (type: 'mainIngredients' | 'syrups' | 'alternativeMilks', id: string) => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].filter(item => item.id !== id)
        }));
    };

    const handleEditIngredient = (type: 'mainIngredients' | 'syrups' | 'alternativeMilks', id: string, newQuantity: number) => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        }));
        setEditingIngredient(null);
    };

    const addSizeVariant = () => {
        setFormData(prev => ({
            ...prev,
            sizeVariants: [...prev.sizeVariants, { size: '', price: 0 }]
        }));
    };

    const updateSizeVariant = (index: number, field: keyof SizeVariant, value: string) => {
        setFormData(prev => ({
            ...prev,
            sizeVariants: prev.sizeVariants.map((variant, i) =>
                i === index ? { ...variant, [field]: field === 'price' ? parseFloat(value || '0' ) : value } : variant
            )
        }));
    };

    const renderIngredientChips = (
        selectedIngredients: IngredientWithQuantity[],
        type: 'mainIngredients' | 'syrups' | 'alternativeMilks'
    ) => {
        return (
            <View style={styles.chipsContainer}>
                {selectedIngredients.map((item) => {
                    const ingredient = ingredients.find((i) => i.id === item.id);
                    if (!ingredient) return null;
                    return (
                        <View key={item.id} style={styles.chipWrapper}>
                            <Chip
                                onClose={() => handleRemoveIngredient(type, item.id)}
                                style={styles.chip}
                            >
                                {`${ingredient.name} (${item.quantity} ${ingredient.usageUnit})`}
                            </Chip>
                            <Menu
                                visible={editingIngredient?.id === item.id && editingIngredient?.type === type}
                                onDismiss={() => setEditingIngredient(null)}
                                anchor={
                                    <IconButton
                                        icon={() => <Edit2 size={16} color={theme.colors.primary} />}
                                        onPress={() => setEditingIngredient({ id: item.id, type })}
                                        size={20}
                                    />
                                }
                            >
                                <View style={styles.editQuantityContainer}>
                                    <TextInput
                                        label="Количество"
                                        value={item.quantity.toString()}
                                        onChangeText={(text) => {
                                            const newQuantity = parseFloat(text) || 0;
                                            handleEditIngredient(type, item.id, newQuantity);
                                        }}
                                        keyboardType="numeric"
                                        mode="outlined"
                                        style={styles.editQuantityInput}
                                    />
                                    <Text>{ingredient.usageUnit}</Text>
                                </View>
                            </Menu>
                        </View>
                    );
                })}
            </View>
        );
    };

    const getFilteredItems = useCallback(() => {
        const query = searchQuery.toLowerCase();
        if (activeSelectorType === 'category') {
            return categories.filter(category =>
                category.name.toLowerCase().includes(query)
            );
        } else if (activeSelectorType) {
            let filteredIngredients = ingredients;
            if (activeSelectorType === 'syrups') {
                filteredIngredients = ingredients.filter(i => i.name.toLowerCase().includes('сироп'));
            } else if (activeSelectorType === 'milk') {
                filteredIngredients = ingredients.filter(i => i.name.toLowerCase().includes('молоко'));
            }
            return filteredIngredients.filter(ingredient =>
                ingredient.name.toLowerCase().includes(query)
            );
        }
        return [];
    }, [activeSelectorType, searchQuery, categories, ingredients]);

    const renderSelector = () => {
        if (!activeSelectorType) return null;

        let title = '';
        switch (activeSelectorType) {
            case 'category':
                title = 'Выбор категории';
                break;
            case 'main':
                title = 'Выбор основных ингредиентов';
                break;
            case 'syrups':
                title = 'Выбор сиропов';
                break;
            case 'milk':
                title = 'Выбор альтернативного молока';
                break;
        }

        const items = getFilteredItems();

        return (
            <View style={styles.selector}>
                <View style={styles.selectorHeader}>
                    <IconButton
                        icon={() => <ArrowLeft size={24} color={theme.colors.text} />}
                        onPress={() => {
                            setActiveSelectorType(null);
                            setSearchQuery('');
                            setSelectedIngredient(null);
                            setIngredientQuantity('');
                        }}
                    />
                    <Text style={styles.title}>{title}</Text>
                </View>
                <Divider />
                <View style={styles.searchContainer}>
                    <TextInput
                        mode="outlined"
                        placeholder="Поиск..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        left={<TextInput.Icon icon={() => <Search size={20} color={theme.colors.text} />} />}
                        style={styles.searchInput}
                    />
                </View>
                <ScrollView style={styles.selectorList}>
                    {items.map((item) => {
                        if (activeSelectorType === 'category') {
                            const category = item as Category;
                            return (
                                <Button
                                    key={category.id}
                                    mode="text"
                                    onPress={() => {
                                        setFormData(prev => ({ ...prev, categoryId: category.id }));
                                        setActiveSelectorType(null);
                                        setSearchQuery('');
                                    }}
                                    style={styles.selectorItem}
                                    contentStyle={styles.selectorItemContent}
                                >
                                    {category.name}
                                </Button>
                            );
                        } else {
                            const ingredient = item as Ingredient;
                            return (
                                <Button
                                    key={ingredient.id}
                                    mode="text"
                                    onPress={() => setSelectedIngredient(ingredient)}
                                    style={styles.selectorItem}
                                    contentStyle={styles.selectorItemContent}
                                >
                                    {ingredient.name}
                                </Button>
                            );
                        }
                    })}
                </ScrollView>
                {selectedIngredient && (
                    <View style={styles.addIngredientContainer}>
                        <TextInput
                            mode="outlined"
                            label={`Количество (${selectedIngredient.usageUnit})`}
                            value={ingredientQuantity}
                            onChangeText={setIngredientQuantity}
                            keyboardType="numeric"
                            style={styles.quantityInput}
                        />
                        <Button
                            mode="contained"
                            onPress={handleAddIngredient}
                            disabled={!ingredientQuantity}
                        >
                            Добавить
                        </Button>
                    </View>
                )}
            </View>
        );
    };


    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[styles.modalContainer, {backgroundColor: theme.colors.background}]}
            >
                {visible && <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    {/* Header */}
                    <View style={[styles.header, {backgroundColor: theme.colors.background}]}>
                        <View style={styles.headerContent}>
                            <IconButton
                                icon={() => <ArrowLeft size={24} color={theme.colors.text}/>}
                                onPress={onDismiss}
                            />
                            <Text style={styles.title}>
                                {initialData ? 'Редактировать блюдо' : 'Добавить блюдо'}
                            </Text>
                        </View>
                        <Divider/>
                    </View>

                    {/* Content */}
                    {activeSelectorType ? (
                        renderSelector()
                    ) : (
                        <ScrollView style={styles.content}>
                            <TextInput
                                label="Название"
                                value={formData.name}
                                onChangeText={(text) => setFormData(prev => ({...prev, name: text}))}
                                style={styles.input}
                                mode="outlined"
                            />

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Категория</Text>
                                <Text style={styles.sectionValue}>
                                    {categories.find(c => c.id === formData.categoryId)?.name || 'Не выбрано'}
                                </Text>
                                <Button
                                    mode="outlined"
                                    onPress={() => setActiveSelectorType('category')}
                                    style={styles.sectionButton}
                                >
                                    Выбрать категорию
                                </Button>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Основные ингредиенты</Text>
                                {renderIngredientChips(formData.mainIngredients, 'mainIngredients')}
                                <Button
                                    mode="outlined"
                                    onPress={() => setActiveSelectorType('main')}
                                    style={styles.sectionButton}
                                    icon={() => <Plus size={20} color={theme.colors.primary}/>}
                                >
                                    Добавить ингредиент
                                </Button>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Сиропы</Text>
                                {renderIngredientChips(formData.syrups || [], 'syrups')}
                                <Button
                                    mode="outlined"
                                    onPress={() => setActiveSelectorType('syrups')}
                                    style={styles.sectionButton}
                                    icon={() => <Plus size={20} color={theme.colors.primary}/>}
                                >
                                    Добавить сироп
                                </Button>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Альтернативное молоко</Text>
                                {renderIngredientChips(formData.alternativeMilks || [], 'alternativeMilks')}
                                <Button
                                    mode="outlined"
                                    onPress={() => setActiveSelectorType('milk')}
                                    style={styles.sectionButton}
                                    icon={() => <Plus size={20} color={theme.colors.primary}/>}
                                >
                                    Добавить молоко
                                </Button>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Варианты размера</Text>
                                {formData.sizeVariants.map((variant, index) => (
                                    <View key={index} style={styles.sizeVariant}>
                                        <TextInput
                                            label="Размер"
                                            value={variant.size}
                                            onChangeText={(text) => updateSizeVariant(index, 'size', text)}
                                            style={[styles.input, styles.sizeInput]}
                                            mode="outlined"
                                        />
                                        <TextInput
                                            label="Цена"
                                            value={variant.price.toString()}
                                            onChangeText={(text) => updateSizeVariant(index, 'price', text)}
                                            keyboardType="numeric"
                                            style={[styles.input, styles.priceInput]}
                                            mode="outlined"
                                            right={<TextInput.Affix text="₽"/>}
                                        />
                                    </View>
                                ))}
                                <Button
                                    mode="outlined"
                                    onPress={addSizeVariant}
                                    style={styles.sectionButton}
                                    icon={() => <Plus size={20} color={theme.colors.primary}/>}
                                >
                                    Добавить вариант размера
                                </Button>
                            </View>

                            <View style={[styles.row, styles.section]}>
                                <Text>Доступно для заказа</Text>
                                <Switch
                                    value={formData.available}
                                    onValueChange={(value) => setFormData(prev => ({...prev, available: value}))}
                                />
                            </View>
                        </ScrollView>
                    )}

                    {/* Footer */}
                    <View style={[styles.footer, {backgroundColor: theme.colors.background}]}>
                        <Divider/>
                        <View style={styles.footerContent}>
                            <Button onPress={onDismiss}>Отмена</Button>
                            <Button
                                mode="contained"
                                onPress={handleSubmit}
                                loading={loading}
                                disabled={loading || !formData.name || formData.sizeVariants.length === 0}
                            >
                                {initialData ? 'Сохранить' : 'Добавить'}
                            </Button>
                        </View>
                    </View>
                </KeyboardAvoidingView>}
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        margin: 0,
        maxWidth: 420,
        width: '100%',
        maxHeight: '90%',
        marginHorizontal: 'auto',
        borderRadius: 16,
        overflow: 'hidden',
    },
    container: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingVertical: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '500',
    },
    content: {
        flex: 1,
        padding: 16,
        marginTop: 64,
        marginBottom: 76,
    },
    input: {
        marginBottom: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    sectionValue: {
        fontSize: 16,
        marginBottom: 8,
    },
    sectionButton: {
        marginTop: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sizeVariant: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    sizeInput: {
        flex: 1,
        marginRight: 8,
    },
    priceInput: {
        flex: 1,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    chipWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chip: {
        marginBottom: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    footerContent: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        padding: 16,
    },
    selector: {
        flex: 1,
        marginTop: 64,
        marginBottom: 76,
    },
    selectorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    searchContainer: {
        padding: 16,
        paddingTop: 8,
    },
    searchInput: {
        marginBottom: 0,
    },
    selectorList: {
        flex: 1,
        padding: 16,
        paddingTop: 0,
    },
    selectorItem: {
        width: '100%',
        marginBottom: 8,
    },
    selectorItemContent: {
        justifyContent: 'flex-start',
    },
    addIngredientContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    quantityInput: {
        flex: 1,
        marginRight: 16,
    },
    editQuantityContainer: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    editQuantityInput: {
        width: 100,
        marginRight: 8,
    },
});
