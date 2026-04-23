const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/salida.controller');

// 🚪 registrar salida
router.post('/', ctrl.registrarSalida);

module.exports = router;