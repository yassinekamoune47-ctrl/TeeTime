import { create } from 'zustand'
import type { ThemeState } from '@/types/theme.types';

export const useThemeStore = create<ThemeState>((set) => ({
    theme: 'light',
    toggleTheme: () =>
        set((state) => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
            return { theme: newTheme };
        }),
}))