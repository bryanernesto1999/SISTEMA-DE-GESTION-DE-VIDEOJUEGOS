"""ALMACEN DAO
Se comunica con la base de datos para las operaciones CRUD de la tabla almacen.
"""
from typing import List, Optional, Dict, Any
from dao.connection import get_connection, release_connection, get_cursor
from models.almacen import Almacen

class AlmacenDAO:
    """Clase para interactuar con la base de datos de almacenes."""
    
    @staticmethod
    def obtener_todos() -> List[dict]:
        """Obtiene todos los almacenes registrados, ordenados por nombre."""
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    SELECT id_almacen, nombre, ubicacion, responsable, activo
                    FROM almacen
                    ORDER BY nombre
                """)
                rows = cur.fetchall()
                return [Almacen.from_row(dict(r)).to_dict() for r in rows]
        except Exception as e:
            raise RuntimeError(f"Error al obtener almacenes: {e}")
        finally:
            release_connection(conn)
            
    @staticmethod
    def crear(datos: Dict[str, Any]) -> Dict:
        """Crea un nuevo almacen. Valida mediante el modelo POO antes de insertar."""
        alm = Almacen(
            id_almacen=0,
            nombre=datos["nombre"],
            ubicacion=datos["ubicacion"],
            responsable=datos.get("responsable", ""),
            activo=datos.get("activo", True),
        )
        
        
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    INSERT INTO almacen (nombre, ubicacion, responsable, activo)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id_almacen
                """, (
                    alm.get_nombre(),
                    alm.get_ubicacion(),
                    alm.get_responsable() or None,
                    alm.get_activo(),
                ))
                nuevo_id = cur.fetchone()["id_almacen"]
            conn.commit()
            return AlmacenDAO.obtener_por_id(nuevo_id)
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Error al crear almacen: {e}")
        finally:
            release_connection(conn)
            
    @staticmethod
    def actualizar(id_almacen: int, datos: Dict[str, Any]) -> Optional[Dict]:
        """Actualiza solo los campos enviados"""
        existente = AlmacenDAO.obtener_por_id(id_almacen)
        if existente is None:
            return None
        
        merged = {**existente, **datos}
        alm = Almacen.from_row(merged)
        if "nombre" in datos:
            alm.set_nombre(datos["nombre"])
        if "ubicacion" in datos:
            alm.set_ubicacion(datos["ubicacion"])
        if "responsable" in datos:
            alm.set_responsable(datos["responsable"])
        if "activo" in datos:
            alm.set_activo(datos["activo"])
          
            
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    UPDATE almacen SET
                        nombre = %s,
                        ubicacion = %s,
                        responsable = %s,
                        activo = %s
                    WHERE id_almacen = %s
                """, (
                    alm.get_nombre(),
                    alm.get_ubicacion(),
                    alm.get_responsable() or None,
                    alm.get_activo(),
                    id_almacen,
                ))
            conn.commit()
            return AlmacenDAO.obtener_por_id(id_almacen)
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Error al actualizar almacen: {e}")
        finally:
            release_connection(conn)
                    
    @staticmethod
    def eliminar(id_almacen: int) -> bool:
        """Elimina un almacen por su id."""
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute(
                    "DELETE FROM almacen WHERE id_almacen = %s",
                    (id_almacen,)
                )
                eliminado = cur.rowcount > 0
            conn.commit()
            return eliminado
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Error al eliminar almacen: {e}")
        finally:
            release_connection(conn)
            
            