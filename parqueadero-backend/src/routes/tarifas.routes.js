const express = require('express');
const router = express.Router();
const tarifasController = require('../controllers/tarifas.controller');

// 👇 IMPORTANTE (esto es lo que agregas)
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');

// 👇 rutas protegidas
router.get('/', verificarToken, tarifasController.obtenerTarifas);
router.put('/:id', verificarToken, soloAdmin, tarifasController.actualizarTarifa);

module.exports = router;