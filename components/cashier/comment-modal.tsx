import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Modal, Portal, Text, Button } from 'react-native-paper';

interface Props {
    visible: boolean;
    onDismiss: () => void;
    comment: string;
}

export default function CommentModal({ visible, onDismiss, comment }: Props) {
    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>Комментарий</Text>
                    <ScrollView style={styles.scrollView}>
                        <Text style={styles.comment}>{comment}</Text>
                    </ScrollView>
                    <Button mode="contained" onPress={onDismiss} style={styles.button}>
                        Закрыть
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 10,
        maxHeight: '80%',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    scrollView: {
        marginBottom: 20,
    },
    comment: {
        fontSize: 16,
    },
    button: {
        marginTop: 10,
    },
});

