import {create} from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    notifications: boolean;
    darkMode: boolean;
    toggleNotifications: () => void;
    toggleDarkMode: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            notifications: true,
            darkMode: false,
            toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
            toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
        }),
        {
            name: 'settings-storage',
        }
    )
);

