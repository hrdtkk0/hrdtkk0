
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Log incoming requests
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

  // Telegram Credentials from Environment Variables
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("Missing Telegram configuration (BOT_TOKEN or CHAT_ID)");
    return res.status(500).json({ success: false, error: "Notification service not configured" });
  }

  try {
    console.log(`Sending Telegram notification for booking: ${apartmentTitle}`);

    // Format the message for Telegram
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

    // Call Telegram API (Standard HTTPS - Never blocked)
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
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
      throw new Error(data.description || 'Failed to send Telegram message');
    }

    console.log('Telegram notification sent successfully');
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Booking Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`>>> Backend is LIVE on port ${PORT}`);
});
