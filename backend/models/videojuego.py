
"""
Clase Videojuego

Esta clase hereda de Producto.
Aqui aplico Herencia porque reutilizo los atributos y metodos de la clase padre.
Tambien aplico Polimorfismo al modificar el metodo mostrar_info().
"""
#Importa la clase Prodcuto para poder heredar de ella
from models.producto import Producto

#La clase Videojuego hereda todo lo que tiene Procucto
class Videojuego(Producto):
    """Representa un videojuego con informacion adicional."""
    # Lista de estados permitidos
    ESTADOS_VALIDOS         = ['ACTIVO', 'DESCONTINUADO', 'AGOTADO', 'SUSPENDIDO']
    
    #Lista de clasificaciones permitidas 
    CLASIFICACIONES_VALIDAS = ['TODOS', 'TEEN', 'MADURO', 'ADULTOS']
    
    #contructor: se ejecuta cuando creo un objeto Videojuego
    def __init__(self,
                id_videojuego:int,
                titulo: str,
                plataforma: str,
                desarrollador: str,
                anio_lanzamiento: int,
                clasificacion: str,
                precio_compra: float,
                precio_venta: float,    
                stock_actual: int,
                stock_minimo: int,
                stock_maximo: int,
                estado: str,
                id_categoria: int,
                nombre_categoria:str = ""):
        
    #llamo al constructor de la clase padre para inicializar los atributos heredados
        super().__init__(id_videojuego, titulo, precio_compra, precio_venta, stock_actual)
    
    #Guardo los datos propios del videojuego
        self.__plataforma = plataforma
        self.__desarrollador = desarrollador
        self.__anio_lanzamiento = anio_lanzamiento
        self.__clasificacion = clasificacion
        self.__stock_minimo = stock_minimo
        self.__stock_maximo = stock_maximo
        self.__estado = estado
        self.__id_categoria = id_categoria
        self.__nombre_categoria = nombre_categoria
    
# ===================== GETTERS =====================

# Devuelve la plataforma 
    def get_plataforma(self) -> str:
        return self.__plataforma

# Devuelve el desarrollador
    def get_desarrollador(self) -> str:
        return self.__desarrollador    

# Devuelve el a;o de lanzamiento
    def get_anio_lanzamiento(self) -> int:
        return self.__anio_lanzamiento

# Devuelve la clasificacion
    def get_clasificacion(self) -> str:
        return self.__clasificacion

# Devuelve el stock minimo
    def get_stock_minimo(self) -> int:
        return self.__stock_minimo

# Devuelve el stock maximo
    def get_stock_maximo(self) -> int:
        return self.__stock_maximo

# Devuelve el estado
    def get_estado(self) -> str:
        return self.__estado    

# Devuelve el id de la categoria
    def get_id_categoria(self) -> int:
        return self.__id_categoria

    def get_nombre_categoria(self) -> str:
        return self.__nombre_categoria

#SETTERS modificar lo datos ==============================================

#Cambia la plataforma y verifica que no este vacia
    def set_plataforma(self, plataforma: str):
        if not plataforma or not plataforma.strip():
            raise ValueError("La plataforma no puede estar vacía.")
        self.__plataforma = plataforma.strip()
    
#camnia el desarrrolador y verifiva que no este vacio
    def set_desarrollador(self, desarrollador: str):
        if not desarrollador or not desarrollador.strip():
            raise ValueError("El desarrollador no puede estar vacío.")
        self.__desarrollador = desarrollador.strip() 
    
#cambia el a;o y verific que se avalido 
    def set_anio_lanzamiento(self, anio: int):
        if not (1990 <=  anio <= 2100):
            raise ValueError("El año de lanzamiento debe estar entre 1990 y 2100.")
        self.__anio_lanzamiento = anio

#cambia la clasificacion y verifica que sea valida
    def set_clasificacion(self, clasificacion: str):
        if clasificacion not in self.CLASIFICACIONES_VALIDAS:
            raise ValueError(f"La clasificación debe ser una de las siguientes: {', '.join(self.CLASIFICACIONES_VALIDAS)}.")
        self.__clasificacion = clasificacion    
    
#cambia el estado y verifica que se valido
    def set_estado(self, estado: str):
        if estado not in self.ESTADOS_VALIDOS:
            raise ValueError(f"El estado debe ser uno de los siguientes: {self.ESTADOS_VALIDOS}.")
        self.__estado = estado
    
# cambia el stock minimo y valida que sea negativo 
    def set_stock_minimo(self, stock_minimo: int):
        if stock_minimo < 0:
            raise ValueError("El stock mínimo no puede ser negativo.")
        self.__stock_minimo = stock_minimo    
    
# cambia el stcock maximo y valida que sea negativo 
    def set_stock_maximo(self, stock_maximo: int):
        if stock_maximo < 0:
            raise ValueError("El stock máximo no puede ser negativo.")
        self.__stock_maximo = stock_maximo

# Cambaia el id de la categoria y balida que sea mayor a cero
    def set_id_categoria(self, id_cat: int):
        if id_cat <= 0:
            raise ValueError("El ID de la categoría debe ser mayor a cero.")
        self.__id_categoria = id_cat    
    
#devuelve toda la informacion del videojuego 
    def mostrar_info(self) -> dict:
        """Retorna toda la informacion del videojuego (sobrescribe Producto)."""
    #obtengo primero la informacion del videojuego
        info = super().mostrar_info() #hereda campos del padre
        info.update({
            "plataforma": self.__plataforma,
            "desarrollador": self.__desarrollador,
            "anio_lanzamiento": self.__anio_lanzamiento,
            "clasificacion": self.__clasificacion,
            "stock_minimo": self.__stock_minimo,
            "stock_maximo": self.__stock_maximo,
            "estado": self.__estado,
            "id_categoria": self.__id_categoria,
            "nombre_categoria": self.__nombre_categoria,
        })
# DEVOLVER LA INFO 
        return info
#comvierrte el objeto en un diccionario para poder enviarlo como respuesta en la API    
    def to_dict(self) -> dict:
        """Devuelve un diccionario con la información del videojuego."""
        return self.mostrar_info() 

#crea un objeto videojeugo usando los daos de una fila de la base de datos
    @classmethod  
    def from_row(cls, row: dict) -> "Videojuego":
        """Crea un Videojuego desde una fila de la base de datos."""
        return cls(
            id_videojuego=row["id_videojuego"],
            titulo=row["titulo"],
            plataforma=row["plataforma"],
            desarrollador=row.get("desarrollador",""),
            anio_lanzamiento=row.get("anio_lanzamiento", 2000),
            clasificacion=row.get("clasificacion", "TODOS"),
            precio_compra=float(row["precio_compra"]),
            precio_venta=float(row["precio_venta"]),
            stock_actual=row["stock_actual"],
            stock_minimo=row.get("stock_minimo", 3),
            stock_maximo=row.get("stock_maximo", 100),
            estado=row.get("estado", "ACTIVO"),
            id_categoria=row["id_categoria"],
            nombre_categoria=row.get("nombre_categoria", ""),
        )
