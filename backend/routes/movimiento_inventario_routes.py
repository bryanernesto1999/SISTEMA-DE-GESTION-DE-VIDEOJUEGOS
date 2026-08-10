"""
RUTAS DE MOVIMIENTOS DE INVENTARIO
Este archivo contiene los endpoints del MovimientoInventario.

Este router sra importado desde main.py

NOTA: este modelo NO tiene endpoint PUT . movimiento_inventario
es un registro de historial/ auditoria - no se edita movimiento 
pasado, se corrige con movimiento nuevo.

NOTA: POST/ movimientos unicamente registra el movimiento. No 
modifica stock_almacen. La conexion real entre un movimiento y el
cambio de stock se implementara en un paso posterior mediante 
una capa de Service.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from dao.movimiento_inventario_dao import MovimientoInventarioDAO

router = APIRouter(
    prefix="/movimientos",
    tags=["MovimientoInventario"]
)

#MODELOS PYDANTIC=======================================================
class MovimientoCreate(BaseModel):
    """Modelo utilizado para registrar un nuevo movimiento de inventario."""
    tipo : str
    cantidad: int = Field(..., gt=0)
    motivo:str = Field(default="")
    precio_unitario: Optional[float] = Field(default=None, ge=0)
    id_videojuego: int
    id_almacen: int
    id_usuario: int
    
#ENDPOINTS===============================================================

@router.get("", summary="Listar todos los movimientos de inventario")
def listar():
    try:
        return MovimientoInventarioDAO.obtener_todos()
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    
@router.get("/{id}", summary="Obtener movimiento por ID")
def obtener(id:int):
    try:
        mov = MovimientoInventarioDAO.obtener_por_id(id)
        if not mov:
            raise HTTPException(404, f"Movimiento {id} no encontrado.")
        return mov
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    

#CREAR MOVIMIENTO========================================================
@router.post("", status_code=201, summary="Registrar movimiento de inventario")
def crear(datos: MovimientoCreate):
    try:
        return MovimientoInventarioDAO.crear(datos.model_dump())
    except ValueError as e:
        raise HTTPException(422, str(e))
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    
#ELIMINAR MOVIMIENTO ==============================================
@router.delete("/{id}", summary="Eliminar movimiento de inventario")
def eliminar(id :int):
    try:
        ok = MovimientoInventarioDAO.eliminar(id)
        if not ok:
            raise HTTPException(404, f"Movimiento {id} no encontrado.")
        return {"mensaje": f"Movimiento{id}eliminado."}
    except RuntimeError as e:
        raise HTTPException(500, str(e))