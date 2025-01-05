import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#2131df',
        accent: '#03dac4',
        background: '#ffffff',
        surface: '#ececf1',
        text: '#1f1f20',
    },
};

export const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#8690fc',
        accent: '#03dac4',
        background: '#121212',
        surface: '#333333',
        text: '#efeef3',
    },
};

