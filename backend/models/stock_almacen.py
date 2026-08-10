"""
Clase StockAlmacen

Representa la cantidad de un videojuego disponible en un almacen
especifico (relacion N:M entre Videojuego y Almacen).

Segun el DDL v2:
- id_videojuego + id_almacen forman la clave primaria compuesta:
no tienen setter, son inmutables una vez creado el objeto.
-cantidad es obligatoria, entera, >= 0 (CHECK del DDL), DEFAULT 0.
-fecha_actualizacion es asignada por la apliacion (Ver DAO) cada vez
que cambia la cantidad, ya que el DEFAULT CURRENT_DATE del DDL solo
se aplica en el INSERT, no en actualizaciones posteriores. Por eso 
no tiene setter publico aqui: la fecha "Actual" siempre la decide el 
DAO en el momento de la operacion, no el modelo.
"""

class StockAlmacen:
    """Representa el stock de un videojuego en un almacen especifico."""
    
    def __init__(self, id_videojuego: int, id_almacen: int,
                 cantidad: int = 0, fecha_actualizacion=None):
        #id_videojuego e id_almacen son la pk compuesta: inmutables
        self.__id_videojuego = id_videojuego
        self.__id_almacen = id_almacen
        self.set_cantidad(cantidad)
        self.__fecha_actualizacion = fecha_actualizacion
        
    #GETTERS===================================================================
    def get_id_videojuego(self) -> int:
        return self.__id_videojuego
    
    def get_id_almacen(self) -> int:
        return self.__id_almacen
    
    def get_cantidad(self) -> int:
        return self.__cantidad
    
    def get_fecha_actualizacion(self):
        return self.__fecha_actualizacion
    
    #SETTERS======================================================================
    def set_cantidad(self, cantidad: int):
        #bool es subclase de int en Python (true ==1) asi que se 
        # excuye explicitamente para no aceptar True/False como cantidad.
        if isinstance(cantidad, bool) or not isinstance(cantidad, int):
            raise ValueError("La cantidad debe ser un numero entero.")
        if cantidad < 0:
            raise ValueError("La cantidad no puede ser negativa.")
        self.__cantidad = cantidad
        
    def mostrar_info(self) -> dict:
        """Retorna toda la informacion del registro de stock."""
        return {
            "id_videojuego": self.__id_videojuego,
            "id_almacen": self.__id_almacen,
            "cantidad": self.__cantidad,
            "fecha_actualizacion": self.__fecha_actualizacion,
        }
        
    def to_dict(self) -> dict:
        """Devuelve un diccionario con la informacion del registro."""
        return self.mostrar_info()
    
    @classmethod
    def from_row(cls, row: dict) -> "StockAlmacen":
        """Crea un StockAlmacen desde una fila de la base de datos."""
        return cls(
            id_videojuego=row["id_videojuego"],
            id_almacen=row["id_almacen"],
            cantidad=row.get("cantidad", 0),
            fecha_actualizacion=row.get("fecha_actualizacion"),   
        )