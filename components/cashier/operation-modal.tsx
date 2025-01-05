import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Portal, TextInput, Button, Text, Surface } from 'react-native-paper';
import { ArrowUpCircle, ArrowDownCircle, BanknoteIcon } from 'lucide-react';

interface Props {
    visible: boolean;
    onDismiss: () => void;
    onSubmit: (amount: number, comment: string) => void;
    type: 'deposit' | 'withdraw' | 'shift-open';
}

export default function OperationModal({ visible, onDismiss, onSubmit, type }: Props) {
    const [amount, setAmount] = useState('');
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return;
        onSubmit(numAmount, comment);
        setAmount('');
        setComment('');
        onDismiss();
    };

    const getIcon = () => {
        switch (type) {
            case 'deposit':
                return <ArrowUpCircle size={24} color="#4CAF50" />;
            case 'withdraw':
                return <ArrowDownCircle size={24} color="#F44336" />;
            case 'shift-open':
                return <BanknoteIcon size={24} color="#2196F3" />;
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'deposit':
                return 'Внесение наличных';
            case 'withdraw':
                return 'Изъятие наличных';
            case 'shift-open':
                return 'Открытие смены';
        }
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={styles.container}
            >
                <Surface style={styles.content}>
                    <View style={styles.header}>
                        {getIcon()}
                        <Text style={styles.title}>{getTitle()}</Text>
                    </View>

                    <TextInput
                        label="Сумма"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        style={styles.input}
                        mode="outlined"
                        right={<TextInput.Affix text="₽" />}
                    />

                    {type !== 'shift-open' && (
                        <TextInput
                            label="Комментарий"
                            value={comment}
                            onChangeText={setComment}
                            style={styles.input}
                            mode="outlined"
                            multiline
                            numberOfLines={2}
                        />
                    )}

                    <View style={styles.actions}>
                        <Button
                            mode="outlined"
                            onPress={onDismiss}
                            style={styles.button}
                            contentStyle={styles.buttonContent}
                        >
                            Отмена
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleSubmit}
                            style={[styles.button, styles.submitButton]}
                            contentStyle={styles.buttonContent}
                            disabled={!amount || parseFloat(amount) <= 0}
                        >
                            Подтвердить
                        </Button>
                    </View>
                </Surface>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: 16,
    },
    content: {
        padding: 24,
        borderRadius: 16,
        maxWidth: 400,
        width: '100%',
        alignSelf: 'center',
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'transparent',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
        borderRadius: 8,
    },
    buttonContent: {
        height: 44,
    },
    submitButton: {
        flex: 1.5,
    },
});

