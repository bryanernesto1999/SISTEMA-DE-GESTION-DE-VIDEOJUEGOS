/**
 * Cliente HTTP compartido por todos los DAOs del frontend.
 * Centraliza la URL base y el manejo de errores (mismo patrón que
 * ya usaba videojuegoDAO.js, extraído para reutilizarlo en todos
 * los módulos nuevos sin duplicar código).
 */
export const BASE = 'http://localhost:8000';

export async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  // DELETE puede no traer body en algunos backends; nos cubrimos igual.
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.detail || `Error ${res.status}`);
  return data;
}
