import { FormEvent, useState } from 'react';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { AvisoError } from '../../compartido/componentes/AvisoError';
import { Modal } from '../../compartido/componentes/Modal';
import { formatearCantidad, formatearMoneda } from '../../compartido/formato';
import { useProductos } from '../productos/useProductos';
import { Receta } from './produccionApi';
import { useProducir } from './useProduccion';

interface Props {
  abierto: boolean;
  alCerrar: () => void;
  receta: Receta | null;
}

export function FormularioProducir({ abierto, alCerrar, receta }: Props) {
  const { data: productos } = useProductos();
  const producir = useProducir();
  const [cantidad, setCantidad] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!receta) {
    return null;
  }

  const cantidadNum = Number(cantidad) || 0;
  const factor = cantidadNum > 0 ? cantidadNum / receta.rindeCantidad : 0;

  // Ingredientes escalados con su costo actual y aviso de stock.
  const filas = receta.ingredientes.map((ingrediente) => {
    const producto = productos?.find((p) => p.id === ingrediente.productoId);
    const necesita = ingrediente.cantidad * factor;
    const costo = (producto?.costoUnitarioReferencia ?? 0) * necesita;
    const alcanza = producto ? producto.stockActual >= necesita : true;
    return {
      nombre: producto?.nombre ?? ingrediente.productoId,
      unidad: producto?.unidadMedida ?? 'KG',
      necesita,
      costo,
      alcanza,
      stock: producto?.stockActual ?? 0,
    };
  });

  const costoTotal = filas.reduce((suma, fila) => suma + fila.costo, 0);
  const costoUnitario = cantidadNum > 0 ? costoTotal / cantidadNum : 0;
  const faltaStock = filas.some((fila) => !fila.alcanza) && cantidadNum > 0;

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    setError(null);
    if (!(cantidadNum > 0)) {
      setError('Indicá cuánto querés producir.');
      return;
    }
    try {
      await producir.mutateAsync({
        productoTerminadoId: receta!.productoTerminadoId,
        cantidadProducida: cantidadNum,
      });
      setCantidad('');
      alCerrar();
    } catch (excepcion) {
      setError(mensajeDeError(excepcion));
    }
  }

  const unidadTerminado =
    productos?.find((p) => p.id === receta.productoTerminadoId)?.unidadMedida ?? 'KG';

  return (
    <Modal
      titulo={`Producir ${receta.productoTerminadoNombre}`}
      abierto={abierto}
      alCerrar={alCerrar}
    >
      <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
        <div>
          <label className="etiqueta" htmlFor="cantidad">
            ¿Cuánto querés producir? ({formatearCantidad(receta.rindeCantidad, unidadTerminado)} por lote)
          </label>
          <input
            id="cantidad"
            className="campo"
            type="number"
            min="0.001"
            step="0.001"
            value={cantidad}
            onChange={(evento) => setCantidad(evento.target.value)}
            placeholder="Ej: 30"
            autoFocus
          />
        </div>

        {cantidadNum > 0 && (
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="mb-2 text-sm font-medium text-gray-700">
              Se va a consumir:
            </p>
            <ul className="space-y-1 text-sm">
              {filas.map((fila, i) => (
                <li
                  key={i}
                  className={`flex justify-between ${fila.alcanza ? 'text-gray-700' : 'text-red-600'}`}
                >
                  <span>
                    {fila.nombre}: {formatearCantidad(fila.necesita, fila.unidad)}
                    {!fila.alcanza &&
                      ` (hay ${formatearCantidad(fila.stock, fila.unidad)})`}
                  </span>
                  <span>{formatearMoneda(fila.costo)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 border-t border-gray-200 pt-2 text-sm">
              <p className="flex justify-between font-semibold">
                <span>Costo total</span>
                <span>{formatearMoneda(costoTotal)}</span>
              </p>
              <p className="flex justify-between text-gray-600">
                <span>Costo por {unidadTerminado === 'KG' ? 'kg' : 'unidad'}</span>
                <span>{formatearMoneda(costoUnitario)}</span>
              </p>
            </div>
          </div>
        )}

        {faltaStock && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            No alcanza el stock de algún ingrediente. Cargá más (por compra o
            desposte) antes de producir esta cantidad.
          </p>
        )}

        <AvisoError mensaje={error} />

        <div className="flex justify-end gap-2">
          <button type="button" className="boton-secundario" onClick={alCerrar}>
            Cancelar
          </button>
          <button
            type="submit"
            className="boton-primario"
            disabled={producir.isPending}
          >
            Confirmar producción
          </button>
        </div>
      </form>
    </Modal>
  );
}
