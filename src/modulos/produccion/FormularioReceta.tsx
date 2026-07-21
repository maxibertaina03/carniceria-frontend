import { FormEvent, useState } from 'react';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { AvisoError } from '../../compartido/componentes/AvisoError';
import { Modal } from '../../compartido/componentes/Modal';
import {
  CATEGORIA_INSUMO,
  CATEGORIAS_PRODUCIBLES,
  formatearMoneda,
} from '../../compartido/formato';
import { useProductos } from '../productos/useProductos';
import { Receta } from './produccionApi';
import { useMutacionesReceta } from './useProduccion';

interface LineaIngrediente {
  productoId: string;
  cantidad: string;
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
        }))
      : [{ productoId: '', cantidad: '' }],
  );

  const terminado = productos?.find((p) => p.id === productoTerminadoId);

  // El producto a producir solo puede ser de categorías producibles;
  // los ingredientes solo insumos (incluye las carnes de producción).
  const productosProducibles = productos?.filter((p) =>
    CATEGORIAS_PRODUCIBLES.includes(p.categoria),
  );
  const insumos = productos?.filter((p) => p.categoria === CATEGORIA_INSUMO);

  // Costo estimado por unidad producida, en vivo con los precios actuales.
  const rindeNum = Number(rinde);
  const costoEstimado =
    rindeNum > 0 &&
    ingredientes.some((linea) => linea.productoId && Number(linea.cantidad) > 0)
      ? ingredientes.reduce((suma, linea) => {
          const producto = productos?.find((p) => p.id === linea.productoId);
          const cantidad = Number(linea.cantidad) || 0;
          return suma + (producto?.costoUnitarioReferencia ?? 0) * cantidad;
        }, 0) / rindeNum
      : null;

  function unidadDe(productoId: string): string {
    return productos?.find((p) => p.id === productoId)?.unidadMedida ?? '';
  }

  function cambiarIngrediente(indice: number, cambios: Partial<LineaIngrediente>) {
    setIngredientes((previas) =>
      previas.map((linea, i) => (i === indice ? { ...linea, ...cambios } : linea)),
    );
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
            {ingredientes.map((linea, indice) => (
              <div key={indice} className="flex items-center gap-2">
                <select
                  className="campo flex-1"
                  value={linea.productoId}
                  onChange={(evento) =>
                    cambiarIngrediente(indice, { productoId: evento.target.value })
                  }
                >
                  <option value="">Elegir ingrediente…</option>
                  {insumos?.map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre}
                    </option>
                  ))}
                </select>
                <div className="flex w-28 shrink-0 items-center gap-1">
                  <input
                    className="campo w-full"
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
                  <span className="w-6 text-xs text-gray-400">
                    {unidadDe(linea.productoId) === 'KG'
                      ? 'kg'
                      : unidadDe(linea.productoId) === 'GRAMO'
                        ? 'g'
                        : unidadDe(linea.productoId) === 'METRO'
                          ? 'm'
                          : unidadDe(linea.productoId) === 'UNIDAD'
                            ? 'u.'
                            : ''}
                  </span>
                </div>
                <button
                  type="button"
                  className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                  onClick={() =>
                    setIngredientes((previas) =>
                      previas.length > 1
                        ? previas.filter((_, i) => i !== indice)
                        : [{ productoId: '', cantidad: '' }],
                    )
                  }
                  aria-label="Quitar ingrediente"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 text-sm font-medium text-blue-700 hover:underline"
            onClick={() =>
              setIngredientes((previas) => [...previas, { productoId: '', cantidad: '' }])
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
