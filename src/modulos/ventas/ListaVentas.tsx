import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { EstadoConsulta } from '../../compartido/componentes/EstadoConsulta';
import {
  formatearCantidad,
  formatearFechaYHora,
  formatearMoneda,
  NOMBRES_FORMA_PAGO,
} from '../../compartido/formato';
import { useVentas } from './useVentas';

const colorFormaPago: Record<string, string> = {
  CONTADO: 'bg-green-100 text-green-700',
  FIADO: 'bg-red-100 text-red-700',
  MIXTO: 'bg-amber-100 text-amber-700',
};

export function ListaVentas() {
  const { data: ventas, isLoading, error } = useVentas();
  const [ventaAbierta, setVentaAbierta] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Ventas</h2>
        <Link to="/ventas/nueva" className="boton-primario">
          + Registrar venta
        </Link>
      </div>

      <EstadoConsulta cargando={isLoading} error={error} />

      {ventas && (
        <div className="tarjeta overflow-x-auto p-0">
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
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${
                          colorFormaPago[venta.formaPago] ?? ''
                        }`}
                      >
                        {NOMBRES_FORMA_PAGO[venta.formaPago] ?? venta.formaPago}
                      </span>
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
                    <td className="celda text-right">
                      <button
                        className="text-sm font-medium text-blue-700 hover:underline"
                        onClick={() =>
                          setVentaAbierta(ventaAbierta === venta.id ? null : venta.id)
                        }
                      >
                        {ventaAbierta === venta.id ? 'Ocultar' : 'Ver detalle'}
                      </button>
                    </td>
                  </tr>
                  {ventaAbierta === venta.id && (
                    <tr>
                      <td colSpan={6} className="bg-gray-50 px-6 py-3">
                        <ul className="space-y-1 text-sm text-gray-700">
                          {venta.items.map((item) => (
                            <li key={item.id}>
                              {item.productoNombre} —{' '}
                              {formatearCantidad(item.cantidad, 'KG')} ×{' '}
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
                            <li className="italic text-gray-500">
                              Nota: {venta.observaciones}
                            </li>
                          )}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {ventas.length === 0 && (
                <tr>
                  <td className="celda py-8 text-center text-gray-500" colSpan={6}>
                    Todavía no hay ventas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
