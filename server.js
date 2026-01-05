
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();

const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Railway Health Check
app.get('/', (req, res) => {
  res.status(200).send('OK');
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
    console.error('Missing Telegram Config');
    return res.status(500).json({ success: false, error: 'Config missing' });
  }

  try {
    const text = `
<b>🚀 New Booking Request</b>

<b>Property:</b> ${apartmentTitle}
<b>Guest Name:</b> ${firstName} ${lastName}
<b>Email:</b> ${email}
<b>Phone:</b> ${phone}
<b>Guests:</b> ${guests}
<b>Check-in:</b> ${checkIn}
<b>Check-out:</b> ${checkOut}
<b>Payment Method:</b> ${paymentMethod?.toUpperCase() || 'BLIK'}

<i>Status: Pending Confirmation</i>
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
    console.error('Booking Error:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  process.exit(0);
});
