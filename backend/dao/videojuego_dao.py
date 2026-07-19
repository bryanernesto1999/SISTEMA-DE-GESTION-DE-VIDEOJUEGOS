"""
CLASE VIDEOJUEGODAO

Esta clase se comunica con la base de datos.
aqui tabien agrego las ooeraciones CRUD (Crear, Leer, Actualizar y Eliminar) para la tabla videojuegos
"""
from typing import List, Optional, Dict, Any #importo los tipos de datos que voy a usar
from dao.connection import get_connection, release_connection, get_cursor #importo las funciones para conectarme a la base de datos
from models.videojuego import Videojuego #importo la clase Videojuego para poder crear objetos de esta clase        

class VideojuegoDAO:
    """Clase para interactuar con la base de datos de videojuegos. Separa la logica d BD del modelo"""
    
    #obtiene todos los videojuegos registrados en la base de datos ================================
    @staticmethod
    def obtener_todos() -> list[Dict]:
        """Obtiene todos los videojuegos registrados en la base de datos."""
        # Lógica para obtener todos los videojuegos de la base de datos
        conn = get_connection() #obtengo la base de datos
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    SELECT v.*, c.nombre AS nombre_categoria
                    FROM  videojuego v
                    JOIN  categoria c ON c.id_categoria = v.id_categoria
                    ORDER BY v.titulo
                """) #Consutlto todos los videojuegos junto con su categoria
                
                rows = cur.fetchall()   #obtengo todos los registros encontrados
                return [Videojuego.from_row(dict(r)).to_dict()for r in rows] #convierto cada registro en un objeto Videojuego y luego en un diccionario
        except Exception as e: 
            #Muestro un error si ocurre algun problema al obtener los videojuegos 
            raise RuntimeError(f"Error al obtener los videojuegos: {e}")
        finally:  
            release_connection(conn) #cierro la conexion a la base de datos
            
    #obtiene todos los videojuegos registrados en la base de datos por id ================================
    @staticmethod
    def obtener_por_id(id_videojuego: int) -> Optional[Dict]:
        """Obtiene todos los videojuegos por id."""
        conn = get_connection() #obtengo la base de datos
        try:
            with get_cursor(conn) as cur:
                cur.execute("""
                    SELECT v.*, c.nombre AS nombre_categoria
                    FROM  videojuego v
                    JOIN  categoria c ON c.id_categoria = v.id_categoria
                    WHERE v.id_videojuego = %s
                """, (id_videojuego,)) #Consutlto todos los videojuegos junto con su categoria #Consutlto todos los videojuegos junto con su categoria 
                row = cur.fetchone() #obtengo todos los registros encontrados
                if row is None:
                   return None
                return Videojuego.from_row(dict(row)).to_dict() #convierto cada registro en un objeto Videojuego y luego en un diccionario
        except Exception as e: 
            #Muestro un error si ocurre algun problema al obtener los videojuegos 
            raise RuntimeError(f"Error al obtener videojuegos{id_videojuego}: {e}")
        finally:
            release_connection(conn) #cierro la conexion a la base de datos


    #agrega un nuevo videojeugo a la base de datos ============================================
    @staticmethod
    def crear(datos: Dict[str, Any]) -> Dict:
        """
        Crea un nuevo juego.
        valida mediante setters del modelo POO antes de insertar.
        """
        vj = Videojuego(
            id_videojuego    = 0,
            titulo           = datos["titulo"],
            plataforma       = datos["plataforma"],
            desarrollador    = datos.get("desarrollador", ""),
            anio_lanzamiento = int(datos.get("anio_lanzamiento", 2000)),
            clasificacion    = datos.get("clasificacion", "TODOS"),
            precio_compra    = float(datos["precio_compra"]),
            precio_venta     = float(datos["precio_venta"]),
            stock_actual     = int(datos.get("stock_actual", 0)),
            stock_minimo     = int(datos.get("stock_minimo", 3)),
            stock_maximo     = int(datos.get("stock_maximo", 100)),
            estado           = datos.get("estado", "ACTIVO"),
            id_categoria     = int(datos["id_categoria"]),
        )
    #aqui se aplican los setters para ejecutar todas las validaciones 
        vj.set_titulo(datos["titulo"])
        vj.set_plataforma(datos["plataforma"])
        vj.set_precio_compra(float(datos["precio_compra"]))
        vj.set_precio_venta(float(datos["precio_venta"]))
        vj.set_clasificacion(datos.get("clasificacion", "TODOS"))
        vj.set_estado(datos.get("estado", "ACTIVO"))
    
        conn = get_connection()  # Me conecto a la base de datos
        try:
            with get_cursor(conn) as cur: # Inserto el nuevo videojuego
                cur.execute("""
                    INSERT INTO videojuego
                       (titulo, plataforma, desarrollador, anio_lanzamiento,
                       clasificacion, precio_compra, precio_venta,
                       stock_actual, stock_minimo, stock_maximo,
                       estado, id_categoria)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    RUTERNING id_videojuego
                """, (
                    vj.get_titulo(),
                    vj.get_plataforma(),
                    vj.get_desarrollador(),
                    vj.get_anio_lanzamiento(),
                    vj.get_clasificacion(),
                    vj.get_precio_compra(),
                    vj.get_precio_venta(),
                    vj.get_stock_actual(),
                    vj.get_stock_minimo(),
                    vj.get_stock_maximo(),
                    vj.get_estado(),
                    vj.get_id_categoria(),
                ))
                nuevo_id = cur.fetchone()["id_videojuego"]
            conn.commit() # Guardo los cambios
            return VideojuegoDAO.obtener_por_id(nuevo_id)
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Error al crear videojuego {e}") 
    # Devuelvo el videojuego recién creado
        finally:
            release_connection(conn)

#Aqui se actualiza la inforarmacion de un juego 
    @staticmethod
    def actualizar(id_videojuego: int, datos: Dict[str, Any]) -> Optional[Dict]:
        """Actualiza solo los campos enviados (PATCH- like)."""
        existente = VideojuegoDAO.obtener_por_id(id_videojuego)# Primero verifico si el videojuego existe
        if existente is None: 
    # Si no existe retorno None
            return None
        
        #Mezcla los datos existentes con los nuevos
        marged = {**existente, **datos}   # Uno los datos antiguos con los nuevos
        #valida con el modelo 
        vj = Videojuego.from_row(marged) # Creo el objeto para validar la información
        if "titulo"           in datos: vj.set_titulo(datos["titulo"])
        if "plataforma"       in datos: vj.set_plataforma(datos["plataforma"])
        if "desarrollador"    in datos: vj.set_desarrollador(datos["desarrollador"])
        if "anio_lanzamiento" in datos: vj.set_anio_lanzamiento(int(datos["anio_lanzamiento"]))
        if "clasificacion"    in datos: vj.set_clasificacion(datos["clasificacion"])
        if "precio_compra"    in datos: vj.set_precio_compra(float(datos["precio_compra"]))
        if "precio_venta"     in datos: vj.set_precio_venta(float(datos["precio_venta"]))
        if "stock_actual"     in datos: vj.set_stock_actual(int(datos["stock_actual"]))
        if "stock_minimo"     in datos: vj.set_stock_minimo(int(datos["stock_minimo"]))
        if "stock_maximo"     in datos: vj.set_stock_maximo(int(datos["stock_maximo"]))
        if "estado"           in datos: vj.set_estado(datos["estado"])
        if "id_categoria"     in datos: vj.set_id_categoria(int(datos["id_categoria"]))           
         # Valido únicamente los campos modificados
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                 # Actualizo el registro en la base de datos
                cur.execute("""
                    UPDATE videojuego SET
                        titulo           = %s,
                        plataforma       = %s,
                        desarrollador    = %s,
                        anio_lanzamiento = %s,
                        clasificacion    = %s,
                        precio_compra    = %s,
                        precio_venta     = %s,
                        stock_actual     = %s,
                        stock_minimo     = %s,
                        stock_maximo     = %s,
                        estado           = %s,
                        id_categoria     = %s
                    WHERE id_videojuego = %s
                """, (
                    vj.get_titulo(),
                    vj.get_plataforma(),
                    vj.get_desarrollador(),
                    vj.get_anio_lanzamiento(),
                    vj.get_clasificacion(),
                    vj.get_precio_compra(),
                    vj.get_precio_venta(),
                    vj.get_stock_actual(),
                    vj.get_stock_minimo(),
                    vj.get_stock_maximo(),
                    vj.get_estado(),
                    vj.get_id_categoria(),
                    id_videojuego,
                )) 
            conn.commit() # Guardo los cambios
            # Retorno el videojuego actualizado
            return VideojuegoDAO.obtener_por_id(id_videojuego)
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Error al actualizar videojuego: {e}")
        finally:
            release_connection(conn)
            
       #aqui se crea la funcion actualizar stock===============================
    @staticmethod
    def actualizar_stock(id_videojuego: int, cantidad: int) -> Optional[Dict]: 
        """Suma o resta stock  si queda negativo lanza ValueError .
        tambien actualiza el estado a AGOTADO si stock llega a 0"""
        
        existente = VideojuegoDAO.obtener_por_id(id_videojuego) # Busco el videojuego
        if existente is None:
            return None
        
        nuevo_stock = existente["stok_actual"] + cantidad # Calculo el nuevo stock
        if nuevo_stock < 0:
            raise ValueError(
                f"Stock insuficiente, Stock actual: {existente['stock_actual']},  "
                f"se intento reducir en {abs(cantidad)}."
            )
                # Si el stock llega a cero cambia el estado a AGOTADO
        nuevo_estado = "AGOTADO" if nuevo_stock == 0 else existente["estado"]
        if existente["estado"] =="AGOTADO" and nuevo_stock > 0:
            nuevo_estado = "ACTIVO"
            
        conn = get_connection
        try:
            with get_cursor(conn) as cur:
                # Actualizo el stock en la base de datos
                cur.execute(""" 
                    UPDATE videojuego
                    SET stock_actual = %s, estado = %s
                    WHERE id_videojuego = %s
                """, (nuevo_stock, nuevo_estado, id_videojuego))
            conn.commit() # Guardo los cambios
             # Devuelvo el registro actualizado
            return VideojuegoDAO.obtener_por_id(id_videojuego)
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Error al actualizar stock: {e}")
        finally:
            release_connection(conn)
            
    #AAqui se crea la funcion de eleminar por id-========================================
    @staticmethod 
    def eliminar(id_videojuego: int) -> bool:
        conn = get_connection() # Me conecto a la base de datos
        try:
            with get_cursor(conn) as cur:
                cur.execute(
                    "DELETE FROM videojuego WHERE id_videojuego = %s",
                    (id_videojuego,)
                )
                eliminado = cur.rowcount > 0  # Verifico si realmente se eliminó
            conn.commit() # Guardo los cambios
            return eliminado # Retorno True o False
        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"Error al eliminar videojuego {e}")
        finally:
            release_connection
            
    # ── obtiene todas las categorias registradas ───────────────────────────────────────────────────
    @staticmethod
    def obtener_categorias() -> List[Dict]:
        conn = get_connection()
        try:
            with get_cursor(conn) as cur:
                # Consulto las categorías ordenadas por nombre
                cur.execute("SELECT id_categoria, nombre FROM categoria ORDER BY nombre")
                return [dict(r) for r in cur.fetchall()] # Devuelvo la lista de categorías
        except Exception as e:
            raise RuntimeError(f"Error al obtener categorias: {e}")
        finally:
            release_connection(conn)
            
    # Obtiene las alertas de stock pendientes
    @staticmethod
    def obtener_alertas() -> List[Dict]:
        conn = get_connection()
        try:
            with get_cursor(conn) as cur: # Consulto las alertas que aún no fueron resueltas
                cur.execute("""
                    SELECT a.*, v.titulo
                    FROM   alerta_stock a
                    JOIN   videojuego   v ON v.id_videojuego = a.id_videojuego
                    WHERE  a.resuelta = FALSE
                    ORDER  BY a.fecha_generacion DESC
                """)
                return [dict(r) for r in cur.fetchall()]    # Devuelvo la lista de alertas
        except Exception as e:
            raise RuntimeError(f"Error al obtener alertas: {e}")
        finally:
            release_connection(conn)                  
               
         
                   