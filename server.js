import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Логирование входящих запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const isSecure = smtpPort === 465;

const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: smtpPort,
  secure: isSecure, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // ВВОДИТЬ БЕЗ ПРОБЕЛОВ
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  connectionTimeout: 15000, 
  greetingTimeout: 15000,
  socketTimeout: 20000,
};

console.log(`Configuring SMTP: ${smtpConfig.host}:${smtpConfig.port} (secure: ${smtpConfig.secure})`);

const transporter = nodemailer.createTransport(smtpConfig);

// Проверка при запуске
transporter.verify((error, success) => {
  if (error) {
    console.error('--- SMTP CONNECTION ERROR ---');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Full Info:', JSON.stringify(error));
    console.error('-----------------------------');
  } else {
    console.log('>>> SMTP connection established successfully');
  }
});

app.post('/api/book', async (req, res) => {
  const { firstName, email, apartmentTitle, paymentMethod, language = 'en' } = req.body;

  if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

  try {
    console.log(`Attempting to send booking email to: ${email}`);
    
    await transporter.sendMail({
      from: `"UrbanStay" <${process.env.SMTP_USER}>`,
      to: email,
      subject: language === 'pl' ? `Potwierdzenie rezerwacji: ${apartmentTitle}` : `Booking Confirmation: ${apartmentTitle}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">Success!</h2>
          <p>Hi ${firstName},</p>
          <p>Your booking for <b>${apartmentTitle}</b> has been confirmed via ${paymentMethod.toUpperCase()}.</p>
          <p>We look forward to seeing you!</p>
        </div>
      `,
    });

    console.log('Email sent successfully');
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email sending failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server active on port ${PORT}`);
});
