"""
RUTAS (ROUTES) DE VIDEOJUEGOS

Este archivo contiene todos los endpoints (rutas) del CRUD de
Videojuegos.

CRUD significa:

C -> Create  (Crear)
R -> Read    (Leer)
U -> Update  (Actualizar)
D -> Delete  (Eliminar)

Este router será importado desde main.py y todas las rutas tendrán
el prefijo:

http://localhost:8000/videojuegos
"""
#Importacion de librerias
from fastapi import APIRouter, HTTPException # APIRouter permite crear un grupo de rutas.
from pydantic import BaseModel, Field
from typing import Optional # Optional permite que un atributo sea opcional
from dao.videojuego_dao import VideojuegoDAO # Importamos el DAO que contiene toda la lógica de acceso a la base de datos PostgreSQL

#CREACION DE ROUTER ===================================================================
router = APIRouter(
    prefix="/videojuegos",
    tags=["videojuegos"]
)

#MODELOS PYDANTIC ========================================================================
class VideojuegoCreate(BaseModel): #Esto permite modificar únicamente los datos necesarios.
    """
    Modelo utilizado para registrar un nuevo videojuego.
    """
    titulo: str = Field(..., min_length=1, max_length=120)
    plataforma: str = Field(..., min_length=1)
    desarrollador: str = Field(default="")
    anio_lanzamiento: int = Field(default=2000, ge=1970, le=2100)
    clasificacion: str = Field(default="TODOS")
    precio_compra: float = Field(..., ge=0)
    precio_venta: float = Field(..., ge=0)
    stock_actual: int = Field(default=0, ge=0) 
    stock_minimo:  int = Field(default=3,  ge=0)
    stock_maximo:  int = Field(default=100, ge=0)
    estado: str = Field(default="ACTIVO")
    id_categoria: int = Field(..., ge=1)
    
# ==========================================================
# MODELO PARA ACTUALIZAR
# ==========================================================

class VideojuegoUpdate(BaseModel):
    titulo: Optional[str] = None
    plataforma: Optional[str] = None
    desarrollador: Optional [str] = None
    anio_lanzamiento: Optional[int] = None
    clasificacion: Optional[str] = None
    precio_compra: Optional[float] = None
    precio_venta: Optional[int] = None
    stock_actual: Optional[int] = None
    stock_minimo: Optional[int] = None
    stock_maximo: Optional[int] = None
    estado: Optional[str] = None
    id_categoria: Optional[int] = None

# ==========================================================
# MODELO PARA ACTUALIZAR STOCK
# ==========================================================

class StockUpdate(BaseModel):
    cantidad: int = Field(..., description="Positivo para agregar, negativo para reducir")
# ENDPOINTS DEL CRUD
# ==========================================================
# LISTAR TODOS LOS VIDEOJUEGOS
# ==========================================================

@router.get("", summary="Obtener catalogo completo")
def listar():
    try:
        return VideojuegoDAO.obtener_todos()
    except RuntimeError as e:
        raise HTTPException(500, str(e))

# ==========================================================
# OBTENER VIDEOJUEGO POR ID
# ==========================================================

@router.get("/{id}", summary="Obtener videojuego por ID")
def obtener(id: int):
    try: # Busca el videojuego en la base de datos.
        vj = VideojuegoDAO.obtener_por_id(id)
        if not vj: # Si no existe devuelve error 404.
            raise HTTPException(404, f"Videojuego {id} no encontrado. ")
        return vj
    except RuntimeError as e:
            raise HTTPException(500, str(e))

# ==========================================================
# CREAR VIDEOJUEGO
# ==========================================================

@router.post("", status_code=201, summary="Registrar videojuego")
def crear(datos: VideojuegoCreate):
    try:
        return VideojuegoDAO.crear(datos.model_dump())
    except ValueError as e:
        raise HTTPException(422, str(e))
    
# ==========================================================
# ACTUALIZAR VIDEOJUEGO
# ==========================================================

@router.put("/{id}", summary="Editarjuego")
def actualizar(id: int, datos: VideojuegoUpdate):
    try:
        # Elimina los campos que llegaron vacíos.
        campos = {k: v for k, v in datos.model_dump().items() if v is not None}
        if not campos:  # Si no existe ese ID.
            raise HTTPException(400, "Debe enviar al menos un campo. ")
        actualizado = VideojuegoDAO.actualizar(id, campos)  # Llama al DAO.
        if not actualizado:
            raise HTTPException(404, f"Videojuego {id} no encontrado. ")
        return actualizado
    except ValueError as e:
        raise HTTPException(422, str(e))
    except RuntimeError as e:
        raise HTTPException(500, str(e))       
# ==========================================================
# ELIMINAR VIDEOJUEGO
# ==========================================================

@router.delete("/{id}", summary="Eliminar videojuego")
def eliminar(id: int):
    try:
        ok = VideojuegoDAO.eliminar(id)
        if not ok:
            raise HTTPException(404, f"Videojuego {id} no encontrado.")
        return {"mensaje": f"Videojuego {id} eliminado."}
    except RuntimeError as e:
        raise HTTPException(500, str(e))

# ==========================================================
# ACTUALIZAR STOCK
# ========================================================== 

@router.patch("/{id}/stock", summary="Actualizar stock")
def stock(id: int, datos: StockUpdate):
    try: # Solo modifica la cantidad disponible.
        actualizado = VideojuegoDAO.actualizar_stock(id, datos.cantidad)
        if not actualizado:
            raise HTTPException(404, f"Videojuego {id} no encontrado.")
        return actualizado
    except ValueError as e:
        raise HTTPException(422, str(e))
    except RuntimeError as e:
        raise HTTPException(500 , str(e))
    
    