

from fastapi import APIRouter, HTTPException # Importo APIRouter para crear las rutas de la API
from dao.videojuego_dao import VideojuegoDAO # e HTTPException para mostrar errores al usuario.

# Creo un router para agrupar todas las rutas relacionadas con categorías. Todas las rutas empezarán con /categorias.
router = APIRouter(
    prefix="/categorias",
    tags=["Categorias"]
)

# LISTAR TODAS LAS CATEGORIAS ================================

@router.get("", summary= "Listar todas las categorias")  #Esta ruta responde al metoo GET cuando el usuario ingresa a/categorias
def listar(): #listar
    try:
        return VideojuegoDAO.obtener_categorias()
     
    except RuntimeError as e: #si ocurre un error en la base de datos devolviendo un error HTTP 500 
        raise  HTTPException(status_code=500, detail=str(e))
    
#MOSTRAR ALERTAS DE STOCK =======================================

#esta rut respode al metodo get cuando el usuario entra a/categorias/alertas
#muestra las alertas en stock pendientes 
@router.get("/alertas", summary = "Ver alertas de stock activas")
def alertas():
    
    try: #Obtengo las alertas desde la base de datos.
        return VideojuegoDAO.obtener_alertas() # Si ocurre un error, envío un mensaje con código 500.
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))