const db = require('../config/db');

exports.obtenerTarifas = (req, res) => {
  db.query('SELECT * FROM tarifas', (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.actualizarTarifa = (req, res) => {
  const { id } = req.params;
  const { hora1, hora2_12, hora13_168, hora169, mensual } = req.body;

  const sql = `
    UPDATE tarifas
    SET hora1=?, hora2_12=?, hora13_168=?, hora169=?, mensual=?
    WHERE id=?
  `;

  db.query(sql, [hora1, hora2_12, hora13_168, hora169, mensual, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ msg: 'Tarifa actualizada' });
  });
};