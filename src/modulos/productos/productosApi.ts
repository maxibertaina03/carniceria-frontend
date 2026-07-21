import { clienteHttp } from '../../compartido/clienteHttp';

export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  subcategoria: string | null;
  unidadMedida: string;
  stockActual: number;
  costoUnitarioReferencia: number;
  precioVentaReferencia: number;
  seVende: boolean;
  activo: boolean;
  fechaCreacion: string;
}

export interface DatosProducto {
  nombre: string;
  categoria: string;
  subcategoria?: string;
  unidadMedida?: string;
  costoUnitarioReferencia?: number;
  precioVentaReferencia?: number;
  seVende?: boolean;
}

export const productosApi = {
  async listar(incluirInactivos = false): Promise<Producto[]> {
    const { data } = await clienteHttp.get('/productos', {
      params: incluirInactivos ? { incluirInactivos: 'true' } : {},
    });
    return data;
  },

  async crear(datos: DatosProducto): Promise<Producto> {
    const { data } = await clienteHttp.post('/productos', datos);
    return data;
  },

  async actualizar(
    id: string,
    datos: Partial<DatosProducto> & { activo?: boolean },
  ): Promise<Producto> {
    const { data } = await clienteHttp.patch(`/productos/${id}`, datos);
    return data;
  },

  async desactivar(id: string): Promise<void> {
    await clienteHttp.delete(`/productos/${id}`);
  },
};
