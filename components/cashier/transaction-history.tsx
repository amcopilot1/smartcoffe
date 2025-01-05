import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, IconButton, List, Text, useTheme} from 'react-native-paper';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';
import {ArrowDownCircle, ArrowUpCircle, Clock, DollarSign} from 'lucide-react';
import CommentModal from './comment-modal';

interface Transaction {
    id: string;
    type: 'deposit' | 'withdraw' | 'shift_open' | 'shift_close';
    amount: number;
    description: string;
    createdAt: Date;
}

interface Props {
    transactions: Transaction[];
    isAdmin: boolean;
}

export default function TransactionHistory({transactions, isAdmin}: Props) {
    const theme = useTheme();
    const [selectedComment, setSelectedComment] = useState<string | null>(null);

    const getIcon = (type: Transaction['type']) => {
        switch (type) {
            case 'deposit':
                return <ArrowUpCircle size={24} color={theme.colors.primary}/>;
            case 'withdraw':
                return <ArrowDownCircle size={24} color={theme.colors.error}/>;
            case 'shift_open':
                return <Clock size={24} color={theme.colors.secondary}/>;
            case 'shift_close':
                return <Clock size={24} color={theme.colors.secondary}/>;
            default:
                return <DollarSign size={24} color={theme.colors.primary}/>;
        }
    };

    const getAmountColor = (type: Transaction['type']) => {
        switch (type) {
            case 'deposit':
                return theme.colors.primary;
            case 'withdraw':
                return theme.colors.error;
            default:
                return theme.colors.text;
        }
    };

    const truncateComment = (comment: string, maxLength: number = 50) => {
        if (comment.length <= maxLength) return comment;
        return comment.substring(0, maxLength) + '...';
    };

    return (
        <View
            style={{
                flex: 1,
                marginHorizontal: 16,
                marginTop: 16,
            }}
        >
            <Text style={styles.title}>История операций</Text>
            {transactions.length === 0 ? (
                <Text style={styles.emptyText}>Нет операций</Text>
            ) : (
                <Card style={styles.card}>
                    <Card.Content>
                        {
                            transactions.sort(
                                (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
                            ).map((transaction) => (
                                    <List.Item
                                        key={transaction.id}
                                        title={transaction.type === 'shift_open' ? 'Открытие смены' :
                                            transaction.type === 'shift_close' ? 'Закрытие смены' :
                                                transaction.description ? truncateComment(transaction.description) :
                                                    transaction.type === 'deposit' ? 'Внесение наличных' : 'Изъятие наличных'
                                        }
                                        description={format(transaction.createdAt, 'dd MMMM, HH:mm', {locale: ru})}
                                        left={() => getIcon(transaction.type)}
                                        right={() => (
                                            <View style={styles.rightContent}>
                                                <Text
                                                    style={[
                                                        styles.amount,
                                                        {color: getAmountColor(transaction.type)},
                                                    ]}
                                                >
                                                    {transaction.type !== 'withdraw' ? '+' : '-'}{Math.abs(transaction.amount)} ₽
                                                </Text>
                                                {transaction.description.length > 50 && (
                                                    <IconButton
                                                        icon="information-outline"
                                                        size={20}
                                                        onPress={() => setSelectedComment(transaction.description)}
                                                    />
                                                )}
                                            </View>
                                        )}
                                    />
                                )
                            )}
                    </Card.Content>
                    <CommentModal
                        visible={!!selectedComment}
                        onDismiss={() => setSelectedComment(null)}
                        comment={selectedComment || ''}
                    />
                </Card>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 16,
        paddingBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    emptyText: {
        textAlign: 'center',
        opacity: 0.7,
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
