import { clienteHttp } from '../../compartido/clienteHttp';

export interface Presentacion {
  id: string;
  productoId: string;
  nombre: string;
  cantidadEquivalente: number;
  precio: number;
  activo: boolean;
}

export interface DatosPresentacion {
  productoId: string;
  nombre: string;
  cantidadEquivalente: number;
  precio: number;
}

export const presentacionesApi = {
  async listar(productoId?: string): Promise<Presentacion[]> {
    const { data } = await clienteHttp.get('/presentaciones', {
      params: productoId ? { productoId } : {},
    });
    return data;
  },

  async crear(datos: DatosPresentacion): Promise<Presentacion> {
    const { data } = await clienteHttp.post('/presentaciones', datos);
    return data;
  },

  async actualizar(
    id: string,
    datos: Partial<Omit<DatosPresentacion, 'productoId'>> & { activo?: boolean },
  ): Promise<Presentacion> {
    const { data } = await clienteHttp.patch(`/presentaciones/${id}`, datos);
    return data;
  },

  async eliminar(id: string): Promise<void> {
    await clienteHttp.delete(`/presentaciones/${id}`);
  },
};
