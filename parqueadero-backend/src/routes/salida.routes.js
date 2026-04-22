const express = require('express');
const router = express.Router();
const salidaController = require('../controllers/salida.controller');

router.post('/', salidaController.registrarSalida);

module.exports = router;