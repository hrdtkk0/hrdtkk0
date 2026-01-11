
import express from 'express';
import cors from 'cors';
import { generateReservationEmail } from './templates/reservationEmail.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Serve static files from the "images" directory
// User should create a folder named "images" in the root directory
app.use('/images', express.static('images'));

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
    // Generate the HTML content
    const emailContent = generateReservationEmail(req.body);
    
    // Create a Blob from the string content
    const fileBlob = new Blob([emailContent], { type: 'text/html' });

    // Create FormData to send the file
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('caption', `📅 <b>New Reservation Request</b>\n\n👤 ${firstName} ${lastName}\n🏠 ${apartmentTitle}\n💰 ${totalPrice}\n\n<i>Full details attached in the file.</i>`);
    formData.append('parse_mode', 'HTML');
    
    // Append the blob as a file with a specific filename
    formData.append('document', fileBlob, 'reservation_details.html');

    // Use sendDocument instead of sendMessage
    const response = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      body: formData
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
