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
  consultarCupos,
  getMiPlan
} = require('../controllers/tarifas.controller');

// Rutas públicas (con token)
router.get('/', verificarToken, getTarifas);
router.get('/mi-plan', verificarToken, getMiPlan);

// Rutas admin
router.put('/:id', verificarToken, esAdmin, actualizarTarifa);
router.get('/historial', verificarToken, esAdmin, getHistorialTarifas);

// Planes
router.post('/planes', verificarToken, comprarPlanMensual);
router.get('/planes/activos', verificarToken, esOperarioOAdmin, getPlanesActivos);

// Reportes y cupos
router.get('/reportes', verificarToken, esAdmin, generarReporte);
router.get('/cupos', verificarToken, esOperarioOAdmin, consultarCupos);

module.exports = router;