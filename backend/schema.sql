-- ================================================================
-- SCRIPT DDL + DML — SGIV: Sistema de Gestion de Inventario
--                          de Videojuegos
-- Motor : PostgreSQL 15+
-- Curso : Lenguaje de Programacion Orientado a Objetos  2026 - III CICLO
-- ================================================================

-- CREATE DATABASE sgiv_db WITH ENCODING='UTF8';
-- \c sgiv_db;

-- ----------------------------------------------------------------
-- 1. TIPOS ENUM
-- ----------------------------------------------------------------
CREATE TYPE tipo_movimiento   AS ENUM ('ENTRADA','SALIDA','TRASLADO','DEVOLUCION','AJUSTE');
CREATE TYPE estado_orden      AS ENUM ('BORRADOR','APROBADA','ENVIADA','RECIBIDA','CANCELADA');
CREATE TYPE estado_producto   AS ENUM ('ACTIVO','DESCONTINUADO','AGOTADO','SUSPENDIDO');
CREATE TYPE clasificacion_edad AS ENUM ('TODOS','TEEN','MADURO','ADULTOS');
CREATE TYPE rol_usuario       AS ENUM ('ADMINISTRADOR','ALMACENERO','SUPERVISOR','AUDITOR');
CREATE TYPE tipo_alerta       AS ENUM ('STOCK_MINIMO','STOCK_AGOTADO','VENCIMIENTO','EXCESO_STOCK');

-- ----------------------------------------------------------------
-- 2. TABLAS BASE (sin FK saliente)
-- ----------------------------------------------------------------

-- Categoria de videojuego (Accion, RPG, Deportes, etc.)
CREATE TABLE categoria (
    id_categoria SERIAL      PRIMARY KEY,
    nombre       VARCHAR(60) NOT NULL UNIQUE,
    descripcion  TEXT
);

-- Proveedor / distribuidor
CREATE TABLE proveedor (
    id_proveedor SERIAL       PRIMARY KEY,
    razon_social VARCHAR(120) NOT NULL,
    ruc          VARCHAR(20)  UNIQUE,
    telefono     VARCHAR(20),
    email        VARCHAR(100),
    direccion    TEXT,
    activo       BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Almacen fisico donde se guarda el inventario
CREATE TABLE almacen (
    id_almacen  SERIAL       PRIMARY KEY,
    nombre      VARCHAR(80)  NOT NULL,
    ubicacion   VARCHAR(120) NOT NULL,
    responsable VARCHAR(100),
    activo      BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Usuario del sistema (almacenero, supervisor, etc.)
CREATE TABLE usuario (
    id_usuario    SERIAL       PRIMARY KEY,
    nombre        VARCHAR(60)  NOT NULL,
    apellido      VARCHAR(60)  NOT NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol           rol_usuario  NOT NULL DEFAULT 'ALMACENERO',
    activo        BOOLEAN      NOT NULL DEFAULT TRUE,
    fecha_registro DATE        NOT NULL DEFAULT CURRENT_DATE
);

-- ----------------------------------------------------------------
-- 3. VIDEOJUEGO (depende de categoria)
-- ----------------------------------------------------------------
CREATE TABLE videojuego (
    id_videojuego    SERIAL              PRIMARY KEY,
    titulo           VARCHAR(120)        NOT NULL,
    plataforma       VARCHAR(60)         NOT NULL,
    desarrollador    VARCHAR(100),
    anio_lanzamiento INT                 CHECK (anio_lanzamiento BETWEEN 1970 AND 2100),
    clasificacion    clasificacion_edad  NOT NULL DEFAULT 'TODOS',
    precio_compra    NUMERIC(10,2)       NOT NULL CHECK (precio_compra  >= 0),
    precio_venta     NUMERIC(10,2)       NOT NULL CHECK (precio_venta   >= 0),
    stock_actual     INT                 NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo     INT                 NOT NULL DEFAULT 3,
    stock_maximo     INT                 NOT NULL DEFAULT 100,
    estado           estado_producto     NOT NULL DEFAULT 'ACTIVO',
    id_categoria     INT                 NOT NULL
                         REFERENCES categoria(id_categoria)
                         ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_stock_minmax CHECK (stock_minimo <= stock_maximo)
);

-- ----------------------------------------------------------------
-- 4. STOCK POR ALMACEN (N:M Videojuego - Almacen)
-- ----------------------------------------------------------------
CREATE TABLE stock_almacen (
    id_videojuego      INT  NOT NULL
                           REFERENCES videojuego(id_videojuego)
                           ON DELETE RESTRICT ON UPDATE CASCADE,
    id_almacen         INT  NOT NULL
                           REFERENCES almacen(id_almacen)
                           ON DELETE RESTRICT ON UPDATE CASCADE,
    cantidad           INT  NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
    fecha_actualizacion DATE NOT NULL DEFAULT CURRENT_DATE,
    PRIMARY KEY (id_videojuego, id_almacen)
);

-- ----------------------------------------------------------------
-- 5. MOVIMIENTO DE INVENTARIO
-- ----------------------------------------------------------------
CREATE TABLE movimiento_inventario (
    id_movimiento  SERIAL           PRIMARY KEY,
    tipo           tipo_movimiento  NOT NULL,
    cantidad       INT              NOT NULL CHECK (cantidad > 0),
    fecha          TIMESTAMP        NOT NULL DEFAULT NOW(),
    motivo         TEXT,
    precio_unitario NUMERIC(10,2)   CHECK (precio_unitario >= 0),
    id_videojuego  INT              NOT NULL
                       REFERENCES videojuego(id_videojuego)
                       ON DELETE RESTRICT ON UPDATE CASCADE,
    id_almacen     INT              NOT NULL
                       REFERENCES almacen(id_almacen)
                       ON DELETE RESTRICT ON UPDATE CASCADE,
    id_usuario     INT              NOT NULL
                       REFERENCES usuario(id_usuario)
                       ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ----------------------------------------------------------------
-- 6. ORDEN DE COMPRA  (depende de proveedor y usuario)
-- ----------------------------------------------------------------
CREATE TABLE orden_compra (
    id_orden         SERIAL       PRIMARY KEY,
    fecha_orden      DATE         NOT NULL DEFAULT CURRENT_DATE,
    fecha_esperada   DATE         NOT NULL,
    fecha_recepcion  DATE,
    estado           estado_orden NOT NULL DEFAULT 'BORRADOR',
    total            NUMERIC(10,2) NOT NULL DEFAULT 0,
    id_proveedor     INT          NOT NULL
                         REFERENCES proveedor(id_proveedor)
                         ON DELETE RESTRICT ON UPDATE CASCADE,
    id_usuario       INT          NOT NULL
                         REFERENCES usuario(id_usuario)
                         ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Detalle de lineas dentro de una orden de compra
CREATE TABLE detalle_orden_compra (
    id_orden           INT           NOT NULL
                           REFERENCES orden_compra(id_orden)
                           ON DELETE CASCADE ON UPDATE CASCADE,
    id_videojuego      INT           NOT NULL
                           REFERENCES videojuego(id_videojuego)
                           ON DELETE RESTRICT ON UPDATE CASCADE,
    cantidad_pedida    INT           NOT NULL CHECK (cantidad_pedida > 0),
    cantidad_recibida  INT           NOT NULL DEFAULT 0 CHECK (cantidad_recibida >= 0),
    precio_unitario    NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    PRIMARY KEY (id_orden, id_videojuego)
);

-- ----------------------------------------------------------------
-- 7. ALERTA DE STOCK
-- ----------------------------------------------------------------
CREATE TABLE alerta_stock (
    id_alerta        SERIAL      PRIMARY KEY,
    tipo             tipo_alerta NOT NULL,
    mensaje          TEXT        NOT NULL,
    fecha_generacion TIMESTAMP   NOT NULL DEFAULT NOW(),
    resuelta         BOOLEAN     NOT NULL DEFAULT FALSE,
    id_videojuego    INT         NOT NULL
                         REFERENCES videojuego(id_videojuego)
                         ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----------------------------------------------------------------
-- 8. AJUSTE DE INVENTARIO (correccion manual)
-- ----------------------------------------------------------------
CREATE TABLE ajuste_inventario (
    id_ajuste         SERIAL  PRIMARY KEY,
    motivo            TEXT    NOT NULL,
    fecha             TIMESTAMP NOT NULL DEFAULT NOW(),
    cantidad_anterior INT     NOT NULL,
    cantidad_nueva    INT     NOT NULL CHECK (cantidad_nueva >= 0),
    id_videojuego     INT     NOT NULL
                          REFERENCES videojuego(id_videojuego)
                          ON DELETE RESTRICT ON UPDATE CASCADE,
    id_usuario        INT     NOT NULL
                          REFERENCES usuario(id_usuario)
                          ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ----------------------------------------------------------------
-- 9. INDICES DE RENDIMIENTO
-- ----------------------------------------------------------------
CREATE INDEX idx_vj_categoria      ON videojuego(id_categoria);
CREATE INDEX idx_vj_estado         ON videojuego(estado);
CREATE INDEX idx_vj_titulo         ON videojuego(titulo);
CREATE INDEX idx_vj_stock          ON videojuego(stock_actual);
CREATE INDEX idx_mov_videojuego    ON movimiento_inventario(id_videojuego);
CREATE INDEX idx_mov_almacen       ON movimiento_inventario(id_almacen);
CREATE INDEX idx_mov_fecha         ON movimiento_inventario(fecha);
CREATE INDEX idx_oc_proveedor      ON orden_compra(id_proveedor);
CREATE INDEX idx_oc_estado         ON orden_compra(estado);
CREATE INDEX idx_alerta_videojuego ON alerta_stock(id_videojuego);
CREATE INDEX idx_alerta_resuelta   ON alerta_stock(resuelta);

-- ----------------------------------------------------------------
-- 10. DATOS DE PRUEBA (DML)
-- ----------------------------------------------------------------

INSERT INTO categoria (nombre, descripcion) VALUES
  ('Accion',     'Combate y reflejos rapidos'),
  ('RPG',        'Juegos de rol con historia profunda'),
  ('Deportes',   'Simulaciones deportivas'),
  ('Estrategia', 'Planificacion y gestion de recursos'),
  ('Terror',     'Horror, suspenso y supervivencia');

INSERT INTO proveedor (razon_social, ruc, telefono, email, direccion) VALUES
  ('Sony Interactive Entertainment Peru', '20100012345', '014512300', 'ventas@sony.pe',    'Av. Javier Prado 1234, Lima'),
  ('Distribuidora GameZone SAC',          '20587654321', '016789012', 'pedidos@gzone.com', 'Jr. Union 456, Lima'),
  ('Nintendo Distribuidor Oficial',       '20512398765', '015678901', 'info@nintendo.pe',  'Av. Larco 789, Lima');

INSERT INTO almacen (nombre, ubicacion, responsable) VALUES
  ('Almacen Central',   'Av. Industrial 100, Lima',    'Pedro Huanca'),
  ('Almacen Norte',     'Av. Tupac Amaru 500, Lima',   'Rosa Quispe'),
  ('Almacen Sur',       'Panamericana Sur km 15, Lima', 'Marco Diaz');

INSERT INTO usuario (nombre, apellido, email, password_hash, rol) VALUES
  ('Admin',    'Sistema',  'admin@sgiv.com',     'hash_admin_001',  'ADMINISTRADOR'),
  ('Carlos',   'Paredes',  'c.paredes@sgiv.com', 'hash_alm_002',    'ALMACENERO'),
  ('Lucia',    'Torres',   'l.torres@sgiv.com',  'hash_sup_003',    'SUPERVISOR'),
  ('Roberto',  'Saenz',    'r.saenz@sgiv.com',   'hash_alm_004',    'ALMACENERO'),
  ('Patricia', 'Vega',     'p.vega@sgiv.com',    'hash_aud_005',    'AUDITOR');

INSERT INTO videojuego
  (titulo, plataforma, desarrollador, anio_lanzamiento,
   clasificacion, precio_compra, precio_venta,
   stock_actual, stock_minimo, stock_maximo, estado, id_categoria)
VALUES
  ('God of War Ragnarok',     'PlayStation 5',   'Santa Monica Studio', 2022, 'MADURO', 180.00, 299.90, 25, 5, 80, 'ACTIVO',       1),
  ('Elden Ring',              'PlayStation 5',   'FromSoftware',        2022, 'MADURO', 150.00, 249.90, 18, 5, 60, 'ACTIVO',       2),
  ('FIFA 24',                 'PlayStation 5',   'EA Sports',           2023, 'TODOS',  120.00, 199.90, 40, 8, 120,'ACTIVO',       3),
  ('Civilization VI',         'PC',              '2K Games',            2016, 'TODOS',   80.00, 149.90,  8, 3, 40, 'ACTIVO',       4),
  ('Resident Evil 4 Remake',  'PlayStation 5',   'Capcom',              2023, 'MADURO', 170.00, 279.90, 15, 4, 60, 'ACTIVO',       5),
  ('Zelda Tears of Kingdom',  'Nintendo Switch', 'Nintendo',            2023, 'TODOS',  160.00, 259.90,  2, 5, 50, 'ACTIVO',       2),
  ('Call of Duty MW3',        'Xbox Series X',   'Activision',          2023, 'ADULTOS',140.00, 229.90,  0, 5, 70, 'AGOTADO',      1),
  ('NBA 2K24',                'PlayStation 5',   '2K Sports',           2023, 'TODOS',  110.00, 189.90, 30, 6, 100,'ACTIVO',       3);

INSERT INTO stock_almacen (id_videojuego, id_almacen, cantidad) VALUES
  (1,1,15),(1,2,7),(1,3,3),
  (2,1,10),(2,2,5),(2,3,3),
  (3,1,20),(3,2,12),(3,3,8),
  (4,1,5), (4,2,3),
  (5,1,8), (5,2,4),(5,3,3),
  (6,1,2),
  (8,1,18),(8,2,8),(8,3,4);

INSERT INTO movimiento_inventario
  (tipo, cantidad, motivo, precio_unitario, id_videojuego, id_almacen, id_usuario)
VALUES
  ('ENTRADA',   25, 'Recepcion orden compra OC-001', 180.00, 1, 1, 2),
  ('ENTRADA',   18, 'Recepcion orden compra OC-001', 150.00, 2, 1, 2),
  ('ENTRADA',   40, 'Recepcion orden compra OC-002', 120.00, 3, 1, 4),
  ('SALIDA',     5, 'Venta a cliente minorista',      299.90, 1, 1, 2),
  ('SALIDA',     3, 'Venta a cliente minorista',      249.90, 2, 1, 2),
  ('TRASLADO',   7, 'Traslado a almacen norte',       180.00, 1, 2, 4),
  ('AJUSTE',     2, 'Correccion por conteo fisico',     0.00, 6, 1, 3),
  ('DEVOLUCION', 1, 'Producto defectuoso devuelto',   180.00, 1, 1, 2);

INSERT INTO orden_compra (fecha_esperada, estado, id_proveedor, id_usuario) VALUES
  (CURRENT_DATE + 15, 'APROBADA', 1, 1),
  (CURRENT_DATE + 10, 'ENVIADA',  2, 3),
  (CURRENT_DATE + 20, 'BORRADOR', 3, 1);

INSERT INTO detalle_orden_compra
  (id_orden, id_videojuego, cantidad_pedida, cantidad_recibida, precio_unitario)
VALUES
  (1, 7, 20,  0, 140.00),
  (1, 6, 15,  0, 160.00),
  (2, 3, 30, 30, 120.00),
  (2, 8, 25, 25, 110.00),
  (3, 4, 10,  0,  80.00);

INSERT INTO alerta_stock (tipo, mensaje, id_videojuego) VALUES
  ('STOCK_MINIMO', 'Zelda Tears of Kingdom esta por debajo del stock minimo (2 < 5)', 6),
  ('STOCK_AGOTADO','Call of Duty MW3 sin stock disponible',                           7);

INSERT INTO ajuste_inventario
  (motivo, cantidad_anterior, cantidad_nueva, id_videojuego, id_usuario)
VALUES
  ('Conteo fisico detecta diferencia de 2 unidades',  4, 2, 6, 3),
  ('Producto danado en almacen retirado del sistema', 18, 15, 2, 3);
