const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');

const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/v1/user', userRoutes);
app.use('/v1/user/token', authRoutes);
app.use('/v1/category', categoryRoutes);
app.use('/v1/product', productRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Drip Store API funcionando!',
  });
});

app.use('/v1/user', userRoutes);

module.exports = app;