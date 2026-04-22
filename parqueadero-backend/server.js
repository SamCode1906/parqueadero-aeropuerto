require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/ingreso', require('./src/routes/ingreso.routes'));
app.use('/api/tarifas', require('./src/routes/tarifas.routes'));
app.use('/api/salida', require('./src/routes/salida.routes'));

app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
});