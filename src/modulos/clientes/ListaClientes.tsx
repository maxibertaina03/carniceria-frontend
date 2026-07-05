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
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Clientes y fiado</h2>
        <button className="boton-primario" onClick={() => setModalAbierto(true)}>
          + Nuevo cliente
        </button>
      </div>

      <EstadoConsulta cargando={isLoading} error={error} />

      {clientes && (
        <div className="tarjeta overflow-x-auto p-0">
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
              {clientes.length === 0 && (
                <tr>
                  <td className="celda py-8 text-center text-gray-500" colSpan={4}>
                    Todavía no hay clientes. Se crean desde acá o al hacer una venta fiada.
                  </td>
                </tr>
              )}
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
