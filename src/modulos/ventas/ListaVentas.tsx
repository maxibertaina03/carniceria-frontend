import { Fragment, ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { EstadoConsulta } from '../../compartido/componentes/EstadoConsulta';
import {
  formatearCantidad,
  formatearFechaYHora,
  formatearMoneda,
  NOMBRES_FORMA_PAGO,
} from '../../compartido/formato';
import { useVentas } from './useVentas';
import { Venta } from './ventasApi';

const colorFormaPago: Record<string, string> = {
  CONTADO: 'bg-green-100 text-green-700',
  FIADO: 'bg-red-100 text-red-700',
  MIXTO: 'bg-amber-100 text-amber-700',
};

function ChipFormaPago({ formaPago }: { formaPago: string }) {
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-semibold ${
        colorFormaPago[formaPago] ?? ''
      }`}
    >
      {NOMBRES_FORMA_PAGO[formaPago] ?? formaPago}
    </span>
  );
}

function DetalleVenta({ venta }: { venta: Venta }) {
  return (
    <ul className="space-y-1 text-sm text-gray-700">
      {venta.items.map((item) => (
        <li key={item.id}>
          {item.productoNombre} — {formatearCantidad(item.cantidad, 'KG')} ×{' '}
          {formatearMoneda(item.precioUnitarioVenta)} ={' '}
          <strong>{formatearMoneda(item.subtotal)}</strong>{' '}
          <span className="text-gray-500">
            (ganancia {formatearMoneda(item.gananciaLinea)})
          </span>
        </li>
      ))}
      {venta.montoFiado > 0 && (
        <li className="pt-1 font-medium text-amber-700">
          Fiado: {formatearMoneda(venta.montoFiado)} · Pagó:{' '}
          {formatearMoneda(venta.montoContado)}
        </li>
      )}
      {venta.observaciones && (
        <li className="italic text-gray-500">Nota: {venta.observaciones}</li>
      )}
    </ul>
  );
}

export function ListaVentas() {
  const { data: ventas, isLoading, error } = useVentas();
  const [ventaAbierta, setVentaAbierta] = useState<string | null>(null);

  function botonDetalle(venta: Venta): ReactNode {
    return (
      <button
        className="text-sm font-medium text-blue-700 hover:underline"
        onClick={() => setVentaAbierta(ventaAbierta === venta.id ? null : venta.id)}
      >
        {ventaAbierta === venta.id ? 'Ocultar' : 'Ver detalle'}
      </button>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Ventas</h2>
        <Link to="/ventas/nueva" className="boton-primario">
          + Registrar venta
        </Link>
      </div>

      <EstadoConsulta cargando={isLoading} error={error} />

      {ventas && ventas.length === 0 && (
        <p className="tarjeta py-8 text-center text-gray-500">
          Todavía no hay ventas registradas.
        </p>
      )}

      {/* Tarjetas apiladas: celular */}
      {ventas && ventas.length > 0 && (
        <div className="space-y-2 md:hidden">
          {ventas.map((venta) => (
            <div key={venta.id} className="tarjeta">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {venta.clienteNombre ?? 'Consumidor final'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatearFechaYHora(venta.fecha)}
                  </p>
                </div>
                <ChipFormaPago formaPago={venta.formaPago} />
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2">
                <p>
                  <span className="font-semibold">{formatearMoneda(venta.total)}</span>{' '}
                  <span
                    className={`text-sm font-medium ${
                      venta.gananciaTotal >= 0 ? 'text-green-700' : 'text-red-600'
                    }`}
                  >
                    (gana {formatearMoneda(venta.gananciaTotal)})
                  </span>
                </p>
                {botonDetalle(venta)}
              </div>
              {ventaAbierta === venta.id && (
                <div className="mt-2 rounded-lg bg-gray-50 p-3">
                  <DetalleVenta venta={venta} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tabla: pantallas medianas y grandes */}
      {ventas && ventas.length > 0 && (
        <div className="tarjeta hidden overflow-x-auto p-0 md:block">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="encabezado-tabla">Fecha</th>
                <th className="encabezado-tabla">Cliente</th>
                <th className="encabezado-tabla">Pago</th>
                <th className="encabezado-tabla">Total</th>
                <th className="encabezado-tabla">Ganancia</th>
                <th className="encabezado-tabla"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ventas.map((venta) => (
                <Fragment key={venta.id}>
                  <tr>
                    <td className="celda">{formatearFechaYHora(venta.fecha)}</td>
                    <td className="celda">
                      {venta.clienteNombre ?? 'Consumidor final'}
                    </td>
                    <td className="celda">
                      <ChipFormaPago formaPago={venta.formaPago} />
                    </td>
                    <td className="celda font-semibold">
                      {formatearMoneda(venta.total)}
                    </td>
                    <td
                      className={`celda font-semibold ${
                        venta.gananciaTotal >= 0 ? 'text-green-700' : 'text-red-600'
                      }`}
                    >
                      {formatearMoneda(venta.gananciaTotal)}
                    </td>
                    <td className="celda text-right">{botonDetalle(venta)}</td>
                  </tr>
                  {ventaAbierta === venta.id && (
                    <tr>
                      <td colSpan={6} className="bg-gray-50 px-6 py-3">
                        <DetalleVenta venta={venta} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
