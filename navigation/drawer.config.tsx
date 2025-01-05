import { Ionicons } from "@expo/vector-icons";

export const getDrawerIcon = (routeName: string) => {
    const iconMap: { [key: string]: string } = {
        orders: 'receipt',
        ingredients: 'cube',
        reports: 'analytics',
        cashManagementScreen: 'wallet',
        discounts: 'pricetag',
        settings: 'settings',
        cashier: 'cash',
        inventory: 'list',
        dishes: 'restaurant',
        users: 'people',
    } ;

    return ({ color, size }: { color: string; size: number }) => (
        <Ionicons name={iconMap[routeName] || 'alert-circle'} size={size} color={color} />
    );
};


export const drawerScreens = [
    { key: 'orders', label: 'Заказы'},
    { key: 'cashier', label: 'Касса'},
    { key: 'inventory', label: 'Инвентаризация'},
    { key: 'ingredients', label: 'Ингредиенты'},
    { key: 'reports', label: 'Отчеты'},
    { key: 'discounts', label: 'Акции'},
    { key: 'dishes', label: 'Блюда'},
    { key: 'cooperators', label: 'Сотрудники'},
    { key: 'settings', label: 'Настройки'},
];