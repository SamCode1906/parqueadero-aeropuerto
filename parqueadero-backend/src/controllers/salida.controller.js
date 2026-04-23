const db = require('../config/db');
const { calcularTarifa } = require('../utils/tarifa.util');

exports.registrarSalida = (req, res) => {
  const { placa } = req.body;

  const sql = `SELECT * FROM movimientos WHERE placa = ? AND estado = 'activo'`;

  db.query(sql, [placa], (err, result) => {
    if (result.length === 0) {
      return res.status(400).json({ msg: 'No hay ingreso activo' });
    }

    const registro = result[0];

    const horas = Math.ceil((new Date() - new Date(registro.hora_ingreso)) / 3600000);

    const tarifaSql = `SELECT * FROM tarifas WHERE tipo = ?`;

    db.query(tarifaSql, [registro.tipo], (err, tarifaRes) => {
      const tarifa = tarifaRes[0];

      const valor = calcularTarifa(horas, tarifa);

      const update = `
        UPDATE movimientos
        SET hora_salida = NOW(), estado='finalizado', valor_pagado=?
        WHERE id=?
      `;

      db.query(update, [valor, registro.id], () => {
        res.json({ placa, horas, valor });
      });
    });
  });
};