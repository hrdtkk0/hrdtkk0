
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Heartbeat for Railway health check
app.get('/', (req, res) => {
  res.send('Online');
});

app.post('/api/book', async (req, res) => {
  const { 
    apartmentTitle, firstName, lastName, phone, email, 
    checkIn, checkOut, guests, totalPrice, nights 
  } = req.body;
  
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ success: false, error: 'Env variables missing' });
  }

  try {
    const text = `
<b>🚀 NEW RESERVATION</b>
<b>Property:</b> ${apartmentTitle}
<b>Guest:</b> ${firstName} ${lastName || ''}
<b>Phone:</b> ${phone}
<b>Email:</b> ${email}
<b>Guests:</b> ${guests}
<b>Stay:</b> ${checkIn} to ${checkOut} (${nights} nights)
<b>💰 TOTAL TO PAY: ${totalPrice}</b>
    `.trim();

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: chatId, 
        text: text, 
        parse_mode: 'HTML' 
      })
    });

    const result = await response.json();
    if (!result.ok) throw new Error(result.description);

    res.json({ success: true });
  } catch (e) {
    console.error('Error:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

// Explicitly bind to 0.0.0.0 for Railway/Docker
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
