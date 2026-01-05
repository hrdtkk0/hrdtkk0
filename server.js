
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Health check for Railway deployment - MUST respond with 200
app.get('/', (req, res) => {
  res.status(200).send('Server is healthy and running.');
});

app.post('/api/book', async (req, res) => {
  try {
    const { 
      apartmentTitle, 
      firstName, 
      lastName, 
      phone, 
      email, 
      checkIn, 
      checkOut, 
      guests, 
      paymentMethod 
    } = req.body;
    
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      throw new Error('Telegram credentials not configured in environment variables.');
    }

    // English notification template
    const message = `
<b>🚀 NEW BOOKING REQUEST</b>

<b>Property:</b> ${apartmentTitle}
<b>Guest Name:</b> ${firstName} ${lastName}
<b>Email:</b> ${email}
<b>Phone:</b> ${phone}
<b>Number of Guests:</b> ${guests}

<b>Check-in:</b> ${checkIn}
<b>Check-out:</b> ${checkOut}

<b>Payment Method:</b> ${paymentMethod?.toUpperCase() || 'BLIK'}
<b>Status:</b> Awaiting confirmation
    `.trim();

    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: chatId, 
        text: message, 
        parse_mode: 'HTML' 
      })
    });

    const result = await response.json();
    if (!result.ok) {
      console.error('Telegram Error:', result);
      return res.status(500).json({ success: false, error: 'Telegram API failed' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Internal Server Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Start listening immediately to satisfy Railway's health check
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server successfully started on port ${PORT}`);
});

// Graceful shutdown and error prevention
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('There was an uncaught error', err);
});
