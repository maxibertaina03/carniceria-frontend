import { clienteHttp } from '../../compartido/clienteHttp';

export interface ItemCompra {
  id: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
}

export interface Compra {
  id: string;
  fecha: string;
  proveedor: string | null;
  total: number;
  observaciones: string | null;
  items: ItemCompra[];
}

export interface DatosRegistrarCompra {
  proveedor?: string;
  observaciones?: string;
  items: { productoId: string; cantidad: number; costoUnitario: number }[];
}

export const comprasApi = {
  async listar(): Promise<Compra[]> {
    const { data } = await clienteHttp.get('/compras');
    return data;
  },

  async registrar(datos: DatosRegistrarCompra): Promise<Compra> {
    const { data } = await clienteHttp.post('/compras', datos);
    return data;
  },
};
