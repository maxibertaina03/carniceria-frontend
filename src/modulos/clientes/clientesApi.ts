import { clienteHttp } from '../../compartido/clienteHttp';

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string | null;
  saldoDeudor: number;
  activo: boolean;
  fechaCreacion: string;
}

export interface MovimientoCuenta {
  id: string;
  tipo: 'CARGO' | 'PAGO';
  monto: number;
  fecha: string;
  ventaId: string | null;
  observaciones: string | null;
}

export const clientesApi = {
  async listar(incluirInactivos = false): Promise<Cliente[]> {
    const { data } = await clienteHttp.get('/clientes', {
      params: incluirInactivos ? { incluirInactivos: 'true' } : {},
    });
    return data;
  },

  async obtener(id: string): Promise<Cliente> {
    const { data } = await clienteHttp.get(`/clientes/${id}`);
    return data;
  },

  async crear(datos: { nombre: string; telefono?: string }): Promise<Cliente> {
    const { data } = await clienteHttp.post('/clientes', datos);
    return data;
  },

  async actualizar(
    id: string,
    datos: { nombre?: string; telefono?: string; activo?: boolean },
  ): Promise<Cliente> {
    const { data } = await clienteHttp.patch(`/clientes/${id}`, datos);
    return data;
  },

  async desactivar(id: string): Promise<void> {
    await clienteHttp.delete(`/clientes/${id}`);
  },

  async eliminarDefinitivo(id: string): Promise<void> {
    await clienteHttp.delete(`/clientes/${id}/definitivo`);
  },

  async obtenerMovimientos(
    id: string,
  ): Promise<{ cliente: Cliente; movimientos: MovimientoCuenta[] }> {
    const { data } = await clienteHttp.get(`/clientes/${id}/movimientos`);
    return data;
  },

  async registrarPago(
    id: string,
    datos: { monto: number; observaciones?: string },
  ): Promise<{ cliente: Cliente; movimiento: MovimientoCuenta }> {
    const { data } = await clienteHttp.post(`/clientes/${id}/pagos`, datos);
    return data;
  },
};
