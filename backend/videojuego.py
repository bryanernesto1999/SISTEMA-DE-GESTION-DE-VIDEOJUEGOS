class Producto:
    def __init__(self, idProducto, nombre, precio, stock):
        self.__idProducto = idProducto
        self.__nombre = nombre
        self.__precio = precio
        self.__stock = stock
    
    def get_id(self):
        return self.__id

    def get_nombre(self):
        return self.__nombre

    def get_precio(self):
        return self.__precio

    def get_stock(self):
        return self.__stock

    def set_stock(self, stock):
        self.__stock = stock

    def mostrar_info(self):
        return f"{self.__nombre} - S/.{self.__precio} - Stock: {self.__stock}"    
    
class Videojuego(Producto):
    def __init__(self, id, nombre, precio, stock,
                 genero, plataforma):
        super().__init__(id, nombre, precio, stock)

        self.__genero = genero
        self.__plataforma = plataforma

    def get_genero(self):
        return self.__genero

    def get_plataforma(self):
        return self.__plataforma

    def mostrar_info(self):
        return (
            f"Videojuego: {self.get_nombre()} | "
            f"Género: {self.__genero} | "
            f"Plataforma: {self.__plataforma}"
        )
        
        