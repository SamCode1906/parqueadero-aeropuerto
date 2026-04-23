const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// rutas reales
const authRoutes = require('../routes/auth.routes');
const ingresoRoutes = require('../routes/ingreso.routes');
const salidaRoutes = require('../routes/salida.routes');
const tarifasRoutes = require('../routes/tarifas.routes');

app.use('/api/auth', authRoutes);
app.use('/api/ingresos', ingresoRoutes);
app.use('/api/salidas', salidaRoutes);
app.use('/api/tarifas', tarifasRoutes);

// test opcional
app.get('/test', (req, res) => {
  res.send('Backend funcionando');
});

app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});