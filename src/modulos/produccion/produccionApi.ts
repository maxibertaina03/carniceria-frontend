import { clienteHttp } from '../../compartido/clienteHttp';

export interface IngredienteReceta {
  productoId: string;
  productoNombre: string;
  unidadMedida: string;
  cantidad: number;
}

export interface Receta {
  id: string;
  productoTerminadoId: string;
  productoTerminadoNombre: string;
  rindeCantidad: number;
  activa: boolean;
  ingredientes: IngredienteReceta[];
}

export interface DatosReceta {
  productoTerminadoId: string;
  rindeCantidad: number;
  ingredientes: { productoId: string; cantidad: number }[];
}

export interface ItemProduccion {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
}

export interface OrdenProduccion {
  id: string;
  fecha: string;
  productoTerminadoId: string;
  productoTerminadoNombre: string;
  cantidadProducida: number;
  costoTotal: number;
  costoUnitario: number;
  observaciones: string | null;
  items: ItemProduccion[];
}

export interface DatosProducir {
  productoTerminadoId: string;
  cantidadProducida: number;
  observaciones?: string;
}

export const produccionApi = {
  async listarRecetas(): Promise<Receta[]> {
    const { data } = await clienteHttp.get('/recetas');
    return data;
  },

  async guardarReceta(datos: DatosReceta): Promise<Receta> {
    const { data } = await clienteHttp.put('/recetas', datos);
    return data;
  },

  async eliminarReceta(productoTerminadoId: string): Promise<void> {
    await clienteHttp.delete(`/recetas/producto/${productoTerminadoId}`);
  },

  async listarOrdenes(): Promise<OrdenProduccion[]> {
    const { data } = await clienteHttp.get('/produccion');
    return data;
  },

  async producir(datos: DatosProducir): Promise<OrdenProduccion> {
    const { data } = await clienteHttp.post('/produccion', datos);
    return data;
  },

  async eliminarOrden(id: string): Promise<void> {
    await clienteHttp.delete(`/produccion/${id}`);
  },

  // Recalcula el costo de los productos producidos según el precio de sus insumos.
  async recalcularCostos(): Promise<void> {
    await clienteHttp.post('/produccion/recalcular-costos');
  },
};
