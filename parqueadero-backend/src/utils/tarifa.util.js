function calcularTarifa(horas, tarifa) {

  if (horas <= 1) return tarifa.hora1;

  if (horas <= 12) return tarifa.hora1 + (horas - 1) * tarifa.hora2_12;

  if (horas <= 168) return tarifa.hora1 +
    11 * tarifa.hora2_12 +
    (horas - 12) * tarifa.hora13_168;

  return tarifa.hora1 +
    11 * tarifa.hora2_12 +
    156 * tarifa.hora13_168 +
    (horas - 168) * tarifa.hora169;
}

module.exports = { calcularTarifa };