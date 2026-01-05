import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const smtpPort = parseInt(process.env.SMTP_PORT || '465');

// Настройка почты с расширенными таймаутами для облачных сред
const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: smtpPort,
  // Для 465 порта ВСЕГДА true, для 587 ВСЕГДА false
  secure: smtpPort === 465, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, 
  },
  tls: {
    // Не падать, если есть проблемы с цепочкой сертификатов на сервере
    rejectUnauthorized: false
  },
  connectionTimeout: 20000, // 20 секунд
  greetingTimeout: 20000,
  socketTimeout: 20000,
};

console.log(`Attempting SMTP: ${smtpConfig.host}:${smtpConfig.port} (secure: ${smtpConfig.secure})`);

const transporter = nodemailer.createTransport(smtpConfig);

// Проверка подключения (не блокирует запуск сервера)
transporter.verify((error, success) => {
  if (error) {
    console.error('!!! SMTP VERIFICATION FAILED !!!');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
  } else {
    console.log('>>> SMTP Server is ready');
  }
});

app.post('/api/book', async (req, res) => {
  const { firstName, email, apartmentTitle, paymentMethod, language = 'en' } = req.body;

  if (!email) return res.status(400).json({ success: false, error: 'Email required' });

  try {
    console.log(`Sending email to ${email} for ${apartmentTitle}...`);
    
    await transporter.sendMail({
      from: `"UrbanStay" <${process.env.SMTP_USER}>`,
      to: email,
      subject: language === 'pl' ? `Potwierdzenie: ${apartmentTitle}` : `Confirmation: ${apartmentTitle}`,
      text: `Hello ${firstName}, your booking for ${apartmentTitle} is confirmed.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #4f46e5;">Booking Confirmed!</h2>
          <p>Hello <b>${firstName}</b>,</p>
          <p>Your stay at <b>${apartmentTitle}</b> has been successfully reserved via ${paymentMethod.toUpperCase()}.</p>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #666;">This is an automated message from UrbanStay.</p>
        </div>
      `,
    });

    console.log('Email successfully sent');
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
