import { clienteHttp } from '../../compartido/clienteHttp';

export interface ReporteGanancias {
  cantidadVentas: number;
  totalVendido: number;
  gananciaTotal: number;
  totalContado: number;
  totalFiado: number;
}

export interface ProductoMasVendido {
  productoId: string;
  nombre: string;
  unidadMedida: string;
  cantidadVendida: number;
  totalVendido: number;
  gananciaGenerada: number;
}

export interface DeudaCliente {
  clienteId: string;
  nombre: string;
  telefono: string | null;
  saldoDeudor: number;
}

export interface StockProducto {
  productoId: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  stockActual: number;
  costoUnitarioReferencia: number;
  precioVentaReferencia: number;
}

export interface RangoFechas {
  desde?: string;
  hasta?: string;
}

export const reportesApi = {
  async ganancias(rango: RangoFechas): Promise<ReporteGanancias> {
    const { data } = await clienteHttp.get('/reportes/ganancias', { params: rango });
    return data;
  },

  async productosMasVendidos(rango: RangoFechas): Promise<ProductoMasVendido[]> {
    const { data } = await clienteHttp.get('/reportes/productos-mas-vendidos', {
      params: rango,
    });
    return data;
  },

  async deudas(): Promise<DeudaCliente[]> {
    const { data } = await clienteHttp.get('/reportes/deudas');
    return data;
  },

  async stock(): Promise<StockProducto[]> {
    const { data } = await clienteHttp.get('/reportes/stock');
    return data;
  },
};
