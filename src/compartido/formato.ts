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

// Nombre del mes y año, ej. "Julio 2026" (para agrupar gastos por mes).
export function formatearMes(fecha: string | Date): string {
  const texto = new Date(fecha).toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function formatearFecha(fecha: string | Date): string {
  // Una fecha "solo día" (AAAA-MM-DD) la interpreta JS como medianoche UTC; al
  // mostrarla en hora Argentina (−3) retrocedería un día. Se fuerza a hora local
  // agregando la hora. Las fechas con hora (ISO completo) se dejan tal cual.
  const valor =
    typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)
      ? new Date(`${fecha}T00:00:00`)
      : new Date(fecha);
  return valor.toLocaleDateString('es-AR', {
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

// Las categorías (nombres, cuáles son producibles y cuáles insumo) dependen del
// rubro y salen de la configuración: usar useConfiguracion() (ConfiguracionProvider).

export const NOMBRES_FORMA_PAGO: Record<string, string> = {
  CONTADO: 'Contado',
  FIADO: 'Fiado',
  MIXTO: 'Mixto',
};
