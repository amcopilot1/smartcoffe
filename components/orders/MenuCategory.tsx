import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MotiView } from 'moti';

interface MenuCategoryProps {
    title: string;
    children: React.ReactNode;
}

export function MenuCategory({ title, children }: MenuCategoryProps) {
    const theme = useTheme();

    return (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
            style={styles.container}
        >
            <Text style={[styles.title, { color: theme.colors.secondary }]}>{title}</Text>
            <View style={styles.content}>
                {children}
            </View>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 12,
        opacity: 0.9,
    },
    content: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
});

