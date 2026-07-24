"""
Conexion a la base de datos PostgreSQL (sgiv_db).
Usa psycopg2 con un pool simple de conexiones.
"""
import os
import psycopg2
import psycopg2.extras
from psycopg2 import pool

# Lee las variables de entorno o usa valores por defecto
DB_CONFIG = {
    "host":     os.getenv("DB_HOST",     "localhost"),
    "port":     int(os.getenv("DB_PORT", "5432")),
    "dbname":   os.getenv("DB_NAME",     "sgiv_db"),
    "user":     os.getenv("DB_USER",     "postgres"),
    "password": os.getenv("DB_PASSWORD", "postgres"), # contrase;a
}

# Pool de conexiones (min 1, max 10)
_pool: pool.SimpleConnectionPool | None = None


def get_pool() -> pool.SimpleConnectionPool:
    """Inicializa y retorna el pool de conexiones (singleton)."""
    global _pool
    if _pool is None:
        try:
            _pool = pool.SimpleConnectionPool(1, 10, **DB_CONFIG)
        except psycopg2.OperationalError as e:
            raise RuntimeError(f"No se pudo conectar a PostgreSQL: {e}")
    return _pool


def get_connection():
    """Obtiene una conexion del pool."""
    return get_pool().getconn()


def release_connection(conn):
    """Devuelve la conexion al pool."""
    get_pool().putconn(conn)


def get_cursor(conn):
    """Retorna un cursor que devuelve filas como diccionarios."""
    return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
