import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {Modal, Portal, Button, Text, Surface, IconButton, useTheme} from 'react-native-paper';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {ShiftReport} from "@/store/cashierStore";


interface Props {
    visible: boolean;
    onDismiss: () => void;
    onCloseShift: () => Promise<void>;
    report: ShiftReport | null;
}

export default function AdminReportModal({ visible, onDismiss, onCloseShift, report }: Props) {
    const {colors} = useTheme();
    if (!report) return null;

    const totals = report.transactions.reduce(
        (acc, transaction) => {
            if (transaction.paymentType === 'cash') {
                acc.cash += transaction.amount;
            } else if (transaction.paymentType === 'nonCash') {
                acc.nonCash += transaction.amount;
            }
            return acc;
        },
        { cash: 0, nonCash: 0 }
    );

    const totalEndAmount = totals.cash + totals.nonCash + report.cashStartAmount;
    const difference = totalEndAmount - report.cashStartAmount;


    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[styles.container, {
                    backgroundColor: colors.background
                }]}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <IconButton
                            icon="arrow-left"
                            size={24}
                            onPress={onDismiss}
                            style={styles.backButton}
                        />
                        <Text style={styles.title}>Отчет по смене</Text>
                    </View>
                    <Surface style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Информация о смене</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Сотрудник</Text>
                            <Text style={styles.value}>{report.userName}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Начало</Text>
                            <Text style={styles.value}>
                                {format(report.startTime, 'dd MMMM, HH:mm', { locale: ru })}
                            </Text>
                        </View>
                    </Surface>

                    <Surface style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Финансы</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Начальный баланс</Text>
                            <Text style={styles.value}>{report.cashStartAmount.toLocaleString()} ₽</Text>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.row}>
                            <Text style={styles.label}>Наличные</Text>
                            <Text style={styles.value}>{totals.cash.toLocaleString()} ₽</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Безналичные</Text>
                            <Text style={styles.value}>{totals.nonCash.toLocaleString()} ₽</Text>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.row}>
                            <Text style={styles.totalLabel}>Итого</Text>
                            <Text style={styles.totalValue}>{totalEndAmount.toLocaleString()} ₽</Text>
                        </View>
                        <View style={[styles.row, styles.differenceRow]}>
                            <Text style={styles.differenceLabel}>Разница</Text>
                            <Text style={[
                                styles.differenceValue,
                                difference >= 0 ? styles.positive : styles.negative
                            ]}>
                                {difference >= 0 ? '+' : ''}{difference.toLocaleString()} ₽
                            </Text>
                        </View>
                    </Surface>

                    <Button
                        mode="contained"
                        onPress={onCloseShift}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                        buttonColor={colors.secondary}
                    >
                        Закрыть смену
                    </Button>
                </ScrollView>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 'auto',
        borderRadius: 16,
        width: '100%',
        maxWidth: 420,
        maxHeight: '90%',
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 8,
    },
    backButton: {
        margin: 0,
        padding: 0,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        flex: 1,
        marginLeft: 8,
    },
    card: {
        borderRadius: 12,
        marginBottom: 16,
        elevation: 1,
    },
    cardHeader: {
        padding: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingVertical: 12,
    },
    label: {
        fontSize: 15,
        opacity: 0.6,
    },
    value: {
        fontSize: 15,
        fontWeight: '500',
    },
    separator: {
        height: 1,
        marginHorizontal: 16,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    differenceRow: {
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    differenceLabel: {
        fontSize: 14,
        opacity: 0.6,
    },
    differenceValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    positive: {
        color: '#34C759',
    },
    negative: {
        color: '#FF3B30',
    },
    button: {
        marginTop: 8,
        borderRadius: 8,
        marginBottom: 16,
    },
    buttonContent: {
        paddingVertical: 8,
    },
});

