"""
RUTAS (ROUTES) DE STOCK POR ALMACEN

NOTA: a diferencia de los modulos anteriores, esta tabla no tiene un
id simple — su identidad es la combinacion (id_videojuego, id_almacen).
Por eso las rutas de detalle usan ambos valores en la URL.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from dao.stock_almacen_dao import StockAlmacenDAO

router = APIRouter(
    prefix="/stock-almacen",
    tags=["StockAlmacen"]
)

# MODELOS PYDANTIC ========================================================
class StockAlmacenCreate(BaseModel):
    """Modelo utilizado para registrar un nuevo registro de stock."""
    id_videojuego: int
    id_almacen: int
    cantidad: int = Field(default=0, ge=0)


class StockAlmacenUpdate(BaseModel):
    """
    Solo permite modificar la cantidad. No tiene sentido 'actualizar'
    la clave compuesta (id_videojuego/id_almacen) — eso equivaldría a
    crear un registro distinto, no a editar el existente.
    """
    cantidad: Optional[int] = Field(default=None, ge=0)


# ENDPOINTS DEL CRUD =======================================================

# LISTAR TODO EL STOCK POR ALMACEN ================================
@router.get("", summary="Listar todo el stock por almacén")
def listar():
    try:
        return StockAlmacenDAO.obtener_todos()
    except RuntimeError as e:
        raise HTTPException(500, str(e))


# OBTENER STOCK POR CLAVE COMPUESTA ================================
@router.get("/{id_videojuego}/{id_almacen}", summary="Obtener stock de un videojuego en un almacén")
def obtener(id_videojuego: int, id_almacen: int):
    try:
        stock = StockAlmacenDAO.obtener_por_clave(id_videojuego, id_almacen)
        if not stock:
            raise HTTPException(
                404,
                f"No existe registro de stock para el videojuego {id_videojuego} "
                f"en el almacén {id_almacen}."
            )
        return stock
    except RuntimeError as e:
        raise HTTPException(500, str(e))


# CREAR REGISTRO DE STOCK ================================
@router.post("", status_code=201, summary="Registrar stock de un videojuego en un almacén")
def crear(datos: StockAlmacenCreate):
    try:
        return StockAlmacenDAO.crear(datos.model_dump())
    except ValueError as e:
        raise HTTPException(422, str(e))
    except RuntimeError as e:
        raise HTTPException(500, str(e))


# ACTUALIZAR CANTIDAD ================================
@router.put("/{id_videojuego}/{id_almacen}", summary="Actualizar la cantidad de stock")
def actualizar(id_videojuego: int, id_almacen: int, datos: StockAlmacenUpdate):
    try:
        campos = {k: v for k, v in datos.model_dump().items() if v is not None}
        if not campos:
            raise HTTPException(400, "Debe enviar la cantidad a actualizar.")
        actualizado = StockAlmacenDAO.actualizar(id_videojuego, id_almacen, campos)
        if not actualizado:
            raise HTTPException(
                404,
                f"No existe registro de stock para el videojuego {id_videojuego} "
                f"en el almacén {id_almacen}."
            )
        return actualizado
    except ValueError as e:
        raise HTTPException(422, str(e))
    except RuntimeError as e:
        raise HTTPException(500, str(e))


# ELIMINAR REGISTRO DE STOCK ================================
@router.delete("/{id_videojuego}/{id_almacen}", summary="Eliminar registro de stock")
def eliminar(id_videojuego: int, id_almacen: int):
    try:
        ok = StockAlmacenDAO.eliminar(id_videojuego, id_almacen)
        if not ok:
            raise HTTPException(
                404,
                f"No existe registro de stock para el videojuego {id_videojuego} "
                f"en el almacén {id_almacen}."
            )
        return {"mensaje": f"Registro de stock (videojuego {id_videojuego}, almacén {id_almacen}) eliminado."}
    except RuntimeError as e:
        raise HTTPException(500, str(e))