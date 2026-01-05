
import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // Теперь это не вызовет ошибку, так как мы добавили пакет в package.json

const app = express();

// Railway автоматически передает переменную PORT.
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Главный маршрут для Railway Health Check
app.get('/', (req, res) => {
  res.status(200).send('Backend is running');
});

// Проверка здоровья API
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env_loaded: !!process.env.TELEGRAM_BOT_TOKEN 
  });
});

app.post('/api/book', async (req, res) => {
  console.log('Booking request received for:', req.body.apartmentTitle);
  
  const { apartmentTitle, firstName, phone, email, checkIn, checkOut, paymentMethod } = req.body;
  
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('Telegram configuration is missing in Railway Variables!');
    return res.status(500).json({ success: false, error: 'Server configuration error' });
  }

  try {
    const text = `
<b>🏨 New Booking Request</b>
<b>Apartment:</b> ${apartmentTitle}
<b>Guest:</b> ${firstName}
<b>Dates:</b> ${checkIn} to ${checkOut}
<b>Phone:</b> ${phone}
<b>Email:</b> ${email}
<b>Payment:</b> ${paymentMethod}
    `.trim();

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: chatId, 
        text: text, 
        parse_mode: 'HTML' 
      })
    });

    const data = await response.json();
    if (!data.ok) throw new Error(data.description);

    res.json({ success: true });
  } catch (e) {
    console.error('Telegram API Error:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

// ВАЖНО: Привязка к 0.0.0.0 обязательна для Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`>>> Server is actively listening on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Cleaning up...');
  process.exit(0);
});
