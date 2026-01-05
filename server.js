import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;

// Настройка CORS: разрешаем запросы со всех источников для тестов
app.use(cors());
app.use(express.json());

// Логгер для всех входящих запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST') console.log('Payload:', req.body);
  next();
});

// Проверка конфигурации SMTP при запуске
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com', 
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Проверка связи с почтовым сервером
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to take our messages');
  }
});

app.post('/api/book', async (req, res) => {
  const { 
    firstName, lastName, email, checkIn, checkOut, 
    guests, apartmentTitle, pricePerNight, paymentMethod, language = 'en'
  } = req.body;

  if (!email) {
    console.error('Validation Error: No email provided');
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  try {
    const t = {
      en: {
        subject: `Booking Confirmation: ${apartmentTitle}`,
        title: 'Booking Confirmed!',
        greeting: `Dear ${firstName} ${lastName},`,
        received: 'Your reservation request has been received.',
        details: 'Reservation Details',
        property: 'Property:',
        dates: 'Dates:',
        guests: 'Guests:',
        paymentRequired: 'Payment Required',
        payVia: `Please pay via ${paymentMethod.toUpperCase()}.`,
        amount: 'Amount:',
        number: 'Number:',
        footer: 'Reply to this email with any questions.',
        plainText: `Your booking for ${apartmentTitle} is confirmed. Amount: $${pricePerNight}.`
      },
      pl: {
        subject: `Potwierdzenie Rezerwacji: ${apartmentTitle}`,
        title: 'Rezerwacja Potwierdzona!',
        greeting: `Szanowny/a ${firstName} ${lastName},`,
        received: 'Twoja prośba o rezerwację została otrzymana.',
        details: 'Szczegóły Rezerwacji',
        property: 'Obiekt:',
        dates: 'Termin:',
        guests: 'Goście:',
        paymentRequired: 'Wymagana Płatność',
        payVia: `Prosimy o zapłatę przez ${paymentMethod.toUpperCase()}.`,
        amount: 'Kwota:',
        number: 'Numer:',
        footer: 'W razie pytań odpowiedz na ten email.',
        plainText: `Twoja rezerwacja dla ${apartmentTitle} została potwierdzona. Kwota: $${pricePerNight}.`
      }
    };

    const strings = t[language] || t.en;
    
    console.log(`Sending email to: ${email}...`);

    await transporter.sendMail({
      from: `"UrbanStay" <${process.env.SMTP_USER}>`,
      to: email,
      subject: strings.subject,
      text: strings.plainText,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <div style="background: #4f46e5; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0;">${strings.title}</h1>
          </div>
          <div style="border: 1px solid #ddd; padding: 20px; border-top: none; border-radius: 0 0 8px 8px;">
            <p><strong>${strings.greeting}</strong></p>
            <p>${strings.received}</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p><strong>${strings.property}</strong> ${apartmentTitle}</p>
              <p><strong>${strings.dates}</strong> ${checkIn} - ${checkOut}</p>
              <p><strong>${strings.guests}</strong> ${guests}</p>
            </div>
            <div style="border: 2px dashed #4f46e5; padding: 15px; background: #f0f4ff;">
              <p><strong>${strings.paymentRequired}</strong></p>
              <p>${strings.payVia}</p>
              <p><strong>${strings.amount}</strong> $${pricePerNight}</p>
              <p><strong>${strings.number}</strong> +48 123 456 789</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log('Email sent successfully');
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('CRITICAL ERROR during booking/email process:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API check: http://localhost:${PORT}/api/book (POST only)`);
});
