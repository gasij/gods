require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== Настройка Telegram бота =====
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

// ===== Middleware =====
app.use(cors()); // Разрешаем запросы с фронтенда
app.use(bodyParser.json()); // Чтение JSON-данных

// ===== Обработка POST-запроса с формы =====
app.post('/api/send-to-telegram', async (req, res) => {
    try {
        const { name, phone, message = 'Не указано' } = req.body;

        // Валидация данных
        if (!name || !phone) {
            return res.status(400).json({ 
                success: false,
                error: 'Имя и телефон обязательны!' 
            });
        }

        // Отправка сообщения в Telegram
        const telegramMessage = `
            📌 Новая заявка!
            ├ Имя: ${name}
            ├ Телефон: ${phone}
            └ Сообщение: ${message}
        `;

        await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, telegramMessage);

        // Успешный ответ
        res.json({ 
            success: true,
            message: '✅ Заявка отправлена!' 
        });

    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ 
            success: false,
            error: 'Ошибка сервера. Попробуйте позже.' 
        });
    }
});

// ===== Запуск сервера =====
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});