
export const menuItems: MenuItem[] = [
    { id: '1', name: 'Эспрессо', price: 150, quantity:0, category: 'Кофе', customizable: true, popularity: 8, image: 'https://example.com/espresso.jpg' },
    { id: '2', name: 'Капучино', price: 200, quantity:0, category: 'Кофе', customizable: true, popularity: 10, image: 'https://example.com/cappuccino.jpg' },
    { id: '3', name: 'Латте', price: 180, quantity:0, category: 'Кофе', customizable: true, popularity: 9, image: 'https://example.com/latte.jpg' },
    { id: '4', name: 'Зелёный чай', price: 120, quantity:0, category: 'Чай', customizable: true, popularity: 6, image: 'https://example.com/green-tea.jpg' },
    { id: '5', name: 'Чёрный чай', price: 120, quantity:0, category: 'Чай', customizable: true, popularity: 7, image: 'https://example.com/black-tea.jpg' },
    { id: '6', name: 'Фруктовый чай', price: 150, quantity:0, category: 'Чай', customizable: true, popularity: 5, image: 'https://example.com/fruit-tea.jpg' },
    { id: '7', name: 'Чизкейк', price: 250, quantity:0, category: 'Десерты', customizable: false, popularity: 8, image: 'https://example.com/cheesecake.jpg' },
    { id: '8', name: 'Тирамису', price: 270, quantity:0, category: 'Десерты', customizable: false, popularity: 7, image: 'https://example.com/tiramisu.jpg' },
    { id: '9', name: 'Круассан', price: 160, quantity:0, category: 'Десерты', customizable: false, popularity: 6, image: 'https://example.com/croissant.jpg' },
    { id: '10', name: 'Сэндвич с курицей', price: 180, quantity:0, category: 'Закуски', customizable: false, popularity: 7, image: 'https://example.com/chicken-sandwich.jpg' },
    { id: '11', name: 'Салат Цезарь', price: 220, quantity:0, category: 'Закуски', customizable: false, popularity: 6, image: 'https://example.com/caesar-salad.jpg' },
    { id: '12', name: 'Киш с грибами', price: 200, quantity:0, category: 'Закуски', customizable: false, popularity: 5, image: 'https://example.com/mushroom-quiche.jpg' },
];

export const addons: Addon[] = [
    { id: '1', name: 'Ванильный сироп', price: 30, type: 'syrup' },
    { id: '2', name: 'Карамельный сироп', price: 30, type: 'syrup' },
    { id: '3', name: 'Ореховый сироп', price: 30, type: 'syrup' },
    { id: '4', name: 'Овсяное молоко', price: 50, type: 'milk' },
    { id: '5', name: 'Миндальное молоко', price: 50, type: 'milk' },
    { id: '6', name: 'Соевое молоко', price: 50, type: 'milk' },
    { id: '7', name: 'Дополнительный шот', price: 50, type: 'extra_shot' },
];

export const discounts = [
    {
        id: 1,
        name: 'Скидка 10%',
        type: 'percentage', // Тип скидки: процентная
        amount: 10, // Процент скидки
    },
    {
        id: 2,
        name: 'Скидка 50 ₽',
        type: 'fixed', // Тип скидки: фиксированная сумма
        amount: 50, // Размер фиксированной скидки
    },
    {
        id: 3,
        name: 'Акция: 15% на кофе',
        type: 'percentage', // Процентная скидка на кофе
        amount: 15,
    },
];
