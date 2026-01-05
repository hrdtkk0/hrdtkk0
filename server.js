
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
// Railway автоматически назначает PORT, обычно это 8080
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Простая проверка для браузера: зайти на https://ваш-урл.railway.app/
app.get('/', (req, res) => {
  res.status(200).send('<h1>UrbanStay Backend is Live!</h1><p>Telegram notification service is ready.</p>');
});

// Логирование всех входящих запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.post('/api/book', async (req, res) => {
  const { 
    firstName, 
    lastName, 
    email, 
    phone, 
    checkIn, 
    checkOut, 
    apartmentTitle, 
    paymentMethod, 
    language = 'en' 
  } = req.body;

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("CRITICAL ERROR: TELEGRAM_BOT_TOKEN or CHAT_ID is missing in environment variables!");
    return res.status(500).json({ 
      success: false, 
      error: "Notification service configuration missing on server." 
    });
  }

  try {
    console.log(`Attempting to send Telegram notification for: ${apartmentTitle}`);

    const message = `
<b>🆕 New Booking Received!</b>
━━━━━━━━━━━━━━━━━━
<b>🏠 Apartment:</b> ${apartmentTitle}
<b>👤 Guest:</b> ${firstName} ${lastName || ''}
<b>📅 Dates:</b> ${checkIn} to ${checkOut}
<b>📧 Email:</b> ${email}
<b>📞 Phone:</b> ${phone || 'Not provided'}
<b>💳 Payment:</b> ${paymentMethod.toUpperCase()}
<b>🌐 Lang:</b> ${language.toUpperCase()}
━━━━━━━━━━━━━━━━━━
    `.trim();

    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error('Telegram API Error Response:', data);
      throw new Error(data.description || 'Telegram API failed');
    }

    console.log('✅ Telegram notification sent successfully to ID:', CHAT_ID);
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ Booking Process Failed:', error.message);
    res.status(500).json({ 
      success: false, 
      error: `Server failed to send notification: ${error.message}` 
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`>>> UrbanStay Backend is LIVE on port ${PORT}`);
  console.log(`>>> Health check available at: http://0.0.0.0:${PORT}/`);
});
