import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuthStore } from '@/store/authStore';
import BaristaCashierScreen from '@/components/cashier/BaristaCashierScreen';
import AdminCashierScreen from '@/components/cashier/AdminCashierScreen';

export default function CashierScreen() {
    const { user } = useAuthStore();

    if (!user) {
        return <View style={styles.container}><Text>Please log in to access the cashier system.</Text></View>;
    }

    return user.role === 'admin' ? <AdminCashierScreen /> : <BaristaCashierScreen />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

