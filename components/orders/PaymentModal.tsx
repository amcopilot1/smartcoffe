import React from 'react';
import { View, StyleSheet } from 'react-native';
import {Modal, Portal, Text, Button, useTheme} from 'react-native-paper';

interface PaymentModalProps {
    visible: boolean;
    onDismiss: () => void;
    onPaymentComplete: (method: 'cash' | 'card') => void;
    total: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
                                                              visible,
                                                              onDismiss,
                                                              onPaymentComplete,
                                                              total,
                                                          }) => {
    const theme = useTheme();

    const styles = StyleSheet.create({
        container: {
            padding: 20,
            margin: 20,
            borderRadius: 8,
            backgroundColor: theme.colors.background,
            maxWidth: 400,
            alignSelf: 'center',
        },
        title: {
            marginBottom: 16,
            textAlign: 'center',
        },
        total: {
            marginBottom: 24,
            textAlign: 'center',
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        button: {
            flex: 1,
            marginHorizontal: 8,
        },
    });


    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
                <Text variant="headlineSmall" style={styles.title}>Выберите способ оплаты</Text>
                <Text variant="titleLarge" style={styles.total}>Итого: ₽{total}</Text>
                <View style={styles.buttonContainer}>
                    <Button mode="contained" onPress={() => onPaymentComplete('cash')} style={styles.button}>
                        Наличные
                    </Button>
                    <Button mode="contained" onPress={() => onPaymentComplete('card')} style={styles.button}>
                        Карта
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
};


