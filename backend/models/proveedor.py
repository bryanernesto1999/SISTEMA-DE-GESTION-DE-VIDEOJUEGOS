"""
Clase Proveedor

Representa un proveedor/distribuidor de videojuegos.
Sigue en el mismo patron de encapsulamiento y validacion Categoria/Videojuego.

"""

class Proveedor:
    """Representa un proveedor de videojuegos."""
    
    def __init__(self, id_proveedor: int, razon_social: str,
                 ruc: str = "", telefono: str = "", email: str = "",
                 direccion: str = "", activo: bool = True):
        self.__id_proveedor = id_proveedor
        self.set_razon_social(razon_social)
        self.__ruc = (ruc or "").strip()
        self.__telefono = (telefono or "").strip()
        self.__email = (email or "").strip()
        self.__direccion = (direccion or "").strip()
        self.set_activo(activo)
        
    # GETTERS ======================================================
    def get_id_proveedor(self) -> int:
        """Devuelve el ID del proveedor."""
        return self.__id_proveedor
    
    def get_razon_social(self) -> str:
        """Devuelve la razón social del proveedor."""
        return self.__razon_social

    def get_ruc(self) -> str:
        """Devuelve el RUC del proveedor."""
        return self.__ruc

    def get_telefono(self) -> str:
        """Devuelve el número de teléfono del proveedor."""
        return self.__telefono

    def get_email(self) -> str:
        """Devuelve el correo electrónico del proveedor."""
        return self.__email

    def get_direccion(self) -> str:
        """Devuelve la dirección del proveedor."""
        return self.__direccion

    def get_activo(self) -> bool:
        """Devuelve el estado de activo del proveedor."""
        return self.__activo
    
    # SETTERS ======================================================
    def set_razon_social(self, razon_social: str): #está validando que el nombre no sea vacío y lo limpia de espacios
        if not razon_social or not razon_social.strip():
            raise ValueError("La razón social del proveedor no puede estar vacía.")
        self.__razon_social = razon_social.strip()

    def set_ruc(self, ruc: str):
        self.__ruc = (ruc or "").strip()

    def set_telefono(self, telefono: str):
        self.__telefono = (telefono or "").strip()

    def set_email(self, email: str):
        self.__email = (email or "").strip()

    def set_direccion(self, direccion: str): # Campo opcional segun el DDL (TEXT, sin NOT NULL).
        self.__direccion = (direccion or "").strip()

    def set_activo(self, activo: bool):
        if not isinstance(activo, bool):
            raise ValueError("El estado de 'activo' debe ser un valor booleano.")
        self.__activo = activo
        
    #REPRESENTACIÓN ======================================================
    def mostrar_info(self) -> dict:
        """Devuelve una representación en diccionario del proveedor."""
        return {
            "id_proveedor": self.__id_proveedor,
            "razon_social": self.__razon_social,
            "ruc": self.__ruc,
            "telefono": self.__telefono,
            "email": self.__email,
            "direccion": self.__direccion,
            "activo": self.__activo
        }
        
    def to_dict(self) -> dict:
        """Devuelve un diccionario con la información del proveedor."""
        return self.mostrar_info()  
    
    @classmethod
    def from_row(cls, row: dict) -> "Proveedor":
        """Crea un proveedor desde una fila de la base de datos."""
        return cls(
            id_proveedor=row["id_proveedor"],
            razon_social=row["razon_social"],
            ruc=row.get("ruc") or  "",
            telefono=row.get("telefono") or  "",
            email=row.get("email") or "",
            direccion=row.get("direccion") or "",
            activo=row.get("activo", True),
        )