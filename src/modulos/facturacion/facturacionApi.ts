import { clienteHttp } from '../../compartido/clienteHttp';

export type TipoComprobante =
  | 'FACTURA'
  | 'NOTA_CREDITO'
  | 'NOTA_DEBITO'
  | 'RECIBO';

export type EstadoComprobante = 'EMITIDO' | 'ANULADO';

export interface ItemComprobante {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Comprobante {
  id: string;
  tipo: TipoComprobante;
  letra: string;
  puntoVenta: string;
  numero: number;
  numeroFormateado: string;
  fecha: string;
  receptorNombre: string;
  receptorDocTipo: string | null;
  receptorDocNumero: string | null;
  receptorDomicilio: string | null;
  neto: number;
  alicuotaIva: number;
  iva: number;
  total: number;
  observaciones: string | null;
  estado: EstadoComprobante;
  comprobanteOrigenId: string | null;
  comprobanteOrigenNumero: string | null;
  items: ItemComprobante[];
}

export interface DatosComprobante {
  tipo: TipoComprobante;
  letra?: string;
  puntoVenta?: string;
  fecha?: string;
  receptor: {
    nombre: string;
    docTipo?: string;
    docNumero?: string;
    domicilio?: string;
  };
  alicuotaIva?: number;
  items: { descripcion: string; cantidad: number; precioUnitario: number }[];
  observaciones?: string;
  comprobanteOrigenId?: string;
}

export const ETIQUETA_TIPO: Record<TipoComprobante, string> = {
  FACTURA: 'Factura',
  NOTA_CREDITO: 'Nota de crédito',
  NOTA_DEBITO: 'Nota de débito',
  RECIBO: 'Recibo',
};

export const facturacionApi = {
  async listar(tipo?: TipoComprobante): Promise<Comprobante[]> {
    const { data } = await clienteHttp.get('/facturacion/comprobantes', {
      params: tipo ? { tipo } : undefined,
    });
    return data;
  },

  async obtener(id: string): Promise<Comprobante> {
    const { data } = await clienteHttp.get(`/facturacion/comprobantes/${id}`);
    return data;
  },

  async crear(datos: DatosComprobante): Promise<Comprobante> {
    const { data } = await clienteHttp.post('/facturacion/comprobantes', datos);
    return data;
  },

  async anular(id: string): Promise<Comprobante> {
    const { data } = await clienteHttp.post(
      `/facturacion/comprobantes/${id}/anular`,
    );
    return data;
  },
};
