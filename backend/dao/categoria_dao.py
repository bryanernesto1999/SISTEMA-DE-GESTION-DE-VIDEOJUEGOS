"""
CLASE CATEGORIADAO

Se comunica con la base de datos para las operaciones CRUD de la tabla categoria."""
from typing import List, Optional, Dict, Any
from dao.connection import get_connection, get_cursor, release_connection
from models.categoria import Categoria

class CategoriaDAO:
    """Clase para interactuar con la base de datos categorias."""
    
    @staticmethod
    def obtener_todas() -> List[Dict]:
        """Obtiene todas las categorias registradas, ordenadas por nombre."""
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute("SELECT id_categoria, nombre,descipcion FROM categoria ORDER BY nombre")
                
                rows = cur.fetchall()
                return [Categoria.from_row(dict(r)).to_dict() for r in rows]
        except Exception as e:
            raise RuntimeError(f"Error al obtener categorias: {e}")
        finally:
            release_connection(conn)
            
    @staticmethod
    def obtener_por_id(id_categoria: int) -> Optional[Dict]:
        """Obtiene una categoria por su id."""
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute(
                    "SELECT id_categoria, nombre, descripcion FROM categoria WHERE id_categoria = %s",
                    (id_categoria,)
                )
                row = cur.fetchone()
                if row is None:
                    return None
                return Categoria.from_row(dict(row)).to_dict()
        except Exception as e:
            raise RuntimeError(f"Error al obtener categoria {id_categoria}: {e}")
        finally:
            release_connection(conn)
            
    @staticmethod
    def crear(datos: Dict[str, Any ]) -> Dict:
        """Crea una nueva categoria. Valida mediante el modelo POO antes de insertar."""
        cat = Categoria(
            id_categoria=0,
            nombre=datos["nombre"],
            descripcion=datos.get("descripcion", ""),
        )
            
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    INSERT INTO categoria (nombre,descripcion)
                    VALUES (%s, %s)
                    RETURNING id_categoria
                """, (cat.get_nombre(), cat.get_descripcion()))
                nuevo_id = cur.fetchone()["id_categoria"]
            conn.commit()
            return CategoriaDAO.obtener_por_id(nuevo_id)
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Error al crear categoria: {e}")
        finally:
            release_connection(conn)    
            
    @staticmethod
    def actualizar(id_categoria: int, datos: Dict[str, Any]) -> Optional[Dict]:
        """Actualiza una categoria existente. Valida mediante el modelo POO antes de actualizar."""
        existente = CategoriaDAO.obtener_por_id(id_categoria)
        if existente is None:
           return None
       
        marged = {**existente, **datos}
        cat = Categoria.from_row(marged)
        if "nombre" in datos:
            cat.set_nombre(datos["nombre"])
        if "descripcion" in datos:
            cat.set_descripcion(datos["descripcion"])
        
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    UPDATE categoria
                    SET nombre = %s, 
                    descripcion = %s
                    WHERE id_categoria = %s
                """, (cat.get_nombre(), cat.get_descripcion(), id_categoria))
            conn.commit()
            return CategoriaDAO.obtener_por_id(id_categoria)
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Error al actualizar categoria {e}")
        finally:
            release_connection(conn)
            
    @staticmethod
    def eliminar(id_categoria: int) -> bool:
        """Elimina una categoria por su id."""
        conn = get_connection()
        try: 
            with get_cursor(conn) as cur:
                cur.execute(
                    "DELETE FROM categoria WHERE id_categoria = %s",
                    (id_categoria,)
                )
                eliminado = cur.rowcount > 0
            conn.commit()
            return eliminado
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Error al eliminar categoria : {e}")
        finally: 
            release_connection(conn)
            
        