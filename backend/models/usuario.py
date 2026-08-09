"""CLASE USUARIO

representa un usuario del sistema (administrador, almacenero, supervisor, auditor).
"""

class Usuario:
    """Representa un usuario del sistema de inventario"""
    
    ROLES_VALIDOS = ['ADMINISTRADOR', 'ALMACENERO', 'SUPERVISOR', 'AUDITOR']
    
    def __init__(self, id_usuario: int, nombre: str, apellido:str,
                 email: str, password_hash: str, rol: str = "ALMACENERO",
                 activo: bool = True, fecha_registro=None):
        self.__id_usuario = id_usuario
        self.set_nombre(nombre)
        self.set_apellido(apellido)
        self.set_email(email)
        self.set_password_hash(password_hash)
        self.set_rol(rol)
        self.set_activo(activo)
        #fecha de registro no tiene setter eso lo asigna la base de datos,
        self.__fecha_registro = fecha_registro
        
#GETTERS==========================================================================
    def get_id_usuario(self) -> int:
        return self.__id_usuario

    def get_nombre(self) -> str:
        return self.__nombre

    def get_apellido(self) -> str:
        return self.__apellido

    def get_email(self) -> str:
        return self.__email

    def get_password_hash(self) -> str:
        return self.__password_hash

    def get_rol(self) -> str:
        return self.__rol
 
    def get_activo(self) -> bool:
        return self.__activo
 
    def get_fecha_registro(self):
        return self.__fecha_registro

#SETTERS=============================================================================
    def set_nombre(self, nombre: str):
        if not nombre or not nombre.strip():
            raise ValueError("El nombre no puede estar vacio.")
        self.__nombre = nombre.strip()
    
    def set_apellido(self, apellido: str):
        if not apellido or not apellido.strip():
            raise ValueError("El apellido no puede estar vacio.")
        self.__apellido = apellido.strip()
        
    def set_email(self, email: str):
        #garantiza la base de datos no se valida fotmato aqui
        if not email or not email.strip():
            raise ValueError("El email no puede estar vacio.")
        self.__email = email.strip()
        
    def set_password_hash(self, password_hash: str):
        if not password_hash or not password_hash.strip():
            raise ValueError("La contra  no puede estar vacia.")
        self.__password_hash = password_hash.strip()
        
    def set_rol(self, rol: str):
        if rol not in self.ROLES_VALIDOS:
            raise ValueError(f"El rol debe ser uno de los siguientes: {', '.join(self.ROLES_VALIDOS)}.")    
        self.__rol = rol
        
    def set_activo(self, activo: bool):
        if not isinstance(activo, bool):
            raise ValueError("El campo 'activo' debe ser un valor booleano")
        self.__activo = activo    
        
    #REPRESENTACION ======================================================================
    def mostrar_info(self) -> dict:
        """
        Retorna toda la informacion del usuario , incluyendo password_hash.
        """
        return {
            "id_usuario": self.__id_usuario,
            "nombre": self.__nombre,
            "apellido": self.__apellido,
            "email": self.__email,
            "password_hash": self.__password_hash,
            "rol": self.__rol,
            "activo": self.__activo,
            "fecha_registro": self.__fecha_registro,
            }        
    def to_dict(self) -> dict:
        """Devuelve un diccionario con toda la informacion del usuario"""
        return self.mostrar_info()
    
    @classmethod
    def from_row(cls, row:dict) -> "Usuario":
        """Crea un Usuario desde una fila de la base de datos."""
        return cls(
            id_usuario=row["id_usuario"],
            nombre=row["nombre"],
            apellido=row["apellido"],
            email=row["email"],
            password_hash=row["password_hash"],
            rol=row.get("rol", "ALMACENERO"),
            activo=row.get("activo", True),
            fecha_registro=row.get("fecha_registro"),
        )