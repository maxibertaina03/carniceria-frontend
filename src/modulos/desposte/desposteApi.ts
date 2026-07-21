import { clienteHttp } from '../../compartido/clienteHttp';

export interface CorteDesposte {
  id: string;
  productoId: string;
  productoNombre: string;
  unidadMedida: string;
  cantidad: number;
  valorReferencia: number;
  costoUnitario: number;
  subtotal: number;
}

export interface Desposte {
  id: string;
  fecha: string;
  proveedor: string | null;
  pesoRes: number;
  costoTotal: number;
  observaciones: string | null;
  cortes: CorteDesposte[];
}

export interface DatosRegistrarDesposte {
  proveedor?: string;
  pesoRes: number;
  costoTotal: number;
  observaciones?: string;
  cortes: { productoId: string; cantidad: number; valorReferencia: number }[];
}

export const desposteApi = {
  async listar(): Promise<Desposte[]> {
    const { data } = await clienteHttp.get('/despostes');
    return data;
  },

  async registrar(datos: DatosRegistrarDesposte): Promise<Desposte> {
    const { data } = await clienteHttp.post('/despostes', datos);
    return data;
  },

  async eliminar(id: string): Promise<void> {
    await clienteHttp.delete(`/despostes/${id}`);
  },
};
