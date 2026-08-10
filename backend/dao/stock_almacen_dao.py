"""
CLASE STOCKALMACENDAO

Se comunica con la base de datos para las operaciones CRUD de la tabla
stock_almacen, que tiene clave primaria compuesta (id_videojuego, id_almacen).

Sigue el mismo patron DAO ya verificado en los modulos anteriores, con
dos particularidades propias de esta tabla:

1. No existe un id simple: se usa obtener_por_clave(id_videojuego, id_almacen)
   en vez de obtener_por_id(id).
2. fecha_actualizacion se asigna explicitamente en cada UPDATE de cantidad,
   ya que el DEFAULT CURRENT_DATE del DDL solo aplica en el INSERT.
"""
from typing import List, Optional, Dict, Any
import psycopg2
from dao.connection import get_connection, release_connection, get_cursor
from models.stock_almacen import StockAlmacen


class StockAlmacenDAO:
    """Clase para interactuar con la base de datos de stock por almacen."""

    @staticmethod
    def obtener_todos() -> List[Dict]:
        """Obtiene todos los registros de stock por almacen."""
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    SELECT id_videojuego, id_almacen, cantidad, fecha_actualizacion
                    FROM stock_almacen
                    ORDER BY id_videojuego, id_almacen
                """)
                rows = cur.fetchall()
                return [StockAlmacen.from_row(dict(r)).to_dict() for r in rows]
        except Exception as e:
            raise RuntimeError(f"Error al obtener el stock por almacén: {e}")
        finally:
            release_connection(conn)

    @staticmethod
    def obtener_por_clave(id_videojuego: int, id_almacen: int) -> Optional[Dict]:
        """Obtiene un registro de stock por su clave compuesta."""
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    SELECT id_videojuego, id_almacen, cantidad, fecha_actualizacion
                    FROM stock_almacen
                    WHERE id_videojuego = %s AND id_almacen = %s
                """, (id_videojuego, id_almacen))
                row = cur.fetchone()
                if row is None:
                    return None
                return StockAlmacen.from_row(dict(row)).to_dict()
        except Exception as e:
            raise RuntimeError(
                f"Error al obtener el stock del videojuego {id_videojuego} "
                f"en el almacén {id_almacen}: {e}"
            )
        finally:
            release_connection(conn)

    @staticmethod
    def obtener_total_por_videojuego(id_videojuego: int) -> int:
        """
        Suma la cantidad de un videojuego en todos los almacenes.
        Sera usado por el modulo Videojuego para calcular stock_actual
        como valor derivado (paso posterior, aun no implementado).
        """
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    SELECT COALESCE(SUM(cantidad), 0) AS total
                    FROM stock_almacen
                    WHERE id_videojuego = %s
                """, (id_videojuego,))
                return cur.fetchone()["total"]
        except Exception as e:
            raise RuntimeError(
                f"Error al calcular el stock total del videojuego {id_videojuego}: {e}"
            )
        finally:
            release_connection(conn)

    @staticmethod
    def crear(datos: Dict[str, Any]) -> Dict:
        """
        Crea un nuevo registro de stock para un (videojuego, almacen).
        Si ya existe un registro para esa clave compuesta, PostgreSQL
        rechaza el INSERT por violacion de PRIMARY KEY (UniqueViolation).
        Si el videojuego o el almacen no existen, rechaza por violacion
        de FOREIGN KEY (ForeignKeyViolation).
        """
        stock = StockAlmacen(
            id_videojuego=datos["id_videojuego"],
            id_almacen=datos["id_almacen"],
            cantidad=datos.get("cantidad", 0),
        )

        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    INSERT INTO stock_almacen (id_videojuego, id_almacen, cantidad)
                    VALUES (%s, %s, %s)
                """, (
                    stock.get_id_videojuego(),
                    stock.get_id_almacen(),
                    stock.get_cantidad(),
                ))
            conn.commit()
            return StockAlmacenDAO.obtener_por_clave(
                stock.get_id_videojuego(), stock.get_id_almacen()
            )
        except psycopg2.errors.UniqueViolation:
            conn.rollback()
            raise ValueError(
                f"Ya existe un registro de stock para el videojuego "
                f"{datos.get('id_videojuego')} en el almacén {datos.get('id_almacen')}."
            )
        except psycopg2.errors.ForeignKeyViolation:
            conn.rollback()
            raise ValueError(
                "El videojuego o el almacén indicado no existe."
            )
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Error al crear el registro de stock: {e}")
        finally:
            release_connection(conn)

    @staticmethod
    def actualizar(id_videojuego: int, id_almacen: int, datos: Dict[str, Any]) -> Optional[Dict]:
        """
        Actualiza unicamente la cantidad de un registro de stock existente.
        fecha_actualizacion se asigna explicitamente a CURRENT_DATE en este
        UPDATE, ya que el DEFAULT del DDL no se reaplica automaticamente
        en actualizaciones posteriores al INSERT.
        """
        existente = StockAlmacenDAO.obtener_por_clave(id_videojuego, id_almacen)
        if existente is None:
            return None

        stock = StockAlmacen.from_row(existente)
        if "cantidad" in datos:
            stock.set_cantidad(datos["cantidad"])

        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    UPDATE stock_almacen SET
                        cantidad = %s,
                        fecha_actualizacion = CURRENT_DATE
                    WHERE id_videojuego = %s AND id_almacen = %s
                """, (
                    stock.get_cantidad(),
                    id_videojuego,
                    id_almacen,
                ))
            conn.commit()
            return StockAlmacenDAO.obtener_por_clave(id_videojuego, id_almacen)
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Error al actualizar el registro de stock: {e}")
        finally:
            release_connection(conn)

    @staticmethod
    def eliminar(id_videojuego: int, id_almacen: int) -> bool:
        """Elimina un registro de stock por su clave compuesta."""
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute(
                    "DELETE FROM stock_almacen WHERE id_videojuego = %s AND id_almacen = %s",
                    (id_videojuego, id_almacen)
                )
                eliminado = cur.rowcount > 0
            conn.commit()
            return eliminado
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Error al eliminar el registro de stock: {e}")
        finally:
            release_connection(conn)