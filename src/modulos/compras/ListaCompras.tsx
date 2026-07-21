import { Fragment, ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { EstadoConsulta } from '../../compartido/componentes/EstadoConsulta';
import {
  formatearCantidad,
  formatearFecha,
  formatearMoneda,
} from '../../compartido/formato';
import { Compra } from './comprasApi';
import { useCompras, useEliminarCompra } from './useCompras';

function DetalleCompra({ compra }: { compra: Compra }) {
  return (
    <ul className="space-y-1 text-sm text-gray-700">
      {compra.items.map((item) => (
        <li key={item.id}>
          {item.productoNombre} — {formatearCantidad(item.cantidad, 'KG')} ×{' '}
          {formatearMoneda(item.costoUnitario)} ={' '}
          <strong>{formatearMoneda(item.subtotal)}</strong>
        </li>
      ))}
      {compra.observaciones && (
        <li className="pt-1 italic text-gray-500">Nota: {compra.observaciones}</li>
      )}
    </ul>
  );
}

export function ListaCompras() {
  const { data: compras, isLoading, error } = useCompras();
  const eliminar = useEliminarCompra();
  const [compraAbierta, setCompraAbierta] = useState<string | null>(null);

  async function manejarEliminar(compra: Compra) {
    if (
      !window.confirm(
        '¿Eliminar esta compra? Se va a descontar del stock lo que había sumado.',
      )
    ) {
      return;
    }
    try {
      await eliminar.mutateAsync(compra.id);
    } catch (excepcion) {
      window.alert(mensajeDeError(excepcion));
    }
  }

  function acciones(compra: Compra): ReactNode {
    return (
      <>
        <button
          className="text-sm font-medium text-blue-700 hover:underline"
          onClick={() =>
            setCompraAbierta(compraAbierta === compra.id ? null : compra.id)
          }
        >
          {compraAbierta === compra.id ? 'Ocultar' : 'Ver detalle'}
        </button>
        <button
          className="ml-3 text-sm font-medium text-red-600 hover:underline"
          onClick={() => manejarEliminar(compra)}
        >
          Eliminar
        </button>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Compras a proveedores</h2>
        <Link to="/compras/nueva" className="boton-primario">
          + Registrar compra
        </Link>
      </div>

      <EstadoConsulta cargando={isLoading} error={error} />

      {compras && compras.length === 0 && (
        <p className="tarjeta py-8 text-center text-gray-500">
          Todavía no hay compras registradas.
        </p>
      )}

      {/* Tarjetas apiladas: celular */}
      {compras && compras.length > 0 && (
        <div className="space-y-2 md:hidden">
          {compras.map((compra) => (
            <div key={compra.id} className="tarjeta">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{compra.proveedor ?? 'Sin proveedor'}</p>
                  <p className="text-sm text-gray-500">
                    {formatearFecha(compra.fecha)} · {compra.items.length}{' '}
                    {compra.items.length === 1 ? 'producto' : 'productos'}
                  </p>
                </div>
                <p className="font-semibold">{formatearMoneda(compra.total)}</p>
              </div>
              <div className="mt-2 border-t border-gray-100 pt-2 text-right">
                {acciones(compra)}
              </div>
              {compraAbierta === compra.id && (
                <div className="mt-2 rounded-lg bg-gray-50 p-3">
                  <DetalleCompra compra={compra} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tabla: pantallas medianas y grandes */}
      {compras && compras.length > 0 && (
        <div className="tarjeta hidden overflow-x-auto p-0 md:block">
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
                    <td className="celda text-right">{acciones(compra)}</td>
                  </tr>
                  {compraAbierta === compra.id && (
                    <tr>
                      <td colSpan={5} className="bg-gray-50 px-6 py-3">
                        <DetalleCompra compra={compra} />
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
