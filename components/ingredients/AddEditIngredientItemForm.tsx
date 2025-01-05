import React, {useEffect, useState} from 'react'
import {Animated, ScrollView, StyleSheet, View} from 'react-native'
import {Button, HelperText, IconButton, Surface, Text, TextInput, useTheme} from 'react-native-paper'
import {getDefaultConversionFactor} from '@/lib/units'
import {Ingredient, useIngredientsStore} from "@/store/ingredientsStore"

interface AddEditIngredientItemFormProps {
    item?: Ingredient | null
    onCancel: () => void
}

export const AddEditIngredientItemForm: React.FC<AddEditIngredientItemFormProps> = ({item, onCancel}) => {
    const theme = useTheme();
    const {colors} = theme;
    const {addIngredient, updateIngredient} = useIngredientsStore()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        incomingUnit: '',
        usageUnit: '',
        stock: '',
        usage: '',
        minStock: '',
        conversionFactor: '',
    })


    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name,
                price: item.price.toString(),
                incomingUnit: item.incomingUnit,
                usageUnit: item.usageUnit,
                stock: item.stock.toString(),
                usage: item.usage.toString(),
                minStock: (item.minStock || '').toString(),
                conversionFactor: item.conversionFactor.toString(),
            })
        }
    }, [item])

    useEffect(() => {
        if (formData.incomingUnit && formData.usageUnit) {
            const defaultFactor = getDefaultConversionFactor(formData.incomingUnit, formData.usageUnit)
            setFormData(prev => ({...prev, conversionFactor: defaultFactor.toString()}))
        }
    }, [formData.incomingUnit, formData.usageUnit])

    const handleSubmit = async () => {
        try {
            setLoading(true)
            const ingredientData = {
                name: formData.name,
                price: parseFloat(formData.price),
                incomingUnit: formData.incomingUnit,
                usageUnit: formData.usageUnit,
                stock: parseFloat(formData.stock),
                usage: parseFloat(formData.usage),
                minStock: formData.minStock ? parseFloat(formData.minStock) : undefined,
                conversionFactor: parseFloat(formData.conversionFactor),
            }

            if (item) {
                await updateIngredient(item.id, ingredientData)
            } else {
                await addIngredient(ingredientData)
            }
            onCancel()
        } catch (error) {
            console.error('Error submitting ingredient:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <View style={[styles.header, {borderBottomColor: colors.outline}]}>
                <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={onCancel}
                    style={styles.backButton}
                />
                <Text style={[styles.headerTitle, {color: colors.onSurface}]}>
                    {item ? 'Редактировать ингредиент' : 'Добавить ингредиент'}
                </Text>
            </View>
            <ScrollView style={styles.content}>
                <Animated.View

                >
                    <Surface style={styles.card}>
                        <Text style={[styles.cardTitle, {color: colors.onSurface}]}>
                            Основная информация
                        </Text>
                        <View style={styles.namePrice}>
                            <TextInput
                                label="Название"
                                value={formData.name}
                                onChangeText={(text) => setFormData(prev => ({...prev, name: text}))}
                                style={[styles.input, styles.nameInput]}
                                mode="outlined"
                                dense
                            />
                            <TextInput
                                label="Цена"
                                value={formData.price}
                                onChangeText={(text) => setFormData(prev => ({...prev, price: text}))}
                                keyboardType="numeric"
                                style={[styles.input, styles.priceInput]}
                                mode="outlined"
                                dense
                                right={<TextInput.Affix text="₽"/>}
                            />
                        </View>

                    </Surface>
                    <Surface style={styles.card}>
                        <Text style={[styles.cardTitle, {color: colors.onSurface}]}>
                            Единицы измерения
                        </Text>
                        <View style={styles.row}>
                            <TextInput
                                label="Ед. измерения прихода"
                                value={formData.incomingUnit}
                                onChangeText={(text) => setFormData(prev => ({...prev, incomingUnit: text}))}
                                style={[styles.input, styles.flex1]}
                                mode="outlined"
                                dense
                            />
                            <TextInput
                                label="Ед. измерения расхода"
                                value={formData.usageUnit}
                                onChangeText={(text) => setFormData(prev => ({...prev, usageUnit: text}))}
                                style={[styles.input, styles.flex1]}
                                mode="outlined"
                                dense
                            />
                        </View>
                        <TextInput
                            label="Коэффициент пересчета"
                            value={formData.conversionFactor}
                            onChangeText={(text) => setFormData(prev => ({...prev, conversionFactor: text}))}
                            keyboardType="numeric"
                            style={styles.input}
                            mode="outlined"
                            dense
                        />
                        <HelperText type="info">
                            1 {formData.incomingUnit || '...'} = {formData.conversionFactor || '?'} {formData.usageUnit || '...'}
                        </HelperText>

                    </Surface>
                    <Surface style={styles.card}>
                        <Text style={[styles.cardTitle, {color: colors.onSurface}]}>
                            Запасы и расход
                        </Text>
                        <View style={styles.row}>
                            <View style={styles.flex1}>
                                <TextInput
                                    label="Текущий запас"
                                    value={formData.stock}
                                    onChangeText={(text) => setFormData(prev => ({...prev, stock: text}))}
                                    keyboardType="numeric"
                                    style={styles.input}
                                    mode="outlined"
                                    dense
                                    right={<TextInput.Affix text={formData.incomingUnit}/>}
                                />
                                <HelperText type="info">Остаток на складе</HelperText>
                            </View>
                            <View style={styles.flex1}>
                                <TextInput
                                    label="Расход в месяц"
                                    value={formData.usage}
                                    onChangeText={(text) => setFormData(prev => ({...prev, usage: text}))}
                                    keyboardType="numeric"
                                    style={styles.input}
                                    mode="outlined"
                                    dense
                                    right={<TextInput.Affix text={formData.usageUnit}/>}
                                />
                                <HelperText type="info">Среднемесячный расход</HelperText>
                            </View>
                        </View>
                        <TextInput
                            label="Минимальный запас"
                            value={formData.minStock}
                            onChangeText={(text) => setFormData(prev => ({...prev, minStock: text}))}
                            keyboardType="numeric"
                            style={styles.input}
                            mode="outlined"
                            dense
                            right={<TextInput.Affix text={formData.incomingUnit}/>}
                        />
                        <HelperText type="info">Порог для уведомления о низком запасе</HelperText>

                    </Surface>
                </Animated.View>
            </ScrollView>

            <View style={[styles.footer, {borderTopColor: colors.outline}]}>
                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.submitButton}
                    loading={loading}
                    disabled={loading || !formData.name || !formData.price || !formData.incomingUnit || !formData.usageUnit}
                >
                    {item ? 'Сохранить' : 'Добавить'}
                </Button>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 8,
    },
    backButton: {
        margin: 0,
        padding: 0,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    footer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    footerButton: {
        width: '100%',
    },
    card: {
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        elevation: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },

    scrollContent: {
        flexGrow: 1,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        marginBottom: 12,
        color: '#666',
    },
    input: {
        marginBottom: 8,
        backgroundColor: 'transparent',
    },
    namePrice: {
        flexDirection: 'row',
        gap: 8,
    },
    nameInput: {
        flex: 2,
    },
    priceInput: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        gap: 8,
    },
    flex1: {
        flex: 1,
    },
    divider: {
        marginVertical: 16,
    },
    buttonContainer: {
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    submitButton: {
        minWidth: 120,
    },
})

