import express from 'express';
 import mongoose from 'mongoose';
 import userRouter from './routers/userRouter.js';
 import productRouter from './routers/productRouter.js';
 import dotenv from 'dotenv';
 import orderRouter from './routers/orderRouter.js';
 import path from 'path';
 import uploadRouter from './routers/uploadRouter.js';


 dotenv.config();
 const app = express();
 app.use(express.json());
 app.use(express.urlencoded({ extended: true }));
 // eslint-disable-next-line no-undef
 mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/amazona', {
   useNewUrlParser: true,
   useUnifiedTopology: true,
 });

 app.get('/api/config/paypal', (req, res) => {
  // eslint-disable-next-line no-undef
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

app.use('/api/uploads', uploadRouter);
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
 app.use('/api/products', productRouter);
 app.use('/api/users', userRouter);
 app.get('/', (req, res) => {
   res.send('Server is ready');
 });
 app.use('/api/orders', orderRouter);
 // eslint-disable-next-line no-unused-vars
 app.use((err, req, res, next) => {
   res.status(500).send({ message: err.message });
 });

 // eslint-disable-next-line no-undef
 const port = process.env.PORT || 4000;
 app.listen(port, () => {
   console.log(`Serve at http://localhost:${port}`);
});