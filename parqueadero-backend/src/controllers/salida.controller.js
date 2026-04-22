const db = require('../config/db');

exports.registrarSalida = (req, res) => {
  const { placa } = req.body;

  if (!placa) {
    return res.status(400).json({ msg: 'La placa es obligatoria' });
  }

  // 1. Buscar ingreso activo
  const sql = `
    SELECT * FROM registros
    WHERE placa = ? AND estado = 'activo'
  `;

  db.query(sql, [placa], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(400).json({ msg: 'No existe ingreso activo para este vehículo' });
    }

    const registro = results[0];

    const fechaIngreso = new Date(registro.fecha_ingreso);
    const fechaSalida = new Date();

    // 2. Calcular tiempo
    const diferenciaMs = fechaSalida - fechaIngreso;
    const horas = Math.ceil(diferenciaMs / (1000 * 60 * 60));

    // ⚠️ TEMPORAL (luego se conecta a tarifas)
    const tarifaHora = 1000;
    const valor = horas * tarifaHora;

    // 3. Actualizar registro
    const updateSql = `
      UPDATE registros
      SET fecha_salida = NOW(),
          estado = 'finalizado',
          valor_pagado = ?
      WHERE id = ?
    `;

    db.query(updateSql, [valor, registro.id], (err) => {
      if (err) return res.status(500).json(err);

      res.json({
        msg: 'Salida registrada',
        placa,
        horas,
        valor
      });
    });
  });
};