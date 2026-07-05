import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { EstadoConsulta } from '../../compartido/componentes/EstadoConsulta';
import {
  formatearCantidad,
  formatearFecha,
  formatearMoneda,
} from '../../compartido/formato';
import { useCompras } from './useCompras';

export function ListaCompras() {
  const { data: compras, isLoading, error } = useCompras();
  const [compraAbierta, setCompraAbierta] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Compras a proveedores</h2>
        <Link to="/compras/nueva" className="boton-primario">
          + Registrar compra
        </Link>
      </div>

      <EstadoConsulta cargando={isLoading} error={error} />

      {compras && (
        <div className="tarjeta overflow-x-auto p-0">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="encabezado-tabla">Fecha</th>
                <th className="encabezado-tabla">Proveedor</th>
                <th className="encabezado-tabla">Productos</th>
                <th className="encabezado-tabla">Total</th>
                <th className="encabezado-tabla"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {compras.map((compra) => (
                <Fragment key={compra.id}>
                  <tr>
                    <td className="celda">{formatearFecha(compra.fecha)}</td>
                    <td className="celda">{compra.proveedor ?? '—'}</td>
                    <td className="celda">{compra.items.length}</td>
                    <td className="celda font-semibold">
                      {formatearMoneda(compra.total)}
                    </td>
                    <td className="celda text-right">
                      <button
                        className="text-sm font-medium text-blue-700 hover:underline"
                        onClick={() =>
                          setCompraAbierta(
                            compraAbierta === compra.id ? null : compra.id,
                          )
                        }
                      >
                        {compraAbierta === compra.id ? 'Ocultar' : 'Ver detalle'}
                      </button>
                    </td>
                  </tr>
                  {compraAbierta === compra.id && (
                    <tr>
                      <td colSpan={5} className="bg-gray-50 px-6 py-3">
                        <ul className="space-y-1 text-sm text-gray-700">
                          {compra.items.map((item) => (
                            <li key={item.id}>
                              {item.productoNombre} —{' '}
                              {formatearCantidad(item.cantidad, 'KG')} ×{' '}
                              {formatearMoneda(item.costoUnitario)} ={' '}
                              <strong>{formatearMoneda(item.subtotal)}</strong>
                            </li>
                          ))}
                          {compra.observaciones && (
                            <li className="pt-1 italic text-gray-500">
                              Nota: {compra.observaciones}
                            </li>
                          )}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {compras.length === 0 && (
                <tr>
                  <td className="celda py-8 text-center text-gray-500" colSpan={5}>
                    Todavía no hay compras registradas.
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
