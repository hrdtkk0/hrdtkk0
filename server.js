
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Health check endpoint for Railway
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

app.post('/api/book', async (req, res) => {
  const { 
    apartmentTitle, firstName, lastName, phone, email, 
    checkIn, checkOut, guests, totalPrice, nights 
  } = req.body;
  
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('Missing Telegram Config');
    return res.status(500).json({ success: false, error: 'Config missing' });
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
<b>💰 TOTAL: ${totalPrice}</b>
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
    console.error('Booking error:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

// Start listening - Railway will automatically stop if this fails to bind
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
