import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EstadoConsulta } from '../../compartido/componentes/EstadoConsulta';
import {
  formatearCantidad,
  formatearFecha,
  formatearMoneda,
} from '../../compartido/formato';
import { Desposte } from './desposteApi';
import { useDespostes } from './useDesposte';

function DetalleDesposte({ desposte }: { desposte: Desposte }) {
  return (
    <ul className="space-y-1 text-sm text-gray-700">
      {desposte.cortes.map((corte) => (
        <li key={corte.id}>
          {corte.productoNombre} — {formatearCantidad(corte.cantidad, 'KG')} ·{' '}
          costo <strong>{formatearMoneda(corte.costoUnitario)}/kg</strong>{' '}
          <span className="text-gray-500">
            ({formatearMoneda(corte.subtotal)})
          </span>
        </li>
      ))}
      {desposte.observaciones && (
        <li className="pt-1 italic text-gray-500">Nota: {desposte.observaciones}</li>
      )}
    </ul>
  );
}

export function ListaDespostes() {
  const { data: despostes, isLoading, error } = useDespostes();
  const [abierto, setAbierto] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Desposte de media res</h2>
        <Link to="/desposte/nuevo" className="boton-primario">
          + Registrar desposte
        </Link>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        Comprás una media res y la desarmás en cortes. Los cortes entran al stock
        con el costo repartido según su valor.
      </p>

      <EstadoConsulta cargando={isLoading} error={error} />

      {despostes && despostes.length === 0 && (
        <p className="tarjeta py-8 text-center text-gray-500">
          Todavía no hay despostes registrados.
        </p>
      )}

      {despostes && despostes.length > 0 && (
        <div className="space-y-2">
          {despostes.map((desposte) => (
            <div key={desposte.id} className="tarjeta">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {desposte.proveedor ?? 'Media res'} ·{' '}
                    {formatearCantidad(desposte.pesoRes, 'KG')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatearFecha(desposte.fecha)} · {desposte.cortes.length}{' '}
                    {desposte.cortes.length === 1 ? 'corte' : 'cortes'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatearMoneda(desposte.costoTotal)}</p>
                  <button
                    className="text-sm font-medium text-blue-700 hover:underline"
                    onClick={() =>
                      setAbierto(abierto === desposte.id ? null : desposte.id)
                    }
                  >
                    {abierto === desposte.id ? 'Ocultar' : 'Ver cortes'}
                  </button>
                </div>
              </div>
              {abierto === desposte.id && (
                <div className="mt-2 rounded-lg bg-gray-50 p-3">
                  <DetalleDesposte desposte={desposte} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
