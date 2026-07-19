"""
Clase base Producto

Esta clase representa un producto genérico del sistema de gestión de videojuegos.
Aquí se aplica el principio de Encapsulamiento de la Programación Orientada a Objetos (POO),
utilizando atributos privados y permitiendo su acceso únicamente mediante métodos
getters y setters con validaciones.
"""


# Definición de la clase padre Producto
class Producto:
    """
    Clase padre que almacena la información básica de cualquier producto.
    Será heredada por otras clases, por ejemplo Videojuego.
    """

    # Constructor de la clase
    
    def __init__(self, id_videojuego: int, titulo: str,
                 precio_compra: float, precio_venta: float, stock_actual: int):
        """
        El constructor se ejecuta automáticamente cuando se crea un objeto.

        Recibe los datos principales del producto y los almacena
        en atributos privados (__), aplicando Encapsulamiento.
        """
        self.__id_videojuego = id_videojuego # Atributo privado que almacena el ID del videojuego
        self.__titulo = titulo  # Atributo privado que almacena el título del videojuego
        self.__precio_compra = precio_compra # Atributo privado que almacena el precio de compra
        self.__precio_venta = precio_venta # Atributo privado que almacena el precio de venta
        self.__stock_actual = stock_actual  # Atributo privado que almacena la cantidad disponible en stock

    
    # GETTERS

    def get_id(self) -> int: # Devuelve el ID del videojuego
        """Devuelve el ID del videojuego."""
        return self.__id_videojuego

    def get_titulo(self) -> str: # Devuelve el título
        """Devuelve el título del videojuego."""
        return self.__titulo

    def get_precio_compra(self) -> float: # Devuelve el precio de compra
        """Devuelve el precio de compra."""
        return self.__precio_compra

    def get_precio_venta(self) -> float: # Devuelve el precio de venta 
        """Devuelve el precio de venta."""
        return self.__precio_venta

    def get_stock_actual(self) -> int: # Devuelve el stock actual
        """Devuelve el stock disponible."""
        return self.__stock_actual

    # ==========================================================
    # SETTERS aqui creo para modificar los atributos privados de la clase Producto.
    # ==========================================================

    def set_titulo(self, titulo: str): # Cambia el título y verifica que no esté vacío
        """
        Modifica el título del videojuego.

        Validación:
        - No permite cadenas vacías.
        - Elimina espacios al inicio y final.
        """
        if not titulo or not titulo.strip():
            raise ValueError("El titulo no puede estar vacio.")

        self.__titulo = titulo.strip()

    def set_precio_compra(self, precio: float): # Cambia el precio de compra y valida que no sea negativo
        """
        Modifica el precio de compra.

        Validación:
        - No permite valores negativos.
        """
        if precio < 0:
            raise ValueError("El precio de compra no puede ser negativo.")

        self.__precio_compra = precio

    def set_precio_venta(self, precio: float): # Cambia el precio de venta y valida que no sea negativo
        """
        Modifica el precio de venta.

        Validación:
        - No permite valores negativos.
        """
        if precio < 0:
            raise ValueError("El precio de venta no puede ser negativo.")

        self.__precio_venta = precio

    def set_stock_actual(self, stock: int):
        """
        Modifica el stock disponible.

        Validación:
        - No permite cantidades negativas.
        """
        if stock < 0:
            raise ValueError("El stock no puede ser negativo.")

        self.__stock_actual = stock

    # ==========================================================
    # MÉTODO POLIMÓRFICO
    # Después la clase hija podrá modificar este comportamiento (Polimorfismo)
    # hija para mostrar información más específica.
    # ==========================================================

    def mostrar_info(self) -> dict:    # Este método muestra la información del producto
        """
        Retorna toda la información del producto en forma
        de diccionario.

        Este método demuestra el concepto de Polimorfismo,
        ya que podrá ser redefinido por la clase Videojuego.
        """

        return { # Devuelvo toda la información en un diccionario
            "id_videojuego": self.__id_videojuego,
            "titulo": self.__titulo,
            "precio_compra": self.__precio_compra,
            "precio_venta": self.__precio_venta,
            "stock_actual": self.__stock_actual,
        }