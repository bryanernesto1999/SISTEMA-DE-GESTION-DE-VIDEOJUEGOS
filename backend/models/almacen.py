"""
Clase Almacen
Representa un almacen fisico donde se guarda el inventario 
"""

class Almacen:
    """Representa un almacen del sistema inventario."""
    
    def __init__(self, id_almacen: int, nombre: str, ubicacion: str,
                 responsable: str ="", activo: bool = True):
        self.__id_almacen = id_almacen
        self.set_nombre(nombre)
        self.set_ubicacion(ubicacion)
        self.__responsable = (responsable or "").strip()
        self.set_activo(activo)
        
        #GETTERS======================================================
    def get_id_almacen(self) -> int:
        return self.__id_almacen
    
    def get_nombre(self) -> str:
        return self.__nombre
    
    def get_ubicacion(self) -> str:
        return self.__ubicacion
    
    def get_responsable(self) -> str:
        return self.__responsable
    
    def get_activo(self) -> bool:
        return self.__activo
     
    #SETTERS==============================================================
    def set_nombre(self, nombre:str):
        if not nombre or not nombre.strip():
            raise ValueError("El nombre del almacen no puede estar vacio.")
        self.__nombre = nombre.strip()
        
    def set_ubicacion(self, ubicacion: str):
        if not ubicacion or not ubicacion.strip():
            raise ValueError("La ubicacion del almacen no puede estar vacia")
        self.__ubicacion = ubicacion.strip()
        
    def set_responsable(self, responsable: str):
        #campo adicional segun el DDL 
        self.__responsable = (responsable or "").strip()
        
    def set_activo(self, activo:bool):
        if not isinstance(activo, bool):
            raise ValueError("El campo 'activo' debe ser un valor booleano.")
        self.__activo = activo
        
    #REPRESENTACION==============================================================
    def mostrar_info(self) -> dict:
        """retorna toda la informacion del almacen."""
        return {
            "id_almacen": self.__id_almacen,
            "nombre": self.__nombre,
            "ubicacion": self.__ubicacion,
            "responsable": self.__responsable,
            "activo": self.__activo,
        }        
        
    def to_dict(self) -> dict:
        """Devuelve un diccionario con la informacion del almacen."""
        return self.mostrar_info()
    
    @classmethod
    def from_row(cls, row:dict) -> "Almacen":
        """Crea un almacen desde una fila de la base de datos."""
        return cls(
            id_almacen = row["id_almacen"],
            nombre= row["nombre"],
            ubicacion=row["ubicacion"],
            responsable=row.get("responsable") or "",
            activo=row.get("activo", True)
    )