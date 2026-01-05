import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 1. МГНОВЕННЫЙ ЗАПУСК СЕРВЕРА (чтобы Railway не убивал процесс по SIGTERM)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`>>> Backend is LIVE on port ${PORT}`);
});

// 2. НАСТРОЙКА ПОЧТЫ ЧЕРЕЗ СЕРВИС (самый надежный способ для Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS?.replace(/\s+/g, ''), // Удаляем любые пробелы автоматически
  },
  pool: true,
  maxConnections: 3,
});

// Фоновая проверка (не блокирует запуск)
setTimeout(() => {
  console.log("Checking SMTP connection in background...");
  transporter.verify((error) => {
    if (error) {
      console.error('!!! SMTP Error:', error.message);
      console.log('Server is still running, but emails might not be sent.');
    } else {
      console.log('>>> SMTP connection SUCCESSFUL');
    }
  });
}, 5000);

app.post('/api/book', async (req, res) => {
  const { firstName, email, apartmentTitle, paymentMethod, language = 'en' } = req.body;

  if (!email) return res.status(400).json({ success: false, error: 'Email missing' });

  try {
    console.log(`Email request: to=${email} for=${apartmentTitle}`);
    
    // Добавляем таймаут на саму отправку, чтобы запрос не висел вечно
    const mailPromise = transporter.sendMail({
      from: `"UrbanStay" <${process.env.SMTP_USER}>`,
      to: email,
      subject: language === 'pl' ? `Rezerwacja: ${apartmentTitle}` : `Booking: ${apartmentTitle}`,
      html: `<div style="font-family:sans-serif;padding:20px;">
               <h2>Reservation Confirmed!</h2>
               <p>Hello ${firstName}, your stay at <b>${apartmentTitle}</b> is booked.</p>
             </div>`,
    });

    // Если письмо не отправится за 10 секунд — выдаем ошибку, но не вешаем сервер
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Mail timeout')), 10000)
    );

    await Promise.race([mailPromise, timeoutPromise]);

    console.log('Email sent successfully');
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Booking API Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
