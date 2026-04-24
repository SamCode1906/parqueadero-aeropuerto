const express = require('express');
const router = express.Router();
const { verificarToken, esAdmin, esOperarioOAdmin } = require('../middlewares/auth.middleware');
const {
  getTarifas,
  actualizarTarifa,
  getHistorialTarifas,
  comprarPlanMensual,
  getPlanesActivos,
  generarReporte,
  consultarCupos
} = require('../controllers/tarifas.controller');

router.get('/', verificarToken, getTarifas);
router.put('/:id', verificarToken, esAdmin, actualizarTarifa);
router.get('/historial', verificarToken, esAdmin, getHistorialTarifas);

router.post('/planes', verificarToken, comprarPlanMensual);
router.get('/planes/activos', verificarToken, esOperarioOAdmin, getPlanesActivos);

router.get('/reportes', verificarToken, esAdmin, generarReporte);
router.get('/cupos', verificarToken, esOperarioOAdmin, consultarCupos);

module.exports = router;