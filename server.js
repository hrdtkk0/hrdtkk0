
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();

// Railway provides the PORT environment variable automatically.
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

/**
 * HEALTH CHECK (CRITICAL FOR RAILWAY)
 * This prevents the SIGTERM error by responding to Railway's deployment probes.
 */
app.get('/', (req, res) => {
  res.status(200).send('UrbanStay Backend is Live');
});

app.post('/api/book', async (req, res) => {
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
    console.error('Missing Telegram Environment Variables!');
    return res.status(500).json({ success: false, error: 'Server configuration error' });
  }

  try {
    // English template for Telegram notifications as requested
    const text = `
<b>🔔 New Booking Notification</b>

<b>Property:</b> ${apartmentTitle}
<b>Guest:</b> ${firstName} ${lastName}
<b>Email:</b> ${email}
<b>Phone:</b> ${phone}
<b>Total Guests:</b> ${guests}

<b>Stay Period:</b>
📅 From: ${checkIn}
📅 To: ${checkOut}

<b>Payment Info:</b>
💳 Method: ${paymentMethod?.toUpperCase() || 'BLIK'}
💰 Status: Awaiting Processing

<i>Sent via UrbanStay Booking System</i>
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

// Bind to 0.0.0.0 to ensure the service is reachable externally
app.listen(PORT, '0.0.0.0', () => {
  console.log(`>>> Server is running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Cleaning up.');
  process.exit(0);
});
