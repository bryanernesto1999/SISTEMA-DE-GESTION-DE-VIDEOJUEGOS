"""
CLASE PROVEEDOR_DAO

se comunica con la base de datos para las operaciones CRUD  de la tabla proveedor.

"""
from typing import List, Optional, Dict, Any #esta importación es para poder usar tipos de datos más específicos en las funciones, como List, Optional, Dict y Any.
import psycopg2
from dao.connection import get_connection, release_connection, get_cursor
from models.proveedor import Proveedor 

class ProveedorDAO:
    """Clase paa interactuar con la base de datos de proveedores."""
    
    @staticmethod
    def obtener_todos() -> List[Dict]:
        """Obtiene todos los proveedores registrados, ordenados por la razon_social."""
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    SELECT id_proveedor, razon_social, ruc, telefono, email, direccion, activo
                    FROM proveedor
                    ORDER BY razon_social
                """)
                rows = cur.fetchall()
                return [Proveedor.from_row(dict(r)).to_dict() for r in rows]
        except Exception as e:
            raise RuntimeError(f"Error al obtener proveedores: {e}") 
        finally:
            release_connection(conn)
            
    @staticmethod
    def obtener_por_id(id_proveedor: int) -> Optional[Dict]:
        """Obtiene un proveedor por id"""
        conn = get_connection
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    SELECT id_proveedor, razon_social, ruc, telefono, email, direccion, activo
                    FROM proveedor
                    WHERE id_proveedor = %s
                """, (id_proveedor,))
                row = cur.fetchone()
                if row is None:
                    return None
                return Proveedor.from_row(dict(row)).to_dict()
        except Exception as e:
            raise RuntimeError(f"Error al obtener proveedor {id_proveedor}: {e}")
        finally:
            release_connection(conn)
    
    @staticmethod
    def crear(datos: Dict[str, Any]) -> Dict:
        """Crea un nuevo proveedor. Valida mediante el modelo POO antes de insertar."""
        prov = Proveedor(
            id_proveedor=0,
            razon_social=datos["razon_social"],
            ruc=datos.get("ruc", ""),
            telefono=datos.get("telefono", ""),
            email=datos.get("email", ""),
            direccion=datos.get("direccion", ""),
            activo=datos.get("activo", True),
        )
        
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    INSERT INTO proveedor (razon_social, ruc, telefono, email, direccion, activo)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id_proveedor
                """, ( 
                    prov.get_razon_social(),
                    prov.get_ruc() or None,       # cadena vacía -> NULL (ruc es opcional/UNIQUE)
                    prov.get_telefono() or None,
                    prov.get_email() or None,
                    prov.get_direccion() or None,
                    prov.get_activo(),
                ))
                nuevo_id = cur.fetchone()["id_proveedor"]
            conn.commit()
            return ProveedorDAO.obtener_por_id(nuevo_id)
        except psycopg2.errors.UniqueViolation:
            conn.rollback()
            raise ValueError(f"Ya existe un proveedor registrado con el RUC '{datos.get('ruc')}'.")
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Error al crear proveedor: {e}")
        finally:
            release_connection(conn)
            
    @staticmethod
    def actualizar(id_proveedor: int, datos: Dict[str, Any]) -> Optional[Dict]:
        """Actualiza solo los campos enviados (PATCH-like)."""
        existente = ProveedorDAO.obtener_por_id(id_proveedor)
        if existente is None:
            return None
 
        merged = {**existente, **datos}
        prov = Proveedor.from_row(merged)
        if "razon_social" in datos:
            prov.set_razon_social(datos["razon_social"])
        if "ruc" in datos:
            prov.set_ruc(datos["ruc"])
        if "telefono" in datos:
            prov.set_telefono(datos["telefono"])
        if "email" in datos:
            prov.set_email(datos["email"])
        if "direccion" in datos:
            prov.set_direccion(datos["direccion"])
        if "activo" in datos:
            prov.set_activo(datos["activo"])
 
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    UPDATE proveedor SET
                        razon_social = %s,
                        ruc = %s,
                        telefono = %s,
                        email = %s,
                        direccion = %s,
                        activo = %s
                    WHERE id_proveedor = %s
                """, (
                    prov.get_razon_social(),
                    prov.get_ruc() or None,
                    prov.get_telefono() or None,
                    prov.get_email() or None,
                    prov.get_direccion() or None,
                    prov.get_activo(),
                    id_proveedor,
                ))
            conn.commit()
            return ProveedorDAO.obtener_por_id(id_proveedor)
        except psycopg2.errors.UniqueViolation:
            conn.rollback()
            raise ValueError(f"Ya existe un proveedor registrado con el RUC '{datos.get('ruc')}'.")
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Error al actualizar proveedor: {e}")
        finally:
            release_connection(conn)     
            
    @staticmethod
    def eliminar(id_proveedor: int) -> bool:
        """Elimina un proveedor por su id."""
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute(
                    "DELETE FROM proveedor WHERE id_proveedor = %s",
                    (id_proveedor,)
                )    
                eliminado = cur.rowcount > 0
            conn.commit()
            return eliminado
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Error al eliminar proveedor: {e}")
        finally:
            release_connection(conn) 
               
                          
          