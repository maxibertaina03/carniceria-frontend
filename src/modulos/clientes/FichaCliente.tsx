import { FormEvent, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { AvisoError } from '../../compartido/componentes/AvisoError';
import { EstadoConsulta } from '../../compartido/componentes/EstadoConsulta';
import { Modal } from '../../compartido/componentes/Modal';
import {
  formatearFechaYHora,
  formatearMoneda,
} from '../../compartido/formato';
import { FormularioCliente } from './FormularioCliente';
import { useMovimientosCliente, useMutacionesCliente } from './useClientes';

export function FichaCliente() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useMovimientosCliente(id!);
  const { registrarPago } = useMutacionesCliente();

  const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [errorPago, setErrorPago] = useState<string | null>(null);

  async function manejarPago(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorPago(null);
    const formulario = new FormData(evento.currentTarget);
    try {
      await registrarPago.mutateAsync({
        id: id!,
        datos: {
          monto: Number(formulario.get('monto') ?? 0),
          observaciones: String(formulario.get('observaciones') ?? '') || undefined,
        },
      });
      await refetch();
      setModalPagoAbierto(false);
    } catch (excepcion) {
      setErrorPago(mensajeDeError(excepcion));
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/clientes" className="text-sm text-blue-700 hover:underline">
        ← Volver a clientes
      </Link>

      <EstadoConsulta cargando={isLoading} error={error} />

      {data && (
        <>
          <div className="mb-6 mt-2 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{data.cliente.nombre}</h2>
              <p className="text-gray-500">
                {data.cliente.telefono ?? 'Sin teléfono'}
                {' · '}
                <button
                  className="text-blue-700 hover:underline"
                  onClick={() => setModalEdicionAbierto(true)}
                >
                  Editar datos
                </button>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Debe</p>
              <p
                className={`text-3xl font-black ${
                  data.cliente.saldoDeudor > 0 ? 'text-red-600' : 'text-green-700'
                }`}
              >
                {formatearMoneda(data.cliente.saldoDeudor)}
              </p>
              {data.cliente.saldoDeudor > 0 && (
                <button
                  className="boton-primario mt-2"
                  onClick={() => setModalPagoAbierto(true)}
                >
                  Registrar pago
                </button>
              )}
            </div>
          </div>

          <h3 className="mb-2 text-lg font-semibold">Historial de la cuenta</h3>
          <div className="tarjeta overflow-x-auto p-0">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="encabezado-tabla">Fecha</th>
                  <th className="encabezado-tabla">Movimiento</th>
                  <th className="encabezado-tabla">Detalle</th>
                  <th className="encabezado-tabla text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.movimientos.map((movimiento) => (
                  <tr key={movimiento.id}>
                    <td className="celda">{formatearFechaYHora(movimiento.fecha)}</td>
                    <td className="celda">
                      {movimiento.tipo === 'CARGO' ? (
                        <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                          Fiado
                        </span>
                      ) : (
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                          Pago
                        </span>
                      )}
                    </td>
                    <td className="celda text-gray-600">
                      {movimiento.observaciones ?? '—'}
                    </td>
                    <td
                      className={`celda text-right font-semibold ${
                        movimiento.tipo === 'CARGO' ? 'text-red-600' : 'text-green-700'
                      }`}
                    >
                      {movimiento.tipo === 'CARGO' ? '+' : '−'}
                      {formatearMoneda(movimiento.monto)}
                    </td>
                  </tr>
                ))}
                {data.movimientos.length === 0 && (
                  <tr>
                    <td className="celda py-8 text-center text-gray-500" colSpan={4}>
                      Sin movimientos: este cliente nunca compró fiado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Modal
            titulo={`Registrar pago de ${data.cliente.nombre}`}
            abierto={modalPagoAbierto}
            alCerrar={() => setModalPagoAbierto(false)}
          >
            <form onSubmit={manejarPago} className="flex flex-col gap-4">
              <p className="text-sm text-gray-600">
                Deuda actual:{' '}
                <strong>{formatearMoneda(data.cliente.saldoDeudor)}</strong>. Puede
                pagar una parte o todo.
              </p>
              <div>
                <label className="etiqueta" htmlFor="monto">¿Cuánto paga?</label>
                <input
                  id="monto"
                  name="monto"
                  className="campo"
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={data.cliente.saldoDeudor}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="etiqueta" htmlFor="observaciones">
                  Observaciones (opcional)
                </label>
                <input id="observaciones" name="observaciones" className="campo" />
              </div>

              <AvisoError mensaje={errorPago} />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="boton-secundario"
                  onClick={() => setModalPagoAbierto(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="boton-primario"
                  disabled={registrarPago.isPending}
                >
                  Registrar pago
                </button>
              </div>
            </form>
          </Modal>

          <FormularioCliente
            abierto={modalEdicionAbierto}
            alCerrar={() => {
              setModalEdicionAbierto(false);
              refetch();
            }}
            cliente={data.cliente}
          />
        </>
      )}
    </div>
  );
}
