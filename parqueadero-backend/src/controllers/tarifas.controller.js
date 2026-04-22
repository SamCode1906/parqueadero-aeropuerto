const db = require('../config/db');

// VER TARIFAS
exports.obtenerTarifas = (req, res) => {
  db.query('SELECT * FROM tarifas', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// ACTUALIZAR TARIFA
exports.actualizarTarifa = (req, res) => {
  const { id } = req.params;
  const { valor } = req.body;

  const sql = 'UPDATE tarifas SET valor = ? WHERE id = ?';

  db.query(sql, [valor, id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({ msg: 'Tarifa actualizada correctamente' });
  });
};