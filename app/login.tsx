import React, {useState} from 'react';
import {View, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {Text, Button, TextInput} from 'react-native-paper';
import {useAuthStore} from '@/store/authStore';
import {router} from 'expo-router';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const {login} = useAuthStore();

    const handleLogin = async () => {
        try {
            await login(email, password);
        } catch (err) {
            setError('Неверный email или пароль');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Image
                    source={require('../assets/images/login-illustration.png')}
                    style={styles.illustration}
                />
                <Text style={styles.title}>Вход в систему</Text>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        mode="outlined"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Пароль"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        mode="outlined"
                    />
                    {error ? <Text style={styles.error}>{error}</Text> : null}
                    <Button onPress={handleLogin}
                            mode="contained" style={styles.button}>
                        <Text style={styles.buttonText}>Войти</Text>
                    </Button>
                </View>

                <TouchableOpacity onPress={() => router.push('/register')}>
                    <Text style={styles.link}>Нет аккаунта? Зарегистрироваться</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    illustration: {
        width: 200,
        height: 200,
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    form: {
        width: '100%',
        maxWidth: 400,
    },
    input: {
        marginBottom: 15,
    },
    button: {
        padding: 7,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    error: {
        color: 'red',
        marginBottom: 15,
    },
    link: {
        marginTop: 20,
    },
});

