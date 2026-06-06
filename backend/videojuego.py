class Producto:
    """Clase base que representa un producto genérico."""
 
    def __init__(self, id: int, nombre: str, precio: float, stock: int):
        """Inicializa un producto con sus atributos básicos."""
        self.__id = id
        self.__nombre = nombre
        self.__precio = precio
        self.__stock = stock