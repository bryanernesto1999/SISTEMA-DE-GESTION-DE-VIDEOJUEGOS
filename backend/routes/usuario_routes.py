"""
RUTAS DE USUARIOS

Este archivo contiene todos los endpoints (rutas) del CRUD de 
Usuarios.

NOTA DE SEGURIDAD: password_hash se filtra (se excluye) de las
respuestas de GET / usuarios y GET /usuarios/ {id}, para no exponer
ese campo al cliente. Esto es independiente de si el valor ya esta
hasheado o no

NOTA: no se implementa login, JWT ni control de acceso en este archivo.
Esa funcionalidad queda para la fase de autenticacion.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from dao.usuario_dao import UsuarioDAO

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)


#MODELOS PYDANTIC================================================================
class UsuarioCreate(BaseModel):
    """Modelo utilizado para registrar un nuevo usuario."""
    nombre: str = Field(..., min_length=1, max_length=60)
    apellido: str = Field(..., min_length=1, max_length=60)
    email: str = Field(..., min_length=1, max_length=100)
    password_hash: str = Field(..., min_length=1, max_length=255)
    rol: str = Field(default="ALMACENERO")
    activo: bool = Field(default= True)
    
class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    email: Optional[str] = None
    password_hash: Optional[str] = None
    rol: Optional[str] = None
    activo: Optional[bool] = None
    
# FUNCION AUXILIAR DE FILTRADO====================================================
def _sin_password(usuario: dict) -> dict:
    """Devuelve una copia del usuario sin el campo password_hash."""
    return {k: v for k, v in usuario.items() if k !="password_hash"} 

#ENDPOINTS DEL CRUD=============================================================

#listar todos los usuarios========================================
@router.get("", summary="Listar todos los usuarios")
def listar():
    try:
        usuarios = UsuarioDAO.obtener_todos()
        return [_sin_password(u) for u in usuarios]
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    
#OBTENER USUARIO POR ID==============================================================
@router.get("/{id}", summary="Obtener usuario por ID")
def obtener(id: int):
    try:
        usr= UsuarioDAO.obtener_por_id(id)
        if not usr:
            raise HTTPException(404, f"Usuario {id} no encontrado.")
        return _sin_password(usr)
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    
#CREAR USUARIO====================================================================
@router.post("", status_code=201, summary="Registrar usuario.")
def crear(datos: UsuarioCreate):
    try:
        return UsuarioDAO.crear(datos.model_dump())
    except ValueError as e:
        raise HTTPException(422, str(e))
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    
#ACTUALIZAR USUARIO==============================================================
@router.put("/{id}", summary="Editar usuario")
def actualizar(id: int, datos: UsuarioUpdate):
    try:
        campos = {k: v for k, v in datos.model_dump().items() if v is not None}
        if not campos:
            raise HTTPException(400, "Debe enviar al menos un campo.")
        actualizado = UsuarioDAO.actualizar(id, campos)
        if not actualizado:
            raise HTTPException(404, f"Usuario {id} no encontrado.")
        return actualizado
    except ValueError as e:
        raise HTTPException(422, str(e))
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    
#ELIMINAR USUARIO==========================================================
@router.delete("/{id}", summary="Eliminar usuario")
def eliminar(id: int):
    try:
        ok = UsuarioDAO.eliminar(id)
        if not ok:
            raise HTTPException(404, f"Usuario {id} no encontrado.")
        return {"mensaje": f"Usuario {id} eliminado."}
    except RuntimeError as e:
        raise HTTPException(500, str(e))
        


    