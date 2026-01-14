
import express from 'express';
import cors from 'cors';
import { generateReservationEmail } from './templates/reservationEmail.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Allow requests from anywhere (or configure specific GitHub Pages URL for security)
app.use(cors());
app.use(express.json());

// Health check endpoint for Railway
app.get('/', (req, res) => {
  res.status(200).send('StayInWarsaw API is running');
});

app.post('/api/book', async (req, res) => {
  const { 
    apartmentTitle, firstName, lastName, phone, email, 
    checkIn, checkOut, guests, totalPrice, nights 
  } = req.body;
  
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  // Collect IDs: Primary and Optional Secondary
  // Filters out undefined, null, or empty strings
  const chatIds = [
    process.env.TELEGRAM_CHAT_ID,
    process.env.TELEGRAM_CHAT_ID_2
  ].filter(Boolean);

  if (!token || chatIds.length === 0) {
    console.error('Missing Telegram Config: Token or Chat ID not found.');
    return res.status(500).json({ success: false, error: 'Config missing' });
  }

  console.log(`Received booking request for ${firstName} ${lastName} (${apartmentTitle})`);

  try {
    // Generate the HTML content from the template
    const emailContent = generateReservationEmail(req.body);
    
    // Create a Blob from the string content
    const fileBlob = new Blob([emailContent], { type: 'text/html' });

    // Function to send notification to a single chat ID
    const sendNotification = async (targetChatId) => {
      console.log(`Attempting to send Telegram notification to ID: ${targetChatId}...`);

      const formData = new FormData();
      formData.append('chat_id', targetChatId);
      // Short caption for the message (content unchanged)
      formData.append('caption', `📅 <b>New Reservation Request</b>\n\n👤 ${firstName} ${lastName}\n🏠 ${apartmentTitle}\n💰 ${totalPrice}\n\n<i>Full details attached in the file.</i>`);
      formData.append('parse_mode', 'HTML');
      
      // Append the blob as a file with a specific filename
      formData.append('document', fileBlob, 'reservation_details.html');

      const response = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (!result.ok) {
        throw new Error(`Telegram API Error for ID ${targetChatId}: ${result.description}`);
      }
      
      console.log(`Successfully sent Telegram notification to ID: ${targetChatId}`);
    };

    // Send to all IDs concurrently
    await Promise.all(chatIds.map(id => sendNotification(id)));

    console.log('All booking notifications processed successfully.');
    res.json({ success: true });
  } catch (e) {
    console.error('Booking processing error:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
