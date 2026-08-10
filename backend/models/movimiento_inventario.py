"""
Clase MovimientoInventario

Representa un movimiento de inventario (entrada, salida, traslado,
devolucion o ajuste) asociado a un videojuego, un almacen y el
usuario que lo registro.

Segun el DDL v2:
- tipo, cantidad, id_videojuego, id_almacen e id_usuario son
  obligatorios (NOT NULL).
- tipo es un ENUM (tipo_movimiento).
- cantidad debe ser ESTRICTAMENTE mayor que cero (CHECK cantidad > 0),
  a diferencia de stock_almacen.cantidad que permite 0.
- motivo es opcional (TEXT, sin NOT NULL).
- precio_unitario es opcional; si se especifica, debe ser >= 0.
- fecha es asignada por PostgreSQL (DEFAULT NOW()) y no es editable
  desde la aplicacion: solo tiene getter, no setter.
"""


class MovimientoInventario:
    """Representa un movimiento de inventario."""

    TIPOS_VALIDOS = ['ENTRADA', 'SALIDA', 'TRASLADO', 'DEVOLUCION', 'AJUSTE']

    def __init__(self, id_movimiento: int, tipo: str, cantidad: int,
                 id_videojuego: int, id_almacen: int, id_usuario: int,
                 motivo: str = "", precio_unitario=None, fecha=None):
        self.__id_movimiento = id_movimiento
        self.set_tipo(tipo)
        self.set_cantidad(cantidad)
        self.set_id_videojuego(id_videojuego)
        self.set_id_almacen(id_almacen)
        self.set_id_usuario(id_usuario)
        self.set_motivo(motivo)
        self.set_precio_unitario(precio_unitario)
        # fecha no tiene setter: la asigna la base de datos (DEFAULT NOW()).
        self.__fecha = fecha

    # GETTERS ==============================================================
    def get_id_movimiento(self) -> int:
        return self.__id_movimiento

    def get_tipo(self) -> str:
        return self.__tipo

    def get_cantidad(self) -> int:
        return self.__cantidad

    def get_id_videojuego(self) -> int:
        return self.__id_videojuego

    def get_id_almacen(self) -> int:
        return self.__id_almacen

    def get_id_usuario(self) -> int:
        return self.__id_usuario

    def get_motivo(self) -> str:
        return self.__motivo

    def get_precio_unitario(self):
        return self.__precio_unitario

    def get_fecha(self):
        return self.__fecha

    # SETTERS ==============================================================
    def set_tipo(self, tipo: str):
        if tipo not in self.TIPOS_VALIDOS:
            raise ValueError(f"El tipo debe ser uno de los siguientes: {', '.join(self.TIPOS_VALIDOS)}.")
        self.__tipo = tipo

    def set_cantidad(self, cantidad: int):
        # bool es subclase de int en Python: se excluye explicitamente.
        if isinstance(cantidad, bool) or not isinstance(cantidad, int):
            raise ValueError("La cantidad debe ser un número entero.")
        # El CHECK del DDL exige cantidad > 0 (estrictamente mayor que
        # cero), a diferencia de stock_almacen que permite 0.
        if cantidad <= 0:
            raise ValueError("La cantidad debe ser mayor que cero.")
        self.__cantidad = cantidad

    def set_id_videojuego(self, id_videojuego: int):
        if not isinstance(id_videojuego, int) or isinstance(id_videojuego, bool) or id_videojuego <= 0:
            raise ValueError("El ID del videojuego debe ser un entero mayor a cero.")
        self.__id_videojuego = id_videojuego

    def set_id_almacen(self, id_almacen: int):
        if not isinstance(id_almacen, int) or isinstance(id_almacen, bool) or id_almacen <= 0:
            raise ValueError("El ID del almacén debe ser un entero mayor a cero.")
        self.__id_almacen = id_almacen

    def set_id_usuario(self, id_usuario: int):
        if not isinstance(id_usuario, int) or isinstance(id_usuario, bool) or id_usuario <= 0:
            raise ValueError("El ID del usuario debe ser un entero mayor a cero.")
        self.__id_usuario = id_usuario

    def set_motivo(self, motivo: str):
        # Campo opcional segun el DDL (TEXT, sin NOT NULL).
        self.__motivo = (motivo or "").strip()

    def set_precio_unitario(self, precio_unitario):
        # Campo opcional segun el DDL. Si se especifica, no puede ser negativo.
        if precio_unitario is None:
            self.__precio_unitario = None
            return
        if isinstance(precio_unitario, bool) or not isinstance(precio_unitario, (int, float)):
            raise ValueError("El precio unitario debe ser un número.")
        if precio_unitario < 0:
            raise ValueError("El precio unitario no puede ser negativo.")
        self.__precio_unitario = float(precio_unitario)

    # NOTA: no existe set_fecha(). La fecha la asigna PostgreSQL
    # mediante DEFAULT NOW() y no se edita despues (Decision A: sin PUT).

    # REPRESENTACION ========================================================
    def mostrar_info(self) -> dict:
        """Retorna toda la informacion del movimiento."""
        return {
            "id_movimiento": self.__id_movimiento,
            "tipo": self.__tipo,
            "cantidad": self.__cantidad,
            "fecha": self.__fecha,
            "motivo": self.__motivo,
            "precio_unitario": self.__precio_unitario,
            "id_videojuego": self.__id_videojuego,
            "id_almacen": self.__id_almacen,
            "id_usuario": self.__id_usuario,
        }

    def to_dict(self) -> dict:
        """Devuelve un diccionario con la informacion del movimiento."""
        return self.mostrar_info()

    @classmethod
    def from_row(cls, row: dict) -> "MovimientoInventario":
        """Crea un MovimientoInventario desde una fila de la base de datos."""
        return cls(
            id_movimiento=row["id_movimiento"],
            tipo=row["tipo"],
            cantidad=row["cantidad"],
            id_videojuego=row["id_videojuego"],
            id_almacen=row["id_almacen"],
            id_usuario=row["id_usuario"],
            motivo=row.get("motivo") or "",
            precio_unitario=row.get("precio_unitario"),
            fecha=row.get("fecha"),
        )