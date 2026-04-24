const express = require('express');
const router = express.Router();
const { verificarToken, esOperarioOAdmin } = require('../middlewares/auth.middleware');
const { registrarIngreso, listarIngresosActivos, verificarPlaca } = require('../controllers/ingreso.controller');

router.post('/', verificarToken, esOperarioOAdmin, registrarIngreso);
router.get('/activos', verificarToken, esOperarioOAdmin, listarIngresosActivos);
router.get('/verificar/:placa', verificarToken, esOperarioOAdmin, verificarPlaca);

module.exports = router;