import React, {useEffect, useState} from 'react';
import {Animated, ScrollView, StyleSheet, View} from 'react-native';
import {Button, IconButton, Modal, Portal, Surface, Text, TextInput, useTheme} from 'react-native-paper';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';
import {ShiftReport, useCashierStore} from '@/store/cashierStore';

interface Props {
    visible: boolean;
    onDismiss: () => void;
    report: ShiftReport | null;
    onCloseShift: (shiftId: string, cashAmount: number, nonCashAmount: number) => Promise<void>;
}

export default function BaristaReportModal({visible, onDismiss, report, onCloseShift}: Props) {
    const theme = useTheme();
    const {colors} = theme;
    const [step, setStep] = useState(1);
    const [actualCash, setActualCash] = useState('');
    const [actualNonCash, setActualNonCash] = useState('');
    const {submitActualAmounts} = useCashierStore();
    const [isNextDisabled, setIsNextDisabled] = useState(true);
    const [fadeAnim] = useState(new Animated.Value(0));
    const totalRevenue = parseFloat(actualCash) + parseFloat(actualNonCash);
    const baristaPercentage = totalRevenue * 0.1;

    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            fadeAnim.setValue(0);
        }
    }, [visible, fadeAnim]);

    useEffect(() => {
        const isCashValid = !isNaN(parseFloat(actualCash)) && parseFloat(actualCash) >= 0;
        const isNonCashValid = !isNaN(parseFloat(actualNonCash)) && parseFloat(actualNonCash) >= 0;
        setIsNextDisabled(!isCashValid || !isNonCashValid);
    }, [actualCash, actualNonCash]);

    if (!report) return null;

    const handleSubmit = async () => {
        if (step === 1) {
            await submitActualAmounts(report.id, parseFloat(actualCash), parseFloat(actualNonCash));
            setStep(2);
        } else {
            await onCloseShift(report.id, parseFloat(actualCash), parseFloat(actualNonCash));
            onDismiss();
        }
    };

    const renderStepper = () => (
        <View style={styles.stepperContainer}>
            <View
                style={[styles.step, step >= 1 ? {backgroundColor: colors.inversePrimary} : {}]}>
                <Text style={[styles.stepText, {color: step === 1 ? colors.text : colors.onSurfaceDisabled}]}>1</Text>
            </View>
            <View
                style={[styles.stepLine, step >= 2 ? {backgroundColor: colors.inversePrimary} : {backgroundColor: colors.onSurfaceDisabled}]}/>
            <View style={[styles.step, step >= 2 ? {backgroundColor: colors.inversePrimary} : {}]}>
                <Text style={[styles.stepText, {color: step >= 2 ? colors.text : colors.onSurfaceDisabled}]}>2</Text>
            </View>
        </View>
    );

    const renderStep1 = () => (
        <Animated.View style={{opacity: fadeAnim}}>
            <Surface style={styles.card}>
                <Text style={[styles.cardTitle, {color: colors.onSurface}]}>
                    Укажите выручку за смену
                </Text>
                <TextInput
                    label="Наличные"
                    value={actualCash}
                    onChangeText={setActualCash}
                    keyboardType="numeric"
                    style={styles.input}
                    mode="outlined"
                />
                <TextInput
                    label="Безналичные переводы"
                    value={actualNonCash}
                    onChangeText={setActualNonCash}
                    keyboardType="numeric"
                    style={styles.input}
                    mode="outlined"
                />
            </Surface>
        </Animated.View>
    );

    const renderStep2 = () => {
        const cashDifference = parseFloat(actualCash) - report.expectedCashAmount;
        const nonCashDifference = parseFloat(actualNonCash) - report.expectedNonCashAmount;
        const totalDifference = cashDifference + nonCashDifference;

        const differenceStyle = (difference: number) => ({
            color: difference >= 0 ? colors.primary : colors.error
        });

        return (
            <Animated.View style={{opacity: fadeAnim}}>
                <Surface style={styles.card}>
                    <Text style={[styles.cardTitle, {color: colors.onSurface}]}>
                        Информация о смене
                    </Text>
                    <View style={styles.row}>
                        <Text style={[styles.label, {color: colors.onSurface}]}>Начало смены</Text>
                        <Text style={[styles.value, {color: colors.onSurface}]}>
                            {format(report.startTime, 'dd MMMM, HH:mm', {locale: ru})}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={[styles.label, {color: colors.onSurface}]}>Конец смены</Text>
                        <Text style={[styles.value, {color: colors.onSurface}]}>
                            {format(new Date(), 'dd MMMM, HH:mm', {locale: ru})}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={[styles.label, {color: colors.onSurface}]}>10% от выручки</Text>
                        <Text style={[styles.value, {color: colors.onSurface}]}>
                            {baristaPercentage.toFixed(2)} ₽
                        </Text>
                    </View>
                </Surface>

                <Surface style={styles.card}>
                    <Text style={[styles.cardTitle, {color: colors.onSurface}]}>
                        Наличные
                    </Text>
                    <View style={styles.row}>
                        <Text style={[styles.label, {color: colors.onSurface}]}>Ожидаемая сумма</Text>
                        <Text style={[styles.value, {color: colors.onSurface}]}>
                            {report.expectedCashAmount.toFixed(2)} ₽
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={[styles.label, {color: colors.onSurface}]}>Фактическая сумма</Text>
                        <Text style={[styles.value, {color: colors.onSurface}]}>
                            {parseFloat(actualCash).toFixed(2)} ₽
                        </Text>
                    </View>
                    {cashDifference !== 0 && <View style={[styles.row, styles.differenceRow]}>
                        <Text style={[styles.label, {color: colors.onSurface}]}>Разница</Text>
                        <Text style={[styles.value, differenceStyle(cashDifference)]}>
                            {cashDifference >= 0 ? '+' : ''}{cashDifference.toFixed(2)} ₽
                        </Text>
                    </View>}
                </Surface>

                <Surface style={styles.card}>
                    <Text style={[styles.cardTitle, {color: colors.onSurface}]}>
                        Безналичные
                    </Text>
                    <View style={styles.row}>
                        <Text style={[styles.label, {color: colors.onSurface}]}>Ожидаемая сумма</Text>
                        <Text style={[styles.value, {color: colors.onSurface}]}>
                            {report.expectedNonCashAmount.toFixed(2)} ₽
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={[styles.label, {color: colors.onSurface}]}>Фактическая сумма</Text>
                        <Text style={[styles.value, {color: colors.onSurface}]}>
                            {parseFloat(actualNonCash).toFixed(2)} ₽
                        </Text>
                    </View>
                    {nonCashDifference !== 0 && <View style={[styles.row, styles.differenceRow]}>
                        <Text style={[styles.label, {color: colors.onSurface}]}>Разница</Text>
                        <Text style={[styles.value, differenceStyle(nonCashDifference)]}>
                            {nonCashDifference >= 0 ? '+' : ''}{nonCashDifference.toFixed(2)} ₽
                        </Text>
                    </View>}
                </Surface>

                <Surface style={[styles.card, styles.totalCard]}>
                    <View style={[styles.row, styles.totalRow]}>
                        <Text style={[styles.totalLabel, {color: colors.onSurface}]}>
                            Всего
                        </Text>
                        <Text style={[styles.totalValue]}>
                            {totalRevenue.toFixed(2)} ₽
                        </Text>
                    </View>
                    <View style={[styles.row, styles.totalRow]}>
                        <Text style={[styles.label, {color: colors.onSurface, opacity: .6}]}>В кассе</Text>
                        <Text style={[styles.value, {color: colors.onSurface, opacity: .6}]}>
                            {((
                                report.transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
                            ) - report.expectedCashAmount).toFixed(2)} ₽
                        </Text>
                    </View>
                </Surface>
            </Animated.View>
        );
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={() => {
                    setStep(1);
                    setActualCash('')
                    setActualNonCash('')
                    onDismiss();
                }}
                contentContainerStyle={[
                    styles.container,
                    {backgroundColor: colors.background}
                ]}
            >
                <View style={[styles.header, {borderBottomColor: colors.outline}]}>
                    <IconButton
                        icon="arrow-left"
                        size={24}
                        onPress={step === 1 ? onDismiss : () => setStep(1)}
                        style={styles.backButton}
                    />
                    <Text style={[styles.headerTitle, {color: colors.onSurface}]}>
                        {step === 1 ? 'Закрытие смены' : 'Отчет по смене'}
                    </Text>
                </View>

                {renderStepper()}

                <ScrollView style={styles.content}>
                    {step === 1 ? renderStep1() : renderStep2()}
                </ScrollView>

                <View style={[styles.footer, {borderTopColor: colors.outline}]}>
                    {step === 1 ? (
                        <Button
                            mode="contained"
                            onPress={handleSubmit}
                            disabled={isNextDisabled}
                            style={styles.footerButton}
                        >
                            Далее
                        </Button>
                    ) : (
                        <Button
                            mode="contained"
                            onPress={handleSubmit}
                            style={styles.footerButton}
                        >
                            Закрыть смену
                        </Button>
                    )}
                </View>
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
    },
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
    stepperContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    step: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    stepLine: {
        flex: 1,
        height: 2,
        marginHorizontal: 8,
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
    input: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    differenceRow: {
        marginTop: 8,
        paddingTop: 12,
    },
    label: {
        flex: 1,
        marginRight: 16,
    },
    value: {
        fontWeight: '500',
    },
    totalCard: {
        backgroundColor: 'transparent',
        elevation: 0,
        marginBottom: 0,
        paddingHorizontal: 0,
    },
    totalRow: {
        padding: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
