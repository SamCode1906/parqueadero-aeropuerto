const express = require('express');
const router = express.Router();
const ingresoController = require('../controllers/ingreso.controller');

router.post('/', ingresoController.registrarIngreso);

module.exports = router;