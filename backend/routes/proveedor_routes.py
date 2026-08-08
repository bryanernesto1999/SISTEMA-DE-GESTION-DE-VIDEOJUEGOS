"""
RUTAS (ROUTES) DE PROVEEDORES

Este archivo contiene todos los endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from dao.proveedor_dao import ProveedorDAO


router = APIRouter(
    prefix="/proveedores",
    tags=["Proveedores"]
)

#MODELOS PYDANTIC ========================================================

class ProveedorCreate(BaseModel):
    """Modelo utilizado para registrar un nuevo proveedor."""
    razon_social: str = Field(..., min_length=1, max_length=120)
    ruc: str = Field(default="", max_length=20)
    telefono: str = Field(default="", max_length=20)
    email: str = Field(default="", max_length=100)
    direccion: str = Field(default="")
    activo: bool = Field(default=True)
    
class ProveedorUpdate(BaseModel):
    razon_social: Optional[str] = None
    ruc: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    direccion: Optional[str] = None
    activo: Optional[bool] = None
    
#ENDPOINTS DEL CRUD =========================================

#LISTAR TODOS LOS PROVEEDORES ================================
@router.get("", summary="Listar todos los proveedores")
def listar():
    try:
        return ProveedorDAO.obtener_todos()
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    
#OBTENER PROVEEDOR POR ID===================================
@router.get("/{id}", summary="Obtener proveedor por ID")
def obtener(id: int):
    try:
        prov = ProveedorDAO.obtener_por_id(id)
        if not prov:
            raise HTTPException(404, f"Proveedor {id} no encontrado.")
        return prov
    except RuntimeError as e:
          raise HTTPException(500, str(e))

#X CREAR PROVEEDOR ======================================
@router.post("", status_code=201, summary="Registrar proveedor")
def crear(datos: ProveedorCreate):
    try:
        return ProveedorDAO.crear(datos.model_dump())
    except ValueError as e:
        raise HTTPException(422, str(e))
    except RuntimeError as e:
        raise HTTPException(500, str(e))

# ACTUALIZAR PROVEEDOR ========================================
@router.put("/{id}", summary="Editar proveedor")
def actualizar(id: int, datos: ProveedorUpdate):
    try:
        campos = {k: v for k, v in datos.model_dump().items() if v is not None}
        if not campos:
            raise HTTPException(400, "Debe enviar al menos un campo.") 
        actualizado = ProveedorDAO.actualizar(id, campos)
        if not actualizado:
            raise HTTPException(404, f"Proveedor {id} no encontrado.")
        return actualizado
    except ValueError as e:
        raise HTTPException(422, str(e))
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    
#ELIMINAR PROVEEDOR=============================================
@router.delete("/{id}", summary="Eliminar proveedor")
def eliminar(id: int):
    try:
        ok = ProveedorDAO.eliminar(id)
        if not ok:
            raise HTTPException(404, f"Proveedor {id} no encontrado.")
        return {"mensaje": f"Proveedor {id} eliminado."}
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    
       