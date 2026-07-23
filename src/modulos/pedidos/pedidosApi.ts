import { clienteHttp } from '../../compartido/clienteHttp';

export interface ItemPedido {
  productoId: string;
  productoNombre: string;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export type EstadoPedido = 'PENDIENTE' | 'ENTREGADO' | 'CANCELADO';

export interface Pedido {
  id: string;
  fecha: string;
  clienteId: string | null;
  clienteNombre: string | null;
  nombreContacto: string | null;
  telefono: string | null;
  fechaEntrega: string | null;
  estado: EstadoPedido;
  observaciones: string | null;
  ventaId: string | null;
  total: number;
  items: ItemPedido[];
}

export interface DatosPedido {
  clienteId?: string;
  nombreContacto?: string;
  telefono?: string;
  fechaEntrega?: string;
  observaciones?: string;
  items: { productoId: string; cantidad: number; precioUnitario?: number }[];
}

export interface DatosEntrega {
  clienteId?: string;
  montoFiado?: number;
  observaciones?: string;
  items?: { productoId: string; cantidad: number; precioUnitarioVenta: number }[];
}

export const pedidosApi = {
  async listar(soloPendientes = false): Promise<Pedido[]> {
    const { data } = await clienteHttp.get('/pedidos', {
      params: soloPendientes ? { soloPendientes: 'true' } : {},
    });
    return data;
  },

  async crear(datos: DatosPedido): Promise<Pedido> {
    const { data } = await clienteHttp.post('/pedidos', datos);
    return data;
  },

  async entregar(id: string, datos: DatosEntrega): Promise<Pedido> {
    const { data } = await clienteHttp.post(`/pedidos/${id}/entregar`, datos);
    return data;
  },

  async cancelar(id: string): Promise<Pedido> {
    const { data } = await clienteHttp.post(`/pedidos/${id}/cancelar`);
    return data;
  },

  async eliminar(id: string): Promise<void> {
    await clienteHttp.delete(`/pedidos/${id}`);
  },
};
