import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get('/api', (_request, response) => {
  response.json({ message: 'API магазину в’язаних іграшок працює.' });
});
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

app.use((_request, response) => {
  response.status(404).json({ message: 'Маршрут не знайдено.' });
});

app.use((error, _request, response, next) => {
  if (response.headersSent) return next(error);
  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status >= 500) {
    console.error(error);
  }
  response.status(status).json({
    message: status >= 500 ? 'Внутрішня помилка сервера.' : error.message,
  });
});

app.listen(port, () => {
  console.log(`API запущено: http://localhost:${port}`);
});
