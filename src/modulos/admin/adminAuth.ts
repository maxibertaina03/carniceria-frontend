import { clienteHttp } from '../../compartido/clienteHttp';

// La contraseña de administrador la escribe el usuario y se guarda solo en su
// dispositivo (no viaja en el código de la app). Se manda en el header
// x-admin-clave para las rutas del módulo de administrador.
const CLAVE_ADMIN = 'clave_admin';

export function obtenerClaveAdmin(): string | null {
  return localStorage.getItem(CLAVE_ADMIN);
}

export function hayClaveAdmin(): boolean {
  return Boolean(obtenerClaveAdmin());
}

function aplicarHeader(clave: string | null) {
  if (clave) {
    clienteHttp.defaults.headers.common['x-admin-clave'] = clave;
  } else {
    delete clienteHttp.defaults.headers.common['x-admin-clave'];
  }
}

export function guardarClaveAdmin(clave: string) {
  localStorage.setItem(CLAVE_ADMIN, clave);
  aplicarHeader(clave);
}

export function cerrarSesionAdmin() {
  localStorage.removeItem(CLAVE_ADMIN);
  aplicarHeader(null);
}

// Verifica una contraseña contra el servidor sin guardarla todavía.
export async function verificarClaveAdmin(clave: string): Promise<boolean> {
  try {
    await clienteHttp.get('/facturacion/verificar', {
      headers: { 'x-admin-clave': clave },
    });
    return true;
  } catch {
    return false;
  }
}

// Al cargar la app, si ya había una contraseña guardada, se reactiva.
aplicarHeader(obtenerClaveAdmin());
