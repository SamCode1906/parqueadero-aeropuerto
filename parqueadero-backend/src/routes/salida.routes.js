const express = require('express');
const router = express.Router();
const { verificarToken, esOperarioOAdmin } = require('../middlewares/auth.middleware');
const { registrarSalida, calcularValorPagar, historialHoy } = require('../controllers/salida.controller');

router.post('/', verificarToken, esOperarioOAdmin, registrarSalida);
router.get('/calcular/:placa', verificarToken, esOperarioOAdmin, calcularValorPagar);
router.get('/historial-hoy', verificarToken, esOperarioOAdmin, historialHoy);

module.exports = router;