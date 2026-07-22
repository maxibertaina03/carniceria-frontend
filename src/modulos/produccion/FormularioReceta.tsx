import { FormEvent, useState } from 'react';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { AvisoError } from '../../compartido/componentes/AvisoError';
import { Modal } from '../../compartido/componentes/Modal';
import {
  abreviarUnidad,
  CATEGORIA_INSUMO,
  CATEGORIAS_PRODUCIBLES,
  formatearMoneda,
} from '../../compartido/formato';
import { convertirCantidad, unidadesCompatibles } from '../../compartido/unidades';
import { useProductos } from '../productos/useProductos';
import { Receta } from './produccionApi';
import { useMutacionesReceta } from './useProduccion';

interface LineaIngrediente {
  productoId: string;
  cantidad: string;
  // Unidad en la que se carga la cantidad (ej. gramos de una sal comprada por kg).
  unidad: string;
}

interface Props {
  abierto: boolean;
  alCerrar: () => void;
  // Si viene una receta, se edita; si no, se crea una nueva.
  receta?: Receta | null;
}

export function FormularioReceta({ abierto, alCerrar, receta }: Props) {
  const { data: productos } = useProductos();
  const { guardar } = useMutacionesReceta();
  const [error, setError] = useState<string | null>(null);

  const editando = Boolean(receta);
  const [productoTerminadoId, setProductoTerminadoId] = useState(
    receta?.productoTerminadoId ?? '',
  );
  const [rinde, setRinde] = useState(
    receta ? String(receta.rindeCantidad) : '',
  );
  const [ingredientes, setIngredientes] = useState<LineaIngrediente[]>(
    receta && receta.ingredientes.length > 0
      ? receta.ingredientes.map((i) => ({
          productoId: i.productoId,
          cantidad: String(i.cantidad),
          unidad: i.unidad,
        }))
      : [{ productoId: '', cantidad: '', unidad: '' }],
  );

  const terminado = productos?.find((p) => p.id === productoTerminadoId);

  // El producto a producir solo puede ser de categorías producibles;
  // los ingredientes solo insumos (incluye las carnes de producción).
  const productosProducibles = productos?.filter((p) =>
    CATEGORIAS_PRODUCIBLES.includes(p.categoria),
  );
  const insumos = productos?.filter((p) => p.categoria === CATEGORIA_INSUMO);

  function unidadDe(productoId: string): string {
    return productos?.find((p) => p.id === productoId)?.unidadMedida ?? '';
  }

  // Costo de una línea: la cantidad se convierte a la unidad del producto
  // (ej. 28 g → 0,028 kg) y se multiplica por su precio (ej. $1.500 el kg).
  function costoDeLinea(linea: LineaIngrediente): number | null {
    const producto = productos?.find((p) => p.id === linea.productoId);
    const cantidad = Number(linea.cantidad);
    if (!producto || !(cantidad > 0) || !linea.unidad) {
      return null;
    }
    const enUnidadProducto = convertirCantidad(
      cantidad,
      linea.unidad,
      producto.unidadMedida,
    );
    return producto.costoUnitarioReferencia * enUnidadProducto;
  }

  // Costo estimado por unidad producida, en vivo con los precios actuales.
  const rindeNum = Number(rinde);
  const costoEstimado =
    rindeNum > 0 &&
    ingredientes.some((linea) => linea.productoId && Number(linea.cantidad) > 0)
      ? ingredientes.reduce((suma, linea) => suma + (costoDeLinea(linea) ?? 0), 0) /
        rindeNum
      : null;

  function cambiarIngrediente(indice: number, cambios: Partial<LineaIngrediente>) {
    setIngredientes((previas) =>
      previas.map((linea, i) => (i === indice ? { ...linea, ...cambios } : linea)),
    );
  }

  // Al elegir el ingrediente, se arranca con la unidad del propio producto
  // (después se puede pasar a gramos si es algo que se usa de a poco).
  function elegirIngrediente(indice: number, productoId: string) {
    cambiarIngrediente(indice, {
      productoId,
      unidad: unidadDe(productoId),
    });
  }

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    setError(null);

    if (!productoTerminadoId) {
      setError('Elegí qué producto produce esta receta.');
      return;
    }
    const ingredientesValidos = ingredientes
      .filter((linea) => linea.productoId)
      .map((linea) => ({
        productoId: linea.productoId,
        cantidad: Number(linea.cantidad),
        unidad: linea.unidad || unidadDe(linea.productoId),
      }));
    if (ingredientesValidos.length === 0) {
      setError('Agregá al menos un ingrediente.');
      return;
    }

    try {
      await guardar.mutateAsync({
        productoTerminadoId,
        rindeCantidad: Number(rinde),
        ingredientes: ingredientesValidos,
      });
      alCerrar();
    } catch (excepcion) {
      setError(mensajeDeError(excepcion));
    }
  }

  return (
    <Modal
      titulo={editando ? `Receta de ${receta?.productoTerminadoNombre}` : 'Nueva receta'}
      abierto={abierto}
      alCerrar={alCerrar}
    >
      <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
        <div>
          <label className="etiqueta" htmlFor="terminado">Producto que se produce</label>
          {editando ? (
            <p className="campo bg-gray-50">{receta?.productoTerminadoNombre}</p>
          ) : (
            <select
              id="terminado"
              className="campo"
              value={productoTerminadoId}
              onChange={(evento) => setProductoTerminadoId(evento.target.value)}
            >
              <option value="">Elegir producto…</option>
              {productosProducibles?.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre}
                  {producto.subcategoria ? ` (${producto.subcategoria})` : ''}
                </option>
              ))}
            </select>
          )}
          {!editando && (
            <p className="mt-1 text-xs text-gray-500">
              Se producen chacinados, milanesas y hamburguesas.
            </p>
          )}
        </div>

        <div>
          <label className="etiqueta" htmlFor="rinde">
            ¿Cuánto rinde esta fórmula?{terminado ? ` (en ${unidadDe(productoTerminadoId).toLowerCase()})` : ''}
          </label>
          <input
            id="rinde"
            className="campo"
            type="number"
            min="0.001"
            step="0.001"
            value={rinde}
            onChange={(evento) => setRinde(evento.target.value)}
            placeholder="Ej: 10"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Las cantidades de abajo son por este rinde. Al producir, se escalan solas.
          </p>
        </div>

        <div>
          <span className="etiqueta">Ingredientes (por el rinde)</span>
          <div className="flex flex-col gap-2">
            {ingredientes.map((linea, indice) => {
              const producto = productos?.find((p) => p.id === linea.productoId);
              const costo = costoDeLinea(linea);
              return (
                <div
                  key={indice}
                  className="rounded-lg border border-gray-100 p-2 sm:border-0 sm:p-0"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="campo sm:w-auto sm:flex-1"
                      value={linea.productoId}
                      onChange={(evento) =>
                        elegirIngrediente(indice, evento.target.value)
                      }
                    >
                      <option value="">Elegir ingrediente…</option>
                      {insumos?.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                    <input
                      className="campo min-w-0 flex-1 sm:w-24 sm:flex-none"
                      type="number"
                      min="0.001"
                      step="0.001"
                      placeholder="Cant."
                      value={linea.cantidad}
                      onChange={(evento) =>
                        cambiarIngrediente(indice, { cantidad: evento.target.value })
                      }
                      required={Boolean(linea.productoId)}
                    />
                    {/* Se puede cargar en otra unidad que la del producto:
                        ej. gramos de una sal que se compra por kilo. */}
                    <select
                      className="campo w-20 shrink-0"
                      value={linea.unidad}
                      onChange={(evento) =>
                        cambiarIngrediente(indice, { unidad: evento.target.value })
                      }
                      disabled={!linea.productoId}
                    >
                      {(producto
                        ? unidadesCompatibles(producto.unidadMedida)
                        : []
                      ).map((unidad) => (
                        <option key={unidad} value={unidad}>
                          {abreviarUnidad(unidad)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                      onClick={() =>
                        setIngredientes((previas) =>
                          previas.length > 1
                            ? previas.filter((_, i) => i !== indice)
                            : [{ productoId: '', cantidad: '', unidad: '' }],
                        )
                      }
                      aria-label="Quitar ingrediente"
                    >
                      ✕
                    </button>
                  </div>
                  {producto && costo !== null && (
                    <p className="mt-1 text-xs text-gray-500">
                      {formatearMoneda(producto.costoUnitarioReferencia)}/
                      {abreviarUnidad(producto.unidadMedida)} → esta línea cuesta{' '}
                      <strong className="text-gray-700">{formatearMoneda(costo)}</strong>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            className="mt-2 text-sm font-medium text-blue-700 hover:underline"
            onClick={() =>
              setIngredientes((previas) => [
                ...previas,
                { productoId: '', cantidad: '', unidad: '' },
              ])
            }
          >
            + Agregar ingrediente
          </button>
        </div>

        {costoEstimado !== null && (
          <p className="rounded-lg bg-gray-50 p-3 text-right text-sm text-gray-600">
            Costo estimado:{' '}
            <strong className="text-gray-900">
              {formatearMoneda(costoEstimado)}
            </strong>{' '}
            por {unidadDe(productoTerminadoId) === 'KG' ? 'kg' : 'unidad'} producido
          </p>
        )}

        <AvisoError mensaje={error} />

        <div className="flex justify-end gap-2">
          <button type="button" className="boton-secundario" onClick={alCerrar}>
            Cancelar
          </button>
          <button type="submit" className="boton-primario" disabled={guardar.isPending}>
            Guardar receta
          </button>
        </div>
      </form>
    </Modal>
  );
}
