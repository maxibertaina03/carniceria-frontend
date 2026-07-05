import { clienteHttp } from '../../compartido/clienteHttp';

export interface ItemVenta {
  id: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitarioVenta: number;
  costoUnitario: number;
  subtotal: number;
  gananciaLinea: number;
}

export interface Venta {
  id: string;
  fecha: string;
  clienteId: string | null;
  clienteNombre: string | null;
  total: number;
  montoContado: number;
  montoFiado: number;
  formaPago: 'CONTADO' | 'FIADO' | 'MIXTO';
  gananciaTotal: number;
  observaciones: string | null;
  items: ItemVenta[];
}

export interface DatosRegistrarVenta {
  clienteId?: string;
  montoFiado?: number;
  observaciones?: string;
  items: { productoId: string; cantidad: number; precioUnitarioVenta: number }[];
}

export const ventasApi = {
  async listar(): Promise<Venta[]> {
    const { data } = await clienteHttp.get('/ventas');
    return data;
  },

  async registrar(datos: DatosRegistrarVenta): Promise<Venta> {
    const { data } = await clienteHttp.post('/ventas', datos);
    return data;
  },
};
