
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
// Railway ОБЯЗАТЕЛЬНО требует использовать переменную процесса PORT
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Главная страница для проверки Health Check (чтобы Railway видел, что сервер жив)
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// Тестовый маршрут для проверки связи
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', timestamp: new Date().toISOString() });
});

app.post('/api/book', async (req, res) => {
  console.log('>>> Incoming booking request:', req.body.apartmentTitle);
  
  const { 
    firstName, 
    lastName, 
    email, 
    phone, 
    checkIn, 
    checkOut, 
    apartmentTitle, 
    paymentMethod 
  } = req.body;

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('Missing TG config');
    return res.status(500).json({ success: false, error: 'Server TG config missing' });
  }

  try {
    const text = `
<b>New Booking!</b>
Apartment: ${apartmentTitle}
Guest: ${firstName} ${lastName || ''}
Dates: ${checkIn} to ${checkOut}
Phone: ${phone}
Email: ${email}
Payment: ${paymentMethod}
    `.trim();

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: 'HTML'
      })
    });

    const result = await response.json();
    if (!result.ok) throw new Error(result.description);

    console.log('>>> Telegram sent!');
    res.json({ success: true });
  } catch (err) {
    console.error('>>> Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Важно: слушаем на 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`>>> Server is running on port ${PORT}`);
});
