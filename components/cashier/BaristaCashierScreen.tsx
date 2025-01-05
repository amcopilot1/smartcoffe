import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Avatar, Button, Card, Text, useTheme} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';
import {useAuthStore} from '@/store/authStore';
import {ShiftReport, useCashierStore} from '@/store/cashierStore';
import {useToastStore} from '@/store/toastStore';
import TransactionHistory from '@/components/cashier/transaction-history';
import OperationModal from '@/components/cashier/operation-modal';
import BaristaReportModal from '@/components/cashier/barista-report-modal';
import {Toast} from '@/components/ui/toast';
import {ArrowDownCircle, ArrowUpCircle, Clock, CreditCard, TrendingUp, User, Wallet} from 'lucide-react';

export default function BaristaCashierScreen() {
    const theme = useTheme();
    const {user} = useAuthStore();
    const {
        nonCashBalance,
        cashBalance,
        isShiftOpen,
        currentShiftId,
        shiftStartTime,
        transactions,
        loading,
        startSession,
        endSession,
        addTransaction,
        getActiveSession,
        getReport,
    } = useCashierStore();
    const showToast = useToastStore((state) => state.showToast);

    const [modalType, setModalType] = useState<'deposit' | 'withdraw' | 'shift-open' | null>(null);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [currentReport, setCurrentReport] = useState<ShiftReport | null>(null);

    useEffect(() => {
        getActiveSession().catch((error) => {
            console.error('Failed to fetch cashier data:', error);
            showToast('Failed to fetch cashier data', 'error');
        });
    }, []);

    const handleOperation = async (amount: number, comment: string) => {
        try {
            if (!currentShiftId) throw new Error('No active shift');

            await addTransaction(
                currentShiftId,
                {
                    type: modalType === 'deposit' ? 'deposit' : 'withdraw',
                    amount: modalType === 'withdraw' ? -amount : amount,
                    description: comment,
                    userId: user!.uid,
                    paymentType: 'cash'
                },
            );

            showToast('Operation completed successfully', 'success');
        } catch (error) {
            console.error('Operation failed:', error);
            showToast('Operation failed', 'error');
        }
    };

    const handleShiftOpen = async (cashAmount: number, nonCashAmount: number) => {
        try {
            await startSession(user!.uid, user!.email!, cashAmount, nonCashAmount);
            showToast('Shift opened successfully', 'success');
        } catch (error) {
            console.error('Failed to open shift:', error);
            showToast('Failed to open shift', 'error');
        }
    };

    const handleShiftClose = async () => {
        try {
            if (!currentShiftId) throw new Error('No active shift');
            const report = await getReport(currentShiftId);
            setCurrentReport(report);
            setReportModalVisible(true);
        } catch (error) {
            console.error('Failed to close shift:', error);
            showToast('Failed to close shift', 'error');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary}/>
            </View>
        );
    }


    const initialCashBalance = transactions.find((transaction) => transaction.type === 'shift_open')?.amount || 0;
    const cashShiftBalance = cashBalance - initialCashBalance;
    const nonCashShiftBalance = nonCashBalance;
    const totalShiftBalance = cashShiftBalance + nonCashShiftBalance;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content}>
                <View style={styles.header}>
                    {isShiftOpen && shiftStartTime && (
                        <View style={styles.shiftInfo}>
                            <Clock size={16} color={theme.colors.primary} />
                            <Text style={styles.shiftInfoText}>
                                Смена открыта: {format(new Date(shiftStartTime), 'HH:mm', { locale: ru })}
                            </Text>
                            <User size={16} color={theme.colors.primary} />
                            <Text style={styles.shiftInfoText}>
                                Ответственный: {user?.email}
                            </Text>
                        </View>
                    )}
                </View>


                <View style={styles.cardsContainer}>
                    <Card style={[styles.balanceCard, styles.totalBalanceCard]}>
                        <Card.Content>
                            <View style={styles.cardHeader}>
                                <TrendingUp size={20} color={theme.colors.primary}/>
                                <Text style={styles.cardLabel}>Баланс за смену</Text>
                            </View>
                            <Text style={styles.totalBalanceAmount}>
                                {totalShiftBalance.toLocaleString()} ₽
                            </Text>
                        </Card.Content>
                    </Card>

                    <View style={styles.balanceRow}>
                        <Card style={[styles.balanceCard, styles.halfCard]}>
                            <Card.Content>
                                <View
                                    style={{justifyContent: 'space-between', flexDirection: 'row'}}
                                >
                                    <View style={styles.cardHeader}>
                                        <Wallet size={20} color={theme.colors.primary}/>
                                        <Text style={styles.cardLabel}>Наличные</Text>
                                    </View>
                                    <Text style={styles.balanceInitial}>
                                        В кассе: {cashBalance.toLocaleString()} ₽
                                    </Text>
                                </View>
                                <Text style={styles.balanceAmount}>
                                    {cashShiftBalance.toLocaleString()} ₽
                                </Text>

                            </Card.Content>
                        </Card>

                        <Card style={[styles.balanceCard, styles.halfCard]}>
                            <Card.Content>
                                <View style={styles.cardHeader}>
                                    <CreditCard size={20} color={theme.colors.primary}/>
                                    <Text style={styles.cardLabel}>Безналичные</Text>
                                </View>
                                <Text style={styles.balanceAmount}>
                                    {nonCashShiftBalance.toLocaleString()} ₽
                                </Text>
                            </Card.Content>
                        </Card>
                    </View>
                </View>

                {isShiftOpen ? (
                    <View style={styles.actions}>
                        <Button
                            mode="outlined"
                            icon={() =>
                                <ArrowUpCircle
                                    size={20}
                                    color={theme.colors.primary}
                                />
                        }
                            onPress={() => setModalType('deposit')}
                            style={[styles.actionButton, {borderColor: theme.colors.primary}]}
                            contentStyle={styles.actionButtonContent}
                            textColor={theme.colors.primary}
                        >
                            Внести
                        </Button>
                        <Button
                            mode="outlined"
                            icon={() =>
                                <ArrowDownCircle
                                    size={20}
                                    color={theme.colors.error}
                                />
                        }
                            onPress={() => setModalType('withdraw')}
                            style={[styles.actionButton, {borderColor: theme.colors.error}]}
                            contentStyle={styles.actionButtonContent}
                            textColor={theme.colors.error}
                        >
                            Изъять
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleShiftClose}
                            style={[styles.actionButton, styles.reportButton]}
                            contentStyle={styles.actionButtonContent}

                        >
                            Закрыть смену
                        </Button>
                    </View>
                ) : (
                    <Button
                        mode="contained"
                        onPress={() => setModalType('shift-open')}
                        style={styles.openShiftButton}
                        contentStyle={styles.actionButtonContent}
                    >
                        Открыть смену
                    </Button>
                )}

                <TransactionHistory
                    transactions={transactions}
                    isAdmin={false}
                />
            </ScrollView>

            <OperationModal
                visible={!!modalType}
                onDismiss={() => setModalType(null)}
                onSubmit={(amount, comment) =>
                    modalType === 'shift-open'
                        ? handleShiftOpen(amount, 0)
                        : handleOperation(amount, comment)
                }
                type={modalType || 'deposit'}
            />

            <BaristaReportModal
                visible={reportModalVisible}
                onDismiss={() => setReportModalVisible(false)}
                report={currentReport}
                onCloseShift={endSession}
            />

            <Toast/>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    header: {
        padding: 16,
        paddingBottom: 8,
    },
    shiftInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
    },
    shiftInfoText: {
        fontSize: 12,
        marginLeft: 4,
        marginRight: 12,
    },
    userCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
    },
    userCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    userCardTitle: {
        fontSize: 14,
        opacity: 0.7,
    },
    userCardSubtitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    cardsContainer: {
        padding: 16,
        paddingTop: 8,
        gap: 16,
    },
    balanceRow: {
        flexDirection: 'row',
        gap: 16,
    },
    balanceCard: {
        borderRadius: 16,
        elevation: 2,
    },
    totalBalanceCard: {
        marginBottom: 0,
    },
    halfCard: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    cardLabel: {
        fontSize: 14,
        opacity: 0.7,
    },
    totalBalanceAmount: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    totalBalanceInitial: {
        fontSize: 14,
        opacity: 0.7,
        marginTop: 4,
    },
    balanceAmount: {
        fontSize: 24,
        fontWeight: '600',
    },
    balanceInitial: {
        fontSize: 12,
        opacity: 0.7,
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        padding: 16,
    },
    actionButton: {
        flex: 1,
        borderRadius: 12,
    },
    actionButtonContent: {
        height: 48,
    },
    reportButton: {
        flex: 1.2,
    },
    openShiftButton: {
        margin: 16,
        borderRadius: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

