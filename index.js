const TelegramBot = require('node-telegram-bot-api');
const token = '7917935318:AAEO9XD9nuddOjmMeOlWEDAaYKM8fZiqJGA';
const bot = new TelegramBot(token, { polling: true });


const carsData = {
    'BMW': [
        { model: 'BMW X5', price: '$50,000', photo: 'https://example.com/bmw_x5.jpg' },
        { model: 'BMW X3', price: '$40,000', photo: 'https://example.com/bmw_x3.jpg' }
    ],
    'Audi': [
        { model: 'Audi A4', price: '$45,000', photo: 'https://example.com/audi_a4.jpg' },
        { model: 'Audi Q7', price: '$60,000', photo: 'https://example.com/audi_q7.jpg' }
    ],
    'Mercedes-Benz': [
        { model: 'Mercedes-Benz C-Class', price: '$55,000', photo: 'https://example.com/mercedes_c_class.jpg' },
        { model: 'Mercedes-Benz GLE', price: '$70,000', photo: 'https://example.com/mercedes_gle.jpg' }
    ]
};


// Главное меню
const mainMenu = {
    reply_markup: {
        keyboard: [['🚗 Автомобили'], ['📞 Контакты']],
        resize_keyboard: true
    }
};

// Меню выбора марки
const brandMenu = {
    reply_markup: {
        keyboard: [['BMW'], ['Audi'], ['Mercedes-Benz'], ['⬅️ Назад']],
        resize_keyboard: true
    }
};

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Добро пожаловать в наш магазин автомобилей! Выберите опцию:', mainMenu);
});

// Обработчик текстовых сообщений
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '🚗 Автомобили') {
        bot.sendMessage(chatId, 'Выберите марку автомобиля:', brandMenu);
    } else if (text === '📞 Контакты') {
        bot.sendMessage(chatId, 'Наши контакты:\nТелефон: +1234567890\nEmail: info@carstore.com');
    } else if (text === '⬅️ Назад') {
        bot.sendMessage(chatId, 'Главное меню:', mainMenu);
    } else if (carsData[text]) {
        // Если выбрана марка, показываем первую модель
        showCar(chatId, text, 0);
    }
});

// Функция для показа автомобиля
function showCar(chatId, brand, index) {
    const car = carsData[brand][index];
    const photo = car.photo;
    const caption = `${car.model}\nЦена: ${car.price}`;

    // Клавиатура для листания
    const carNavigation = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '⬅️', callback_data: `prev_${brand}_${index}` },
                    { text: '➡️', callback_data: `next_${brand}_${index}` }
                ],
                [{ text: '⬅️ Назад к маркам', callback_data: 'back_to_brands' }]
            ]
        }
    };

    // Отправляем фото и описание
    bot.sendPhoto(chatId, photo, { caption, ...carNavigation });
}

// Обработчик inline-кнопок
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data.startsWith('prev_') || data.startsWith('next_')) {
        // Обработка листания
        const [action, brand, index] = data.split('_');
        let newIndex = parseInt(index);

        if (action === 'prev' && newIndex > 0) {
            newIndex--;
        } else if (action === 'next' && newIndex < carsData[brand].length - 1) {
            newIndex++;
        }

        showCar(chatId, brand, newIndex);
    } else if (data === 'back_to_brands') {
        // Возврат к выбору марки
        bot.sendMessage(chatId, 'Выберите марку автомобиля:', brandMenu);
    }

    // Подтверждение обработки callback
    bot.answerCallbackQuery(query.id);
});