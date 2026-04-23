const db = require('../config/db');

exports.registrarIngreso = (req, res) => {
  const { placa, tipo } = req.body;

  if (!placa || !tipo) {
    return res.status(400).json({ msg: 'Datos incompletos' });
  }

  const checkSql = `SELECT * FROM movimientos WHERE placa = ? AND estado = 'activo'`;

  db.query(checkSql, [placa], (err, result) => {
    if (result.length > 0) {
      return res.status(400).json({ msg: 'Vehículo ya está dentro' });
    }

    const sql = `
      INSERT INTO movimientos (placa, hora_ingreso, estado, tipo)
      VALUES (?, NOW(), 'activo', ?)
    `;

    db.query(sql, [placa, tipo], (err) => {
      if (err) return res.status(500).json(err);

      res.json({ msg: 'Ingreso registrado', placa });
    });
  });
};