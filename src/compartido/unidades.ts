// Conversión de unidades, igual que en el backend: un producto se compra y
// stockea en su unidad (ej. sal por KG) pero en las recetas se puede cargar en
// otra compatible (ej. GRAMO), y se convierte para calcular el costo.

const EQUIVALENCIAS: Record<string, { grupo: string; enBase: number }> = {
  KG: { grupo: 'peso', enBase: 1000 },
  GRAMO: { grupo: 'peso', enBase: 1 },
  METRO: { grupo: 'longitud', enBase: 1 },
  UNIDAD: { grupo: 'unidad', enBase: 1 },
};

export function sonCompatibles(a: string, b: string): boolean {
  return EQUIVALENCIAS[a]?.grupo === EQUIVALENCIAS[b]?.grupo;
}

// Unidades en las que se puede cargar una cantidad de un producto medido
// en `unidadProducto` (ej. un producto en KG admite KG y GRAMO).
export function unidadesCompatibles(unidadProducto: string): string[] {
  const grupo = EQUIVALENCIAS[unidadProducto]?.grupo;
  return Object.keys(EQUIVALENCIAS).filter(
    (unidad) => EQUIVALENCIAS[unidad].grupo === grupo,
  );
}

// Ej: convertirCantidad(28, 'GRAMO', 'KG') = 0,028
export function convertirCantidad(
  cantidad: number,
  desde: string,
  hacia: string,
): number {
  if (desde === hacia || !sonCompatibles(desde, hacia)) {
    return cantidad;
  }
  return (cantidad * EQUIVALENCIAS[desde].enBase) / EQUIVALENCIAS[hacia].enBase;
}
