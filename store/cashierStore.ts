import { create } from 'zustand';
import {doc, collection, addDoc, getDocs, query, where, updateDoc, Timestamp, getDoc} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Transaction {
    id: string;
    type: 'deposit' | 'withdraw' | 'shift_open' | 'shift_close';
    amount: number;
    description: string;
    userId: string;
    createdAt: Date;
    paymentType: 'cash' | 'nonCash';
}

export interface ShiftReport {
    id: string;
    startTime: Date;
    endTime: Date | null;
    cashStartAmount: number;
    nonCashStartAmount: number;
    cashEndAmount: number;
    nonCashEndAmount: number;
    expectedCashAmount: number;
    expectedNonCashAmount: number;
    userId: string;
    userName: string;
    transactions: Transaction[];
}

interface CashierState {
    cashBalance: number;
    nonCashBalance: number;
    isShiftOpen: boolean;
    currentShiftId: string | null;
    shiftStartTime: string | null;
    transactions: Transaction[];
    userId: string | null;
    userName: string | null;
    loading: boolean;
    startSession: (userId: string, userName: string, cashAmount: number, nonCashAmount: number) => Promise<void>;
    endSession: (shiftId: string, cashAmount: number, nonCashAmount: number) => Promise<void>;
    addTransaction: (shiftId: string, transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
    getActiveSession: () => Promise<void>;
    getReport: (shiftId: string) => Promise<ShiftReport>;
    setLoading: (loading: boolean) => void;
    submitActualAmounts: (shiftId: string, cashAmount: number, nonCashAmount: number) => Promise<void>;
}

export const useCashierStore = create<CashierState>((set, get) => ({
    cashBalance: 0,
    nonCashBalance: 0,
    isShiftOpen: false,
    currentShiftId: null,
    shiftStartTime: null,
    transactions: [],
    userId: null,
    userName: null,
    loading: false,

    setLoading: (loading) => set({ loading }),

    startSession: async (userId, userName, cashAmount, nonCashAmount) => {
        try {
            const sessionRef = await addDoc(collection(db, 'shifts'), {
                startTime: Timestamp.now(),
                cashStartAmount: cashAmount,
                nonCashStartAmount: nonCashAmount,
                userId,
                userName,
                endTime: null,
            });

            const shiftOpenTransaction: Omit<Transaction, 'id' | 'createdAt'> = {
                type: 'shift_open',
                amount: cashAmount + nonCashAmount,
                description: 'Открытие смены',
                userId,
                paymentType: 'cash',
            };

            await addDoc(collection(db, 'transactions'), {
                ...shiftOpenTransaction,
                shiftId: sessionRef.id,
                createdAt: Timestamp.now(),
            });

            set({
                isShiftOpen: true,
                currentShiftId: sessionRef.id,
                shiftStartTime: new Date().toISOString(),
                cashBalance: cashAmount,
                nonCashBalance: nonCashAmount,
                userId,
                userName,
                transactions: [{
                    ...shiftOpenTransaction,
                    id: sessionRef.id,
                    createdAt: new Date(),
                }],
            });
        } catch (error) {
            console.error('Failed to start session:', error);
            throw error;
        }
    },

    endSession: async (shiftId, cashAmount, nonCashAmount) => {
        try {
            const endTime = Timestamp.now();
            await updateDoc(doc(db, 'shifts', shiftId), {
                endTime,
                cashEndAmount: cashAmount,
                nonCashEndAmount: nonCashAmount,
            });

            const state = get();
            const shiftCloseTransaction: Omit<Transaction, 'id' | 'createdAt'> = {
                type: 'shift_close',
                amount: cashAmount + nonCashAmount,
                description: 'Закрытие смены',
                userId: state.userId!,
                paymentType: 'cash',
            };

            await addDoc(collection(db, 'transactions'), {
                ...shiftCloseTransaction,
                shiftId,
                createdAt: endTime,
            });

            set({
                isShiftOpen: false,
                currentShiftId: null,
                shiftStartTime: null,
                cashBalance: 0,
                nonCashBalance: 0,
                transactions: [],
                userId: null,
                userName: null,
            });
        } catch (error) {
            console.error('Failed to end session:', error);
            throw error;
        }
    },

    addTransaction: async (shiftId, transaction) => {
        try {
            const docRef = await addDoc(collection(db, 'transactions'), {
                ...transaction,
                shiftId,
                createdAt: Timestamp.now(),
            });

            const newTransaction: Transaction = {
                id: docRef.id,
                ...transaction,
                createdAt: new Date(),
            };

            set((state) => ({
                transactions: [...state.transactions, newTransaction],
                cashBalance: transaction.paymentType === 'cash' ? state.cashBalance + transaction.amount : state.cashBalance,
                nonCashBalance: transaction.paymentType === 'nonCash' ? state.nonCashBalance + transaction.amount : state.nonCashBalance,
            }));
        } catch (error) {
            console.error('Failed to add transaction:', error);
            throw error;
        }
    },

    getActiveSession: async () => {
        try {
            set({ loading: true });
            const shiftsQuery = query(
                collection(db, 'shifts'),
                where('endTime', '==', null)
            );

            const snapshot = await getDocs(shiftsQuery);
            if (!snapshot.empty) {
                const shiftDoc = snapshot.docs[0];
                const shiftData = shiftDoc.data();

                // Fetch transactions for the active shift
                const transactionsQuery = query(
                    collection(db, 'transactions'),
                    where('shiftId', '==', shiftDoc.id)
                );
                const transactionsSnapshot = await getDocs(transactionsQuery);
                const transactions = transactionsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt.toDate(),
                } as Transaction));

                set({
                    isShiftOpen: true,
                    currentShiftId: shiftDoc.id,
                    shiftStartTime: shiftData.startTime.toDate().toISOString(),
                    cashBalance: transactions.reduce((total, transaction) => total + transaction.amount, 0),
                    nonCashBalance: shiftData.nonCashStartAmount,
                    userId: shiftData.userId,
                    userName: shiftData.userName,
                    transactions,
                });
            }
        } catch (error) {
            console.error('Failed to get active session:', error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    getReport: async (shiftId: string) => {
        try {
            const shiftDoc = await getDoc(doc(db, 'shifts', shiftId));
            if (!shiftDoc.exists()) {
                throw new Error('Shift not found');
            }

            const shiftData = shiftDoc.data();

            const transactionsQuery = query(
                collection(db, 'transactions'),
                where('shiftId', '==', shiftId)
            );
            const transactionsSnapshot = await getDocs(transactionsQuery);
            const transactions = transactionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
            } as Transaction));

            const { cashStartAmount, nonCashStartAmount } = shiftData;
            const { cashEndAmount, nonCashEndAmount } = transactions.filter(
                (transaction) => transaction.type !== 'shift_close' && (transaction.type !== 'shift_open')
            ).reduce(
                (acc, transaction) => {
                    if (transaction.paymentType === 'cash') {
                        acc.cashEndAmount += transaction.amount;
                    } else if (transaction.paymentType === 'nonCash') {
                        acc.nonCashEndAmount += transaction.amount;
                    }
                    return acc;
                },
                { cashEndAmount: 0, nonCashEndAmount: 0 }
            );

            return {
                id: shiftId,
                startTime: shiftData.startTime.toDate(),
                endTime: shiftData.endTime?.toDate() || null,
                cashStartAmount,
                nonCashStartAmount,
                cashEndAmount,
                nonCashEndAmount,
                expectedCashAmount: cashEndAmount,
                expectedNonCashAmount: nonCashEndAmount,
                userId: shiftData.userId,
                userName: shiftData.userName,
                transactions,
            };
        } catch (error) {
            console.error('Failed to get report:', error);
            throw error;
        }
    },

    submitActualAmounts: async (shiftId: string, cashAmount: number, nonCashAmount: number) => {
        try {
            await updateDoc(doc(db, 'shifts', shiftId), {
                actualCashAmount: cashAmount,
                actualNonCashAmount: nonCashAmount,
            });
        } catch (error) {
            console.error('Failed to submit actual amounts:', error);
            throw error;
        }
    },
}));

