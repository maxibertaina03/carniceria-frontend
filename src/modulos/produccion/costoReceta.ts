import { convertirCantidad } from '../../compartido/unidades';
import { Producto } from '../productos/productosApi';
import { Receta } from './produccionApi';

export interface DesgloseIngrediente {
  productoId: string;
  nombre: string;
  // Cantidad y unidad tal como están cargadas en la receta (ej. 28 g).
  cantidad: number;
  unidad: string;
  // Costo del producto por su propia unidad (ej. $1.500 por kg).
  costoUnitario: number;
  unidadProducto: string;
  // Costo de este ingrediente por el rinde base de la receta.
  subtotal: number;
}

export interface CostoReceta {
  // Costo de producción por unidad del producto terminado.
  costoUnitario: number;
  desglose: DesgloseIngrediente[];
}

// Calcula el costo de una receta con el precio actual de sus insumos.
// Es el mismo cálculo que hace el backend: la cantidad de la receta se
// convierte a la unidad del producto (ej. 28 g → 0,028 kg) antes de costear.
export function calcularCostoReceta(
  receta: Receta,
  productos: Producto[] | undefined,
): CostoReceta {
  const porId = new Map((productos ?? []).map((p) => [p.id, p]));
  const desglose = receta.ingredientes.map((ingrediente) => {
    const producto = porId.get(ingrediente.productoId);
    const unidadProducto =
      producto?.unidadMedida ?? ingrediente.unidadProducto ?? ingrediente.unidad;
    const costoUnitario = producto?.costoUnitarioReferencia ?? 0;
    const cantidadEnUnidadProducto = convertirCantidad(
      ingrediente.cantidad,
      ingrediente.unidad,
      unidadProducto,
    );
    return {
      productoId: ingrediente.productoId,
      nombre: ingrediente.productoNombre,
      cantidad: ingrediente.cantidad,
      unidad: ingrediente.unidad,
      costoUnitario,
      unidadProducto,
      subtotal: costoUnitario * cantidadEnUnidadProducto,
    };
  });
  const total = desglose.reduce((suma, item) => suma + item.subtotal, 0);
  return {
    costoUnitario: receta.rindeCantidad > 0 ? total / receta.rindeCantidad : 0,
    desglose,
  };
}
