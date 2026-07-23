import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { AvisoError } from '../../compartido/componentes/AvisoError';
import { EstadoConsulta } from '../../compartido/componentes/EstadoConsulta';
import { Modal } from '../../compartido/componentes/Modal';
import {
  formatearFecha,
  formatearFechaYHora,
  formatearMoneda,
} from '../../compartido/formato';
import { useCompras } from '../compras/useCompras';
import { FormularioProveedor } from './FormularioProveedor';
import {
  useMovimientosProveedor,
  useMutacionesProveedor,
} from './useProveedores';

export function FichaProveedor() {
  const { id } = useParams<{ id: string }>();
  const navegar = useNavigate();
  const { data, isLoading, error, refetch } = useMovimientosProveedor(id!);
  const { data: compras } = useCompras();
  const { registrarPago, desactivar, actualizar, eliminarDefinitivo } =
    useMutacionesProveedor();

  const comprasDelProveedor =
    compras?.filter((compra) => compra.proveedorId === id) ?? [];

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

  async function accion(fn: () => Promise<unknown>, navegarAlSalir = false) {
    try {
      await fn();
      if (navegarAlSalir) navegar('/proveedores');
      else await refetch();
    } catch (excepcion) {
      window.alert(mensajeDeError(excepcion));
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/proveedores" className="text-sm text-blue-700 hover:underline">
        ← Volver a proveedores
      </Link>

      <EstadoConsulta cargando={isLoading} error={error} />

      {data && (
        <>
          <div className="mb-6 mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">{data.proveedor.nombre}</h2>
              <p className="text-gray-500">
                {data.proveedor.telefono ?? 'Sin teléfono'}
                {' · '}
                <button
                  className="text-blue-700 hover:underline"
                  onClick={() => setModalEdicionAbierto(true)}
                >
                  Editar datos
                </button>
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {data.proveedor.activo ? (
                  <button
                    className="font-medium text-gray-600 hover:underline"
                    onClick={() =>
                      window.confirm('¿Desactivar este proveedor?') &&
                      accion(() => desactivar.mutateAsync(id!))
                    }
                  >
                    Desactivar
                  </button>
                ) : (
                  <button
                    className="font-medium text-green-700 hover:underline"
                    onClick={() =>
                      accion(() =>
                        actualizar.mutateAsync({ id: id!, datos: { activo: true } }),
                      )
                    }
                  >
                    Reactivar
                  </button>
                )}
                <button
                  className="font-medium text-red-600 hover:underline"
                  onClick={() =>
                    window.confirm(
                      '¿Borrar definitivamente? Solo si no tiene compras ni movimientos.',
                    ) && accion(() => eliminarDefinitivo.mutateAsync(id!), true)
                  }
                >
                  Eliminar
                </button>
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-sm text-gray-500">Le debo</p>
              <p
                className={`text-3xl font-black ${
                  data.proveedor.saldoAdeudado > 0 ? 'text-red-600' : 'text-green-700'
                }`}
              >
                {formatearMoneda(data.proveedor.saldoAdeudado)}
              </p>
              {data.proveedor.saldoAdeudado > 0 && (
                <button
                  className="boton-primario mt-2 w-full sm:w-auto"
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
                  <th className="encabezado-tabla hidden sm:table-cell">Detalle</th>
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
                          Deuda
                        </span>
                      ) : (
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                          Pago
                        </span>
                      )}
                    </td>
                    <td className="celda hidden text-gray-600 sm:table-cell">
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
                      Sin movimientos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <h3 className="mb-2 mt-6 text-lg font-semibold">Compras a este proveedor</h3>
          <div className="tarjeta overflow-x-auto p-0">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="encabezado-tabla">Fecha</th>
                  <th className="encabezado-tabla">Productos</th>
                  <th className="encabezado-tabla text-right">Total</th>
                  <th className="encabezado-tabla text-right">Quedó a deber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comprasDelProveedor.map((compra) => (
                  <tr key={compra.id}>
                    <td className="celda">{formatearFecha(compra.fecha)}</td>
                    <td className="celda">{compra.items.length}</td>
                    <td className="celda text-right font-semibold">
                      {formatearMoneda(compra.total)}
                    </td>
                    <td className="celda text-right">
                      {compra.montoAdeudado > 0 ? (
                        <span className="font-semibold text-red-600">
                          {formatearMoneda(compra.montoAdeudado)}
                        </span>
                      ) : (
                        <span className="text-gray-400">pagada</span>
                      )}
                    </td>
                  </tr>
                ))}
                {comprasDelProveedor.length === 0 && (
                  <tr>
                    <td className="celda py-8 text-center text-gray-500" colSpan={4}>
                      Todavía no hay compras a este proveedor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Modal
            titulo={`Pagar a ${data.proveedor.nombre}`}
            abierto={modalPagoAbierto}
            alCerrar={() => setModalPagoAbierto(false)}
          >
            <form onSubmit={manejarPago} className="flex flex-col gap-4">
              <p className="text-sm text-gray-600">
                Le debés{' '}
                <strong>{formatearMoneda(data.proveedor.saldoAdeudado)}</strong>. Podés
                pagar una parte o todo.
              </p>
              <div>
                <label className="etiqueta" htmlFor="monto">¿Cuánto le pagás?</label>
                <input
                  id="monto"
                  name="monto"
                  className="campo"
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={data.proveedor.saldoAdeudado}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="etiqueta" htmlFor="observaciones">Observaciones (opcional)</label>
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

          <FormularioProveedor
            abierto={modalEdicionAbierto}
            alCerrar={() => {
              setModalEdicionAbierto(false);
              refetch();
            }}
            proveedor={data.proveedor}
          />
        </>
      )}
    </div>
  );
}
