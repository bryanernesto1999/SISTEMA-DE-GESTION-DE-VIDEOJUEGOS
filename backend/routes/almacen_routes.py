"""
RUTAS DE ALMACEN
Este archivo contiene los endopoints del CRUD de almacenes

"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from dao.almacen_dao import AlmacenDAO

router = APIRouter(
    prefix="/almacenes",
    tags=["Almacenes"]
)

#MODELOS PYDANTIC ===================================================
class AlmacenCreate(BaseModel):
    """Modelo utilizado para registrar un nuevo almacen."""
    nombre: str = Field(..., min_length=1, max_length=80)
    ubicacion: str =Field(..., min_length=1, max_length=120)
    responsable: str =Field(default="", max_length=100)
    activo: bool = Field(default=True)
    
class AlmacenUpdate(BaseModel):
    nombre: Optional[str] = None
    ubicacion: Optional[str] = None
    responsable: Optional[str] = None
    activo: Optional[bool] =None
 
#ENDPOINTS DEL CRUD=========================================================

#Listar los almacenes 
@router.get("", summary="Listar todos los almacenes")
def listar():
    try:
        return AlmacenDAO.obtener_todos()
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    
#OBTENER ALMACEN POR ID======================================================
@router.get("/{id}", summary="Obtener almacen por ID")
def obtener(id: int):
    try:
        alm= AlmacenDAO.obtener_por_id(id)
        if not alm:
            raise HTTPException(404, f"Almacen {id} no encontrado.") 
        return alm
    except RuntimeError as e:
        raise HTTPException(500, str(e))

#CREAR ALMACEN============================================================
@router.post("", status_code=201, summary="Registrar almacen")
def crear(datos: AlmacenCreate):
    try:
        return AlmacenDAO.crear(datos.model_dump())
    except ValueError as e: 
        raise HTTPException(422, str(e))
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    
#Actualizar almacen=============================================================
@router.put("/{id}", summary="Editar almacen")
def actualizar(id: int, datos: AlmacenUpdate):
    try:
        campos = {k: v for k, v in datos.model_dump().items() if v is not None}
        if not campos:
            raise HTTPException(400, "Debe enviar al menos un campo.")
        actualizado = AlmacenDAO.actualizar(id, campos)
        if not actualizado:
            raise HTTPException(404, f"Almacen {id} no encontrado.")
        return actualizado
    except ValueError as e:
        raise HTTPException(422, str(e))
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    
# ELIMINAR ALMACEN==============================================================
@router.delete("/{id}", summary="Eliminar almacen")
def eliminar(id: int):
    try:
        ok = AlmacenDAO.eliminar(id)
        if not ok:
            raise HTTPException(404, f"Almacen {id} no encontrado.")
        return {"mensaje": f"Almacen {id} eliminado."}
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    
    