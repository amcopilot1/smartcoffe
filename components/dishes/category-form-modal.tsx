import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, IconButton, Modal, Portal, Text, TextInput, useTheme, Divider } from 'react-native-paper';
import { Category } from "@/store/dishesStore";
import { ArrowLeft } from 'lucide-react';

interface CategoryFormModalProps {
    visible: boolean;
    onDismiss: () => void;
    initialData?: Category | null;
    onSubmit: (data: Omit<Category, 'id'>) => Promise<void>;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
                                                                        visible,
                                                                        onDismiss,
                                                                        initialData,
                                                                        onSubmit,
                                                                    }) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Omit<Category, 'id'>>({
        name: initialData?.name || '',
        order: initialData?.order || 0,
    });

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await onSubmit(formData);
            onDismiss();
        } catch (error) {
            console.error('Error submitting category:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[styles.modalContainer, {backgroundColor: theme.colors.background}]}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    {/* Header */}
                    <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
                        <View style={styles.headerContent}>
                            <IconButton
                                icon={() => <ArrowLeft size={24} color={theme.colors.text} />}
                                onPress={onDismiss}
                            />
                            <Text style={styles.title}>
                                {initialData ? 'Редактировать категорию' : 'Добавить категорию'}
                            </Text>
                        </View>
                        <Divider />
                    </View>

                    {/* Content */}
                    <ScrollView style={styles.content}>
                        <TextInput
                            label="Название категории"
                            value={formData.name}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                            style={styles.input}
                            mode="outlined"
                        />
                        <TextInput
                            label="Порядок сортировки"
                            value={formData.order.toString()}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, order: parseInt(text) || 0 }))}
                            keyboardType="numeric"
                            style={styles.input}
                            mode="outlined"
                        />
                    </ScrollView>

                    {/* Footer */}
                    <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
                        <Divider />
                        <View style={styles.footerContent}>
                            <Button onPress={onDismiss}>Отмена</Button>
                            <Button
                                mode="contained"
                                onPress={handleSubmit}
                                loading={loading}
                                disabled={loading || !formData.name}
                            >
                                {initialData ? 'Сохранить' : 'Добавить'}
                            </Button>
                        </View>
                    </View>
                </KeyboardAvoidingView>
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
});

