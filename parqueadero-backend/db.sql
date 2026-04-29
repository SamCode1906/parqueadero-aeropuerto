-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS parqueadero_aeropuerto;
USE parqueadero_aeropuerto;

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios (rol_id DEFAULT 3 = cliente)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    identificacion VARCHAR(50) UNIQUE,
    rol_id INT DEFAULT 3,
    vehiculo_placa VARCHAR(10),
    vehiculo_tipo VARCHAR(50),
    plan_activo BOOLEAN DEFAULT FALSE,
    plan_inicio DATE,
    plan_vencimiento DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- Tabla de tarifas
CREATE TABLE IF NOT EXISTS tarifas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_vehiculo VARCHAR(50) NOT NULL,
    primera_hora DECIMAL(10,2) NOT NULL,
    hora_adicional DECIMAL(10,2) NOT NULL,
    plan_mensual DECIMAL(10,2) DEFAULT 0,
    activa BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de historial de tarifas
CREATE TABLE IF NOT EXISTS historial_tarifas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarifa_id INT,
    tipo_vehiculo VARCHAR(50),
    primera_hora_anterior DECIMAL(10,2),
    primera_hora_nueva DECIMAL(10,2),
    hora_adicional_anterior DECIMAL(10,2),
    hora_adicional_nueva DECIMAL(10,2),
    plan_mensual_anterior DECIMAL(10,2),
    plan_mensual_nuevo DECIMAL(10,2),
    modificado_por INT,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (modificado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de ingresos
CREATE TABLE IF NOT EXISTS ingresos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(10) NOT NULL,
    tipo_vehiculo VARCHAR(50) NOT NULL,
    tipo_registro ENUM('manual', 'automatico') DEFAULT 'manual',
    es_plan_mensual BOOLEAN DEFAULT FALSE,
    usuario_plan_id INT NULL,
    fecha_ingreso DATETIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    operario_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (operario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_placa_activo (placa, activo)
);

-- Tabla de salidas
CREATE TABLE IF NOT EXISTS salidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ingreso_id INT NOT NULL,
    placa VARCHAR(10) NOT NULL,
    tipo_vehiculo VARCHAR(50),
    fecha_ingreso DATETIME NOT NULL,
    fecha_salida DATETIME NOT NULL,
    total_horas DECIMAL(10,2),
    tarifa_aplicada DECIMAL(10,2),
    total_pagar DECIMAL(10,2) DEFAULT 0,
    metodo_pago ENUM('efectivo', 'transferencia', 'qr') DEFAULT 'efectivo',
    operario_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ingreso_id) REFERENCES ingresos(id) ON DELETE CASCADE,
    FOREIGN KEY (operario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de planes mensuales
CREATE TABLE IF NOT EXISTS planes_mensuales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    placa VARCHAR(10) NOT NULL,
    tipo_vehiculo VARCHAR(50),
    fecha_inicio DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    monto DECIMAL(10,2),
    activo BOOLEAN DEFAULT TRUE,
    operario_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (operario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Insertar roles
INSERT IGNORE INTO roles (id, nombre) VALUES 
(1, 'admin'),
(2, 'operario'),
(3, 'cliente');

-- Insertar tarifas OFICIALES Aeropuerto Alfonso Bonilla Aragón
INSERT IGNORE INTO tarifas (tipo_vehiculo, primera_hora, hora_adicional, plan_mensual) VALUES 
('Automovil', 4300.00, 2600.00, 178900.00),
('Campero', 4300.00, 2600.00, 178900.00),
('Camioneta', 4300.00, 2600.00, 178900.00),
('Microbus', 4300.00, 2600.00, 178900.00),
('Motocarro', 4300.00, 2600.00, 178900.00),
('Motocicleta', 2700.00, 1500.00, 67200.00),
('Bicicleta', 700.00, 400.00, 16800.00);


-- Insertar roles
INSERT INTO roles (id, nombre) VALUES 
(1, 'admin'),
(2, 'operario'),
(3, 'cliente');

-- Insertar tarifas OFICIALES Aeropuerto Alfonso Bonilla Aragón
INSERT INTO tarifas (tipo_vehiculo, primera_hora, hora_adicional, plan_mensual) VALUES 
('Automovil', 4300.00, 2600.00, 178900.00),
('Campero', 4300.00, 2600.00, 178900.00),
('Camioneta', 4300.00, 2600.00, 178900.00),
('Microbus', 4300.00, 2600.00, 178900.00),
('Motocarro', 4300.00, 2600.00, 178900.00),
('Motocicleta', 2700.00, 1500.00, 67200.00),
('Bicicleta', 700.00, 400.00, 16800.00);

ALTER TABLE usuarios MODIFY rol_id INT DEFAULT 3;