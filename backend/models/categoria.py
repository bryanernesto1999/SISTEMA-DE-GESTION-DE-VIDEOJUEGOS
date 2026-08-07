"""
CLASE CATEGORIA

representa una categoria de videojuego (Accion, RPG, Deportes etc)
"""
class Categoria:
    """Representa una categoria de catalogo de viddojuegos."""
    
    def __init__(self, id_categoria: int, nombre: str, descripcion: str = ""):
        """
        Inicializa una instancia de la clase Categoria.

        Args:
            id_categoria (int): Identificador único de la categoría.
            nombre (str): Nombre de la categoría.
            descripcion (str, optional): Descripción de la categoría. Por defecto es una cadena vacía.
        """
        self.__id_categoria = id_categoria
        self.__nombre = nombre(nombre)
        self.__descripcion = descripcion or ""
        
        #GETTERS ======================================================
        def get_id_categoria(self) -> int:
            """Devuelve el ID de la categoría."""
            return self.__id_categoria
        
        def get_nombre(self) -> str:
            """Devuelve el nombre de la categoría."""
            return self.__nombre
        
        def get_descripcion(self) -> str:
            """Devuelve la descripción de la categoría."""
            return self.__descripcion
        
        #SETTERS ======================================================
        def set_nombre(self, nombre: str):
            """
            Modifica el nombre de la categoría.

            Validación:
            - No permite cadenas vacías.
            - Elimina espacios al inicio y final.
            """
            if not nombre or not nombre.strip():
                raise ValueError("El nombre no puede estar vacío.")
            
            self.__nombre = nombre.strip()
            
        def mostrar_info(self) -> dict:
            """Devuelve una representación en cadena de la categoría."""
            return {
                "id_categoria": self.__id_categoria,
                "nombre": self.__nombre,
                "descripcion": self.__descripcion
            }

        def to_dict(self) -> dict:
            """Devuelve un diccionario con la informacion de la categoria"""
            return self.mostrar_info()
        
        @classmethod
        def from_row(cls, row: dict) -> 'Categoria':
            """Crea una categoria desde una fila de la base de datos"""
            return cls(
                id_categoria=row["id_categoria"],
                nombre=row["nombre"],
                descripcion=row.get("descripcion", "")
            )