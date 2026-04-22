const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// REGISTRO
exports.register = async (req, res) => {
  console.log("ENTRÓ AL ENDPOINT");

  return res.json({ msg: "funciona" });
};
exports.register = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { nombre, correo, contraseña } = req.body;

    if (!nombre || !correo || !contraseña) {
      return res.status(400).json({ msg: 'Campos obligatorios' });
    }

    const hash = await bcrypt.hash(contraseña, 10);

    const sql = 'INSERT INTO usuarios (nombre, correo, contraseña, rol) VALUES (?, ?, ?, ?)';

    db.query(sql, [nombre, correo, hash, 'cliente'], (err, result) => {
      if (err) {
        console.error("ERROR SQL:", err);
        return res.status(500).json({ msg: 'Error al registrar' });
      }

      return res.json({ msg: 'Usuario registrado correctamente' });
    });

  } catch (error) {
    console.error("ERROR GENERAL:", error);
    res.status(500).json({ msg: 'Error interno' });
  }
};

// LOGIN
exports.login = (req, res) => {
  const { correo, contraseña } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE correo = ?';

  db.query(sql, [correo], async (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(400).json({ msg: 'Usuario no encontrado' });
    }

    const user = results[0];

    const valid = await bcrypt.compare(contraseña, user.contraseña);

    if (!valid) {
      return res.status(400).json({ msg: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // 👇 quitar contraseña sin romper
    delete user.contraseña;

    res.json({
      msg: 'Login exitoso',
      token,
      user
    });
  });
};