const db = require('../config/db');

exports.registrarIngreso = (req, res) => {
  const { placa } = req.body;

  if (!placa) {
    return res.status(400).json({ msg: 'La placa es obligatoria' });
  }

  // 1. Verificar si ya está dentro
  const checkSql = 'SELECT * FROM registros WHERE placa = ? AND estado = "activo"';

  db.query(checkSql, [placa], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length > 0) {
      return res.status(400).json({ msg: 'El vehículo ya está dentro del parqueadero' });
    }

    // 2. Registrar ingreso
    const insertSql = `
      INSERT INTO registros (placa, fecha_ingreso, estado)
      VALUES (?, NOW(), 'activo')
    `;

    db.query(insertSql, [placa], (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({
        msg: 'Ingreso registrado correctamente',
        placa
      });
    });
  });
};