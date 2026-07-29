import { clienteHttp } from '../../compartido/clienteHttp';

export interface ReporteGanancias {
  cantidadVentas: number;
  totalVendido: number;
  gananciaTotal: number;
  totalContado: number;
  totalFiado: number;
  totalGastos: number;
  resultado: number;
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

export interface ResumenInicio {
  fecha: string;
  ventasHoy: {
    cantidad: number;
    total: number;
    contado: number;
    fiado: number;
  };
  totalPorCobrar: number;
  totalPorPagar: number;
  pedidosPendientes: number;
  boletas: {
    vencidas: number;
    porVencer: number;
    totalAdeudado: number;
  };
  lotes: {
    vencidos: number;
    porVencer: number;
  };
}

export const reportesApi = {
  async resumenInicio(): Promise<ResumenInicio> {
    const { data } = await clienteHttp.get('/reportes/inicio');
    return data;
  },

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
