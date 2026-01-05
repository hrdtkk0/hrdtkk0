
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();

// Railway uses the PORT environment variable
const PORT = process.env.PORT || 8080;

// Enable CORS for all origins to allow GitHub Pages to communicate with this API
app.use(cors());
app.use(express.json());

// Critical: Health check for Railway deployment status
app.get('/', (req, res) => {
  res.status(200).send('UrbanStay API is operational');
});

app.post('/api/book', async (req, res) => {
  console.log('Received booking for:', req.body.apartmentTitle);
  
  const { 
    apartmentTitle, 
    firstName, 
    lastName, 
    phone, 
    email, 
    checkIn, 
    checkOut, 
    guests, 
    paymentMethod,
    totalPrice,
    nights
  } = req.body;
  
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('Environment variables for Telegram are missing.');
    return res.status(500).json({ success: false, error: 'Server configuration error' });
  }

  try {
    const text = `
<b>🚀 NEW BOOKING REQUEST</b>

<b>Property:</b> ${apartmentTitle}
<b>Guest:</b> ${firstName} ${lastName || ''}
<b>Email:</b> ${email}
<b>Phone:</b> ${phone}
<b>Guests:</b> ${guests || 1}

<b>Stay:</b> ${checkIn} to ${checkOut} (${nights || 0} nights)
<b>Payment:</b> ${paymentMethod?.toUpperCase() || 'BLIK'}

<b>💰 TOTAL TO PAY: ${totalPrice || 'N/A'}</b>
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

// Start server and bind to 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`>>> Backend active on port ${PORT}`);
});

process.on('SIGTERM', () => {
  process.exit(0);
});
