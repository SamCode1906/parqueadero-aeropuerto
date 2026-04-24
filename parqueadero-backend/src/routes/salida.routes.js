const express = require('express');
const router = express.Router();
const { verificarToken, esOperarioOAdmin } = require('../middlewares/auth.middleware');
const { registrarSalida, calcularValorPagar } = require('../controllers/salida.controller');

router.post('/', verificarToken, esOperarioOAdmin, registrarSalida);
router.get('/calcular/:placa', verificarToken, esOperarioOAdmin, calcularValorPagar);

module.exports = router;