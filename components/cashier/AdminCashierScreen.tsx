import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuthStore } from '@/store/authStore';
import { ShiftReport, useCashierStore } from '@/store/cashierStore';
import { useToastStore } from '@/store/toastStore';
import AdminReportModal from '@/components/cashier/admin-report-modal';
import { Toast } from '@/components/ui/toast';
import {collection, getDocs} from "firebase/firestore";
import {db} from "@/lib/firebase";

export default function AdminCashierScreen() {
    const theme = useTheme();
    const { user } = useAuthStore();
    const { loading, getReport } = useCashierStore();
    const showToast = useToastStore((state) => state.showToast);

    const [shifts, setShifts] = useState<ShiftReport[]>([]);
    const [selectedReport, setSelectedReport] = useState<ShiftReport | null>(null);
    const [reportModalVisible, setReportModalVisible] = useState(false);

    useEffect(() => {
        fetchShifts();
    }, []);

    const fetchShifts = async () => {
        try {
            const shiftsSnapshot = await getDocs(collection(db, 'shifts'));
            const shiftList = await Promise.all(shiftsSnapshot.docs.map(async (doc) => {
                const report = await getReport(doc.id);
                return report;
            }));
            setShifts(shiftList);
        } catch (error) {
            console.error('Failed to fetch shifts:', error);
            showToast('Failed to fetch shifts', 'error');
        }
    };

    const openReport = async (shiftId: string) => {
        try {
            const report = await getReport(shiftId);
            setSelectedReport(report);
            setReportModalVisible(true);
        } catch (error) {
            console.error('Failed to open report:', error);
            showToast('Failed to open report', 'error');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content}>
                <Text style={styles.title}>История смен</Text>
                {shifts.map((shift) => (
                    <Card key={shift.id} style={styles.shiftCard}>
                        <Card.Content>
                            <Text>Смена: {shift.id}</Text>
                            <Text>Начало: {format(shift.startTime, 'dd MMMM yyyy, HH:mm', { locale: ru })}</Text>
                            {shift.endTime && (
                                <Text>Конец: {format(shift.endTime, 'dd MMMM yyyy, HH:mm', { locale: ru })}</Text>
                            )}
                            <Text>Кассир: {shift.userName}</Text>
                            <Button
                                mode="contained"
                                onPress={() => openReport(shift.id)}
                                style={styles.viewReportButton}
                            >
                                Просмотреть отчет
                            </Button>
                        </Card.Content>
                    </Card>
                ))}
            </ScrollView>

            <AdminReportModal
                visible={reportModalVisible}
                onDismiss={() => setReportModalVisible(false)}
                report={selectedReport}
            />

            <Toast />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    shiftCard: {
        marginBottom: 16,
        borderRadius: 12,
    },
    viewReportButton: {
        marginTop: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

