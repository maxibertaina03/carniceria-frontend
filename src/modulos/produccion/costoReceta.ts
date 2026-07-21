import { Producto } from '../productos/productosApi';
import { Receta } from './produccionApi';

export interface DesgloseIngrediente {
  productoId: string;
  nombre: string;
  unidad: string;
  cantidad: number;
  // Costo por unidad del insumo (precio de referencia).
  costoUnitario: number;
  // Costo de este ingrediente por el rinde base de la receta.
  subtotal: number;
}

export interface CostoReceta {
  // Costo de producción por unidad del producto terminado.
  costoUnitario: number;
  desglose: DesgloseIngrediente[];
}

// Calcula el costo de una receta con el precio actual de sus insumos.
// Es el mismo cálculo que hace el backend; acá se usa para mostrarlo en vivo.
export function calcularCostoReceta(
  receta: Receta,
  productos: Producto[] | undefined,
): CostoReceta {
  const porId = new Map((productos ?? []).map((p) => [p.id, p]));
  const desglose = receta.ingredientes.map((ingrediente) => {
    const producto = porId.get(ingrediente.productoId);
    const costoUnitario = producto?.costoUnitarioReferencia ?? 0;
    return {
      productoId: ingrediente.productoId,
      nombre: ingrediente.productoNombre,
      unidad: ingrediente.unidadMedida,
      cantidad: ingrediente.cantidad,
      costoUnitario,
      subtotal: costoUnitario * ingrediente.cantidad,
    };
  });
  const total = desglose.reduce((suma, item) => suma + item.subtotal, 0);
  return {
    costoUnitario: receta.rindeCantidad > 0 ? total / receta.rindeCantidad : 0,
    desglose,
  };
}
