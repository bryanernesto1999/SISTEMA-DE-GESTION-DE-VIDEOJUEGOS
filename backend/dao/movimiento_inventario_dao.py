"""
CLASE MOVIMIENTOINVENTARIODAO

Se comunica con la base de datos para las operaciones de la tabla
movimiento_inventario. Sigue el mismo patron DAO ya verificado en los 
modulos anteriores, con dos particularidades propias de este modulo:

- No existe actualizar(): movimiento_inventario es un registro de 
historial/auditoria , no se edita movimiviento pasado, se corrige con 
un movimiento nuevo.
"""

from typing import List, Optional, Dict, Any
import psycopg2
from dao.connection import get_connection, release_connection, get_cursor
from models.movimiento_inventario import MovimientoInventario

class MovimientoInventarioDAO:
    """Clase para interactuar con la base de datos de movimientos de inventario."""
    
    @staticmethod
    def obtener_todos() -> List[Dict]:
        """Obtiene todos los movimiento registrados, mas recientes primero."""
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    SELECT id_movimiento, tipo, cantidad, fecha, motivo,
                    precio_unitario, id_videojuego, id_almacen, id_usuario
                FROM movimiento_inventario
                ORDER BY fecha DESC
                """)
                rows = cur.fetchall()
                return[MovimientoInventario.from_row(dict(r)).to_dict() for r in rows]
        except Exception as e:
            raise RuntimeError(f"Error al obtener los movimientos de inventario: {e}")
        finally:
            release_connection(conn)
            
    @staticmethod
    def obtener_por_id(id_movimiento: int) -> Optional[Dict]:
        """Obtiene un movimiento por su id."""
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    SELECT id_movimiento, tipo, cantidad, fecha, motivo,
                        precio_unitario, id_videojuego, id_almacen, id_usuario
                    FROM movimiento_inventario
                    WHERE id_movimiento = %s
                """, (id_movimiento,))
                row = cur.fetchone()
                if row is None:
                    return None
                return MovimientoInventario.from_row(dict(row)).to_dict()
        except Exception as e:
            raise RuntimeError(f"Error al obtener el movimiento {id_movimiento}: {e}")
        finally:
            release_connection(conn)
                
    @staticmethod
    def crear(datos: Dict[str, Any]) -> Dict:
        """Crea un nuevo movimiento de inventario.
        No incluye 'fecha': la asigna PostgreSQL con DEFAULT NOW().
        No modifica stock_almacen.
        """
        mov = MovimientoInventario(
            id_movimiento=0,
            tipo=datos["tipo"],
            cantidad=datos["cantidad"],
            id_videojuego=datos["id_videojuego"],
            id_almacen=datos["id_almacen"],
            id_usuario=datos["id_usuario"],
            motivo=datos.get("motivo", ""),
            precio_unitario=datos.get("precio_unitario"),
        )
 
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    INSERT INTO movimiento_inventario
                        (tipo, cantidad, motivo, precio_unitario,
                         id_videojuego, id_almacen, id_usuario)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id_movimiento
                """, (
                    mov.get_tipo(),
                    mov.get_cantidad(),
                    mov.get_motivo() or None,
                    mov.get_precio_unitario(),
                    mov.get_id_videojuego(),
                    mov.get_id_almacen(),
                    mov.get_id_usuario(),
                ))
                nuevo_id = cur.fetchone()["id_movimiento"]
            conn.commit()
            return MovimientoInventarioDAO.obtener_por_id(nuevo_id)
        except psycopg2.errors.ForeignKeyViolation:
            conn.rollback()
            raise ValueError(
                "El videojuego, el almacén o el usuario indicado no existe."
            )
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Error al crear el movimiento de inventario: {e}")
        finally:
            release_connection(conn)
 
    @staticmethod
    def eliminar(id_movimiento: int) -> bool:
        """Elimina un movimiento por su id."""
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute(
                    "DELETE FROM movimiento_inventario WHERE id_movimiento = %s",
                    (id_movimiento,)
                )
                eliminado = cur.rowcount > 0
            conn.commit()
            return eliminado
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Error al eliminar el movimiento de inventario: {e}")
        finally:
            release_connection(conn)
   
            