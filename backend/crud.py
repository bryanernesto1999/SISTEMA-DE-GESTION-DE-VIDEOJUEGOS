"""
Módulo CRUD para la gestión de videojuegos.
"""
from typing import List, Dict, Any, Optional
from videojuego import Videojuego
from database import cargar_datos, guardar_datos, obtener_siguiente_id


def crear_videojuego(datos: Dict[str, Any]) -> Dict[str, Any]:
    """
    Crea un nuevo videojuego y lo persiste en JSON.
    Raises: ValueError si los datos son inválidos.
    """
    try:
        lista = cargar_datos()
        nuevo_id = obtener_siguiente_id(lista)

        vj = Videojuego(
            id=nuevo_id,
            nombre=datos["nombre"],
            precio=float(datos["precio"]),
            stock=int(datos["stock"]),
            genero=datos["genero"],
            plataforma=datos["plataforma"],
            desarrollador=datos["desarrollador"],
            anio=int(datos["anio"]),
        )
        # Validaciones via setters
        vj.set_nombre(datos["nombre"])
        vj.set_precio(float(datos["precio"]))
        vj.set_stock(int(datos["stock"]))
        vj.set_genero(datos["genero"])
        vj.set_plataforma(datos["plataforma"])
        vj.set_desarrollador(datos["desarrollador"])
        vj.set_anio(int(datos["anio"]))

        lista.append(vj.to_dict())
        guardar_datos(lista)
        return vj.to_dict()
    except KeyError as e:
        raise ValueError(f"Campo requerido faltante: {e}")


def obtener_todos() -> List[Dict[str, Any]]:
    """Retorna todos los videojuegos."""
    try:
        return cargar_datos()
    except RuntimeError as e:
        raise RuntimeError(str(e))


def obtener_por_id(id: int) -> Optional[Dict[str, Any]]:
    """Retorna un videojuego por su ID o None si no existe."""
    try:
        lista = cargar_datos()
        for item in lista:
            if item["id"] == id:
                return item
        return None
    except RuntimeError as e:
        raise RuntimeError(str(e))


def actualizar_videojuego(id: int, datos: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Actualiza un videojuego existente por su ID.
    Retorna el videojuego actualizado o None si no se encontró.
    """
    try:
        lista = cargar_datos()
        for i, item in enumerate(lista):
            if item["id"] == id:
                vj = Videojuego.from_dict(item)

                # Aplicar solo los campos enviados (PATCH-like), validando con setters
                if "nombre" in datos:
                    vj.set_nombre(datos["nombre"])
                if "precio" in datos:
                    vj.set_precio(float(datos["precio"]))
                if "stock" in datos:
                    vj.set_stock(int(datos["stock"]))
                if "genero" in datos:
                    vj.set_genero(datos["genero"])
                if "plataforma" in datos:
                    vj.set_plataforma(datos["plataforma"])
                if "desarrollador" in datos:
                    vj.set_desarrollador(datos["desarrollador"])
                if "anio" in datos:
                    vj.set_anio(int(datos["anio"]))

                lista[i] = vj.to_dict()
                guardar_datos(lista)
                return vj.to_dict()
        return None
    except RuntimeError as e:
        raise RuntimeError(str(e))


def eliminar_videojuego(id: int) -> bool:
    """
    Elimina un videojuego por su ID.
    Retorna True si fue eliminado, False si no se encontró.
    """
    try:
        lista = cargar_datos()
        nueva_lista = [item for item in lista if item["id"] != id]
        if len(nueva_lista) == len(lista):
            return False
        guardar_datos(nueva_lista)
        return True
    except RuntimeError as e:
        raise RuntimeError(str(e))


def actualizar_stock(id: int, cantidad: int) -> Optional[Dict[str, Any]]:
    """
    Actualiza únicamente el stock de un videojuego.
    cantidad puede ser positivo (agregar) o negativo (reducir).
    """
    try:
        lista = cargar_datos()
        for i, item in enumerate(lista):
            if item["id"] == id:
                vj = Videojuego.from_dict(item)
                nuevo_stock = vj.get_stock() + cantidad
                vj.set_stock(nuevo_stock)  # Valida que no sea negativo
                lista[i] = vj.to_dict()
                guardar_datos(lista)
                return vj.to_dict()
        return None
    except RuntimeError as e:
        raise RuntimeError(str(e))