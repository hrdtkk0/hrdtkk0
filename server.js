
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

app.post('/api/book', async (req, res) => {
  const { 
    apartmentTitle, firstName, lastName, phone, email, 
    checkIn, checkOut, guests, paymentMethod, totalPrice, nights 
  } = req.body;
  
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ success: false, error: 'Config missing' });
  }

  try {
    const text = `
<b>🚀 NEW BOOKING</b>
<b>Property:</b> ${apartmentTitle}
<b>Guest:</b> ${firstName} ${lastName || ''}
<b>Phone:</b> ${phone}
<b>Email:</b> ${email}
<b>Guests:</b> ${guests}
<b>Stay:</b> ${checkIn} - ${checkOut} (${nights} nights)
<b>Payment:</b> ${paymentMethod?.toUpperCase()}
<b>💰 TOTAL: ${totalPrice}</b>
    `.trim();

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
