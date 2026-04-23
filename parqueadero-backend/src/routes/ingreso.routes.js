const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ingreso.controller');

// 🚪 registrar ingreso
router.post('/', ctrl.registrarIngreso);

module.exports = router;