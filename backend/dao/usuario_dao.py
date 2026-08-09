"""
CLASE USUARIODAO

se comunica con la base de datos para las operaciones CRUD de la tabla usuario.
NOTA: password_hash se guarda tal cual llega ( sin hashing real). el hashing , login , jwt y control 
de acceso quedan en la fase de autentificacion, aun no lo implementare en este proyecto.
"""
from typing import List, Optional, Dict, Any
import psycopg2
from dao.connection import get_connection, release_connection, get_cursor
from models.usuario import Usuario

class UsuarioDAO:
    """Clase para interactuar con la base de datos de usuarios."""
    
    @staticmethod
    def obtener_todos() -> List[Dict]:
        """Obtiene todos los usuarios registrados, ordenados por apellido/nombre"""
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    SELECT id_usuario, nombre, apellido, email, password_hash,
                           rol, activo, fecha_registro
                    FROM usuario
                    ORDER BY apellido, nombre
                """)
                rows = cur.fetchall()
                return [Usuario.from_row(dict(r)).to_dict() for r in rows]
        except Exception as e:
            raise RuntimeError(f"Error al obtener usuarios: {e}")
        finally:
            release_connection(conn)
    
    @staticmethod
    def obtener_por_id(id_usuario: int) -> Optional[Dict]:
        """Obtiene un usuario por su id."""
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    SELECT id_usuario, nombre, apellido, email, password_hash,
                            rol, activo, fecha_registro
                    FROM usuario
                    WHERE id_usuario = %s
                """, (id_usuario,))
                row = cur.fetchone()
                if row is None:
                    return None
                return Usuario.from_row(dict(row)).to_dict()
        except Exception as e:
            raise RuntimeError(f"Error al obtener usuario {id_usuario}: {e}")
        finally:
            release_connection(conn)
            
    @staticmethod
    def crear(datos: Dict[str, Any]) -> Dict:
        """
        Crea un nuevo usuario Valida mediante el modelo POO antes de insertar.
        No incluye fecha_registro: la asisgna PostgresSQL con DEFAULT CURRENT_DATE.
        """
        usr= Usuario(
            id_usuario=0,
            nombre=datos["nombre"],
            apellido=datos["apellido"],
            email=datos["email"],
            password_hash=datos["password_hash"],
            rol=datos.get("rol", "ALMACENERO"),
            activo=datos.get("activo", True),
        )
        
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    INSERT INTO usuario (nombre, apellido, email, password_hash, rol, activo)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id_usuario
                """, (
                    usr.get_nombre(),
                    usr.get_apellido(),
                    usr.get_email(),
                    usr.get_password_hash(),
                    usr.get_rol(),
                    usr.get_activo(),
                ))
                nuevo_id = cur.fetchone()["id_usuario"]
            conn.commit()
            return UsuarioDAO.obtener_por_id(nuevo_id)
        except psycopg2.errors.UniqueViolation:
            conn.rollback()
            raise ValueError(f"Ya existe un usuario registrado con el correo '{datos.get('email')}'.")
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Error al crear Usuario: {e}")
        finally:
            release_connection(conn)
    
    @staticmethod
    def actualizar(id_usuario: int, datos: Dict[str, Any]) -> Optional[Dict]:
        """Actualiza solo los campos enviados (PACH - like).
        fecha_registro Nunca se actualiza: No existe set_fecha_registro()
        en el modelo, y esta columna no se incluye en el UPDATE.
        """
        existente = UsuarioDAO.obtener_por_id(id_usuario)
        if existente is None:
           return None
       
        merged = {**existente, **datos}
        usr= Usuario.from_row(merged)
        if "nombre" in datos:
            usr.set_nombre(datos["nombre"])
        if "apellido" in datos:
            usr.set_apellido(datos["apellido"])
        if "email" in datos:
            usr.set_email(datos["email"])
        if "password_hash" in datos:
            usr.set_password_hash(datos["password_hash"])
        if "rol" in datos:
            usr.set_rol(datos["rol"])
        if "activo" in datos:
            usr.set_activo(datos["activo"])
            
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    UPDATE usuario SET
                        nombre = %s,
                        apellido = %s,
                        email = %s,
                        password_hash = %s,
                        rol = %s,
                        activo = %s
                    WHERE id_usuario = %s
                """, (
                    usr.get_nombre(),
                    usr.get_apellido(),
                    usr.get_email(),
                    usr.get_password_hash(),
                    usr.get_rol(),
                    usr.get_activo(),
                    id_usuario,
                ))
            conn.commit()
            return UsuarioDAO.obtener_por_id(id_usuario)
        except psycopg2.errors.UniqueViolation:
            conn.rollback()
            raise ValueError(f"Ya existe un usuario registrado con el correo '{datos.get('email')}'.")
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Error al actualizar usuario: {e}")
        finally:
            release_connection(conn)
 
    @staticmethod
    def eliminar(id_usuario: int) -> bool:
        """Elimina un usuario por su id."""
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                cur.execute(
                    "DELETE FROM usuario WHERE id_usuario = %s",
                    (id_usuario,)
                )
                eliminado = cur.rowcount > 0
            conn.commit()
            return eliminado
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Error al eliminar usuario: {e}")
        finally:
            release_connection(conn)