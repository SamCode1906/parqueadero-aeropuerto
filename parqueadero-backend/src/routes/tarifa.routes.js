const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/tarifas.controller');
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');

router.get('/', verificarToken, ctrl.obtenerTarifas);
router.put('/:id', verificarToken, soloAdmin, ctrl.actualizarTarifa);

module.exports = router;