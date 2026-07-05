import axios from 'axios';

// Cliente HTTP único para hablar con el backend.
export const clienteHttp = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

// Extrae un mensaje entendible de cualquier error de la API.
export function mensajeDeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const datos = error.response?.data as
      | { mensaje?: string | string[]; message?: string | string[] }
      | undefined;
    const mensaje = datos?.mensaje ?? datos?.message;
    if (Array.isArray(mensaje)) {
      return mensaje.join('. ');
    }
    if (mensaje) {
      return mensaje;
    }
    if (!error.response) {
      return 'No se pudo conectar con el sistema. ¿Está encendido el servidor?';
    }
  }
  return 'Ocurrió un error inesperado. Probá de nuevo.';
}
