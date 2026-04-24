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
  res.json({
    success: true,
    message: 'API de Parqueadero funcionando correctamente',
    timestamp: new Date()
  });
});

app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await testConnection();
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log('📋 Endpoints disponibles:');
      console.log('   POST /api/auth/register');
      console.log('   POST /api/auth/login');
      console.log('   GET  /api/auth/profile');
      console.log('   POST /api/ingresos');
      console.log('   GET  /api/ingresos/activos');
      console.log('   GET  /api/ingresos/verificar/:placa');
      console.log('   POST /api/salidas');
      console.log('   GET  /api/salidas/calcular/:placa');
      console.log('   GET  /api/tarifas');
      console.log('   PUT  /api/tarifas/:id');
      console.log('   GET  /api/tarifas/historial');
      console.log('   POST /api/tarifas/planes');
      console.log('   GET  /api/tarifas/planes/activos');
      console.log('   GET  /api/tarifas/reportes');
      console.log('   GET  /api/tarifas/cupos');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
}

startServer();