import { clienteHttp } from '../../compartido/clienteHttp';

export interface Proveedor {
  id: string;
  nombre: string;
  telefono: string | null;
  saldoAdeudado: number;
  activo: boolean;
  fechaCreacion: string;
}

export interface MovimientoProveedor {
  id: string;
  tipo: 'CARGO' | 'PAGO';
  monto: number;
  fecha: string;
  compraId: string | null;
  gastoId: string | null;
  observaciones: string | null;
}

export const proveedoresApi = {
  async listar(): Promise<Proveedor[]> {
    const { data } = await clienteHttp.get('/proveedores');
    return data;
  },

  async obtenerMovimientos(
    id: string,
  ): Promise<{ proveedor: Proveedor; movimientos: MovimientoProveedor[] }> {
    const { data } = await clienteHttp.get(`/proveedores/${id}/movimientos`);
    return data;
  },

  async crear(datos: { nombre: string; telefono?: string }): Promise<Proveedor> {
    const { data } = await clienteHttp.post('/proveedores', datos);
    return data;
  },

  async actualizar(
    id: string,
    datos: { nombre?: string; telefono?: string; activo?: boolean },
  ): Promise<Proveedor> {
    const { data } = await clienteHttp.patch(`/proveedores/${id}`, datos);
    return data;
  },

  async registrarPago(
    id: string,
    datos: { monto: number; observaciones?: string },
  ): Promise<unknown> {
    const { data } = await clienteHttp.post(`/proveedores/${id}/pagos`, datos);
    return data;
  },

  async desactivar(id: string): Promise<void> {
    await clienteHttp.delete(`/proveedores/${id}`);
  },

  async eliminarDefinitivo(id: string): Promise<void> {
    await clienteHttp.delete(`/proveedores/${id}/definitivo`);
  },
};
