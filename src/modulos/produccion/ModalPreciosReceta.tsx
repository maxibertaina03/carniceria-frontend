import { FormEvent, useState } from 'react';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { AvisoError } from '../../compartido/componentes/AvisoError';
import { Modal } from '../../compartido/componentes/Modal';
import { abreviarUnidad, formatearCantidad } from '../../compartido/formato';
import { useMutacionesProducto, useProductos } from '../productos/useProductos';
import { Receta } from './produccionApi';
import { useRecalcularCostos } from './useProduccion';

interface Props {
  abierto: boolean;
  alCerrar: () => void;
  receta: Receta | null;
}

// Editar rápido, desde la receta, el precio de cada insumo y el precio de venta
// del producto terminado. Al guardar, recalcula el costo de producción.
export function ModalPreciosReceta({ abierto, alCerrar, receta }: Props) {
  const { data: productos } = useProductos();
  const { actualizar } = useMutacionesProducto();
  const recalcular = useRecalcularCostos();
  const [error, setError] = useState<string | null>(null);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [precioVenta, setPrecioVenta] = useState<string | null>(null);

  if (!receta) {
    return null;
  }

  const terminado = productos?.find((p) => p.id === receta.productoTerminadoId);

  function precioActual(productoId: string): string {
    if (valores[productoId] !== undefined) {
      return valores[productoId];
    }
    const producto = productos?.find((p) => p.id === productoId);
    return String(producto?.costoUnitarioReferencia ?? 0);
  }

  const precioVentaMostrado =
    precioVenta ?? String(terminado?.precioVentaReferencia ?? 0);

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    setError(null);
    try {
      // Actualizar el costo de cada insumo que se haya tocado.
      for (const [productoId, valor] of Object.entries(valores)) {
        await actualizar.mutateAsync({
          id: productoId,
          datos: { costoUnitarioReferencia: Number(valor) },
        });
      }
      // Actualizar el precio de venta del producto terminado si cambió.
      if (precioVenta !== null && terminado) {
        await actualizar.mutateAsync({
          id: terminado.id,
          datos: { precioVentaReferencia: Number(precioVenta) },
        });
      }
      // Recalcular el costo de producción con los nuevos precios.
      await recalcular.mutateAsync();
      alCerrar();
    } catch (excepcion) {
      setError(mensajeDeError(excepcion));
    }
  }

  return (
    <Modal
      titulo={`Precios de ${receta.productoTerminadoNombre}`}
      abierto={abierto}
      alCerrar={alCerrar}
    >
      <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
        <div>
          <span className="etiqueta">Precio de los insumos</span>
          <div className="flex flex-col gap-2">
            {receta.ingredientes.map((ingrediente) => (
              <div
                key={ingrediente.productoId}
                className="flex items-center justify-between gap-2"
              >
                <span className="text-sm text-gray-700">
                  {ingrediente.productoNombre}
                  <span className="text-gray-400">
                    {' '}
                    (usa {formatearCantidad(ingrediente.cantidad, ingrediente.unidad)})
                  </span>
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-400">$</span>
                  <input
                    className="campo w-28"
                    type="number"
                    min="0"
                    step="0.01"
                    value={precioActual(ingrediente.productoId)}
                    onChange={(evento) =>
                      setValores((previas) => ({
                        ...previas,
                        [ingrediente.productoId]: evento.target.value,
                      }))
                    }
                  />
                  {/* El precio del insumo va en la unidad en que se compra
                      (ej. $/kg), aunque la receta lo use en gramos. */}
                  <span className="w-8 text-xs text-gray-400">
                    /{abreviarUnidad(ingrediente.unidadProducto)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
          <span className="text-sm font-medium text-gray-700">
            Precio de venta del {receta.productoTerminadoNombre}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-400">$</span>
            <input
              className="campo w-28"
              type="number"
              min="0"
              step="0.01"
              value={precioVentaMostrado}
              onChange={(evento) => setPrecioVenta(evento.target.value)}
            />
          </div>
        </div>

        <AvisoError mensaje={error} />

        <div className="flex justify-end gap-2">
          <button type="button" className="boton-secundario" onClick={alCerrar}>
            Cancelar
          </button>
          <button
            type="submit"
            className="boton-primario"
            disabled={actualizar.isPending || recalcular.isPending}
          >
            Guardar precios
          </button>
        </div>
      </form>
    </Modal>
  );
}
