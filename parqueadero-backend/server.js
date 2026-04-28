const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { pool, testConnection, initializeDatabase } = require('./src/config/db');

const authRoutes = require('./src/routes/auth.routes');
const ingresoRoutes = require('./src/routes/ingreso.routes');
const salidaRoutes = require('./src/routes/salida.routes');
const tarifaRoutes = require('./src/routes/tarifa.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/ingresos', ingresoRoutes);
app.use('/api/salidas', salidaRoutes);
app.use('/api/tarifas', tarifaRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API funcionando', timestamp: new Date() });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4000;

async function startServer() {
  await testConnection();
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer();