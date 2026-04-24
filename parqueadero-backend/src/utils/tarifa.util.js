function calcularTarifa(tipoVehiculo, fechaIngreso, tarifaData) {
  if (!fechaIngreso || !tarifaData) {
    throw new Error('Fecha de ingreso y tarifa son requeridos');
  }

  const fechaSalida = new Date();
  const ingreso = new Date(fechaIngreso);
  
  if (isNaN(ingreso.getTime())) {
    throw new Error('Fecha de ingreso inválida');
  }

  let diferenciaMs = fechaSalida - ingreso;
  
  if (diferenciaMs < 0) {
    throw new Error('La fecha de salida no puede ser anterior a la de ingreso');
  }

  let totalHoras = Math.ceil(diferenciaMs / (1000 * 60 * 60));
  
  if (totalHoras < 1) {
    totalHoras = 1;
  }

  let totalPagar = 0;

  if (totalHoras === 1) {
    totalPagar = parseFloat(tarifaData.primera_hora);
  } else {
    totalPagar = parseFloat(tarifaData.primera_hora);
    const horasAdicionales = totalHoras - 1;
    totalPagar += horasAdicionales * parseFloat(tarifaData.hora_adicional);
  }

  totalPagar = Math.round(totalPagar);

  return {
    totalHoras,
    totalPagar,
    tarifaAplicada: totalHoras === 1 ? 
      parseFloat(tarifaData.primera_hora) : 
      parseFloat(tarifaData.hora_adicional)
  };
}

module.exports = { calcularTarifa };