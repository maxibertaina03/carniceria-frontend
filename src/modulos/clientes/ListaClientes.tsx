import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EstadoConsulta } from '../../compartido/componentes/EstadoConsulta';
import { formatearMoneda } from '../../compartido/formato';
import { FormularioCliente } from './FormularioCliente';
import { useClientes } from './useClientes';

export function ListaClientes() {
  const { data: clientes, isLoading, error } = useClientes();
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Clientes y fiado</h2>
        <button className="boton-primario" onClick={() => setModalAbierto(true)}>
          + Nuevo cliente
        </button>
      </div>

      <EstadoConsulta cargando={isLoading} error={error} />

      {clientes && clientes.length === 0 && (
        <p className="tarjeta py-8 text-center text-gray-500">
          Todavía no hay clientes. Se crean desde acá o al hacer una venta fiada.
        </p>
      )}

      {/* Tarjetas apiladas: celular */}
      {clientes && clientes.length > 0 && (
        <div className="space-y-2 md:hidden">
          {clientes.map((cliente) => (
            <Link
              key={cliente.id}
              to={`/clientes/${cliente.id}`}
              className="tarjeta flex items-center justify-between gap-2 active:bg-gray-50"
            >
              <div>
                <p className="font-semibold">{cliente.nombre}</p>
                <p className="text-sm text-gray-500">{cliente.telefono ?? '—'}</p>
              </div>
              <div className="text-right">
                {cliente.saldoDeudor > 0 ? (
                  <p className="font-semibold text-red-600">
                    {formatearMoneda(cliente.saldoDeudor)}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-green-700">Al día</p>
                )}
                <p className="text-xs text-blue-700">Ver cuenta →</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Tabla: pantallas medianas y grandes */}
      {clientes && clientes.length > 0 && (
        <div className="tarjeta hidden overflow-x-auto p-0 md:block">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="encabezado-tabla">Cliente</th>
                <th className="encabezado-tabla">Teléfono</th>
                <th className="encabezado-tabla">Debe</th>
                <th className="encabezado-tabla"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td className="celda font-medium">{cliente.nombre}</td>
                  <td className="celda">{cliente.telefono ?? '—'}</td>
                  <td className="celda">
                    {cliente.saldoDeudor > 0 ? (
                      <span className="font-semibold text-red-600">
                        {formatearMoneda(cliente.saldoDeudor)}
                      </span>
                    ) : (
                      <span className="text-green-700">Al día</span>
                    )}
                  </td>
                  <td className="celda text-right">
                    <Link
                      to={`/clientes/${cliente.id}`}
                      className="text-sm font-medium text-blue-700 hover:underline"
                    >
                      Ver cuenta
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FormularioCliente
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
      />
    </div>
  );
}
