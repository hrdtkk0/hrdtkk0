
import express from 'express';
import cors from 'cors';

const app = express();

// Railway автоматически передает переменную PORT. Если её нет (локально), используем 8080
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// 1. САМЫЙ ВАЖНЫЙ МАРШРУТ для Railway (Health Check)
// Если Railway увидит 'OK', он поймет, что сервер живой
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// Проверка здоровья
app.get('/health', (req, res) => {
  res.json({ status: 'up' });
});

app.post('/api/book', async (req, res) => {
  const { apartmentTitle, firstName, phone } = req.body;
  
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ success: false, error: 'Config missing' });
  }

  try {
    const text = `Новая бронь!\nОбъект: ${apartmentTitle}\nИмя: ${firstName}\nТел: ${phone}`;
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 2. ВАЖНО: Слушаем на 0.0.0.0. Это критично для Docker/Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
});

// Обработка мягкого завершения (чтобы логи были чище)
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  process.exit(0);
});
