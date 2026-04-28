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

  // Cálculo según resolución Aeropuerto Alfonso Bonilla Aragón
  if (totalHoras <= 12) {
    // Primera hora = tarifa completa
    // Horas adicionales hasta 12 = tarifa hora_adicional
    totalPagar = parseFloat(tarifaData.primera_hora);
    if (totalHoras > 1) {
      const horasAdicionales = totalHoras - 1;
      totalPagar += horasAdicionales * parseFloat(tarifaData.hora_adicional);
    }
  } else if (totalHoras <= 168) {
    // De 13 hasta 168 horas
    totalPagar = parseFloat(tarifaData.primera_hora) + (11 * parseFloat(tarifaData.hora_adicional));
    const horasExtra = totalHoras - 12;
    totalPagar += horasExtra * 1600; // Tarifa reducida para estancias largas
  } else {
    // Más de 169 horas
    totalPagar = parseFloat(tarifaData.primera_hora) + (11 * parseFloat(tarifaData.hora_adicional));
    const horasExtra = totalHoras - 12;
    totalPagar += horasExtra * 300; // Tarifa mínima para muy larga estancia
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