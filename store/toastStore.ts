import {create} from 'zustand';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
    message: string | null;
    type: ToastType;
    isVisible: boolean;
    showToast: (message: string, type: ToastType) => void;
    hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
    message: null,
    type: 'info',
    isVisible: false,
    showToast: (message: string, type: ToastType) => {
        set({ message, type, isVisible: true });
        setTimeout(() => {
            set({ isVisible: false });
        }, 3000);
    },
    hideToast: () => set({ isVisible: false }),
}));

