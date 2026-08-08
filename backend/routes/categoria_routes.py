"""Rutas (ROUTES) para gestionar categorías.
este archivo contiene los endpoints (rutas del CRUD)
Este router sera importado desde main.py y todas las rutas tendran el prefijo:
http://localhost:8000/categorias
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from dao.categoria_dao import CategoriaDAO
from dao.videojuego_dao import VideojuegoDAO #se mantiene unicamente para /alertas (pendiente de mover a AlertaStockDAO)

router = APIRouter( #este router se importa en main.py y todas las rutas tendran el prefijo /categorias
    prefix="/categorias", #este prefijo se agrega a todas las rutas definidas en este archivo
    tags=["categorias"] #este tag se usa para agrupar las rutas en la documentación de FastAPI (Swagger UI)
)

# MODELOS PYDANTIC PARA VALIDACION DE DATOS ==========================================
class CategoriaCreate(BaseModel): #Aqui se puede poner un modelo para crear, pero en este caso no es necesario ya que se puede usar el mismo modelo de CategoriaUpdate
    """Modelo para crear una nueva categoría."""
    nombre: str = Field(..., min_length=1, max_length=60)
    descripcion: str = Field(default="")
    
class CategoriaUpdate(BaseModel):#aqui se puede poner un modelo para actualizar, pero en este caso no es necesario ya que se puede usar el mismo modelo de CategoriaCreate
   nombre: Optional[str] = None
   descripcion: Optional[str] = None
   
   
# ENDPOINTS DEL CRUD =======================================================
 
# LISTAR TODAS LAS CATEGORIAS ================================
@router.get("", summary="Listar todas las categorias") #este endpoint se accede a traves de GET /categorias
def listar():
    try:
        return CategoriaDAO.obtener_todas()
    except RuntimeError as e:
        raise HTTPException(500, str(e))

#MOSTRAR ALERTAS DE STOCK ACTIVAS ================================
@router.get("/alertas", summary="Ver alertas de stock activas")
def alertas():
    try:
        return VideojuegoDAO.obtener_alertas()
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    
#OBTENER UNA CATEGORIA POR ID ================================
@router.get("/{id}", summary="Obtener  categoria por ID") #este endpoint se accede a traves de GET /categorias/{id}
def obtener(id: int):
    try:
        cat = CategoriaDAO.obtener_por_id(id)
        if not cat:
            raise HTTPException(404, f"Categoria con id {id} no encontrada")
        return cat
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    
@router.post("", status_code= 201, summary="Registrar categoria") #este endpoint se accede a traves de POST /categorias
def crear(datos: CategoriaCreate):
    try:
        return CategoriaDAO.crear(datos.model_dump())
    except ValueError as e:
        raise HTTPException(422, str(e))
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    
#ACTUALIZAR UNA CATEGORIA POR ID ================================
@router.put("/{id}", summary="Editar categoria") #este endpoint se accede a traves de PUT /categorias/{id}
def actualizar(id: int, datos: CategoriaUpdate):
    try:
        campos = {k: v for k, v in datos.model_dump().items() if v is not None} #filtra los campos que no son None
        if not campos:
            raise HTTPException(400, "Debe enviar al menos un campo para actualizar")
        actualizado = CategoriaDAO.actualizar(id, campos)
        if not actualizado:
            raise HTTPException(404, f"Categoria con id {id} no encontrada")
        return actualizado
    except ValueError as e:
        raise HTTPException(422, str(e))
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    

#ELIMINAR UNA CATEGORIA POR ID ================================
@router.delete("/{id}", summary= "Eliminar categoria") #este endpoint se accede a traves de DELETE /categorias/{id}
def eliminar(id: int):
    try:
        ok = CategoriaDAO.eliminar(id)
        if not ok:
            raise HTTPException(404, f"Categoria con {id} no encontrada")
        return {"mensaje": f"Categoria {id} eliminada. "}
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    
    
    