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
  diasVencimiento: number | null;
  imagen: string | null;
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
  // Días de vencimiento (solo rubros con lotes). null para quitarlo.
  diasVencimiento?: number | null;
  // Foto del producto (data URI). null para quitarla.
  imagen?: string | null;
  // Cuánto hay hoy del producto al darlo de alta.
  stockInicial?: number;
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

  // Deja el stock en la cantidad real contada (no la suma).
  async ajustarStock(id: string, cantidad: number): Promise<Producto> {
    const { data } = await clienteHttp.post(`/productos/${id}/ajustar-stock`, {
      cantidad,
    });
    return data;
  },

  async desactivar(id: string): Promise<void> {
    await clienteHttp.delete(`/productos/${id}`);
  },

  async actualizarPrecios(datos: {
    porcentaje: number;
    categorias?: string[];
    redondearA?: number;
    incluirPresentaciones?: boolean;
  }): Promise<{ productos: number; presentaciones: number }> {
    const { data } = await clienteHttp.post('/productos/actualizar-precios', datos);
    return data;
  },
};

// Precio nuevo tras aplicar el porcentaje (misma fórmula que el backend).
// Se usa para la vista previa antes de aplicar.
export function nuevoPrecioPorcentaje(
  precio: number,
  porcentaje: number,
  redondearA?: number,
): number {
  const valor = precio * (1 + porcentaje / 100);
  if (redondearA && redondearA > 0) {
    return Math.round(valor / redondearA) * redondearA;
  }
  return Math.round(valor * 100) / 100;
}
