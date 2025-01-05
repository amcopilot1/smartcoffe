import {useEffect} from 'react';
import {router} from 'expo-router';
import {useAuthStore} from '@/store/authStore';
import {useCashierStore} from "@/store/cashierStore";

export function ProtectedRoute() {
    const { user, isLoading } = useAuthStore();
    const { isShiftOpen } = useCashierStore();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.replace('/login');
            } else if (user.role === 'barista') {
                if (!isShiftOpen) {
                    router.replace('/cashier');
                } else {
                    router.replace('/orders');
                }
            } else if (user.role === 'admin') {
                router.replace('/reports');
            }
        }
    }, [user, isLoading, isShiftOpen]);

    return null;
}

