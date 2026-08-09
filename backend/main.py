"""
SGIV — Sistema de Gestion de Inventario de Videojuegos
API REST con FastAPI + PostgreSQL (sgiv_db)
Curso: Programacion Orientada a Objetos 2025-I
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.videojuego_routes import router as vj_router
from routes.categoria_routes  import router as cat_router
from routes.proveedor_routes  import router as prov_router
from routes.almacen_routes import router as alm_router

app = FastAPI(
    title       = "SGIV — Sistema de Gestion de Inventario de Videojuegos",
    description = "API CRUD con POO en Python + PostgreSQL. Curso POO 2026-III ciclo.",
    version     = "2.0.0",
)

# CORS — permite peticiones desde el frontend React (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins  = ["http://localhost:5173","http://localhost:3000"],
    allow_methods  = ["*"],
    allow_headers  = ["*"],
)

# Monta los routers
app.include_router(vj_router)
app.include_router(cat_router)
app.include_router(prov_router)
app.include_router(alm_router)

@app.get("/", tags=["Root"])
def root():
    return {
        "sistema":  "SGIV",
        "version":  "2.0.0",
        "estado":   "activo",
        "docs":     "/docs",
    }
