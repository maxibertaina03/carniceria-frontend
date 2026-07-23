import { clienteHttp } from '../../compartido/clienteHttp';

export interface Gasto {
  id: string;
  fecha: string;
  concepto: string;
  categoria: string | null;
  monto: number;
  adeudado: boolean;
  proveedorId: string | null;
  proveedorNombre: string | null;
  observaciones: string | null;
}

export interface DatosGasto {
  concepto: string;
  categoria?: string;
  monto: number;
  adeudado?: boolean;
  proveedorId?: string;
  observaciones?: string;
  fecha?: string;
}

export const gastosApi = {
  async listar(): Promise<Gasto[]> {
    const { data } = await clienteHttp.get('/gastos');
    return data;
  },

  async crear(datos: DatosGasto): Promise<Gasto> {
    const { data } = await clienteHttp.post('/gastos', datos);
    return data;
  },

  async eliminar(id: string): Promise<void> {
    await clienteHttp.delete(`/gastos/${id}`);
  },
};
