import React, { useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useToastStore } from '@/store/toastStore';
import { Text } from '@/components/Themed';

export function Toast() {
    const { message, type, isVisible, hideToast } = useToastStore();
    const opacity = new Animated.Value(0);

    useEffect(() => {
        if (isVisible) {
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.delay(2400),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => hideToast());
        }
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                styles[type],
                { opacity },
            ]}
        >
            <Text style={styles.text}>{message}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        padding: 16,
        borderRadius: 8,
        elevation: 4,
        zIndex: 1000,
    },
    success: {
        backgroundColor: '#4CAF50',
    },
    error: {
        backgroundColor: '#F44336',
    },
    info: {
        backgroundColor: '#2196F3',
    },
    text: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
});

