import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Логирование
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Настройка транспортера
// Для Railway/Cloud лучше всего работает 587 + secure: false (STARTTLS)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // false для 587, true для 465
  pool: true,    // Использование пула соединений
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Вводить 16 символов БЕЗ пробелов
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
});

// Неблокирующая проверка
console.log("Starting SMTP verification...");
transporter.verify().then(() => {
  console.log('>>> SMTP Server is ready to send emails');
}).catch((err) => {
  console.error('!!! SMTP VERIFICATION FAILED !!!');
  console.error('Reason:', err.message);
});

app.post('/api/book', async (req, res) => {
  const { firstName, email, apartmentTitle, paymentMethod, language = 'en' } = req.body;

  if (!email) return res.status(400).json({ success: false, error: 'Email required' });

  try {
    console.log(`Sending confirmation to: ${email}`);
    
    await transporter.sendMail({
      from: `"UrbanStay" <${process.env.SMTP_USER}>`,
      to: email,
      subject: language === 'pl' ? `Potwierdzenie: ${apartmentTitle}` : `Booking Confirmation: ${apartmentTitle}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #4f46e5;">Success!</h2>
          <p>Hello ${firstName},</p>
          <p>Your stay at <b>${apartmentTitle}</b> is confirmed via ${paymentMethod.toUpperCase()}.</p>
          <p>Thank you for choosing UrbanStay!</p>
        </div>
      `,
    });

    console.log('Email sent!');
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('SendMail Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Принудительно слушаем на 0.0.0.0 для Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
