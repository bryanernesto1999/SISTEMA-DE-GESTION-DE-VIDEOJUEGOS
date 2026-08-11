# SISTEMA-DE-GESTION-DE-VIDEOJUEGOS
Aqui creare mi sistema de gestion de videojuegos, este permitira mostrar una lista de videojuegos, editar ,eliminar registros y demas
# Guía de Instalación — SGIV (Sistema de Gestión de Inventario de Videojuegos)

Esta guía explica, paso a paso, cómo levantar el proyecto completo (backend + frontend + base de datos) en una máquina nueva, partiendo únicamente del repositorio de GitHub.

## 0. Requisitos previos

Instala esto antes de empezar (si ya los tienes, puedes saltar al paso 1):

| Herramienta | Versión mínima | Verificar instalación |
|---|---|---|
| [Git](https://git-scm.com/downloads) | cualquiera reciente | `git --version` |
| [Python](https://www.python.org/downloads/) | 3.10+ | `python --version` |
| [PostgreSQL](https://www.postgresql.org/download/) | 15+ | `psql --version` |
| [Node.js](https://nodejs.org/) (incluye npm) | 18+ | `node --version` y `npm --version` |

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/<tu-usuario>/SISTEMA-DE-GESTION-DE-VIDEOJUEGOS.git
cd SISTEMA-DE-GESTION-DE-VIDEOJUEGOS
```

---

## 2. Configurar la base de datos PostgreSQL

### 2.1. Crear la base de datos

Abre `psql` (o pgAdmin) y crea la base de datos vacía:

```sql
CREATE DATABASE sgiv_db WITH ENCODING='UTF8';
```

### 2.2. Ejecutar el script DDL + DML

El proyecto incluye el script SQL con la estructura completa (11 tablas, tipos ENUM, índices) y datos de prueba. Ejecútalo completo, de una sola vez, contra `sgiv_db`:

- **Desde pgAdmin:** abre una Query Tool conectada a `sgiv_db`, pega el contenido del script SQL del proyecto, y ejecútalo completo.
- **Desde la terminal:**
  ```bash
  psql -U postgres -d sgiv_db -f ruta/al/script.sql
  ```

Al terminar, confirma que las 11 tablas se crearon:

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
```

Debe listar: `ajuste_inventario`, `alerta_stock`, `almacen`, `categoria`, `detalle_orden_compra`, `movimiento_inventario`, `orden_compra`, `proveedor`, `stock_almacen`, `usuario`, `videojuego`.

### 2.3. Configurar la zona horaria (opcional, recomendado)

El proyecto usa `America/Lima` como zona horaria oficial:

```sql
ALTER DATABASE sgiv_db SET timezone TO 'America/Lima';
```

> Esto solo afecta a conexiones **nuevas** — si tenías una sesión de `psql`/pgAdmin ya abierta, reconéctate para verlo reflejado.

---

## 3. Configurar y levantar el backend (FastAPI)

### 3.1. Crear y activar un entorno virtual

```bash
cd backend
python -m venv venv
```

Activarlo:
- **Windows (PowerShell):** `venv\Scripts\Activate.ps1`
- **Windows (cmd):** `venv\Scripts\activate.bat`
- **macOS/Linux:** `source venv/bin/activate`

Vas a saber que quedó activo porque tu terminal muestra `(venv)` al inicio de la línea.

### 3.2. Instalar las dependencias

```bash
pip install -r requirements.txt
```

Esto instala `fastapi`, `uvicorn`, `psycopg2-binary` y `python-dotenv`.

### 3.3. Configurar la conexión a la base de datos

El backend se conecta a PostgreSQL usando estos valores por defecto (definidos en `dao/connection.py`):

| Variable | Valor por defecto |
|---|---|
| `DB_HOST` | `localhost` |
| `DB_PORT` | `5432` |
| `DB_NAME` | `sgiv_db` |
| `DB_USER` | `postgres` |
| `DB_PASSWORD` | `postgres` |

**Si tu PostgreSQL local usa exactamente estos valores** (usuario `postgres`, contraseña `postgres`, puerto por defecto), **no necesitas hacer nada más** — puedes saltar directo al paso 3.4.

**Si tus credenciales son distintas**, configúralas como variables de entorno del sistema antes de levantar el backend (el proyecto actualmente no carga un archivo `.env` automáticamente, así que deben exportarse en la sesión de terminal):

- **Windows (PowerShell):**
  ```powershell
  $env:DB_USER="tu_usuario"
  $env:DB_PASSWORD="tu_password"
  ```
- **macOS/Linux:**
  ```bash
  export DB_USER=tu_usuario
  export DB_PASSWORD=tu_password
  ```

### 3.4. Levantar el servidor

Desde la carpeta `backend/`, con el entorno virtual activado:

```bash
python -m uvicorn main:app --reload
```

Deberías ver algo como:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

### 3.5. Confirmar que el backend funciona

Abre en el navegador:

```
http://127.0.0.1:8000/docs
```

Debe cargar la documentación interactiva (Swagger UI) con todos los módulos: Categorías, Videojuegos, Proveedores, Almacenes, Usuarios, StockAlmacen, MovimientoInventario.

**Deja esta terminal abierta y corriendo** — el backend debe seguir activo mientras uses el frontend.

---

## 4. Configurar y levantar el frontend (React + Vite)

Abre una **segunda terminal** (deja la del backend corriendo en la primera).

### 4.1. Instalar las dependencias

```bash
cd frontend-react
npm install
```

### 4.2. Levantar el servidor de desarrollo

```bash
npm run dev
```

Vite mostrará algo como:
```
  VITE v8.1.5  ready in 400 ms
  ➜  Local:   http://localhost:5173/
```

### 4.3. Abrir la aplicación

Abre en el navegador:

```
http://localhost:5173
```

Ya deberías ver la interfaz completa del sistema, conectada al backend que dejaste corriendo en la primera terminal.

---

## 5. Resumen — orden de arranque en una máquina ya configurada

Una vez que ya hiciste la instalación completa una primera vez, para volver a levantar el proyecto solo necesitas:

**Terminal 1 (backend):**
```bash
cd backend
venv\Scripts\Activate.ps1   # o el comando de activación correspondiente a tu SO
python -m uvicorn main:app --reload
```

**Terminal 2 (frontend):**
```bash
cd frontend-react
npm run dev
```

Y PostgreSQL debe estar corriendo como servicio en segundo plano (normalmente arranca solo con el sistema operativo tras la instalación).

---

## 6. Solución de problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `uvicorn` no reconocido como comando | El entorno virtual no está activado | Repite el paso 3.1 (activar `venv`) |
| Error de conexión a PostgreSQL al abrir `/docs` o al usar un endpoint | Credenciales incorrectas, o PostgreSQL no está corriendo | Verifica el servicio de PostgreSQL, y revisa `DB_USER`/`DB_PASSWORD` (paso 3.3) |
| El frontend carga pero los datos no aparecen | El backend no está corriendo, o corre en otro puerto | Confirma que `http://127.0.0.1:8000/docs` responde antes de usar el frontend |
| `npm run build` falla por `js/api.js`/`js/ui.js` | Vestigio de una versión anterior del frontend (fuera del árbol de Vite) | No bloquea el build de producción, es solo una advertencia — puede ignorarse |
| Error `relation "videojuego" does not exist` (u otra tabla) | El script DDL no se ejecutó, o se ejecutó parcialmente | Repite el paso 2.2 completo, sobre una base de datos limpia |
