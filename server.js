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

// Настройка почты
const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  // Важно: для порта 465 secure должен быть true, для 587 - false
  secure: process.env.SMTP_PORT === '465' || process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Здесь должен быть "Пароль приложения"
  },
  connectionTimeout: 10000, // 10 секунд на попытку подключения
};

console.log('Attempting to initialize SMTP with host:', smtpConfig.host, 'port:', smtpConfig.port);

const transporter = nodemailer.createTransport(smtpConfig);

// Проверка подключения при старте
transporter.verify((error, success) => {
  if (error) {
    console.error('!!! SMTP VERIFICATION FAILED !!!');
    console.error('Error Details:', error.message);
    console.error('Code:', error.code);
    console.error('Full Error:', JSON.stringify(error));
  } else {
    console.log('>>> SMTP Server is ready to send emails');
  }
});

app.post('/api/book', async (req, res) => {
  const { firstName, email, apartmentTitle, paymentMethod, language = 'en' } = req.body;

  try {
    console.log(`Booking request for ${apartmentTitle} from ${email}`);
    
    await transporter.sendMail({
      from: `"UrbanStay" <${process.env.SMTP_USER}>`,
      to: email,
      subject: language === 'pl' ? `Potwierdzenie: ${apartmentTitle}` : `Confirmation: ${apartmentTitle}`,
      text: `Hello ${firstName}, your booking for ${apartmentTitle} is confirmed via ${paymentMethod}.`,
      html: `<h1 style="color: #4f46e5;">Booking Confirmed!</h1><p>Hello ${firstName}, your stay at <b>${apartmentTitle}</b> is reserved.</p>`,
    });

    console.log('Email sent successfully to', email);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email sending failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
