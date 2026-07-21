const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
});

export function formatearMoneda(monto: number): string {
  return formatoMoneda.format(monto);
}

const ABREVIATURA_UNIDAD: Record<string, string> = {
  KG: 'kg',
  GRAMO: 'g',
  METRO: 'm',
  UNIDAD: 'u.',
};

// Abreviatura corta de la unidad, para textos como "$1.200/kg".
export function abreviarUnidad(unidad: string): string {
  return ABREVIATURA_UNIDAD[unidad] ?? unidad.toLowerCase();
}

export function formatearCantidad(cantidad: number, unidad: string): string {
  const numero = new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 3,
  }).format(cantidad);
  return `${numero} ${ABREVIATURA_UNIDAD[unidad] ?? unidad.toLowerCase()}`;
}

// Porcentaje de margen sobre el precio de venta (ganancia / precio).
export function formatearMargen(costo: number, precioVenta: number): string {
  if (precioVenta <= 0) {
    return '—';
  }
  const margen = ((precioVenta - costo) / precioVenta) * 100;
  return `${margen.toFixed(0)}%`;
}

export function formatearFecha(fecha: string | Date): string {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatearFechaYHora(fecha: string | Date): string {
  return new Date(fecha).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const NOMBRES_CATEGORIA: Record<string, string> = {
  VACUNO: 'Vacuno',
  CERDO: 'Cerdo',
  AVE: 'Ave',
  CHACINADOS: 'Chacinados',
  MILANESAS: 'Milanesas',
  HAMBURGUESAS: 'Hamburguesas',
  INSUMOS: 'Insumos',
  OTROS: 'Otros',
};

// Categorías cuyos productos se fabrican con una receta (módulo Producción).
export const CATEGORIAS_PRODUCIBLES = ['CHACINADOS', 'MILANESAS', 'HAMBURGUESAS'];

// Categoría de los ingredientes que se pueden usar en una receta.
export const CATEGORIA_INSUMO = 'INSUMOS';

export const NOMBRES_FORMA_PAGO: Record<string, string> = {
  CONTADO: 'Contado',
  FIADO: 'Fiado',
  MIXTO: 'Mixto',
};
